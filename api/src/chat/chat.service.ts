import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import sanitizeHtml from "sanitize-html";
import { Conversation } from "./entities/conversation.entity";
import { Message } from "./entities/message.entity";
import { MessageAttachment } from "./entities/message-attachment.entity";
import { ReadReceipt } from "./entities/read-receipt.entity";
import { User, UserRole } from "../auth/entities/user.entity";
import { UploadService } from "../upload/upload.service";
import { CreateConversationDto } from "./dto/create-conversation.dto";
import { CreateMessageDto } from "./dto/create-message.dto";
import { UpdateConversationSettingsDto } from "./dto/update-conversation-settings.dto";

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private readonly convRepo: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(MessageAttachment)
    private readonly attachmentRepo: Repository<MessageAttachment>,
    @InjectRepository(ReadReceipt)
    private readonly receiptRepo: Repository<ReadReceipt>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly uploadService: UploadService,
  ) {}

  // ─── Conversations ────────────────────────────────────────────────────────

  /** Admin creates a new conversation with a specific client. */
  async createConversation(
    adminId: string,
    dto: CreateConversationDto,
  ): Promise<Conversation> {
    const client = await this.userRepo.findOne({ where: { id: dto.clientId } });
    if (!client) throw new NotFoundException("Client user not found");
    if (client.role !== UserRole.CLIENT) {
      throw new BadRequestException("Target user is not a client");
    }

    const admin = await this.userRepo.findOne({ where: { id: adminId } });
    if (!admin) throw new NotFoundException("Admin user not found");

    // Prevent duplicate conversations between same admin-client pair
    const existing = await this.convRepo.findOne({
      where: { client: { id: dto.clientId }, admin: { id: adminId } },
    });
    if (existing) return existing;

    const conv = this.convRepo.create({ client, admin });
    return this.convRepo.save(conv);
  }

  /** Get all conversations for the requesting user (scoped by role). */
  async getMyConversations(
    userId: string,
    role: UserRole,
  ): Promise<Conversation[]> {
    const where =
      role === UserRole.ADMIN
        ? { admin: { id: userId } }
        : { client: { id: userId } };

    return this.convRepo.find({
      where,
      relations: ["client", "admin"],
      order: { updatedAt: "DESC" },
    });
  }

  /** Get a single conversation — only participants can access it. */
  async getConversation(
    convId: string,
    requesterId: string,
  ): Promise<Conversation> {
    const conv = await this.convRepo.findOne({
      where: { id: convId },
      relations: ["client", "admin"],
    });
    if (!conv) throw new NotFoundException("Conversation not found");
    this.assertParticipant(conv, requesterId);
    return conv;
  }

  /** Admin-only: toggle read-receipt visibility for the client. */
  async updateSettings(
    convId: string,
    adminId: string,
    dto: UpdateConversationSettingsDto,
  ): Promise<Conversation> {
    const conv = await this.convRepo.findOne({
      where: { id: convId },
      relations: ["admin"],
    });
    if (!conv) throw new NotFoundException("Conversation not found");
    if (conv.admin.id !== adminId) {
      throw new ForbiddenException(
        "Only the admin of this conversation can update its settings",
      );
    }

    conv.showReadReceiptsToClient = dto.showReadReceiptsToClient;
    return this.convRepo.save(conv);
  }

  // ─── Messages ─────────────────────────────────────────────────────────────

  /**
   * Send a message. At least one of `content` or `files` must be present.
   * Content is sanitized (all HTML stripped). Files are validated + saved.
   */
  async sendMessage(
    convId: string,
    senderId: string,
    dto: CreateMessageDto,
    files: Express.Multer.File[],
  ): Promise<Message> {
    const conv = await this.convRepo.findOne({
      where: { id: convId },
      relations: ["client", "admin"],
    });
    if (!conv) throw new NotFoundException("Conversation not found");
    this.assertParticipant(conv, senderId);

    const hasContent = dto.content && dto.content.trim().length > 0;
    const hasFiles = files && files.length > 0;

    if (!hasContent && !hasFiles) {
      throw new BadRequestException(
        "A message must contain text content and/or at least one file.",
      );
    }

    // Sanitize: strip ALL html tags and attributes
    const sanitizedContent = hasContent
      ? sanitizeHtml(dto.content!.trim(), {
          allowedTags: [],
          allowedAttributes: {},
        })
      : null;

    if (hasContent && (!sanitizedContent || sanitizedContent.length === 0)) {
      throw new BadRequestException(
        "Message content is empty after sanitization.",
      );
    }

    const sender = await this.userRepo.findOne({ where: { id: senderId } });
    if (!sender) throw new NotFoundException("Sender not found");

    // Save files first
    const savedAttachments: Partial<MessageAttachment>[] = [];
    for (const file of files ?? []) {
      const saved = await this.uploadService.saveFile(file, senderId);
      savedAttachments.push({
        originalName: saved.originalName,
        storedName: saved.storedName,
        mimeType: saved.mimeType,
        size: saved.size,
        path: saved.path,
        uploadedById: senderId,
      });
    }

    const message = this.messageRepo.create({
      conversation: conv,
      sender,
      content: sanitizedContent,
      attachments: savedAttachments as MessageAttachment[],
    });

    return this.messageRepo.save(message);
  }

  /**
   * Get all messages in a conversation.
   * - Automatically marks all unread messages (not sent by requester) as read.
   * - Read receipts are included for the admin always.
   * - For the client they're only included when `showReadReceiptsToClient` is true.
   */
  async getMessages(convId: string, requesterId: string, role: UserRole) {
    const conv = await this.convRepo.findOne({
      where: { id: convId },
      relations: ["client", "admin"],
    });
    if (!conv) throw new NotFoundException("Conversation not found");
    this.assertParticipant(conv, requesterId);

    const messages = await this.messageRepo.find({
      where: { conversation: { id: convId } },
      relations: [
        "sender",
        "attachments",
        "readReceipts",
        "readReceipts.reader",
      ],
      order: { createdAt: "ASC" },
    });

    // Mark messages sent by the OTHER party as read
    const unread = messages.filter(
      (m) =>
        m.sender.id !== requesterId &&
        !m.readReceipts.some((rr) => rr.reader.id === requesterId),
    );

    if (unread.length > 0) {
      const reader = await this.userRepo.findOne({
        where: { id: requesterId },
      });
      if (reader) {
        const receipts = unread.map((m) =>
          this.receiptRepo.create({ message: m, reader }),
        );
        await this.receiptRepo.save(receipts);

        // Update in-memory so response is consistent
        for (const m of unread) {
          m.readReceipts.push(...receipts.filter((r) => r.message.id === m.id));
        }
      }
    }

    const showReceipts =
      role === UserRole.ADMIN || conv.showReadReceiptsToClient;

    return messages.map((m) => this.formatMessage(m, showReceipts));
  }

  // ─── Attachments / File serving ───────────────────────────────────────────

  /**
   * Returns the absolute filesystem path for an attachment
   * after verifying the requester is a participant in the conversation.
   */
  async resolveAttachmentPath(
    attachmentId: string,
    requesterId: string,
    role: UserRole,
  ): Promise<string> {
    const attachment = await this.attachmentRepo.findOne({
      where: { id: attachmentId },
      relations: [
        "message",
        "message.conversation",
        "message.conversation.client",
        "message.conversation.admin",
      ],
    });

    if (!attachment) throw new NotFoundException("Attachment not found");

    const conv = attachment.message.conversation;

    // Admins can access any attachment; clients only their own conversation's files
    if (role !== UserRole.ADMIN) {
      this.assertParticipant(conv, requesterId);
    }

    if (!this.uploadService.fileExists(attachment.path)) {
      throw new NotFoundException("File not found on server");
    }

    return this.uploadService.resolveFilePath(attachment.path);
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private assertParticipant(conv: Conversation, userId: string): void {
    if (conv.client.id !== userId && conv.admin.id !== userId) {
      throw new ForbiddenException(
        "You are not a participant in this conversation",
      );
    }
  }

  private formatMessage(message: Message, includeReceipts: boolean) {
    return {
      id: message.id,
      senderId: message.sender.id,
      senderName: message.sender.name,
      content: message.content,
      attachments: message.attachments.map((a) => ({
        id: a.id,
        originalName: a.originalName,
        mimeType: a.mimeType,
        size: a.size,
      })),
      ...(includeReceipts && {
        readReceipts: message.readReceipts.map((rr) => ({
          readerId: rr.reader.id,
          readerName: rr.reader.name,
          readAt: rr.readAt,
        })),
      }),
      createdAt: message.createdAt,
    };
  }
}

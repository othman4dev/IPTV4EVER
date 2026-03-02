import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  ParseUUIDPipe,
  Res,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { Response } from "express";
import * as mime from "mime-types";
import { ChatService } from "./chat.service";
import { CreateConversationDto } from "./dto/create-conversation.dto";
import { CreateMessageDto } from "./dto/create-message.dto";
import { UpdateConversationSettingsDto } from "./dto/update-conversation-settings.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { UserRole } from "../auth/entities/user.entity";
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
} from "../upload/upload.service";

const chatMulterOptions = {
  storage: memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 5,
  },
  fileFilter: (
    _req: any,
    file: Express.Multer.File,
    cb: (err: Error | null, accept: boolean) => void,
  ) => {
    if (ALLOWED_MIME_TYPES[file.mimetype]) {
      cb(null, true);
    } else {
      cb(new Error(`File type "${file.mimetype}" is not allowed.`), false);
    }
  },
};

@Controller("chat")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // ─── Conversations ────────────────────────────────────────────────────────

  /** Admin creates a new conversation with a client. */
  @Post("conversations")
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  createConversation(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateConversationDto,
  ) {
    return this.chatService.createConversation(user.id, dto);
  }

  /** Get all conversations for the requesting user. */
  @Get("conversations")
  getMyConversations(@CurrentUser() user: { id: string; role: UserRole }) {
    return this.chatService.getMyConversations(user.id, user.role);
  }

  /** Get a single conversation by ID. */
  @Get("conversations/:id")
  getConversation(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.chatService.getConversation(id, user.id);
  }

  /** Admin-only: toggle whether the client sees read receipts. */
  @Patch("conversations/:id/settings")
  @Roles(UserRole.ADMIN)
  updateSettings(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateConversationSettingsDto,
  ) {
    return this.chatService.updateSettings(id, user.id, dto);
  }

  // ─── Messages ─────────────────────────────────────────────────────────────

  /**
   * Send a message in a conversation.
   * Accepts multipart/form-data with optional `files` field (up to 5 files).
   * The `content` field carries the text part.
   */
  @Post("conversations/:id/messages")
  @UseInterceptors(FilesInterceptor("files", 5, chatMulterOptions))
  @HttpCode(HttpStatus.CREATED)
  sendMessage(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateMessageDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.chatService.sendMessage(id, user.id, dto, files ?? []);
  }

  /**
   * Get all messages in a conversation.
   * Automatically marks all messages from the other party as read.
   */
  @Get("conversations/:id/messages")
  getMessages(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.chatService.getMessages(id, user.id, user.role);
  }

  // ─── File serving ─────────────────────────────────────────────────────────

  /**
   * Download / view an attachment.
   * Only participants in the related conversation can access the file.
   * Admins can access any attachment.
   */
  @Get("files/:attachmentId")
  async serveAttachment(
    @Param("attachmentId", ParseUUIDPipe) attachmentId: string,
    @CurrentUser() user: { id: string; role: UserRole },
    @Res() res: Response,
  ) {
    const filePath = await this.chatService.resolveAttachmentPath(
      attachmentId,
      user.id,
      user.role,
    );

    const contentType = mime.lookup(filePath) || "application/octet-stream";

    res.setHeader("Content-Type", contentType);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.sendFile(filePath);
  }
}

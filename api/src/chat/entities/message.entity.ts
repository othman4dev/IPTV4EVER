import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  JoinColumn,
} from "typeorm";
import { User } from "../../auth/entities/user.entity";
import { Conversation } from "./conversation.entity";
import { MessageAttachment } from "./message-attachment.entity";
import { ReadReceipt } from "./read-receipt.entity";

@Entity("messages")
export class Message {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Conversation, (conv) => conv.messages, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "conversation_id" })
  conversation!: Conversation;

  @ManyToOne(() => User, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "sender_id" })
  sender!: User;

  /** Text content — optional only if at least one attachment is present */
  @Column({ type: "text", nullable: true })
  content!: string | null;

  @OneToMany(() => MessageAttachment, (att) => att.message, { cascade: true })
  attachments!: MessageAttachment[];

  @OneToMany(() => ReadReceipt, (rr) => rr.message, { cascade: true })
  readReceipts!: ReadReceipt[];

  @CreateDateColumn()
  createdAt!: Date;
}

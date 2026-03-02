import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { Message } from "./message.entity";

@Entity("message_attachments")
export class MessageAttachment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Message, (msg) => msg.attachments, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "message_id" })
  message!: Message;

  /** Sanitized original filename */
  @Column({ type: "varchar", length: 255 })
  originalName!: string;

  /** UUID-based stored filename (no path components) */
  @Column({ type: "varchar", length: 255 })
  storedName!: string;

  @Column({ type: "varchar", length: 100 })
  mimeType!: string;

  /** File size in bytes */
  @Column({ type: "int" })
  size!: number;

  /** Relative path within the uploads directory: {uploaderId}/{storedName} */
  @Column({ type: "varchar", length: 512 })
  path!: string;

  /** The user who uploaded the file (sender of the message) */
  @Column({ type: "varchar", length: 36, name: "uploaded_by_id" })
  uploadedById!: string;

  @CreateDateColumn()
  createdAt!: Date;
}

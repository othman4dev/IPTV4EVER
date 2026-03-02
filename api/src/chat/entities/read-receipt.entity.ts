import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from "typeorm";
import { Message } from "./message.entity";
import { User } from "../../auth/entities/user.entity";

@Entity("read_receipts")
@Unique(["message", "reader"])
export class ReadReceipt {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Message, (msg) => msg.readReceipts, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "message_id" })
  message!: Message;

  @ManyToOne(() => User, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "reader_id" })
  reader!: User;

  @CreateDateColumn({ name: "read_at" })
  readAt!: Date;
}

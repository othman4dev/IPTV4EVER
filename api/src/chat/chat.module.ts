import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";
import { Conversation } from "./entities/conversation.entity";
import { Message } from "./entities/message.entity";
import { MessageAttachment } from "./entities/message-attachment.entity";
import { ReadReceipt } from "./entities/read-receipt.entity";
import { User } from "../auth/entities/user.entity";
import { UploadModule } from "../upload/upload.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Conversation,
      Message,
      MessageAttachment,
      ReadReceipt,
      User,
    ]),
    UploadModule,
  ],
  providers: [ChatService],
  controllers: [ChatController],
  exports: [ChatService],
})
export class ChatModule {}

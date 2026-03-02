import { IsUUID } from "class-validator";

export class CreateConversationDto {
  /** The client user ID to open a conversation with */
  @IsUUID()
  clientId!: string;
}

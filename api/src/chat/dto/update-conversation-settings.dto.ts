import { IsBoolean } from "class-validator";

export class UpdateConversationSettingsDto {
  /** Allow the client to see read receipts for messages in this conversation */
  @IsBoolean()
  showReadReceiptsToClient!: boolean;
}

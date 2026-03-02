import { IsString, IsOptional, MaxLength, MinLength } from "class-validator";

export class CreateMessageDto {
  /**
   * Text content of the message. Optional only when files are attached.
   * Will be sanitized server-side (all HTML stripped).
   */
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content?: string;
}

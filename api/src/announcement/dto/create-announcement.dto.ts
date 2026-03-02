import { IsString, IsInt, IsOptional, IsBoolean, Min } from "class-validator";

export class CreateAnnouncementDto {
  @IsString()
  icon!: string;

  @IsString()
  text!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  order?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

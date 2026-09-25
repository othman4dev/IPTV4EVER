import {
  IsString,
  IsInt,
  IsOptional,
  IsBoolean,
  Min,
  Max,
  IsHexColor,
} from "class-validator";

export class CreateSlideDto {
  @IsString()
  title!: string;

  @IsString()
  subtitle!: string;

  @IsString()
  description!: string;

  @IsString()
  icon!: string;

  @IsOptional()
  @IsHexColor()
  background?: string;

  @IsOptional()
  @IsString()
  bgImage?: string;

  @IsOptional()
  @IsHexColor()
  textColor?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  backgroundDim?: number; // 0-100

  @IsOptional()
  @IsBoolean()
  hasTextBorder?: boolean;

  @IsOptional()
  @IsHexColor()
  textBorderColor?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  order?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

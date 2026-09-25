import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from "class-validator";
import { HeroMediaType } from "../hero.entity";

const LINK_PATTERN = /^(https?:\/\/|\/).+/;

export class CreateHeroDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  titleLine1Prefix!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  titleLine1Highlight!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  titleLine1Suffix!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  titleLine2Prefix!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  titleLine2Highlight!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  titleLine2Suffix!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  subtitle!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  primaryButtonText!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  @Matches(LINK_PATTERN, {
    message:
      "primaryButtonLink must be an absolute URL (http/https) or an internal path starting with /",
  })
  primaryButtonLink!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  secondaryButtonText!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  @Matches(LINK_PATTERN, {
    message:
      "secondaryButtonLink must be an absolute URL (http/https) or an internal path starting with /",
  })
  secondaryButtonLink!: string;

  @IsEnum(HeroMediaType)
  mediaType!: HeroMediaType;

  @IsString()
  @IsNotEmpty()
  mediaPath!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  order?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  heroStyle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  textMode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  textColor?: string;
}

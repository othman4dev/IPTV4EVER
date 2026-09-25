import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";

export class PageSectionItemDto {
  @IsString()
  sectionKey!: string;

  @IsBoolean()
  isVisible!: boolean;

  @IsInt()
  @Min(0)
  order!: number;

  @IsString()
  @IsOptional()
  variant?: string;

  @IsString()
  @IsOptional()
  config?: string;
}

export class UpdatePageLayoutDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PageSectionItemDto)
  sections!: PageSectionItemDto[];
}

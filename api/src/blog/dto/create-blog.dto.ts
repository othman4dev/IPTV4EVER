import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsArray,
  IsIn,
  Min,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class BlogMediaDto {
  @IsString()
  url!: string;

  @IsIn(["image", "video"])
  type!: "image" | "video";

  @IsOptional()
  @IsString()
  caption?: string;
}

export class CreateBlogDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsString()
  content!: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BlogMediaDto)
  media?: BlogMediaDto[];

  @IsOptional()
  @IsInt()
  @Min(1)
  order?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

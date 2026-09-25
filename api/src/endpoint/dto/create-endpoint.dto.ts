import { Transform } from "class-transformer";
import { IsString, IsNotEmpty, IsUrl } from "class-validator";

export class CreateEndpointDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  username!: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  password!: string;

  @IsUrl({ require_protocol: true }, { message: "url must be a valid URL" })
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  url!: string;
}

import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
  MaxLength,
} from "class-validator";
import { UserRole } from "../../auth/entities/user.entity";

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(25)
  phone?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

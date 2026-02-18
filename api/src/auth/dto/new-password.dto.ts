import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class NewPasswordDto {
  @IsEmail({}, { message: "Please provide a valid email address" })
  @IsNotEmpty({ message: "Email is required" })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: "Old password is required" })
  oldPassword!: string;

  @IsString()
  @IsNotEmpty({ message: "Password is required" })
  newPassword!: string;
}

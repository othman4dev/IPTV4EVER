import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { NewPasswordDto } from "./dto/new-password.dto";
import { AuthResponseDto, UserResponseDto } from "./dto/auth-response.dto";
import { JwtPayload } from "./interfaces/auth.interface";
import { User } from "./entities/user.entity";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, name } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = this.userRepository.create({
      email,
      name,
      password: hashedPassword,
    });

    await this.userRepository.save(newUser);

    // Generate JWT token
    const tokens = await this.generateTokens(newUser);

    return {
      ...tokens,
      user: this.sanitizeUser(newUser),
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid email or password");
    }

    // Generate JWT token
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  async changePassword(newPasswordDto: NewPasswordDto): Promise<void> {
    const { email, oldPassword, newPassword } = newPasswordDto;

    // Find user by email
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new UnauthorizedException("Old password is incorrect");
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update user's password
    user.password = hashedNewPassword;
    await this.userRepository.save(user);
  }

  async validateUserById(userId: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    return user || null;
  }

  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return this.sanitizeUser(user);
  }

  private async generateTokens(user: User): Promise<{
    accessToken: string;
    tokenType: string;
    expiresIn: number;
  }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const expiresIn = 3600; // 1 hour

    try {
      const accessToken = await this.jwtService.signAsync(payload, {
        expiresIn,
      });

      return {
        accessToken,
        tokenType: "Bearer",
        expiresIn,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        "Error generating authentication token",
      );
    }
  }

  private sanitizeUser(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone ?? null,
      createdAt: user.createdAt,
    };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { email } });

    // Always return success message to prevent email enumeration
    if (!user) {
      return {
        message:
          "If an account with that email exists, a password reset link has been sent.",
      };
    }

    // Generate reset token (random 32-byte hex string)
    const crypto = require("crypto");
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash the token before storing in database
    const hashedToken = await bcrypt.hash(resetToken, 10);

    // Set token expiry (1 hour from now)
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 1);

    // Save token to user
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = tokenExpiry;
    await this.userRepository.save(user);

    // Send email with reset link
    await this.sendResetEmail(email, resetToken);

    return {
      message:
        "If an account with that email exists, a password reset link has been sent.",
    };
  }

  async resetPassword(resetPasswordDto: {
    token: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    const { token, newPassword } = resetPasswordDto;

    // Find users with non-expired reset tokens
    const users = await this.userRepository
      .createQueryBuilder("user")
      .where("user.resetPasswordExpires > :now", { now: new Date() })
      .andWhere("user.resetPasswordToken IS NOT NULL")
      .getMany();

    // Find the user with matching token
    let matchedUser: User | null = null;
    for (const user of users) {
      if (user.resetPasswordToken) {
        const isValidToken = await bcrypt.compare(
          token,
          user.resetPasswordToken,
        );
        if (isValidToken) {
          matchedUser = user;
          break;
        }
      }
    }

    if (!matchedUser) {
      throw new UnauthorizedException("Invalid or expired reset token");
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear reset token
    matchedUser.password = hashedPassword;
    matchedUser.resetPasswordToken = undefined;
    matchedUser.resetPasswordExpires = undefined;
    await this.userRepository.save(matchedUser);

    return { message: "Password has been successfully reset" };
  }

  private async sendResetEmail(email: string, token: string): Promise<void> {
    const nodemailer = require("nodemailer");

    // Create transporter using SMTP settings from environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Create reset URL (frontend will handle this route)
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${token}`;

    // Email content
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || "IPTV4EVER"}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Password Reset Request</h2>
          <p>You requested to reset your password for your IPTV4EVER account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #666; word-break: break-all;">${resetUrl}</p>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            <strong>This link will expire in 1 hour.</strong>
          </p>
          <p style="color: #666; font-size: 14px;">
            If you didn't request this password reset, please ignore this email.
          </p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Error sending email:", error);
      // Don't throw error to prevent revealing email existence
    }
  }

  // Helper method to get all users (for development/testing only)
  async getAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find();
    return users.map((user) => this.sanitizeUser(user));
  }
}

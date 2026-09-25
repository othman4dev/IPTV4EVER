import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Query,
  Get,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadService } from "./upload.service";

@Controller("upload")
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Get("health")
  health() {
    return { status: "ok" };
  }

  @Post()
  @UseInterceptors(FileInterceptor("file"))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query("uploadType") uploadType: string = "image",
  ) {
    if (!file) {
      throw new BadRequestException("No file provided");
    }

    // Use "system" as uploader ID for admin/system uploads (like slides, announcements, etc)
    const uploaderId = "system";

    try {
      const result = await this.uploadService.saveFile(file, uploaderId);
      return result;
    } catch (error: any) {
      throw new BadRequestException(error.message || "File upload failed");
    }
  }
}

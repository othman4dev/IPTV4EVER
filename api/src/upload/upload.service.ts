import { Injectable, BadRequestException } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import * as path from "path";
import * as fs from "fs";

export const ALLOWED_MIME_TYPES: Record<string, string> = {
  // Images
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  // Videos
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
  // Documents
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",
  "text/plain": ".txt",
};

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export interface SavedFile {
  storedName: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string; // relative path: userId/storedName
}

@Injectable()
export class UploadService {
  private readonly uploadsRoot: string;

  constructor() {
    this.uploadsRoot = path.join(process.cwd(), "uploads");
    this.ensureDir(this.uploadsRoot);
  }

  /**
   * Validate and save a multer file to uploads/{uploaderId}/
   * Returns metadata; throws on invalid type or size.
   */
  async saveFile(
    file: Express.Multer.File,
    uploaderId: string,
  ): Promise<SavedFile> {
    this.validateFile(file);

    const ext = ALLOWED_MIME_TYPES[file.mimetype];
    const storedName = `${uuidv4()}${ext}`;
    const userDir = path.join(this.uploadsRoot, uploaderId);
    this.ensureDir(userDir);

    const fullPath = path.join(userDir, storedName);
    await fs.promises.writeFile(fullPath, file.buffer);

    return {
      storedName,
      originalName: this.sanitizeFilename(file.originalname),
      mimeType: file.mimetype,
      size: file.size,
      path: `${uploaderId}/${storedName}`,
    };
  }

  /**
   * Get the absolute filesystem path for a stored relative path.
   * Validates against path traversal.
   */
  resolveFilePath(relativePath: string): string {
    const normalized = path
      .normalize(relativePath)
      .replace(/^(\.\.(\/|\\|$))+/, "");
    const full = path.join(this.uploadsRoot, normalized);

    // Guard against path traversal
    if (
      !full.startsWith(this.uploadsRoot + path.sep) &&
      full !== this.uploadsRoot
    ) {
      throw new BadRequestException("Invalid file path");
    }
    return full;
  }

  async deleteFile(relativePath: string): Promise<void> {
    const full = this.resolveFilePath(relativePath);
    try {
      await fs.promises.unlink(full);
    } catch {
      // Silently ignore missing files on delete
    }
  }

  fileExists(relativePath: string): boolean {
    try {
      const full = this.resolveFilePath(relativePath);
      return fs.existsSync(full);
    } catch {
      return false;
    }
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private validateFile(file: Express.Multer.File): void {
    if (!ALLOWED_MIME_TYPES[file.mimetype]) {
      throw new BadRequestException(
        `File type "${file.mimetype}" is not allowed. Allowed types: images (jpg, png, gif, webp), videos (mp4, webm, mov), documents (pdf, doc, docx, txt).`,
      );
    }

    const isImage = file.mimetype.startsWith("image/");
    const limit = isImage ? MAX_IMAGE_SIZE_BYTES : MAX_FILE_SIZE_BYTES;

    if (file.size > limit) {
      const limitMb = limit / 1024 / 1024;
      throw new BadRequestException(
        `File too large. Maximum allowed size is ${limitMb} MB for ${isImage ? "images" : "this file type"}.`,
      );
    }
  }

  private sanitizeFilename(name: string): string {
    return path
      .basename(name)
      .replace(/[^a-zA-Z0-9._\-]/g, "_")
      .substring(0, 255);
  }

  private ensureDir(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

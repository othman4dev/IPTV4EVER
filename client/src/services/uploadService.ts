import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export interface UploadResponse {
  storedName: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
}

/**
 * Reusable file upload service for the entire app
 * Supports images, videos, and documents
 */
export const uploadFile = async (
  file: File,
  uploadType: "image" | "video" | "document" = "image",
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("uploadType", uploadType);

  const { data } = await axios.post(`${API_URL}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

/**
 * Upload multiple files at once
 */
export const uploadMultipleFiles = async (
  files: File[],
  uploadType: "image" | "video" | "document" = "image",
): Promise<UploadResponse[]> => {
  return Promise.all(files.map((file) => uploadFile(file, uploadType)));
};

/**
 * Get the full URL for an uploaded file
 */
export const getFileUrl = (filePath: string): string => {
  if (!filePath) return "";
  if (filePath.startsWith("http")) return filePath; // Already a full URL
  return `${API_URL}/uploads/${filePath}`;
};

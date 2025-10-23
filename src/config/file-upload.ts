import path from "node:path";

// File upload configuration constants
export const FILE_UPLOAD_CONFIG = {
  // Upload directories (from environment)
  CV_UPLOAD_DIR: process.env.CV_UPLOAD_DIR as string,

  // File size limits (from environment)
  MAX_CV_FILE_SIZE: Number(process.env.MAX_CV_FILE_SIZE),

  // Allowed MIME types for CV files
  ALLOWED_CV_MIME_TYPES: [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/msword", // .doc
    "application/pdf", // .pdf
  ] as const,

  // Allowed file extensions (from environment)
  ALLOWED_CV_EXTENSIONS: (process.env.ALLOWED_CV_EXTENSIONS as string)
    .split(",")
    .map((ext) => (ext.startsWith(".") ? ext : `.${ext}`)),

  // File naming strategy
  generateFileName: (originalName: string): string => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(originalName);
    return `${timestamp}-${randomString}${extension}`;
  },

  // Get file path for storage
  getStoragePath: (fileName: string): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return path.join(FILE_UPLOAD_CONFIG.CV_UPLOAD_DIR, String(year), month, fileName);
  },
} as const;

// Type for allowed MIME types
export type AllowedMimeType = (typeof FILE_UPLOAD_CONFIG.ALLOWED_CV_MIME_TYPES)[number];

// Type for allowed extensions
export type AllowedExtension = (typeof FILE_UPLOAD_CONFIG.ALLOWED_CV_EXTENSIONS)[number];

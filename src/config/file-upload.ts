import path from "node:path";

// File upload configuration constants
export const FILE_UPLOAD_CONFIG = {
  // Upload directories (configurable via environment)
  CV_UPLOAD_DIR: process.env.CV_UPLOAD_DIR || "./uploads/cvs",

  // File size limits (configurable via environment, default 10MB)
  MAX_CV_FILE_SIZE: Number(process.env.MAX_CV_FILE_SIZE) || 10 * 1024 * 1024, // 10MB in bytes

  // Allowed MIME types for CV files
  ALLOWED_CV_MIME_TYPES: [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/msword", // .doc
    "image/png", // .png
  ] as const,

  // Allowed file extensions (configurable via environment)
  ALLOWED_CV_EXTENSIONS: process.env.ALLOWED_CV_EXTENSIONS 
    ? process.env.ALLOWED_CV_EXTENSIONS.split(',').map(ext => ext.startsWith('.') ? ext : `.${ext}`)
    : [".doc", ".docx", ".png"] as const,

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

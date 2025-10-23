import fs from "node:fs";
import path from "node:path";
import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { FILE_UPLOAD_CONFIG } from "../config/file-upload.js";

// Ensure upload directories exist
function ensureUploadDirExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Custom storage configuration
const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    try {
      // Generate storage path with year/month structure
      const fileName = FILE_UPLOAD_CONFIG.generateFileName(file.originalname);
      const storagePath = FILE_UPLOAD_CONFIG.getStoragePath(fileName);
      const dirPath = path.dirname(storagePath);

      // Ensure directory exists
      ensureUploadDirExists(dirPath);

      cb(null, dirPath);
    } catch (error) {
      cb(error as Error, "");
    }
  },
  filename: (_req, file, cb) => {
    try {
      // Generate unique filename
      const fileName = FILE_UPLOAD_CONFIG.generateFileName(file.originalname);
      cb(null, path.basename(fileName));
    } catch (error) {
      cb(error as Error, "");
    }
  },
});

// File filter function to validate file types
function fileFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback): void {
  // Check MIME type
  const isValidMimeType = FILE_UPLOAD_CONFIG.ALLOWED_CV_MIME_TYPES.some(
    (type) => type === file.mimetype
  );

  // Check file extension
  const fileExtension = path.extname(file.originalname).toLowerCase();
  const isValidExtension = FILE_UPLOAD_CONFIG.ALLOWED_CV_EXTENSIONS.some(
    (ext) => ext.toLowerCase() === fileExtension
  );

  if (isValidMimeType && isValidExtension) {
    cb(null, true);
  } else {
    const error = new Error(
      `Invalid file type. Only ${FILE_UPLOAD_CONFIG.ALLOWED_CV_EXTENSIONS.join(
        ", "
      )} files are allowed.`
    );
    error.name = "INVALID_FILE_TYPE";
    cb(error);
  }
}

// Create multer instance for CV uploads
export const cvUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: FILE_UPLOAD_CONFIG.MAX_CV_FILE_SIZE,
    files: 1, // Only allow one CV file per application
  },
});

// Middleware to handle CV file upload
export const handleCvUpload = cvUpload.single("cvFile");

// Error handling middleware for multer errors
export const handleUploadError = (
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case "LIMIT_FILE_SIZE":
        res.status(400).json({
          success: false,
          error: `File too large. Maximum size is ${
            FILE_UPLOAD_CONFIG.MAX_CV_FILE_SIZE / (1024 * 1024)
          }MB.`,
        });
        return;
      case "LIMIT_FILE_COUNT":
        res.status(400).json({
          success: false,
          error: "Only one CV file is allowed per application.",
        });
        return;
      case "LIMIT_UNEXPECTED_FILE":
        res.status(400).json({
          success: false,
          error: "Unexpected file field. Use 'cvFile' as the field name.",
        });
        return;
      default:
        res.status(400).json({
          success: false,
          error: `File upload error: ${error.message}`,
        });
        return;
    }
  }

  if (error instanceof Error && error.name === "INVALID_FILE_TYPE") {
    res.status(400).json({
      success: false,
      error: error.message,
    });
    return;
  }
  // Pass other errors to the next error handler
  next(error);
};

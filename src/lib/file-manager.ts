import fs from "node:fs/promises";
import path from "node:path";
import { FILE_UPLOAD_CONFIG } from "../config/file-upload.js";

/**
 * Delete a file from the file system
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
    console.log(`File deleted: ${filePath}`);
  } catch (error: unknown) {
    // If file doesn't exist, that's fine - it's already "deleted"
    if (error instanceof Error && "code" in error && error.code !== "ENOENT") {
      console.error(`Error deleting file ${filePath}:`, error);
      throw error;
    }
  }
}

/**
 * Check if a file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get file information
 */
export async function getFileInfo(filePath: string): Promise<{
  size: number;
  mimeType: string;
  exists: boolean;
}> {
  try {
    const stats = await fs.stat(filePath);
    const extension = path.extname(filePath);

    // Determine MIME type based on extension
    let mimeType = "application/octet-stream";
    switch (extension.toLowerCase()) {
      case ".doc":
        mimeType = "application/msword";
        break;
      case ".docx":
        mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        break;
      case ".png":
        mimeType = "image/png";
        break;
    }

    return {
      size: stats.size,
      mimeType,
      exists: true,
    };
  } catch {
    return {
      size: 0,
      mimeType: "application/octet-stream",
      exists: false,
    };
  }
}

/**
 * Recursively clean up old files
 */
async function recursiveCleanup(dirPath: string, cutoffDate: Date): Promise<void> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        await recursiveCleanup(fullPath, cutoffDate);
      } else if (entry.isFile()) {
        const stats = await fs.stat(fullPath);
        if (stats.mtime < cutoffDate) {
          await deleteFile(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`Error cleaning directory ${dirPath}:`, error);
  }
}

/**
 * Clean up old files (for maintenance)
 */
export async function cleanupOldFiles(daysOld: number = 30): Promise<void> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  try {
    const baseDir = FILE_UPLOAD_CONFIG.CV_UPLOAD_DIR;
    await recursiveCleanup(baseDir, cutoffDate);
  } catch (error) {
    console.error("Error during file cleanup:", error);
  }
}

/**
 * Validate uploaded file
 */
export function validateUploadedFile(
  file: Express.Multer.File,
): { isValid: boolean; error?: string } {
  try {
    // Check file size
    if (file.size > FILE_UPLOAD_CONFIG.MAX_CV_FILE_SIZE) {
      return {
        isValid: false,
        error: `File size exceeds ${FILE_UPLOAD_CONFIG.MAX_CV_FILE_SIZE / (1024 * 1024)}MB limit`,
      };
    }

    // Check file type
    if (!FILE_UPLOAD_CONFIG.ALLOWED_CV_MIME_TYPES.includes(file.mimetype as any)) {
      return {
        isValid: false,
        error: `File type ${file.mimetype} is not allowed`,
      };
    }

    return { isValid: true };
  } catch (error) {
    console.error("Error validating file:", error);
    return {
      isValid: false,
      error: "File validation failed",
    };
  }
}

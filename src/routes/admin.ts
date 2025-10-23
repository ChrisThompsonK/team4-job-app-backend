import type { Request, Response } from "express";
import express from "express";
import { cleanupOldFiles, fileExists } from "../lib/file-manager.js";
import { ApplicationRepository } from "../repositories/application-repository.js";

const router = express.Router();
const applicationRepository = new ApplicationRepository();

/**
 * Cleanup old files that are no longer referenced in the database
 * POST /api/admin/cleanup-files
 *
 * Note: This should be protected with admin authentication in production
 */
router.post("/cleanup-files", async (req: Request, res: Response): Promise<void> => {
  try {
    const { daysOld = 30, dryRun = true } = req.body;

    if (typeof daysOld !== "number" || daysOld < 1) {
      res.status(400).json({
        success: false,
        error: "daysOld must be a positive number",
      });
      return;
    }

    // Get all applications with their file paths
    const applications = await applicationRepository.findAll();
    const referencedFiles = new Set(
      applications.map((app: { cvFilePath: string }) => app.cvFilePath)
    );

    let cleanedFiles = 0;
    const errors: string[] = [];

    if (dryRun) {
      // Just report what would be cleaned
      await cleanupOldFiles(daysOld);

      res.json({
        success: true,
        message: "Dry run completed - no files were actually deleted",
        data: {
          daysOld,
          referencedFiles: referencedFiles.size,
          note: "Set dryRun: false to actually perform cleanup",
        },
      });
    } else {
      // Actually perform cleanup
      await cleanupOldFiles(daysOld);
      cleanedFiles++;

      res.json({
        success: true,
        message: "File cleanup completed",
        data: {
          daysOld,
          cleanedFiles,
          referencedFiles: referencedFiles.size,
          errors: errors.length > 0 ? errors : undefined,
        },
      });
    }
  } catch (error) {
    console.error("Error during file cleanup:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error during file cleanup",
    });
  }
});

/**
 * Get file system statistics
 * GET /api/admin/file-stats
 *
 * Note: This should be protected with admin authentication in production
 */
router.get("/file-stats", async (_req: Request, res: Response): Promise<void> => {
  try {
    // Get all applications
    const applications = await applicationRepository.findAll();

    let totalFiles = 0;
    let totalSize = 0;
    let missingFiles = 0;
    const fileTypes: Record<string, number> = {};

    // Check each file
    for (const app of applications) {
      totalFiles++;
      totalSize += app.cvFileSize;

      // Count file types
      const extension = app.cvFileName.split(".").pop()?.toLowerCase() || "unknown";
      fileTypes[extension] = (fileTypes[extension] || 0) + 1;

      // Check if file exists
      const exists = await fileExists(app.cvFilePath);
      if (!exists) {
        missingFiles++;
      }
    }

    res.json({
      success: true,
      data: {
        totalApplications: applications.length,
        totalFiles,
        missingFiles,
        totalSizeBytes: totalSize,
        totalSizeFormatted: `${(totalSize / (1024 * 1024)).toFixed(2)} MB`,
        averageFileSizeBytes: totalFiles > 0 ? Math.round(totalSize / totalFiles) : 0,
        averageFileSizeFormatted:
          totalFiles > 0 ? `${(totalSize / totalFiles / (1024 * 1024)).toFixed(2)} MB` : "0 MB",
        fileTypes,
        healthScore:
          totalFiles > 0 ? Math.round(((totalFiles - missingFiles) / totalFiles) * 100) : 100,
      },
    });
  } catch (error) {
    console.error("Error getting file stats:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error while getting file statistics",
    });
  }
});

/**
 * Validate all files in the system for integrity
 * GET /api/admin/validate-all-files
 *
 * Note: This should be protected with admin authentication in production
 */
router.get("/validate-all-files", async (_req: Request, res: Response): Promise<void> => {
  try {
    const applications = await applicationRepository.findAll();

    const results = [];
    let validFiles = 0;
    let invalidFiles = 0;
    let totalSize = 0;

    for (const application of applications) {
      const exists = await fileExists(application.cvFilePath);

      let actualSize = 0;
      let accessible = false;
      let sizeMismatch = false;

      if (exists) {
        try {
          const stats = await import("node:fs/promises").then((fs) =>
            fs.stat(application.cvFilePath)
          );
          actualSize = stats.size;
          accessible = true;
          sizeMismatch = actualSize !== application.cvFileSize;
          totalSize += actualSize;
        } catch (error) {
          console.error(`Error accessing file ${application.cvFilePath}:`, error);
        }
      }

      const isValid = exists && accessible && !sizeMismatch;

      if (isValid) {
        validFiles++;
      } else {
        invalidFiles++;
      }

      const issues = [
        !exists && "File missing",
        !accessible && "File inaccessible",
        sizeMismatch && `Size mismatch: stored ${application.cvFileSize}, actual ${actualSize}`,
      ].filter(Boolean);

      results.push({
        applicationId: application.id,
        fileName: application.cvFileName,
        filePath: application.cvFilePath,
        isValid,
        issues: issues.length > 0 ? issues : undefined,
      });
    }

    res.json({
      success: true,
      data: {
        summary: {
          totalApplications: applications.length,
          validFiles,
          invalidFiles,
          totalSizeBytes: totalSize,
          totalSizeFormatted: `${(totalSize / (1024 * 1024)).toFixed(2)} MB`,
          healthScore:
            applications.length > 0 ? Math.round((validFiles / applications.length) * 100) : 100,
        },
        details: results,
      },
    });
  } catch (error) {
    console.error("Error validating all files:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error while validating files",
    });
  }
});

/**
 * Verify file integrity for a specific application
 * GET /api/admin/verify-file/:applicationId
 *
 * Note: This should be protected with admin authentication in production
 */
router.get("/verify-file/:applicationId", async (req: Request, res: Response): Promise<void> => {
  try {
    const { applicationId } = req.params;

    if (!applicationId) {
      res.status(400).json({
        success: false,
        error: "Application ID is required",
      });
      return;
    }

    const id = Number.parseInt(applicationId, 10);
    if (Number.isNaN(id) || id <= 0) {
      res.status(400).json({
        success: false,
        error: "Invalid application ID",
      });
      return;
    }

    // Find application
    const application = await applicationRepository.findById(id);
    if (!application) {
      res.status(404).json({
        success: false,
        error: "Application not found",
      });
      return;
    }

    // Check file existence and get actual info
    const exists = await fileExists(application.cvFilePath);

    let actualSize = 0;
    let actualMimeType = "unknown";
    let accessible = false;

    if (exists) {
      try {
        // Try to get file stats
        const stats = await import("node:fs/promises").then((fs) =>
          fs.stat(application.cvFilePath)
        );
        actualSize = stats.size;
        accessible = true;

        // Determine MIME type from extension
        const extension = application.cvFileName.split(".").pop()?.toLowerCase();
        switch (extension) {
          case "doc":
            actualMimeType = "application/msword";
            break;
          case "docx":
            actualMimeType =
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            break;
          case "png":
            actualMimeType = "image/png";
            break;
          default:
            actualMimeType = "application/octet-stream";
        }
      } catch (error) {
        console.error(`Error accessing file ${application.cvFilePath}:`, error);
      }
    }

    const isValid = exists && accessible && actualSize === application.cvFileSize;

    res.json({
      success: true,
      data: {
        applicationId: application.id,
        fileName: application.cvFileName,
        filePath: application.cvFilePath,
        exists,
        accessible,
        isValid,
        storedSize: application.cvFileSize,
        actualSize,
        sizeMismatch: actualSize !== application.cvFileSize,
        storedMimeType: application.cvFileType,
        actualMimeType,
        mimeTypeMismatch: actualMimeType !== application.cvFileType,
        issues: [
          !exists && "File does not exist",
          !accessible && "File exists but is not accessible",
          actualSize !== application.cvFileSize &&
            `Size mismatch: stored ${application.cvFileSize}, actual ${actualSize}`,
          actualMimeType !== application.cvFileType &&
            `MIME type mismatch: stored ${application.cvFileType}, actual ${actualMimeType}`,
        ].filter(Boolean),
      },
    });
  } catch (error) {
    console.error("Error verifying file:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error while verifying file",
    });
  }
});

/**
 * Bulk operation to clean up orphaned files
 * POST /api/admin/cleanup-orphaned-files
 *
 * Note: This should be protected with admin authentication in production
 */
router.post("/cleanup-orphaned-files", async (req: Request, res: Response): Promise<void> => {
  try {
    const { dryRun = true } = req.body;

    // Get all file paths from the database
    const applications = await applicationRepository.findAll();
    const referencedFiles = new Set(
      applications.map((app: { cvFilePath: string }) => app.cvFilePath)
    );

    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const uploadsDir = "./uploads/cvs";

    let foundFiles = 0;
    let orphanedFiles = 0;
    let cleanedFiles = 0;
    const orphanedFilePaths: string[] = [];

    async function scanDirectory(dirPath: string): Promise<void> {
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);

          if (entry.isDirectory()) {
            await scanDirectory(fullPath);
          } else {
            foundFiles++;

            // Check if this file is referenced in the database
            if (!referencedFiles.has(fullPath)) {
              orphanedFiles++;
              orphanedFilePaths.push(fullPath);

              if (!dryRun) {
                try {
                  await fs.unlink(fullPath);
                  cleanedFiles++;
                } catch (error) {
                  console.error(`Error deleting orphaned file ${fullPath}:`, error);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error scanning directory ${dirPath}:`, error);
      }
    }

    // Check if uploads directory exists
    try {
      await fs.access(uploadsDir);
      await scanDirectory(uploadsDir);
    } catch (_error) {
      console.log("Uploads directory does not exist yet");
    }

    res.json({
      success: true,
      message: dryRun
        ? "Dry run completed - no files were actually deleted"
        : "Orphaned file cleanup completed",
      data: {
        foundFiles,
        referencedFiles: referencedFiles.size,
        orphanedFiles,
        cleanedFiles: dryRun ? 0 : cleanedFiles,
        orphanedFilePaths: dryRun ? orphanedFilePaths : undefined,
        note: dryRun ? "Set dryRun: false to actually perform cleanup" : undefined,
      },
    });
  } catch (error) {
    console.error("Error during orphaned file cleanup:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error during orphaned file cleanup",
    });
  }
});

export default router;

import path from "node:path";
import type { Request, Response } from "express";
import express from "express";
import { fileExists, getFileInfo } from "../lib/file-manager.js";
import { ApplicationService } from "../services/application-service.js";

const router = express.Router();
const applicationService = new ApplicationService();

/**
 * Serve CV files for applications
 * GET /api/files/cv/:applicationId
 */
router.get("/cv/:applicationId", async (req: Request, res: Response): Promise<void> => {
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

    // Get application to verify it exists and get file info
    const application = await applicationService.getApplicationById(id);
    if (!application) {
      res.status(404).json({
        success: false,
        error: "Application not found",
      });
      return;
    }

    // TODO: Add authentication/authorization check here
    // For now, we'll allow access to all files
    // In a real application, you'd want to check:
    // - User is authenticated
    // - User owns the application OR user is an admin

    const filePath = application.cvFilePath;

    // Check if file exists
    const fileExistsResult = await fileExists(filePath);
    if (!fileExistsResult) {
      res.status(404).json({
        success: false,
        error: "CV file not found",
      });
      return;
    }

    // Get file info
    const _fileInfo = await getFileInfo(filePath); // Set appropriate headers
    res.setHeader("Content-Type", _fileInfo?.mimeType || application.cvFileType || "application/octet-stream");
    res.setHeader("Content-Length", _fileInfo?.size || application.cvFileSize || 0);
    res.setHeader("Content-Disposition", `inline; filename="${_fileInfo?.name || application.cvFileName || "file"}"`);

    // Serve the file
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    console.error("Error serving CV file:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error while serving file",
    });
  }
});

/**
 * Download CV files for applications (forces download instead of inline)
 * GET /api/files/cv/:applicationId/download
 */
router.get("/cv/:applicationId/download", async (req: Request, res: Response): Promise<void> => {
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

    // Get application
    const application = await applicationService.getApplicationById(id);
    if (!application) {
      res.status(404).json({
        success: false,
        error: "Application not found",
      });
      return;
    }

    const filePath = application.cvFilePath;

    // Check if file exists
    const fileExistsResult = await fileExists(filePath);
    if (!fileExistsResult) {
      res.status(404).json({
        success: false,
        error: "CV file not found",
      });
      return;
    } // Set headers to force download
    res.setHeader("Content-Type", application.cvFileType);
    res.setHeader("Content-Length", application.cvFileSize);
    res.setHeader("Content-Disposition", `attachment; filename="${application.cvFileName}"`);

    // Serve the file
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    console.error("Error downloading CV file:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error while downloading file",
    });
  }
});

/**
 * Get CV file metadata without downloading
 * GET /api/files/cv/:applicationId/info
 */
router.get("/cv/:applicationId/info", async (req: Request, res: Response): Promise<void> => {
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

    // Get application
    const application = await applicationService.getApplicationById(id);
    if (!application) {
      res.status(404).json({
        success: false,
        error: "Application not found",
      });
      return;
    }

    const filePath = application.cvFilePath;

    // Check if file exists and get info
    const fileExistsResult = await fileExists(filePath);
    const fileInfo = await getFileInfo(filePath);

    res.json({
      success: true,
      data: {
        applicationId: application.id,
        fileName: application.cvFileName,
        fileType: application.cvFileType,
        fileSize: application.cvFileSize,
        fileSizeFormatted: `${(application.cvFileSize / (1024 * 1024)).toFixed(2)} MB`,
        exists: fileExistsResult,
        actualSize: fileInfo.size,
        actualMimeType: fileInfo.mimeType,
        isConsistent:
          fileInfo.size === application.cvFileSize && fileInfo.mimeType === application.cvFileType,
      },
    });
  } catch (error) {
    console.error("Error getting CV file info:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error while getting file info",
    });
  }
});

export default router;

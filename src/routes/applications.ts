import { Router } from "express";
import { ApplicationController } from "../controllers/application-controller.js";
import { handleCvUpload, handleUploadError } from "../middleware/file-upload.js";

const router = Router();
const controller = new ApplicationController();

// POST /api/applications - Submit a new application with CV file upload (no authentication required)
router.post("/", handleCvUpload, handleUploadError, controller.createApplication);

// GET /api/applications/:id - Get specific application (no authentication required)
router.get("/:id", controller.getApplicationById);

// GET /api/applications/job/:jobRoleId - Get all applications for a job role (no authentication required)
router.get("/job/:jobRoleId", controller.getApplicationsByJobRole);

// GET /api/applications/user/:userId - Get all applications for a user (no authentication required)
router.get("/user/:userId", controller.getApplicationsByUserId);

// PUT /api/applications/:id/hire - Hire an applicant (no authentication required)
router.put("/:id/hire", controller.hireApplicant);

// PUT /api/applications/:id/reject - Reject an applicant (no authentication required)
router.put("/:id/reject", controller.rejectApplicant);

// DELETE /api/applications/:id - Delete an application (no authentication required)
router.delete("/:id", controller.deleteApplication);

export default router;

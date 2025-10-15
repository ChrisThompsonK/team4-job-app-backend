import { Router } from "express";
import { ApplicationController } from "../controllers/application-controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();
const controller = new ApplicationController();

// POST /api/applications - Submit a new application (requires authentication)
router.post("/", authenticateToken, controller.createApplication);

// GET /api/applications/:id - Get specific application (requires authentication)
router.get("/:id", authenticateToken, controller.getApplicationById);

// GET /api/applications/job/:jobRoleId - Get all applications for a job role (admin only)
router.get("/job/:jobRoleId", authenticateToken, controller.getApplicationsByJobRole);

// PUT /api/applications/:id/hire - Hire an applicant (no authentication required)
router.put("/:id/hire", controller.hireApplicant);

// PUT /api/applications/:id/reject - Reject an applicant (admin only)
router.put("/:id/reject", authenticateToken, controller.rejectApplicant);

export default router;

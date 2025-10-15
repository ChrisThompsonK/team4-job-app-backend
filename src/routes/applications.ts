import { Router } from "express";
import { ApplicationController } from "../controllers/application-controller.js";

const router = Router();
const controller = new ApplicationController();

// POST /api/applications - Submit a new application (no authentication required)
router.post("/", controller.createApplication);

// GET /api/applications/:id - Get specific application (no authentication required)
router.get("/:id", controller.getApplicationById);

// GET /api/applications/job/:jobRoleId - Get all applications for a job role (no authentication required)
router.get("/job/:jobRoleId", controller.getApplicationsByJobRole);

// PUT /api/applications/:id/hire - Hire an applicant (no authentication required)
router.put("/:id/hire", controller.hireApplicant);

// PUT /api/applications/:id/reject - Reject an applicant (no authentication required)
router.put("/:id/reject", controller.rejectApplicant);

export default router;

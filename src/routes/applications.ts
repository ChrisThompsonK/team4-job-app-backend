import { Router } from "express";
import { ApplicationController } from "../controllers/application-controller.js";

const router = Router();
const controller = new ApplicationController();

// POST /api/applications - Submit a new application
router.post("/", controller.createApplication);

// GET /api/applications/:id - Get specific application
router.get("/:id", controller.getApplicationById);

// GET /api/applications/job/:jobRoleId - Get all applications for a job role
router.get("/job/:jobRoleId", controller.getApplicationsByJobRole);

export default router;

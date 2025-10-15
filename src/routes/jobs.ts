import { Router } from "express";
import { JobRoleController } from "../controllers/job-role-controller.js";

const router = Router();
const controller = new JobRoleController();

// GET /api/jobs - Get all job roles
router.get("/", controller.getAllJobRoles);

// GET /api/jobs/status/:status - Filter jobs by status
router.get("/status/:status", controller.getJobRolesByStatus);

// GET /api/jobs/:id - Get specific job role
router.get("/:id", controller.getJobRoleById);

// POST /api/jobs - Create a new job role
router.post("/", controller.createJobRole);

// PUT /api/jobs/:id - Update specific job role
router.put("/:id", controller.updateJobRole);

// DELETE /api/jobs/:id - Delete specific job role
router.delete("/:id", controller.deleteJobRole);

export default router;

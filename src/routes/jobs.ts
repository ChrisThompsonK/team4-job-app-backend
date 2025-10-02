import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { jobRoles, type JobRole } from "../db/schema.js";

const router = Router();

// GET /api/jobs - Get all job roles
router.get("/", async (_req, res) => {
  try {
    const jobs = await db.select().from(jobRoles).orderBy(jobRoles.id);

    // Convert closingDate string to Date object for frontend
    const formattedJobs = jobs.map((job) => ({
      ...job,
      closingDate: new Date(job.closingDate),
    }));

    res.json({
      success: true,
      data: formattedJobs,
      count: formattedJobs.length,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch job roles",
    });
  }
});

// GET /api/jobs/:id - Get specific job role
router.get("/:id", async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const jobId = parseInt(id, 10);

    if (isNaN(jobId)) {
      res.status(400).json({
        success: false,
        error: "Invalid job ID",
      });
      return;
    }

    const job = await db.select().from(jobRoles).where(eq(jobRoles.id, jobId)).limit(1);

    if (job.length === 0) {
      res.status(404).json({
        success: false,
        error: "Job not found",
      });
      return;
    }

    // Convert closingDate string to Date object for frontend
    const foundJob = job[0]!; // Non-null assertion since we checked length above
    const formattedJob = {
      ...foundJob,
      closingDate: new Date(foundJob.closingDate),
    };

    res.json({
      success: true,
      data: formattedJob,
    });
  } catch (error) {
    console.error("Error fetching job:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch job role",
    });
  }
});

// GET /api/jobs/status/:status - Filter jobs by status
router.get("/status/:status", async (req, res): Promise<void> => {
  try {
    const { status } = req.params;

    if (status !== "open" && status !== "closed") {
      res.status(400).json({
        success: false,
        error: "Invalid status. Must be 'open' or 'closed'",
      });
      return;
    }

    const jobs = await db
      .select()
      .from(jobRoles)
      .where(eq(jobRoles.status, status))
      .orderBy(jobRoles.id);

    const formattedJobs = jobs.map((job) => ({
      ...job,
      closingDate: new Date(job.closingDate),
    }));

    res.json({
      success: true,
      data: formattedJobs,
      count: formattedJobs.length,
      filter: status,
    });
  } catch (error) {
    console.error("Error filtering jobs:", error);
    res.status(500).json({
      success: false,
      error: "Failed to filter job roles",
    });
  }
});

export default router;

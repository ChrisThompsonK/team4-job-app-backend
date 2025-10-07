import { eq } from "drizzle-orm";
import { Router } from "express";
import { db } from "../db/index.js";
import type { NewJobRole } from "../db/schema.js";
import { jobRoles } from "../db/schema.js";

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

    if (Number.isNaN(jobId)) {
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
    const foundJob = job[0] as NonNullable<(typeof job)[0]>; // Safe since we checked length above
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

// POST /api/jobs - Create a new job role
router.post("/", async (req, res): Promise<void> => {
  try {
    const {
      name,
      location,
      capability,
      band,
      closingDate,
      summary,
      keyResponsibilities,
      status,
      numberOfOpenPositions,
    } = req.body;

    // Validation
    if (
      !name ||
      !location ||
      !capability ||
      !band ||
      !closingDate ||
      !summary ||
      !keyResponsibilities
    ) {
      res.status(400).json({
        success: false,
        error:
          "Missing required fields. Required: name, location, capability, band, closingDate, summary, keyResponsibilities",
      });
      return;
    }

    // Validate status
    const jobStatus = status || "open";
    if (jobStatus !== "open" && jobStatus !== "closed") {
      res.status(400).json({
        success: false,
        error: "Invalid status. Must be 'open' or 'closed'",
      });
      return;
    }

    // Validate numberOfOpenPositions
    const positions = numberOfOpenPositions || 1;
    if (typeof positions !== "number" || positions < 0) {
      res.status(400).json({
        success: false,
        error: "numberOfOpenPositions must be a non-negative number",
      });
      return;
    }

    // Validate and format closing date
    let formattedClosingDate: string;
    try {
      const date = new Date(closingDate);
      if (Number.isNaN(date.getTime())) {
        throw new Error("Invalid date");
      }
      formattedClosingDate = date.toISOString();
    } catch (_error) {
      res.status(400).json({
        success: false,
        error: "Invalid closingDate. Must be a valid date string",
      });
      return;
    }

    // Create new job role
    const newJob: NewJobRole = {
      name,
      location,
      capability,
      band,
      closingDate: formattedClosingDate,
      summary,
      keyResponsibilities,
      status: jobStatus,
      numberOfOpenPositions: positions,
    };

    const result = await db.insert(jobRoles).values(newJob).returning();

    if (result.length === 0) {
      res.status(500).json({
        success: false,
        error: "Failed to create job role",
      });
      return;
    }

    const createdJob = result[0];
    if (!createdJob) {
      res.status(500).json({
        success: false,
        error: "Failed to create job role",
      });
      return;
    }

    const formattedJob = {
      ...createdJob,
      closingDate: new Date(createdJob.closingDate),
    };

    res.status(201).json({
      success: true,
      message: "Job role created successfully",
      data: formattedJob,
    });
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create job role",
    });
  }
});

export default router;

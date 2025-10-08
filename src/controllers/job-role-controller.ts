import type { Request, Response } from "express";
import { JobRoleService } from "../services/job-role-service.js";

export class JobRoleController {
  private service: JobRoleService;

  constructor(service?: JobRoleService) {
    this.service = service || new JobRoleService();
  }

  getAllJobRoles = async (_req: Request, res: Response): Promise<void> => {
    try {
      const jobs = await this.service.getAllJobRoles();

      res.json({
        success: true,
        data: jobs,
        count: jobs.length,
      });
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({
        error: "Failed to fetch job roles",
      });
    }
  };

  getJobRoleById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          error: "Job ID is required",
        });
        return;
      }

      const jobId = parseInt(id, 10);

      if (Number.isNaN(jobId)) {
        res.status(400).json({
          error: "Invalid job ID",
        });
        return;
      }

      const job = await this.service.getJobRoleById(jobId);

      if (!job) {
        res.status(404).json({
          error: "Job not found",
        });
        return;
      }

      res.json(job,);
      } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch job role",
      });
    }
  };

  getJobRolesByStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { status } = req.params;

      if (status !== "open" && status !== "closed") {
        res.status(400).json({
          error: "Invalid status. Must be 'open' or 'closed'",
        });
        return;
      }

      const jobs = await this.service.getJobRolesByStatus(status);

      res.json({
        success: true,
        data: jobs,
        count: jobs.length,
        filter: status,
      });
    } catch (error) {
      console.error("Error filtering jobs:", error);
      res.status(500).json({
        error: "Failed to filter job roles",
      });
    }
  };

  createJobRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const jobRole = await this.service.createJobRole(req.body);

      res.status(201).json({
        message: "Job role created successfully",
        data: jobRole,
      });
    } catch (error) {
      console.error("Error creating job:", error);

      // Handle validation errors
      if (error instanceof Error) {
        const errorMessage = error.message;

        // Check if it's a validation error
        if (
          errorMessage.includes("Missing required fields") ||
          errorMessage.includes("Invalid status") ||
          errorMessage.includes("numberOfOpenPositions") ||
          errorMessage.includes("Invalid closingDate")
        ) {
          res.status(400).json({
            error: errorMessage,
          });
          return;
        }
      }

      res.status(500).json({
        error: "Failed to create job role",
      });
    }
  };
}

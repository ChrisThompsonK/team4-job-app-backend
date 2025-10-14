import type { Request, Response } from "express";
import { handleError } from "../errors/custom-errors.js";
import { JobRoleService } from "../services/job-role-service.js";

export class JobRoleController {
  private service: JobRoleService;

  constructor(service?: JobRoleService) {
    this.service = service || new JobRoleService();
  }

  getAllJobRoles = async (req: Request, res: Response): Promise<void> => {
    try {
      // Parse query parameters for pagination
      const { limit, offset } = req.query;

      let parsedLimit: number | undefined;
      let parsedOffset: number | undefined;

      // Validate and parse limit
      if (limit !== undefined) {
        const limitNum = parseInt(limit as string, 10);
        if (Number.isNaN(limitNum) || limitNum < 1) {
          res.status(400).json({
            error: "Invalid limit parameter. Must be a positive integer.",
          });
          return;
        }
        parsedLimit = limitNum;
      }

      // Validate and parse offset
      if (offset !== undefined) {
        const offsetNum = parseInt(offset as string, 10);
        if (Number.isNaN(offsetNum) || offsetNum < 0) {
          res.status(400).json({
            error: "Invalid offset parameter. Must be a non-negative integer.",
          });
          return;
        }
        parsedOffset = offsetNum;
      }

      const jobs = await this.service.getAllJobRoles(parsedLimit, parsedOffset);

      res.json({
        success: true,
        data: jobs,
        count: jobs.length,
        pagination: {
          limit: parsedLimit,
          offset: parsedOffset,
        },
      });
    } catch (error) {
      handleError(error, res, "Failed to fetch job roles");
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

      res.json(job);
    } catch (error) {
      handleError(error, res, "Failed to fetch job role");
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
      handleError(error, res, "Failed to filter job roles");
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
      handleError(error, res, "Failed to create job role");
    }
  };
}

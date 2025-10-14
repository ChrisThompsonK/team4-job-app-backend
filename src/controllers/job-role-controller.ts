import type { Request, Response } from "express";
import { handleError } from "../errors/custom-errors.js";
import { JobRoleService } from "../services/job-role-service.js";

interface PaginationParams {
  limit?: number;
  offset?: number;
}

interface ParsedPaginationResult {
  isValid: boolean;
  error?: string;
  params?: PaginationParams;
}

function parseIntParam(
  value: unknown,
  name: string,
  minValue = 0
): { isValid: boolean; value?: number; error?: string } {
  if (value === undefined) {
    return { isValid: true };
  }

  const parsed = parseInt(value as string, 10);
  if (Number.isNaN(parsed) || parsed < minValue) {
    const constraint = minValue === 0 ? "non-negative integer" : "positive integer";
    return {
      isValid: false,
      error: `Invalid ${name} parameter. Must be a ${constraint}.`,
    };
  }

  return { isValid: true, value: parsed };
}

function parsePaginationParams(limit?: unknown, offset?: unknown): ParsedPaginationResult {
  const params: PaginationParams = {};

  const paramsToParse: Array<{ value: unknown; name: keyof PaginationParams; minValue: number }> = [
    { value: limit, name: "limit", minValue: 1 },
    { value: offset, name: "offset", minValue: 0 },
  ];

  for (const { value, name, minValue } of paramsToParse) {
    const result = parseIntParam(value, name, minValue);
    if (!result.isValid) {
      return { isValid: false, error: result.error || `Invalid ${name} parameter` };
    }
    if (result.value !== undefined) {
      params[name] = result.value;
    }
  }

  return {
    isValid: true,
    params,
  };
}

export class JobRoleController {
  private service: JobRoleService;

  constructor(service?: JobRoleService) {
    this.service = service || new JobRoleService();
  }

  getAllJobRoles = async (req: Request, res: Response): Promise<void> => {
    try {
      // Parse query parameters for pagination
      const { limit, offset } = req.query;
      const paginationResult = parsePaginationParams(limit, offset);

      if (!paginationResult.isValid) {
        res.status(400).json({
          error: paginationResult.error,
        });
        return;
      }

      const { limit: parsedLimit, offset: parsedOffset } = paginationResult.params || {};
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

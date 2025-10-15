import type { Request, Response } from "express";
import { handleError } from "../errors/custom-errors.js";
import { ApplicationService } from "../services/application-service.js";

export class ApplicationController {
  private service: ApplicationService;

  constructor(service?: ApplicationService) {
    this.service = service || new ApplicationService();
  }

  createApplication = async (req: Request, res: Response): Promise<void> => {
    try {
      const { jobRoleId, cvText, userId } = req.body;

      // Get userId from authenticated user
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          error: "User authentication required",
        });
        return;
      }

      if (!jobRoleId || !cvText) {
        res.status(400).json({
          error: "Job role ID, CV text, and user ID are required",
        });
        return;
      }

      const application = await this.service.createApplication({
        userId: userId,
        jobRoleId: Number.parseInt(jobRoleId, 10),
        cvText,
      });

      res.status(201).json({
        data: application,
        message: "Application submitted successfully",
      });
    } catch (error) {
      handleError(error, res, "Failed to create application");
    }
  };

  getApplicationById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          error: "Application ID is required",
        });
        return;
      }

      const applicationId = Number.parseInt(id, 10);

      if (Number.isNaN(applicationId)) {
        res.status(400).json({
          error: "Invalid application ID",
        });
        return;
      }

      const application = await this.service.getApplicationById(applicationId);

      if (!application) {
        res.status(404).json({
          error: "Application not found",
        });
        return;
      }

      res.json({
        data: application,
      });
    } catch (error) {
      handleError(error, res, "Failed to fetch application");
    }
  };

  getApplicationsByJobRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const { jobRoleId } = req.params;

      if (!jobRoleId) {
        res.status(400).json({
          error: "Job role ID is required",
        });
        return;
      }

      const id = Number.parseInt(jobRoleId, 10);

      if (Number.isNaN(id)) {
        res.status(400).json({
          error: "Invalid job role ID",
        });
        return;
      }

      const applications = await this.service.getApplicationsByJobRole(id);

      res.json({
        data: applications,
        count: applications.length,
      });
    } catch (error) {
      handleError(error, res, "Failed to fetch applications");
    }
  };

  hireApplicant = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          error: "Application ID is required",
        });
        return;
      }

      const applicationId = Number.parseInt(id, 10);

      if (Number.isNaN(applicationId) || applicationId <= 0) {
        res.status(400).json({
          error: "Invalid application ID",
        });
        return;
      }

      const result = await this.service.hireApplicant(applicationId);

      res.json({
        message: "Application hired successfully",
        data: result,
      });
    } catch (error) {
      handleError(error, res, "Failed to hire applicant");
    }
  };

  rejectApplicant = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          error: "Application ID is required",
        });
        return;
      }

      const applicationId = Number.parseInt(id, 10);

      if (Number.isNaN(applicationId) || applicationId <= 0) {
        res.status(400).json({
          error: "Invalid application ID",
        });
        return;
      }

      const result = await this.service.rejectApplicant(applicationId);

      res.json({
        message: "Application rejected",
        data: result,
      });
    } catch (error) {
      handleError(error, res, "Failed to reject applicant");
    }
  };
}

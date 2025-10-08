import type { Request, Response } from "express";
import { ApplicationService } from "../services/application-service.js";

export class ApplicationController {
  private service: ApplicationService;

  constructor(service?: ApplicationService) {
    this.service = service || new ApplicationService();
  }

  createApplication = async (req: Request, res: Response): Promise<void> => {
    try {
      const { jobRoleId, cvText } = req.body;

      if (!jobRoleId || !cvText) {
        res.status(400).json({
          success: false,
          error: "Job role ID and CV text are required",
        });
        return;
      }

      const application = await this.service.createApplication({
        jobRoleId: Number.parseInt(jobRoleId, 10),
        cvText,
      });

      res.status(201).json({
        success: true,
        data: application,
        message: "Application submitted successfully",
      });
    } catch (error) {
      console.error("Error creating application:", error);

      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: "Failed to create application",
        });
      }
    }
  };

  getApplicationById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: "Application ID is required",
        });
        return;
      }

      const applicationId = Number.parseInt(id, 10);

      if (Number.isNaN(applicationId)) {
        res.status(400).json({
          success: false,
          error: "Invalid application ID",
        });
        return;
      }

      const application = await this.service.getApplicationById(applicationId);

      if (!application) {
        res.status(404).json({
          success: false,
          error: "Application not found",
        });
        return;
      }

      res.json({
        success: true,
        data: application,
      });
    } catch (error) {
      console.error("Error fetching application:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch application",
      });
    }
  };

  getApplicationsByJobRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const { jobRoleId } = req.params;

      if (!jobRoleId) {
        res.status(400).json({
          success: false,
          error: "Job role ID is required",
        });
        return;
      }

      const id = Number.parseInt(jobRoleId, 10);

      if (Number.isNaN(id)) {
        res.status(400).json({
          success: false,
          error: "Invalid job role ID",
        });
        return;
      }

      const applications = await this.service.getApplicationsByJobRole(id);

      res.json({
        success: true,
        data: applications,
        count: applications.length,
      });
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch applications",
      });
    }
  };
}

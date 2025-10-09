import { db } from "../db/index.js";
import type { NewApplication } from "../db/schema.js";
import { BusinessLogicError, NotFoundError, ValidationError } from "../errors/custom-errors.js";
import { ApplicationRepository } from "../repositories/application-repository.js";
import { JobRoleRepository } from "../repositories/job-role-repository.js";
import { ApplicationValidator } from "../validators/application-validator.js";

interface CreateApplicationInput {
  jobRoleId: number;
  cvText: string;
}

export class ApplicationService {
  private applicationRepository: ApplicationRepository;
  private jobRoleRepository: JobRoleRepository;
  private validator: ApplicationValidator;

  constructor(
    applicationRepository?: ApplicationRepository,
    jobRoleRepository?: JobRoleRepository,
    validator?: ApplicationValidator
  ) {
    this.applicationRepository = applicationRepository || new ApplicationRepository();
    this.jobRoleRepository = jobRoleRepository || new JobRoleRepository();
    this.validator = validator || new ApplicationValidator();
  }

  async createApplication(input: CreateApplicationInput) {
    // Validate input data
    const validation = this.validator.validateApplication(input);
    if (!validation.isValid) {
      throw new ValidationError(validation.errors.map((e) => e.message).join(", "));
    }

    // Check if job role exists
    const jobRole = await this.jobRoleRepository.findById(input.jobRoleId);
    if (!jobRole) {
      throw new NotFoundError("Job role not found");
    }

    // Check if job role is open
    if (jobRole.status !== "open") {
      throw new BusinessLogicError("This job role is not currently accepting applications");
    }

    // Check if there are open positions
    if (jobRole.numberOfOpenPositions <= 0) {
      throw new BusinessLogicError("There are no open positions for this job role");
    }

    // Create the application
    const newApplication: NewApplication = {
      jobRoleId: input.jobRoleId,
      cvText: input.cvText.trim(),
      status: "in progress",
      createdAt: new Date().toISOString(),
    };

    const application = await this.applicationRepository.create(newApplication);

    if (!application) {
      throw new Error("Failed to create application");
    }

    return application;
  }

  async getApplicationById(id: number) {
    if (!id || !Number.isInteger(id) || id <= 0) {
      throw new ValidationError("Valid application ID is required");
    }

    const application = await this.applicationRepository.findById(id);

    if (!application) {
      return null;
    }

    // Convert createdAt string to Date object for frontend
    return {
      ...application,
      createdAt: new Date(application.createdAt),
    };
  }

  async getApplicationsByJobRole(jobRoleId: number) {
    if (!jobRoleId || !Number.isInteger(jobRoleId) || jobRoleId <= 0) {
      throw new ValidationError("Valid job role ID is required");
    }

    const applications = await this.applicationRepository.findByJobRoleId(jobRoleId);

    // Convert createdAt string to Date object for frontend
    return applications.map((app) => ({
      ...app,
      createdAt: new Date(app.createdAt),
    }));
  }

  async hireApplicant(applicationId: number) {
    // Validate application ID
    if (!applicationId || !Number.isInteger(applicationId) || applicationId <= 0) {
      throw new ValidationError("Valid application ID is required");
    }

    // Use transaction to ensure atomicity
    return await db.transaction(async (_tx) => {
      // Get application with job role data
      const result = await this.applicationRepository.findByIdWithJobRole(applicationId);

      if (!result) {
        throw new NotFoundError("Application not found");
      }

      const { application, jobRole } = result;

      // Validate status transition
      const statusValidation = this.validator.validateStatusTransition(application.status, "hired");
      if (!statusValidation.isValid) {
        throw new BusinessLogicError(statusValidation.errors.map((e) => e.message).join(", "));
      }

      // Check if there are open positions
      if (jobRole.numberOfOpenPositions <= 0) {
        throw new BusinessLogicError("No open positions available for this job role");
      }

      // Update application status to hired
      const updatedApplication = await this.applicationRepository.updateStatus(
        applicationId,
        "hired"
      );

      if (!updatedApplication) {
        throw new Error("Failed to update application status");
      }

      // Decrement open positions
      const updatedJobRole = await this.jobRoleRepository.decrementOpenPositions(jobRole.id);

      if (!updatedJobRole) {
        throw new Error("Failed to update job role positions");
      }

      return {
        application: {
          ...updatedApplication,
          createdAt: new Date(updatedApplication.createdAt),
        },
        jobRole: updatedJobRole,
      };
    });
  }

  async rejectApplicant(applicationId: number) {
    // Validate application ID
    if (!applicationId || !Number.isInteger(applicationId) || applicationId <= 0) {
      throw new ValidationError("Valid application ID is required");
    }

    // Get application
    const application = await this.applicationRepository.findById(applicationId);

    if (!application) {
      throw new NotFoundError("Application not found");
    }

    // Validate status transition
    const statusValidation = this.validator.validateStatusTransition(
      application.status,
      "rejected"
    );
    if (!statusValidation.isValid) {
      throw new BusinessLogicError(statusValidation.errors.map((e) => e.message).join(", "));
    }

    // Update application status to rejected
    const updatedApplication = await this.applicationRepository.updateStatus(
      applicationId,
      "rejected"
    );

    if (!updatedApplication) {
      throw new Error("Failed to update application status");
    }

    return {
      ...updatedApplication,
      createdAt: new Date(updatedApplication.createdAt),
    };
  }
}

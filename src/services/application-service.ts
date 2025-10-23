import type { NewApplication } from "../db/schema.js";
import { BusinessLogicError, NotFoundError, ValidationError } from "../errors/custom-errors.js";
import { deleteFile } from "../lib/file-manager.js";
import { ApplicationRepository } from "../repositories/application-repository.js";
import { JobRoleRepository } from "../repositories/job-role-repository.js";
import { ApplicationValidator } from "../validators/application-validator.js";

interface CreateApplicationInput {
  userId: number;
  jobRoleId: number;
  cvFile: Express.Multer.File;
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

    // Check if user has already applied for this job
    const existingApplication = await this.applicationRepository.findByUserIdAndJobRoleId(
      input.userId,
      input.jobRoleId
    );
    if (existingApplication) {
      throw new BusinessLogicError("You have already applied for this job role");
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

    // Process the uploaded file
    const file = input.cvFile;

    // The file has already been saved by multer middleware
    // Use the path where multer stored the file
    const actualStoragePath = file.path; // Create the application with file metadata
    const newApplication: NewApplication = {
      userId: input.userId,
      jobRoleId: input.jobRoleId,
      cvFileName: file.originalname,
      cvFilePath: actualStoragePath,
      cvFileType: file.mimetype,
      cvFileSize: file.size,
      status: "in progress",
      createdAt: new Date().toISOString(),
    };

    try {
      const application = await this.applicationRepository.create(newApplication);

      if (!application) {
        // If application creation failed, clean up the uploaded file
        await deleteFile(actualStoragePath);
        throw new Error("Failed to create application");
      }

      return application;
    } catch (error) {
      // If anything goes wrong, clean up the uploaded file
      await deleteFile(actualStoragePath);
      throw error;
    }
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

  async getApplicationsByUserId(userId: number) {
    if (!userId || !Number.isInteger(userId) || userId <= 0) {
      throw new ValidationError("Valid user ID is required");
    }

    const applications = await this.applicationRepository.findByUserId(userId);

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
    await this.applicationRepository.updateStatus(applicationId, "hired");

    // Decrement open positions
    await this.jobRoleRepository.decrementOpenPositions(jobRole.id);

    // Fetch the updated application with user details
    const updatedApplication = await this.applicationRepository.findById(applicationId);

    if (!updatedApplication) {
      throw new Error("Failed to fetch updated application");
    }

    return {
      ...updatedApplication,
      createdAt: new Date(updatedApplication.createdAt),
    };
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
    await this.applicationRepository.updateStatus(applicationId, "rejected");

    // Fetch the updated application with user details
    const updatedApplication = await this.applicationRepository.findById(applicationId);

    if (!updatedApplication) {
      throw new Error("Failed to fetch updated application");
    }

    return {
      ...updatedApplication,
      createdAt: new Date(updatedApplication.createdAt),
    };
  }

  async deleteApplication(applicationId: number) {
    // Validate application ID
    if (!applicationId || !Number.isInteger(applicationId) || applicationId <= 0) {
      throw new ValidationError("Valid application ID is required");
    }

    // Get application to get file path for cleanup
    const application = await this.applicationRepository.findById(applicationId);

    if (!application) {
      throw new NotFoundError("Application not found");
    }

    // Delete the application from database
    await this.applicationRepository.delete(applicationId);

    // Clean up the CV file
    try {
      await deleteFile(application.cvFilePath);
    } catch (error) {
      // Log error but don't fail the operation
      console.error(`Warning: Failed to delete CV file ${application.cvFilePath}:`, error);
    }

    return {
      ...application,
      createdAt: new Date(application.createdAt),
    };
  }
}

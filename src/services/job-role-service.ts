import type { NewJobRole } from "../db/schema.js";
import { ConflictError, NotFoundError, ValidationError } from "../errors/custom-errors.js";
import { ApplicationRepository } from "../repositories/application-repository.js";
import { JobRoleRepository } from "../repositories/job-role-repository.js";
import { JobRoleValidator } from "../validators/job-role-validator.js";

interface CreateJobRoleInput {
  name: string;
  location: string;
  capability: string;
  band: string;
  closingDate: string;
  summary: string;
  keyResponsibilities: string;
  status?: "open" | "closed";
  numberOfOpenPositions?: number;
}

interface UpdateJobRoleInput {
  name?: string;
  location?: string;
  capability?: string;
  band?: string;
  closingDate?: string;
  summary?: string;
  keyResponsibilities?: string;
  status?: "open" | "closed";
  numberOfOpenPositions?: number;
}

interface DeleteJobRoleResult {
  success: boolean;
  job: {
    id: number;
    name: string;
  };
  deletedApplicationsCount: number;
}

export class JobRoleService {
  private repository: JobRoleRepository;
  private validator: JobRoleValidator;
  private applicationRepository: ApplicationRepository;

  constructor(
    repository?: JobRoleRepository,
    validator?: JobRoleValidator,
    applicationRepository?: ApplicationRepository
  ) {
    this.repository = repository || new JobRoleRepository();
    this.validator = validator || new JobRoleValidator();
    this.applicationRepository = applicationRepository || new ApplicationRepository();
  }

  async getAllJobRoles(
    limit?: number,
    offset?: number,
    search?: string
  ) {
    const jobs = await this.repository.findAll(limit, offset, search);
    const total = await this.repository.count(search);

    // Convert closingDate string to Date object for frontend
    return {
      jobs: jobs.map((job) => ({
        ...job,
        closingDate: new Date(job.closingDate),
      })),
      total,
    };
  }

  async getJobRoleById(id: number) {
    const job = await this.repository.findById(id);

    if (!job) {
      return null;
    }

    // Convert closingDate string to Date object for frontend
    return {
      ...job,
      closingDate: new Date(job.closingDate),
    };
  }

  async getJobRolesByStatus(status: "open" | "closed") {
    const jobs = await this.repository.findByStatus(status);

    return jobs.map((job) => ({
      ...job,
      closingDate: new Date(job.closingDate),
    }));
  }

  async createJobRole(input: CreateJobRoleInput) {
    // Validate input
    const validationResult = this.validator.validateCreateJobRole(input);

    if (!validationResult.isValid) {
      throw new ValidationError(validationResult.error || "Validation failed");
    }

    if (!validationResult.value) {
      throw new ValidationError("Validation passed but no value returned");
    }

    const { status, numberOfOpenPositions, formattedClosingDate } = validationResult.value;

    // Create new job role
    const newJob: NewJobRole = {
      name: input.name,
      location: input.location,
      capability: input.capability,
      band: input.band,
      closingDate: formattedClosingDate,
      summary: input.summary,
      keyResponsibilities: input.keyResponsibilities,
      status,
      numberOfOpenPositions,
    };

    const createdJob = await this.repository.create(newJob);

    if (!createdJob) {
      throw new Error("Failed to create job role");
    }

    // Convert closingDate string to Date object for frontend
    return {
      ...createdJob,
      closingDate: new Date(createdJob.closingDate),
    };
  }

  async updateJobRole(id: number, input: UpdateJobRoleInput) {
    // First check if job exists before attempting update
    const existingJob = await this.repository.findById(id);
    if (!existingJob) {
      throw new NotFoundError(`Job role with ID ${id} not found`);
    }

    // Validate input if any fields are provided
    if (Object.keys(input).length > 0) {
      const validationResult = this.validator.validateUpdateJobRole(input);

      if (!validationResult.isValid) {
        throw new ValidationError(validationResult.error || "Validation failed");
      }

      if (!validationResult.value) {
        throw new ValidationError("Validation passed but no value returned");
      }

      const { status, numberOfOpenPositions, formattedClosingDate } = validationResult.value;

      // Business rule: If changing status to closed, ensure no active applications
      if (status === "closed" && existingJob.status === "open") {
        const applications = await this.applicationRepository.findByJobRoleId(id);
        const activeApplications = applications.filter((app) => app.status === "in progress");

        if (activeApplications.length > 0) {
          throw new ConflictError(
            `Cannot close job role with ${activeApplications.length} active application(s). ` +
              `Please process all applications before closing the position.`
          );
        }
      }

      // Prepare update data
      const updateData: Partial<typeof existingJob> = {};

      if (input.name !== undefined) updateData.name = input.name;
      if (input.location !== undefined) updateData.location = input.location;
      if (input.capability !== undefined) updateData.capability = input.capability;
      if (input.band !== undefined) updateData.band = input.band;
      if (input.summary !== undefined) updateData.summary = input.summary;
      if (input.keyResponsibilities !== undefined)
        updateData.keyResponsibilities = input.keyResponsibilities;
      if (status !== undefined) updateData.status = status;
      if (numberOfOpenPositions !== undefined)
        updateData.numberOfOpenPositions = numberOfOpenPositions;
      if (formattedClosingDate !== undefined) updateData.closingDate = formattedClosingDate;

      // Update the job role
      const updatedJob = await this.repository.update(id, updateData);

      if (!updatedJob) {
        throw new Error("Failed to update job role");
      }

      // Convert closingDate string to Date object for frontend
      return {
        ...updatedJob,
        closingDate: new Date(updatedJob.closingDate),
      };
    }

    // If no fields to update, return existing job
    return {
      ...existingJob,
      closingDate: new Date(existingJob.closingDate),
    };
  }

  async deleteJobRole(id: number, forceDelete: boolean = false): Promise<DeleteJobRoleResult> {
    // First check if job exists before attempting deletion
    const existingJob = await this.repository.findById(id);
    if (!existingJob) {
      throw new NotFoundError(`Job role with ID ${id} not found`);
    }

    // Business rule validation: Check for active applications
    if (!forceDelete) {
      const applications = await this.applicationRepository.findByJobRoleId(id);
      const activeApplications = applications.filter((app) => app.status === "in progress");

      if (activeApplications.length > 0) {
        throw new ConflictError(
          `Cannot delete job role with ${activeApplications.length} active application(s). ` +
            `Please process all applications before deletion or use force delete.`
        );
      }
    }

    try {
      // Use transaction-based cascade deletion
      const result = await this.repository.deleteWithApplications(id);

      if (!result.job) {
        throw new Error("Failed to delete job role - job not found during deletion");
      }

      return {
        success: true,
        job: {
          id: result.job.id,
          name: result.job.name,
        },
        deletedApplicationsCount: result.deletedApplicationsCount,
      };
    } catch (error) {
      if (error instanceof ConflictError || error instanceof NotFoundError) {
        throw error;
      }
      throw new Error(
        `Failed to delete job role: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}

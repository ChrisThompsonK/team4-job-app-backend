import type { NewJobRole } from "../db/schema.js";
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

export class JobRoleService {
  private repository: JobRoleRepository;
  private validator: JobRoleValidator;

  constructor(repository?: JobRoleRepository, validator?: JobRoleValidator) {
    this.repository = repository || new JobRoleRepository();
    this.validator = validator || new JobRoleValidator();
  }

  async getAllJobRoles() {
    const jobs = await this.repository.findAll();

    // Convert closingDate string to Date object for frontend
    return jobs.map((job) => ({
      ...job,
      closingDate: new Date(job.closingDate),
    }));
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
      throw new Error(validationResult.error);
    }

    if (!validationResult.value) {
      throw new Error("Validation passed but no value returned");
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
}

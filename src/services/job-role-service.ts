import type { NewJobRole } from "../db/schema.js";
import { JobRoleRepository } from "../repositories/job-role-repository.js";

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

  constructor() {
    this.repository = new JobRoleRepository();
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
    // Validate required fields
    if (
      !input.name ||
      !input.location ||
      !input.capability ||
      !input.band ||
      !input.closingDate ||
      !input.summary ||
      !input.keyResponsibilities
    ) {
      throw new Error(
        "Missing required fields. Required: name, location, capability, band, closingDate, summary, keyResponsibilities"
      );
    }

    // Validate status
    const jobStatus = input.status || "open";
    if (jobStatus !== "open" && jobStatus !== "closed") {
      throw new Error("Invalid status. Must be 'open' or 'closed'");
    }

    // Validate numberOfOpenPositions
    const positions = input.numberOfOpenPositions || 1;
    if (typeof positions !== "number" || positions < 0) {
      throw new Error("numberOfOpenPositions must be a non-negative number");
    }

    // Validate and format closing date
    let formattedClosingDate: string;
    try {
      const date = new Date(input.closingDate);
      if (Number.isNaN(date.getTime())) {
        throw new Error("Invalid date");
      }
      formattedClosingDate = date.toISOString();
    } catch (_error) {
      throw new Error("Invalid closingDate. Must be a valid date string");
    }

    // Create new job role
    const newJob: NewJobRole = {
      name: input.name,
      location: input.location,
      capability: input.capability,
      band: input.band,
      closingDate: formattedClosingDate,
      summary: input.summary,
      keyResponsibilities: input.keyResponsibilities,
      status: jobStatus,
      numberOfOpenPositions: positions,
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

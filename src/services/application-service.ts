import type { NewApplication } from "../db/schema.js";
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
      throw new Error(validation.errors.map((e) => e.message).join(", "));
    }

    // Check if job role exists
    const jobRole = await this.jobRoleRepository.findById(input.jobRoleId);
    if (!jobRole) {
      throw new Error("Job role not found");
    }

    // Check if job role is open
    if (jobRole.status !== "open") {
      throw new Error("This job role is not currently accepting applications");
    }

    // Check if there are open positions
    if (jobRole.numberOfOpenPositions <= 0) {
      throw new Error("There are no open positions for this job role");
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
      throw new Error("Valid application ID is required");
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
      throw new Error("Valid job role ID is required");
    }

    const applications = await this.applicationRepository.findByJobRoleId(jobRoleId);

    // Convert createdAt string to Date object for frontend
    return applications.map((app) => ({
      ...app,
      createdAt: new Date(app.createdAt),
    }));
  }
}

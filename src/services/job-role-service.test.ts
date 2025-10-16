import { beforeEach, describe, expect, it, vi } from "vitest";
import type { JobRole } from "../db/schema";
import { ConflictError, NotFoundError, ValidationError } from "../errors/custom-errors";
import type { ApplicationRepository } from "../repositories/application-repository";
import type { JobRoleRepository } from "../repositories/job-role-repository";
import type { JobRoleValidator } from "../validators/job-role-validator";
import { JobRoleService } from "./job-role-service";

// Mock the database module to prevent actual database connections
vi.mock("../db/index.js", () => ({
  db: {},
}));

describe("JobRoleService", () => {
  let mockRepository: {
    findAll: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    findByStatus: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    deleteWithApplications: ReturnType<typeof vi.fn>;
  };

  let mockValidator: {
    validateCreateJobRole: ReturnType<typeof vi.fn>;
    validateUpdateJobRole: ReturnType<typeof vi.fn>;
  };

  let mockApplicationRepository: {
    findByJobRoleId: ReturnType<typeof vi.fn>;
  };

  let service: JobRoleService;

  beforeEach(() => {
    mockRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByStatus: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
      deleteWithApplications: vi.fn(),
    };

    mockValidator = {
      validateCreateJobRole: vi.fn(),
      validateUpdateJobRole: vi.fn(),
    };

    mockApplicationRepository = {
      findByJobRoleId: vi.fn(),
    };

    service = new JobRoleService(
      mockRepository as unknown as JobRoleRepository,
      mockValidator as unknown as JobRoleValidator,
      mockApplicationRepository as unknown as ApplicationRepository
    );
  });

  describe("getAllJobRoles", () => {
    it("should return all jobs with formatted dates", async () => {
      const mockJobs: JobRole[] = [
        {
          id: 1,
          name: "Software Engineer",
          location: "Belfast",
          capability: "Engineering",
          band: "Senior",
          closingDate: "2025-12-31T00:00:00.000Z",
          summary: "Great role",
          keyResponsibilities: "Code",
          status: "open",
          numberOfOpenPositions: 2,
        },
        {
          id: 2,
          name: "Data Analyst",
          location: "London",
          capability: "Data",
          band: "Mid",
          closingDate: "2025-11-30T00:00:00.000Z",
          summary: "Analyze data",
          keyResponsibilities: "Data analysis",
          status: "open",
          numberOfOpenPositions: 1,
        },
      ];

      mockRepository.findAll.mockResolvedValue(mockJobs);
      mockRepository.count.mockResolvedValue(2);

      const result = await service.getAllJobRoles();

      expect(mockRepository.findAll).toHaveBeenCalledOnce();
      expect(mockRepository.count).toHaveBeenCalledOnce();
      expect(result.jobs).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.jobs[0]?.closingDate).toBeInstanceOf(Date);
      expect(result.jobs[1]?.closingDate).toBeInstanceOf(Date);
      expect(result.jobs[0]?.name).toBe("Software Engineer");
    });

    it("should return empty array when no jobs exist", async () => {
      mockRepository.findAll.mockResolvedValue([]);
      mockRepository.count.mockResolvedValue(0);

      const result = await service.getAllJobRoles();

      expect(result.jobs).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe("getJobRoleById", () => {
    it("should return job with formatted date when found", async () => {
      const mockJob: JobRole = {
        id: 1,
        name: "Software Engineer",
        location: "Belfast",
        capability: "Engineering",
        band: "Senior",
        closingDate: "2025-12-31T00:00:00.000Z",
        summary: "Great role",
        keyResponsibilities: "Code",
        status: "open",
        numberOfOpenPositions: 2,
      };

      mockRepository.findById.mockResolvedValue(mockJob);

      const result = await service.getJobRoleById(1);

      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(result).not.toBeNull();
      expect(result?.closingDate).toBeInstanceOf(Date);
      expect(result?.name).toBe("Software Engineer");
    });

    it("should return null when job not found", async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await service.getJobRoleById(999);

      expect(mockRepository.findById).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });
  });

  describe("getJobRolesByStatus", () => {
    it("should return open jobs with formatted dates", async () => {
      const mockJobs: JobRole[] = [
        {
          id: 1,
          name: "Software Engineer",
          location: "Belfast",
          capability: "Engineering",
          band: "Senior",
          closingDate: "2025-12-31T00:00:00.000Z",
          summary: "Great role",
          keyResponsibilities: "Code",
          status: "open",
          numberOfOpenPositions: 2,
        },
      ];

      mockRepository.findByStatus.mockResolvedValue(mockJobs);

      const result = await service.getJobRolesByStatus("open");

      expect(mockRepository.findByStatus).toHaveBeenCalledWith("open");
      expect(result).toHaveLength(1);
      expect(result[0]?.status).toBe("open");
      expect(result[0]?.closingDate).toBeInstanceOf(Date);
    });

    it("should return closed jobs", async () => {
      const mockJobs: JobRole[] = [
        {
          id: 2,
          name: "Data Analyst",
          location: "London",
          capability: "Data",
          band: "Mid",
          closingDate: "2025-11-30T00:00:00.000Z",
          summary: "Analyze data",
          keyResponsibilities: "Data analysis",
          status: "closed",
          numberOfOpenPositions: 0,
        },
      ];

      mockRepository.findByStatus.mockResolvedValue(mockJobs);

      const result = await service.getJobRolesByStatus("closed");

      expect(mockRepository.findByStatus).toHaveBeenCalledWith("closed");
      expect(result).toHaveLength(1);
      expect(result[0]?.status).toBe("closed");
    });
  });

  describe("createJobRole", () => {
    const validInput = {
      name: "Software Engineer",
      location: "Belfast",
      capability: "Engineering",
      band: "Senior",
      closingDate: "2025-12-31",
      summary: "Great opportunity",
      keyResponsibilities: "Develop software",
      status: "open" as const,
      numberOfOpenPositions: 3,
    };

    it("should create job role successfully with valid input", async () => {
      const formattedDate = new Date("2025-12-31").toISOString();

      mockValidator.validateCreateJobRole.mockReturnValue({
        isValid: true,
        value: {
          status: "open",
          numberOfOpenPositions: 3,
          formattedClosingDate: formattedDate,
        },
      });

      const createdJob: JobRole = {
        id: 1,
        ...validInput,
        closingDate: formattedDate,
      };

      mockRepository.create.mockResolvedValue(createdJob);

      const result = await service.createJobRole(validInput);

      expect(mockValidator.validateCreateJobRole).toHaveBeenCalledWith(validInput);
      expect(mockRepository.create).toHaveBeenCalledWith({
        name: validInput.name,
        location: validInput.location,
        capability: validInput.capability,
        band: validInput.band,
        closingDate: formattedDate,
        summary: validInput.summary,
        keyResponsibilities: validInput.keyResponsibilities,
        status: "open",
        numberOfOpenPositions: 3,
      });
      expect(result.closingDate).toBeInstanceOf(Date);
      expect(result.name).toBe("Software Engineer");
    });

    it("should throw error when validation fails", async () => {
      mockValidator.validateCreateJobRole.mockReturnValue({
        isValid: false,
        error: "Missing required fields",
      });

      await expect(service.createJobRole(validInput)).rejects.toThrow("Missing required fields");

      expect(mockValidator.validateCreateJobRole).toHaveBeenCalledWith(validInput);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it("should throw error when repository fails to create", async () => {
      mockValidator.validateCreateJobRole.mockReturnValue({
        isValid: true,
        value: {
          status: "open",
          numberOfOpenPositions: 3,
          formattedClosingDate: new Date("2025-12-31").toISOString(),
        },
      });

      mockRepository.create.mockResolvedValue(null);

      await expect(service.createJobRole(validInput)).rejects.toThrow("Failed to create job role");
    });

    it("should use validator defaults for optional fields", async () => {
      const inputWithoutOptionals = {
        name: "Software Engineer",
        location: "Belfast",
        capability: "Engineering",
        band: "Senior",
        closingDate: "2025-12-31",
        summary: "Great opportunity",
        keyResponsibilities: "Develop software",
      };

      const formattedDate = new Date("2025-12-31").toISOString();

      mockValidator.validateCreateJobRole.mockReturnValue({
        isValid: true,
        value: {
          status: "open",
          numberOfOpenPositions: 1,
          formattedClosingDate: formattedDate,
        },
      });

      const createdJob: JobRole = {
        id: 1,
        ...inputWithoutOptionals,
        status: "open",
        numberOfOpenPositions: 1,
        closingDate: formattedDate,
      };

      mockRepository.create.mockResolvedValue(createdJob);

      const result = await service.createJobRole(inputWithoutOptionals);

      expect(result.status).toBe("open");
      expect(result.numberOfOpenPositions).toBe(1);
    });
  });

  describe("updateJobRole", () => {
    const mockJob: JobRole = {
      id: 1,
      name: "Software Engineer",
      location: "London",
      capability: "Engineering",
      band: "Senior",
      closingDate: "2024-12-31T23:59:59.999Z",
      summary: "Test job",
      keyResponsibilities: "Code",
      status: "open",
      numberOfOpenPositions: 2,
    };

    it("should successfully update a job role", async () => {
      const updateInput = {
        name: "Senior Software Engineer",
        numberOfOpenPositions: 3,
      };

      mockRepository.findById.mockResolvedValue(mockJob);
      mockValidator.validateUpdateJobRole.mockReturnValue({
        isValid: true,
        value: {
          numberOfOpenPositions: 3,
        },
      });

      const updatedJob = { ...mockJob, name: "Senior Software Engineer", numberOfOpenPositions: 3 };
      mockRepository.update.mockResolvedValue(updatedJob);

      const result = await service.updateJobRole(1, updateInput);

      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockValidator.validateUpdateJobRole).toHaveBeenCalledWith(updateInput);
      expect(mockRepository.update).toHaveBeenCalledWith(1, {
        name: "Senior Software Engineer",
        numberOfOpenPositions: 3,
      });
      expect(result.name).toBe("Senior Software Engineer");
      expect(result.numberOfOpenPositions).toBe(3);
    });

    it("should throw NotFoundError when job does not exist", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.updateJobRole(999, { name: "New Name" })).rejects.toThrow(NotFoundError);
      expect(mockRepository.findById).toHaveBeenCalledWith(999);
    });

    it("should throw ValidationError for invalid input", async () => {
      mockRepository.findById.mockResolvedValue(mockJob);
      mockValidator.validateUpdateJobRole.mockReturnValue({
        isValid: false,
        error: "Invalid input data",
      });

      await expect(service.updateJobRole(1, { name: "" })).rejects.toThrow(ValidationError);
    });

    it("should throw ConflictError when closing job with active applications", async () => {
      const mockApplications = [
        { id: 1, status: "in progress", jobRoleId: 1 },
        { id: 2, status: "hired", jobRoleId: 1 },
      ];

      mockRepository.findById.mockResolvedValue(mockJob);
      mockValidator.validateUpdateJobRole.mockReturnValue({
        isValid: true,
        value: { status: "closed" },
      });
      mockApplicationRepository.findByJobRoleId.mockResolvedValue(mockApplications);

      await expect(service.updateJobRole(1, { status: "closed" })).rejects.toThrow(ConflictError);
    });

    it("should allow closing job with no active applications", async () => {
      const mockApplications = [
        { id: 1, status: "hired", jobRoleId: 1 },
        { id: 2, status: "rejected", jobRoleId: 1 },
      ];

      mockRepository.findById.mockResolvedValue(mockJob);
      mockValidator.validateUpdateJobRole.mockReturnValue({
        isValid: true,
        value: { status: "closed" },
      });
      mockApplicationRepository.findByJobRoleId.mockResolvedValue(mockApplications);

      const updatedJob = { ...mockJob, status: "closed" as const };
      mockRepository.update.mockResolvedValue(updatedJob);

      const result = await service.updateJobRole(1, { status: "closed" });

      expect(result.status).toBe("closed");
      expect(mockApplicationRepository.findByJobRoleId).toHaveBeenCalledWith(1);
    });
  });

  describe("deleteJobRole", () => {
    const mockJob: JobRole = {
      id: 1,
      name: "Software Engineer",
      location: "London",
      capability: "Engineering",
      band: "Senior",
      closingDate: "2024-12-31T23:59:59.999Z",
      summary: "Test job",
      keyResponsibilities: "Code",
      status: "open",
      numberOfOpenPositions: 2,
    };

    it("should successfully delete a job role with no active applications", async () => {
      const mockApplications = [
        { id: 1, status: "hired", jobRoleId: 1 },
        { id: 2, status: "rejected", jobRoleId: 1 },
      ];

      mockRepository.findById.mockResolvedValue(mockJob);
      mockApplicationRepository.findByJobRoleId.mockResolvedValue(mockApplications);
      mockRepository.deleteWithApplications.mockResolvedValue({
        job: mockJob,
        deletedApplicationsCount: 2,
      });

      const result = await service.deleteJobRole(1);

      expect(result.success).toBe(true);
      expect(result.job.id).toBe(1);
      expect(result.job.name).toBe("Software Engineer");
      expect(result.deletedApplicationsCount).toBe(2);
    });

    it("should throw NotFoundError when job does not exist", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.deleteJobRole(999)).rejects.toThrow(NotFoundError);
      expect(mockRepository.findById).toHaveBeenCalledWith(999);
    });

    it("should throw ConflictError when deleting job with active applications", async () => {
      const mockApplications = [
        { id: 1, status: "in progress", jobRoleId: 1 },
        { id: 2, status: "hired", jobRoleId: 1 },
      ];

      mockRepository.findById.mockResolvedValue(mockJob);
      mockApplicationRepository.findByJobRoleId.mockResolvedValue(mockApplications);

      await expect(service.deleteJobRole(1)).rejects.toThrow(ConflictError);
      expect(mockApplicationRepository.findByJobRoleId).toHaveBeenCalledWith(1);
    });

    it("should force delete job with active applications when forceDelete is true", async () => {
      const _mockApplications = [
        { id: 1, status: "in progress", jobRoleId: 1 },
        { id: 2, status: "hired", jobRoleId: 1 },
      ];

      mockRepository.findById.mockResolvedValue(mockJob);
      mockRepository.deleteWithApplications.mockResolvedValue({
        job: mockJob,
        deletedApplicationsCount: 2,
      });

      const result = await service.deleteJobRole(1, true);

      expect(result.success).toBe(true);
      expect(result.deletedApplicationsCount).toBe(2);
      // Should not check for active applications when force delete is true
      expect(mockApplicationRepository.findByJobRoleId).not.toHaveBeenCalled();
    });

    it("should handle repository deletion failure", async () => {
      mockRepository.findById.mockResolvedValue(mockJob);
      mockApplicationRepository.findByJobRoleId.mockResolvedValue([]);
      mockRepository.deleteWithApplications.mockResolvedValue({
        job: null,
        deletedApplicationsCount: 0,
      });

      await expect(service.deleteJobRole(1)).rejects.toThrow(
        "Failed to delete job role - job not found during deletion"
      );
    });
  });
});

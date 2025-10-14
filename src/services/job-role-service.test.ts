import { beforeEach, describe, expect, it, vi } from "vitest";
import type { JobRole } from "../db/schema";
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
  };

  let mockValidator: {
    validateCreateJobRole: ReturnType<typeof vi.fn>;
  };

  let service: JobRoleService;

  beforeEach(() => {
    mockRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findByStatus: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    };

    mockValidator = {
      validateCreateJobRole: vi.fn(),
    };

    service = new JobRoleService(
      mockRepository as unknown as JobRoleRepository,
      mockValidator as unknown as JobRoleValidator
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
});

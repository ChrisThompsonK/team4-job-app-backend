import { beforeEach, describe, expect, it, vi } from "vitest";
import type { JobRole } from "../db/schema";
import type { ApplicationRepository } from "../repositories/application-repository";
import type { JobRoleRepository } from "../repositories/job-role-repository";
import type { ApplicationValidator } from "../validators/application-validator";
import { ApplicationService } from "./application-service";

// Mock the database module to prevent actual database connections
vi.mock("../db/index.js", () => ({
  db: {
    transaction: vi.fn((callback) => callback()),
  },
}));

describe("ApplicationService", () => {
  let mockApplicationRepository: {
    create: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    findByJobRoleId: ReturnType<typeof vi.fn>;
    updateStatus: ReturnType<typeof vi.fn>;
    findByIdWithJobRole: ReturnType<typeof vi.fn>;
  };

  let mockJobRoleRepository: {
    findById: ReturnType<typeof vi.fn>;
    decrementOpenPositions: ReturnType<typeof vi.fn>;
  };

  let mockValidator: {
    validateApplication: ReturnType<typeof vi.fn>;
    validateStatusTransition: ReturnType<typeof vi.fn>;
  };

  let service: ApplicationService;

  beforeEach(() => {
    mockApplicationRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByJobRoleId: vi.fn(),
      updateStatus: vi.fn(),
      findByIdWithJobRole: vi.fn(),
    };

    mockJobRoleRepository = {
      findById: vi.fn(),
      decrementOpenPositions: vi.fn(),
    };

    mockValidator = {
      validateApplication: vi.fn(),
      validateStatusTransition: vi.fn(),
    };

    service = new ApplicationService(
      mockApplicationRepository as unknown as ApplicationRepository,
      mockJobRoleRepository as unknown as JobRoleRepository,
      mockValidator as unknown as ApplicationValidator
    );
  });

  describe("createApplication", () => {
    const validInput = {
      userId: 1,
      jobRoleId: 1,
      cvText: "This is my CV text with more than 50 characters to pass validation requirements.",
    };

    const mockOpenJobRole: JobRole = {
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

    it("should create application when job is open and has positions", async () => {
      mockValidator.validateApplication.mockReturnValue({
        isValid: true,
        errors: [],
      });

      mockJobRoleRepository.findById.mockResolvedValue(mockOpenJobRole);

      const mockCreatedApplication = {
        id: 1,
        userId: 1,
        jobRoleId: 1,
        cvText: validInput.cvText,
        status: "in progress",
        createdAt: new Date().toISOString(),
      };

      mockApplicationRepository.create.mockResolvedValue(mockCreatedApplication);

      const result = await service.createApplication(validInput);

      expect(mockValidator.validateApplication).toHaveBeenCalledWith(validInput);
      expect(mockJobRoleRepository.findById).toHaveBeenCalledWith(1);
      expect(mockApplicationRepository.create).toHaveBeenCalledWith({
        userId: 1,
        jobRoleId: 1,
        cvText: validInput.cvText,
        status: "in progress",
        createdAt: expect.any(String),
      });
      expect(result).toEqual(mockCreatedApplication);
    });

    it("should throw error when validation fails", async () => {
      mockValidator.validateApplication.mockReturnValue({
        isValid: false,
        errors: [{ field: "cvText", message: "CV text is required" }],
      });

      await expect(service.createApplication(validInput)).rejects.toThrow("CV text is required");

      expect(mockJobRoleRepository.findById).not.toHaveBeenCalled();
      expect(mockApplicationRepository.create).not.toHaveBeenCalled();
    });

    it("should throw error when job role not found", async () => {
      mockValidator.validateApplication.mockReturnValue({
        isValid: true,
        errors: [],
      });

      mockJobRoleRepository.findById.mockResolvedValue(null);

      await expect(service.createApplication(validInput)).rejects.toThrow("Job role not found");

      expect(mockApplicationRepository.create).not.toHaveBeenCalled();
    });

    it("should throw error when job role is closed", async () => {
      mockValidator.validateApplication.mockReturnValue({
        isValid: true,
        errors: [],
      });

      const closedJobRole = { ...mockOpenJobRole, status: "closed" };
      mockJobRoleRepository.findById.mockResolvedValue(closedJobRole);

      await expect(service.createApplication(validInput)).rejects.toThrow(
        "This job role is not currently accepting applications"
      );

      expect(mockApplicationRepository.create).not.toHaveBeenCalled();
    });

    it("should throw error when no open positions available", async () => {
      mockValidator.validateApplication.mockReturnValue({
        isValid: true,
        errors: [],
      });

      const noPositionsJobRole = { ...mockOpenJobRole, numberOfOpenPositions: 0 };
      mockJobRoleRepository.findById.mockResolvedValue(noPositionsJobRole);

      await expect(service.createApplication(validInput)).rejects.toThrow(
        "There are no open positions for this job role"
      );

      expect(mockApplicationRepository.create).not.toHaveBeenCalled();
    });

    it("should throw error when application creation fails", async () => {
      mockValidator.validateApplication.mockReturnValue({
        isValid: true,
        errors: [],
      });

      mockJobRoleRepository.findById.mockResolvedValue(mockOpenJobRole);
      mockApplicationRepository.create.mockResolvedValue(null);

      await expect(service.createApplication(validInput)).rejects.toThrow(
        "Failed to create application"
      );
    });

    it("should trim CV text before creating application", async () => {
      mockValidator.validateApplication.mockReturnValue({
        isValid: true,
        errors: [],
      });

      mockJobRoleRepository.findById.mockResolvedValue(mockOpenJobRole);

      const mockCreatedApplication = {
        id: 1,
        userId: 1,
        jobRoleId: 1,
        cvText: validInput.cvText,
        status: "in progress",
        createdAt: new Date().toISOString(),
      };

      mockApplicationRepository.create.mockResolvedValue(mockCreatedApplication);

      const inputWithWhitespace = {
        ...validInput,
        cvText: `  ${validInput.cvText}  `,
      };

      await service.createApplication(inputWithWhitespace);

      expect(mockApplicationRepository.create).toHaveBeenCalledWith({
        userId: 1,
        jobRoleId: 1,
        cvText: validInput.cvText,
        status: "in progress",
        createdAt: expect.any(String),
      });
    });
  });

  describe("getApplicationById", () => {
    it("should return application with formatted date when found", async () => {
      const mockApplication = {
        id: 1,
        jobRoleId: 1,
        cvText: "My CV text",
        status: "in progress",
        createdAt: "2025-10-07T12:00:00.000Z",
      };

      mockApplicationRepository.findById.mockResolvedValue(mockApplication);

      const result = await service.getApplicationById(1);

      expect(mockApplicationRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toBeDefined();
      expect(result?.createdAt).toBeInstanceOf(Date);
      expect(result?.id).toBe(1);
    });

    it("should return null when application not found", async () => {
      mockApplicationRepository.findById.mockResolvedValue(null);

      const result = await service.getApplicationById(1);

      expect(result).toBeNull();
    });

    it("should throw error for invalid ID", async () => {
      await expect(service.getApplicationById(0)).rejects.toThrow(
        "Valid application ID is required"
      );
      await expect(service.getApplicationById(-1)).rejects.toThrow(
        "Valid application ID is required"
      );
    });
  });

  describe("getApplicationsByJobRole", () => {
    it("should return applications with formatted dates", async () => {
      const mockApplications = [
        {
          id: 1,
          jobRoleId: 1,
          cvText: "CV 1",
          status: "in progress",
          createdAt: "2025-10-07T12:00:00.000Z",
        },
        {
          id: 2,
          jobRoleId: 1,
          cvText: "CV 2",
          status: "in progress",
          createdAt: "2025-10-07T13:00:00.000Z",
        },
      ];

      mockApplicationRepository.findByJobRoleId.mockResolvedValue(mockApplications);

      const result = await service.getApplicationsByJobRole(1);

      expect(mockApplicationRepository.findByJobRoleId).toHaveBeenCalledWith(1);
      expect(result).toHaveLength(2);
      expect(result[0]?.createdAt).toBeInstanceOf(Date);
      expect(result[1]?.createdAt).toBeInstanceOf(Date);
    });

    it("should return empty array when no applications found", async () => {
      mockApplicationRepository.findByJobRoleId.mockResolvedValue([]);

      const result = await service.getApplicationsByJobRole(1);

      expect(result).toEqual([]);
    });

    it("should throw error for invalid job role ID", async () => {
      await expect(service.getApplicationsByJobRole(0)).rejects.toThrow(
        "Valid job role ID is required"
      );
    });
  });

  describe("hireApplicant", () => {
    const mockApplication = {
      id: 1,
      jobRoleId: 1,
      cvText: "My CV text",
      status: "in progress",
      createdAt: "2025-10-08T12:00:00.000Z",
    };

    const mockJobRole: JobRole = {
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

    it("should successfully hire an applicant", async () => {
      mockApplicationRepository.findByIdWithJobRole.mockResolvedValue({
        application: mockApplication,
        jobRole: mockJobRole,
      });

      mockValidator.validateStatusTransition.mockReturnValue({
        isValid: true,
        errors: [],
      });

      const updatedApplication = { ...mockApplication, status: "hired" };
      mockApplicationRepository.updateStatus.mockResolvedValue(updatedApplication);

      const updatedJobRole = { ...mockJobRole, numberOfOpenPositions: 1 };
      mockJobRoleRepository.decrementOpenPositions.mockResolvedValue(updatedJobRole);

      const result = await service.hireApplicant(1);

      expect(mockApplicationRepository.findByIdWithJobRole).toHaveBeenCalledWith(1);
      expect(mockValidator.validateStatusTransition).toHaveBeenCalledWith("in progress", "hired");
      expect(mockApplicationRepository.updateStatus).toHaveBeenCalledWith(1, "hired");
      expect(mockJobRoleRepository.decrementOpenPositions).toHaveBeenCalledWith(1);
      expect(result.application.status).toBe("hired");
      expect(result.jobRole.numberOfOpenPositions).toBe(1);
    });

    it("should throw error when application not found", async () => {
      mockApplicationRepository.findByIdWithJobRole.mockResolvedValue(null);

      await expect(service.hireApplicant(1)).rejects.toThrow("Application not found");

      expect(mockValidator.validateStatusTransition).not.toHaveBeenCalled();
      expect(mockApplicationRepository.updateStatus).not.toHaveBeenCalled();
    });

    it("should throw error when status transition is invalid", async () => {
      const hiredApplication = { ...mockApplication, status: "hired" };
      mockApplicationRepository.findByIdWithJobRole.mockResolvedValue({
        application: hiredApplication,
        jobRole: mockJobRole,
      });

      mockValidator.validateStatusTransition.mockReturnValue({
        isValid: false,
        errors: [
          {
            field: "status",
            message:
              'Cannot change status from "hired" to "hired". Only applications with status "in progress" can be hired or rejected.',
          },
        ],
      });

      await expect(service.hireApplicant(1)).rejects.toThrow(
        'Cannot change status from "hired" to "hired"'
      );

      expect(mockApplicationRepository.updateStatus).not.toHaveBeenCalled();
    });

    it("should throw error when no open positions available", async () => {
      const jobRoleWithNoPositions = { ...mockJobRole, numberOfOpenPositions: 0 };
      mockApplicationRepository.findByIdWithJobRole.mockResolvedValue({
        application: mockApplication,
        jobRole: jobRoleWithNoPositions,
      });

      mockValidator.validateStatusTransition.mockReturnValue({
        isValid: true,
        errors: [],
      });

      await expect(service.hireApplicant(1)).rejects.toThrow(
        "No open positions available for this job role"
      );

      expect(mockApplicationRepository.updateStatus).not.toHaveBeenCalled();
    });

    it("should throw error for invalid application ID", async () => {
      await expect(service.hireApplicant(0)).rejects.toThrow("Valid application ID is required");
      await expect(service.hireApplicant(-1)).rejects.toThrow("Valid application ID is required");
    });
  });

  describe("rejectApplicant", () => {
    const mockApplication = {
      id: 1,
      jobRoleId: 1,
      cvText: "My CV text",
      status: "in progress",
      createdAt: "2025-10-08T12:00:00.000Z",
    };

    it("should successfully reject an applicant", async () => {
      mockApplicationRepository.findById.mockResolvedValue(mockApplication);

      mockValidator.validateStatusTransition.mockReturnValue({
        isValid: true,
        errors: [],
      });

      const updatedApplication = { ...mockApplication, status: "rejected" };
      mockApplicationRepository.updateStatus.mockResolvedValue(updatedApplication);

      const result = await service.rejectApplicant(1);

      expect(mockApplicationRepository.findById).toHaveBeenCalledWith(1);
      expect(mockValidator.validateStatusTransition).toHaveBeenCalledWith(
        "in progress",
        "rejected"
      );
      expect(mockApplicationRepository.updateStatus).toHaveBeenCalledWith(1, "rejected");
      expect(result.status).toBe("rejected");
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it("should throw error when application not found", async () => {
      mockApplicationRepository.findById.mockResolvedValue(null);

      await expect(service.rejectApplicant(1)).rejects.toThrow("Application not found");

      expect(mockValidator.validateStatusTransition).not.toHaveBeenCalled();
      expect(mockApplicationRepository.updateStatus).not.toHaveBeenCalled();
    });

    it("should throw error when status transition is invalid", async () => {
      const rejectedApplication = { ...mockApplication, status: "rejected" };
      mockApplicationRepository.findById.mockResolvedValue(rejectedApplication);

      mockValidator.validateStatusTransition.mockReturnValue({
        isValid: false,
        errors: [
          {
            field: "status",
            message:
              'Cannot change status from "rejected" to "rejected". Only applications with status "in progress" can be hired or rejected.',
          },
        ],
      });

      await expect(service.rejectApplicant(1)).rejects.toThrow(
        'Cannot change status from "rejected" to "rejected"'
      );

      expect(mockApplicationRepository.updateStatus).not.toHaveBeenCalled();
    });

    it("should throw error for invalid application ID", async () => {
      await expect(service.rejectApplicant(0)).rejects.toThrow("Valid application ID is required");
      await expect(service.rejectApplicant(-1)).rejects.toThrow("Valid application ID is required");
    });
  });
});

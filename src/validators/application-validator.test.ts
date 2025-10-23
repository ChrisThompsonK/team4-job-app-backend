import { Readable } from "node:stream";
import { describe, expect, it } from "vitest";
import { ApplicationValidator } from "./application-validator";

describe("ApplicationValidator", () => {
  const validator = new ApplicationValidator();

  // Helper function to create mock files
  const createMockFile = (overrides?: Partial<Express.Multer.File>): Express.Multer.File => ({
    fieldname: "cv",
    originalname: "test-cv.pdf",
    encoding: "7bit",
    mimetype: "application/pdf",
    destination: "uploads/cvs",
    filename: "test-cv.pdf",
    path: "uploads/cvs/test-cv.pdf",
    size: 1024 * 1024, // 1MB
    buffer: Buffer.from(""),
    stream: new Readable(),
    ...overrides,
  });

  describe("validateCvFile", () => {
    it("should return valid when file is properly provided with .docx extension", () => {
      const validFile = createMockFile({
        originalname: "resume.docx",
        mimetype: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        size: 2 * 1024 * 1024, // 2MB
      });

      const result = validator.validateCvFile(validFile);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should return valid when file is properly provided with .doc extension", () => {
      const validFile = createMockFile({
        originalname: "resume.doc",
        mimetype: "application/msword",
        size: 1 * 1024 * 1024, // 1MB
      });

      const result = validator.validateCvFile(validFile);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should return valid when file is properly provided with .png extension", () => {
      const validFile = createMockFile({
        originalname: "cv-image.png",
        mimetype: "image/png",
        size: 3 * 1024 * 1024, // 3MB
      });

      const result = validator.validateCvFile(validFile);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should return invalid when file is missing", () => {
      // biome-ignore lint/suspicious/noExplicitAny: Testing null case requires any
      const result = validator.validateCvFile(null as any);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.message).toBe("CV file is required");
      expect(result.errors[0]?.field).toBe("cvFile");
    });

    it("should return invalid when file size exceeds maximum (10MB)", () => {
      const largeFile = createMockFile({
        size: 11 * 1024 * 1024, // 11MB
      });

      const result = validator.validateCvFile(largeFile);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(
        result.errors.some(
          (e) => e.field === "cvFile" && e.message.includes("exceeds maximum allowed size")
        )
      ).toBe(true);
    });

    it("should return invalid when MIME type is not allowed", () => {
      const invalidFile = createMockFile({
        originalname: "document.pdf",
        mimetype: "application/pdf",
      });

      const result = validator.validateCvFile(invalidFile);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(
        result.errors.some((e) => e.field === "cvFile" && e.message.includes("Invalid file type"))
      ).toBe(true);
    });

    it("should return invalid when file extension is not allowed", () => {
      const invalidFile = createMockFile({
        originalname: "document.txt",
        mimetype: "text/plain",
      });

      const result = validator.validateCvFile(invalidFile);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((e) => e.message.includes("Invalid file extension"))).toBe(true);
    });

    it("should return invalid when filename is empty", () => {
      const invalidFile = createMockFile({
        originalname: "",
      });

      const result = validator.validateCvFile(invalidFile);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.message.includes("valid filename"))).toBe(true);
    });

    it("should return invalid when filename is too long (over 255 characters)", () => {
      const longFilename = `${"a".repeat(256)}.docx`;
      const invalidFile = createMockFile({
        originalname: longFilename,
        mimetype: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      const result = validator.validateCvFile(invalidFile);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.message.includes("Filename is too long"))).toBe(true);
    });
  });

  describe("validateJobRoleId", () => {
    it("should return valid for positive integer", () => {
      const result = validator.validateJobRoleId(1);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should return valid for large positive integer", () => {
      const result = validator.validateJobRoleId(999999);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should return invalid when job role ID is zero", () => {
      const result = validator.validateJobRoleId(0);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.message).toBe("Valid job role ID is required");
      expect(result.errors[0]?.field).toBe("jobRoleId");
    });

    it("should return invalid when job role ID is negative", () => {
      const result = validator.validateJobRoleId(-1);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.message).toBe("Valid job role ID is required");
    });

    it("should return invalid when job role ID is a float", () => {
      const result = validator.validateJobRoleId(1.5);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.message).toBe("Valid job role ID is required");
    });

    it("should return invalid when job role ID is NaN", () => {
      const result = validator.validateJobRoleId(Number.NaN);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe("validateApplication", () => {
    it("should return valid when all fields are valid", () => {
      const validData = {
        userId: 1,
        jobRoleId: 1,
        cvFile: createMockFile({
          originalname: "resume.docx",
          mimetype: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }),
      };

      const result = validator.validateApplication(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should return all errors when both fields are invalid", () => {
      const invalidData = {
        userId: 0, // This won't be validated anymore since it comes from auth
        jobRoleId: 0,
        // biome-ignore lint/suspicious/noExplicitAny: Testing null case requires any
        cvFile: null as any, // Invalid file
      };

      const result = validator.validateApplication(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2); // jobRoleId, cvFile errors
      expect(result.errors.some((e) => e.field === "jobRoleId")).toBe(true);
      expect(result.errors.some((e) => e.field === "cvFile")).toBe(true);
    });

    it("should return only jobRoleId error when only jobRoleId is invalid", () => {
      const data = {
        userId: 1,
        jobRoleId: -1,
        cvFile: createMockFile({
          originalname: "resume.docx",
          mimetype: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }),
      };

      const result = validator.validateApplication(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.field).toBe("jobRoleId");
    });

    it("should return only cvFile error when only cvFile is invalid", () => {
      const data = {
        userId: 1,
        jobRoleId: 1,
        cvFile: createMockFile({
          originalname: "document.pdf",
          mimetype: "application/pdf", // Invalid MIME type
        }),
      };

      const result = validator.validateApplication(data);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.every((e) => e.field === "cvFile")).toBe(true);
    });
  });

  describe("validateStatusTransition", () => {
    it("should return valid when transitioning from 'in progress' to 'hired'", () => {
      const result = validator.validateStatusTransition("in progress", "hired");

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should return valid when transitioning from 'in progress' to 'rejected'", () => {
      const result = validator.validateStatusTransition("in progress", "rejected");

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should return invalid when transitioning from 'hired' status", () => {
      const result = validator.validateStatusTransition("hired", "rejected");

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.field).toBe("status");
      expect(result.errors[0]?.message).toContain('Cannot change status from "hired"');
      expect(result.errors[0]?.message).toContain('Only applications with status "in progress"');
    });

    it("should return invalid when transitioning from 'rejected' status", () => {
      const result = validator.validateStatusTransition("rejected", "hired");

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.field).toBe("status");
      expect(result.errors[0]?.message).toContain('Cannot change status from "rejected"');
    });

    it("should return invalid when new status is not 'hired' or 'rejected'", () => {
      const result = validator.validateStatusTransition("in progress", "invalid");

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.field).toBe("status");
      expect(result.errors[0]?.message).toContain('Invalid status "invalid"');
    });

    it("should return multiple errors when both current status and new status are invalid", () => {
      const result = validator.validateStatusTransition("hired", "invalid");

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
    });
  });
});

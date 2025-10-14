import { describe, expect, it } from "vitest";
import { ApplicationValidator } from "./application-validator";

describe("ApplicationValidator", () => {
  const validator = new ApplicationValidator();

  describe("validateCvText", () => {
    it("should return valid when CV text is properly provided", () => {
      const validCvText =
        "This is a valid CV text that contains more than 50 characters as required by the validation.";

      const result = validator.validateCvText(validCvText);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should return invalid when CV text is empty", () => {
      const result = validator.validateCvText("");

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.message).toBe("CV text is required");
      expect(result.errors[0]?.field).toBe("cvText");
    });

    it("should return invalid when CV text is only whitespace", () => {
      const result = validator.validateCvText("   ");

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.message).toBe("CV text is required");
    });

    it("should return invalid when CV text is too short (less than 50 characters)", () => {
      const result = validator.validateCvText("Short CV");

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.message).toBe("CV text must be at least 50 characters long");
      expect(result.errors[0]?.field).toBe("cvText");
    });

    it("should return valid for CV text with exactly 50 characters", () => {
      const exactlyFiftyChars = "A".repeat(50);

      const result = validator.validateCvText(exactlyFiftyChars);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should return invalid when CV text exceeds 10,000 characters", () => {
      const tooLongCvText = "A".repeat(10001);

      const result = validator.validateCvText(tooLongCvText);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.message).toBe("CV text must not exceed 10,000 characters");
      expect(result.errors[0]?.field).toBe("cvText");
    });

    it("should return valid for CV text with exactly 10,000 characters", () => {
      const exactlyTenThousand = "A".repeat(10000);

      const result = validator.validateCvText(exactlyTenThousand);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
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
    it("should return valid when both fields are valid", () => {
      const validData = {
        userId: 1,
        jobRoleId: 1,
        cvText: "This is a valid CV text with more than 50 characters to pass validation.",
      };

      const result = validator.validateApplication(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should return all errors when both fields are invalid", () => {
      const invalidData = {
        userId: 0,
        jobRoleId: 0,
        cvText: "Short",
      };

      const result = validator.validateApplication(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
      expect(result.errors.some((e) => e.field === "userId")).toBe(true);
      expect(result.errors.some((e) => e.field === "jobRoleId")).toBe(true);
      expect(result.errors.some((e) => e.field === "cvText")).toBe(true);
    });

    it("should return only jobRoleId error when only jobRoleId is invalid", () => {
      const data = {
        userId: 1,
        jobRoleId: -1,
        cvText: "This is a valid CV text with more than 50 characters to pass validation.",
      };

      const result = validator.validateApplication(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.field).toBe("jobRoleId");
    });

    it("should return only cvText error when only cvText is invalid", () => {
      const data = {
        userId: 1,
        jobRoleId: 1,
        cvText: "",
      };

      const result = validator.validateApplication(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.field).toBe("cvText");
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

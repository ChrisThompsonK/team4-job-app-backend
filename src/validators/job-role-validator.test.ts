import { describe, expect, it } from "vitest";
import { JobRoleValidator } from "./job-role-validator";

describe("JobRoleValidator", () => {
  const validator = new JobRoleValidator();

  describe("validateRequiredFields", () => {
    it("should return valid when all required fields are present", () => {
      const input = {
        name: "Software Engineer",
        location: "Belfast",
        capability: "Engineering",
        band: "Senior",
        closingDate: "2025-12-31",
        summary: "Great opportunity",
        keyResponsibilities: "Develop software",
      };

      const result = validator.validateRequiredFields(input);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should return invalid when name is missing", () => {
      const input = {
        name: "",
        location: "Belfast",
        capability: "Engineering",
        band: "Senior",
        closingDate: "2025-12-31",
        summary: "Great opportunity",
        keyResponsibilities: "Develop software",
      };

      const result = validator.validateRequiredFields(input);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Missing required fields");
    });

    it("should return invalid when location is missing", () => {
      const input = {
        name: "Software Engineer",
        location: "",
        capability: "Engineering",
        band: "Senior",
        closingDate: "2025-12-31",
        summary: "Great opportunity",
        keyResponsibilities: "Develop software",
      };

      const result = validator.validateRequiredFields(input);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Missing required fields");
    });

    it("should return invalid when multiple fields are missing", () => {
      const input = {
        name: "",
        location: "",
        capability: "Engineering",
        band: "Senior",
        closingDate: "2025-12-31",
        summary: "",
        keyResponsibilities: "Develop software",
      };

      const result = validator.validateRequiredFields(input);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Missing required fields");
    });
  });

  describe("validateStatus", () => {
    it("should return valid with 'open' when status is 'open'", () => {
      const result = validator.validateStatus("open");

      expect(result.isValid).toBe(true);
      expect(result.value?.status).toBe("open");
    });

    it("should return valid with 'closed' when status is 'closed'", () => {
      const result = validator.validateStatus("closed");

      expect(result.isValid).toBe(true);
      expect(result.value?.status).toBe("closed");
    });

    it("should default to 'open' when status is undefined", () => {
      const result = validator.validateStatus(undefined);

      expect(result.isValid).toBe(true);
      expect(result.value?.status).toBe("open");
    });

    it("should return invalid when status is not 'open' or 'closed'", () => {
      const result = validator.validateStatus("pending");

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Invalid status");
    });
  });

  describe("validateNumberOfOpenPositions", () => {
    it("should return valid with the provided number", () => {
      const result = validator.validateNumberOfOpenPositions(5);

      expect(result.isValid).toBe(true);
      expect(result.value?.numberOfOpenPositions).toBe(5);
    });

    it("should default to 1 when undefined", () => {
      const result = validator.validateNumberOfOpenPositions(undefined);

      expect(result.isValid).toBe(true);
      expect(result.value?.numberOfOpenPositions).toBe(1);
    });

    it("should return valid when 0 positions", () => {
      const result = validator.validateNumberOfOpenPositions(0);

      expect(result.isValid).toBe(true);
      expect(result.value?.numberOfOpenPositions).toBe(0);
    });

    it("should return invalid when negative number", () => {
      const result = validator.validateNumberOfOpenPositions(-1);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("numberOfOpenPositions must be a non-negative number");
    });

    it("should return invalid when not a number", () => {
      // biome-ignore lint/suspicious/noExplicitAny: Testing invalid type
      const result = validator.validateNumberOfOpenPositions("5" as any);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("numberOfOpenPositions must be a non-negative number");
    });
  });

  describe("validateClosingDate", () => {
    it("should return valid with ISO string for valid date", () => {
      const result = validator.validateClosingDate("2025-12-31");

      expect(result.isValid).toBe(true);
      expect(result.value?.formattedClosingDate).toBe(new Date("2025-12-31").toISOString());
    });

    it("should handle ISO datetime strings", () => {
      const dateString = "2025-12-31T23:59:59Z";
      const result = validator.validateClosingDate(dateString);

      expect(result.isValid).toBe(true);
      expect(result.value?.formattedClosingDate).toBe(new Date(dateString).toISOString());
    });

    it("should return invalid for invalid date string", () => {
      const result = validator.validateClosingDate("invalid-date");

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Invalid closingDate");
    });

    it("should return invalid for empty string", () => {
      const result = validator.validateClosingDate("");

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Invalid closingDate");
    });
  });

  describe("validateCreateJobRole", () => {
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

    it("should return valid for complete valid input", () => {
      const result = validator.validateCreateJobRole(validInput);

      expect(result.isValid).toBe(true);
      expect(result.value).toEqual({
        status: "open",
        numberOfOpenPositions: 3,
        formattedClosingDate: new Date("2025-12-31").toISOString(),
      });
    });

    it("should use defaults for optional fields", () => {
      const input = {
        name: "Software Engineer",
        location: "Belfast",
        capability: "Engineering",
        band: "Senior",
        closingDate: "2025-12-31",
        summary: "Great opportunity",
        keyResponsibilities: "Develop software",
      };

      const result = validator.validateCreateJobRole(input);

      expect(result.isValid).toBe(true);
      expect(result.value?.status).toBe("open");
      expect(result.value?.numberOfOpenPositions).toBe(1);
    });

    it("should fail on missing required fields", () => {
      const input = {
        ...validInput,
        name: "",
      };

      const result = validator.validateCreateJobRole(input);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Missing required fields");
    });

    it("should fail on invalid status", () => {
      const input = {
        ...validInput,
        // biome-ignore lint/suspicious/noExplicitAny: Testing invalid type
        status: "pending" as any,
      };

      const result = validator.validateCreateJobRole(input);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Invalid status");
    });

    it("should fail on invalid numberOfOpenPositions", () => {
      const input = {
        ...validInput,
        numberOfOpenPositions: -1,
      };

      const result = validator.validateCreateJobRole(input);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("numberOfOpenPositions");
    });

    it("should fail on invalid closingDate", () => {
      const input = {
        ...validInput,
        closingDate: "not-a-date",
      };

      const result = validator.validateCreateJobRole(input);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Invalid closingDate");
    });
  });

  describe("validateUpdateJobRole", () => {
    it("should successfully validate partial update with valid fields", () => {
      const input = {
        name: "Senior Software Engineer",
        numberOfOpenPositions: 3,
        status: "open" as const,
      };

      const result = validator.validateUpdateJobRole(input);

      expect(result.isValid).toBe(true);
      expect(result.value?.numberOfOpenPositions).toBe(3);
      expect(result.value?.status).toBe("open");
    });

    it("should successfully validate update with single field", () => {
      const input = {
        name: "Updated Job Title",
      };

      const result = validator.validateUpdateJobRole(input);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should fail when no fields are provided", () => {
      const input = {};

      const result = validator.validateUpdateJobRole(input);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe("At least one field must be provided for update");
    });

    it("should fail when string fields are empty", () => {
      const input = {
        name: "",
      };

      const result = validator.validateUpdateJobRole(input);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("name must be a non-empty string");
    });

    it("should fail when string fields are only whitespace", () => {
      const input = {
        location: "   ",
      };

      const result = validator.validateUpdateJobRole(input);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("location must be a non-empty string");
    });

    it("should validate all string fields correctly", () => {
      const input = {
        name: "Valid Name",
        location: "Valid Location",
        capability: "Valid Capability",
        band: "Valid Band",
        summary: "Valid Summary",
        keyResponsibilities: "Valid Responsibilities",
      };

      const result = validator.validateUpdateJobRole(input);

      expect(result.isValid).toBe(true);
    });

    it("should validate status field", () => {
      const input = {
        status: "closed" as const,
      };

      const result = validator.validateUpdateJobRole(input);

      expect(result.isValid).toBe(true);
      expect(result.value?.status).toBe("closed");
    });

    it("should fail with invalid status", () => {
      const input = {
        status: "invalid-status" as "open" | "closed",
      };

      const result = validator.validateUpdateJobRole(input);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Invalid status");
    });

    it("should validate numberOfOpenPositions", () => {
      const input = {
        numberOfOpenPositions: 5,
      };

      const result = validator.validateUpdateJobRole(input);

      expect(result.isValid).toBe(true);
      expect(result.value?.numberOfOpenPositions).toBe(5);
    });

    it("should fail with negative numberOfOpenPositions", () => {
      const input = {
        numberOfOpenPositions: -1,
      };

      const result = validator.validateUpdateJobRole(input);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("numberOfOpenPositions must be a non-negative number");
    });

    it("should validate closingDate and format it correctly", () => {
      const input = {
        closingDate: "2024-12-31",
      };

      const result = validator.validateUpdateJobRole(input);

      expect(result.isValid).toBe(true);
      expect(result.value?.formattedClosingDate).toBeDefined();
      expect(result.value?.formattedClosingDate).toMatch(
        /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/
      );
    });

    it("should fail with invalid closingDate", () => {
      const input = {
        closingDate: "not-a-valid-date",
      };

      const result = validator.validateUpdateJobRole(input);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Invalid closingDate");
    });

    it("should handle mixed valid fields", () => {
      const input = {
        name: "Valid Name",
        status: "open" as const,
        closingDate: "2024-12-31",
      };

      const result = validator.validateUpdateJobRole(input);

      expect(result.isValid).toBe(true);
      expect(result.value?.status).toBe("open");
      expect(result.value?.formattedClosingDate).toBeDefined();
      expect(result.value?.numberOfOpenPositions).toBeUndefined();
    });

    it("should return correct result structure", () => {
      const input = {
        status: "closed" as const,
        numberOfOpenPositions: 0,
        closingDate: "2024-12-31",
      };

      const result = validator.validateUpdateJobRole(input);

      expect(result.isValid).toBe(true);
      expect(result.value).toHaveProperty("status");
      expect(result.value).toHaveProperty("numberOfOpenPositions");
      expect(result.value).toHaveProperty("formattedClosingDate");
      expect(result.error).toBeUndefined();
    });
  });
});

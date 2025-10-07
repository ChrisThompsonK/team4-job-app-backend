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
});

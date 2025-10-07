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

interface ValidationResult {
  isValid: boolean;
  error?: string;
  value?: {
    status: "open" | "closed";
    numberOfOpenPositions: number;
    formattedClosingDate: string;
  };
}

export class JobRoleValidator {
  validateRequiredFields(input: CreateJobRoleInput): ValidationResult {
    if (
      !input.name ||
      !input.location ||
      !input.capability ||
      !input.band ||
      !input.closingDate ||
      !input.summary ||
      !input.keyResponsibilities
    ) {
      return {
        isValid: false,
        error:
          "Missing required fields. Required: name, location, capability, band, closingDate, summary, keyResponsibilities",
      };
    }

    return { isValid: true };
  }

  validateStatus(status?: string): ValidationResult {
    const jobStatus = status || "open";

    if (jobStatus !== "open" && jobStatus !== "closed") {
      return {
        isValid: false,
        error: "Invalid status. Must be 'open' or 'closed'",
      };
    }

    return {
      isValid: true,
      value: { status: jobStatus, numberOfOpenPositions: 0, formattedClosingDate: "" },
    };
  }

  validateNumberOfOpenPositions(positions?: number): ValidationResult {
    const numberOfPositions = positions ?? 1;

    if (typeof numberOfPositions !== "number" || numberOfPositions < 0) {
      return {
        isValid: false,
        error: "numberOfOpenPositions must be a non-negative number",
      };
    }

    return {
      isValid: true,
      value: { status: "open", numberOfOpenPositions: numberOfPositions, formattedClosingDate: "" },
    };
  }

  validateClosingDate(closingDate: string): ValidationResult {
    try {
      const date = new Date(closingDate);

      if (Number.isNaN(date.getTime())) {
        return {
          isValid: false,
          error: "Invalid closingDate. Must be a valid date string",
        };
      }

      return {
        isValid: true,
        value: {
          status: "open",
          numberOfOpenPositions: 0,
          formattedClosingDate: date.toISOString(),
        },
      };
    } catch (_error) {
      return {
        isValid: false,
        error: "Invalid closingDate. Must be a valid date string",
      };
    }
  }

  validateCreateJobRole(input: CreateJobRoleInput): ValidationResult {
    // Validate required fields
    const requiredFieldsResult = this.validateRequiredFields(input);
    if (!requiredFieldsResult.isValid) {
      return requiredFieldsResult;
    }

    // Validate status
    const statusResult = this.validateStatus(input.status);
    if (!statusResult.isValid) {
      return statusResult;
    }

    // Validate numberOfOpenPositions
    const positionsResult = this.validateNumberOfOpenPositions(input.numberOfOpenPositions);
    if (!positionsResult.isValid) {
      return positionsResult;
    }

    // Validate closing date
    const closingDateResult = this.validateClosingDate(input.closingDate);
    if (!closingDateResult.isValid) {
      return closingDateResult;
    }

    return {
      isValid: true,
      value: {
        status: statusResult.value?.status,
        numberOfOpenPositions: positionsResult.value?.numberOfOpenPositions,
        formattedClosingDate: closingDateResult.value?.formattedClosingDate,
      },
    };
  }
}

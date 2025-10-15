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

interface UpdateJobRoleInput {
  name?: string;
  location?: string;
  capability?: string;
  band?: string;
  closingDate?: string;
  summary?: string;
  keyResponsibilities?: string;
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

interface UpdateValidationResult {
  isValid: boolean;
  error?: string;
  value?: {
    status?: "open" | "closed";
    numberOfOpenPositions?: number;
    formattedClosingDate?: string;
  };
}

export class JobRoleValidator {
  validateOptionalStringField(value?: string, fieldName?: string): ValidationResult {
    if (value !== undefined) {
      if (typeof value !== "string" || value.trim().length === 0) {
        return {
          isValid: false,
          error: `${fieldName || "Field"} must be a non-empty string`,
        };
      }
    }
    return { isValid: true };
  }

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

    // At this point, all validations passed and values are guaranteed to exist
    if (!statusResult.value || !positionsResult.value || !closingDateResult.value) {
      return {
        isValid: false,
        error: "Validation passed but values are missing",
      };
    }

    return {
      isValid: true,
      value: {
        status: statusResult.value.status,
        numberOfOpenPositions: positionsResult.value.numberOfOpenPositions,
        formattedClosingDate: closingDateResult.value.formattedClosingDate,
      },
    };
  }

  validateUpdateJobRole(input: UpdateJobRoleInput): UpdateValidationResult {
    // If no fields provided, return early
    if (Object.keys(input).length === 0) {
      return {
        isValid: false,
        error: "At least one field must be provided for update",
      };
    }

    // Validate individual optional fields
    const fieldValidations = [
      { field: input.name, name: "name" },
      { field: input.location, name: "location" },
      { field: input.capability, name: "capability" },
      { field: input.band, name: "band" },
      { field: input.summary, name: "summary" },
      { field: input.keyResponsibilities, name: "keyResponsibilities" },
    ];

    for (const { field, name } of fieldValidations) {
      const result = this.validateOptionalStringField(field, name);
      if (!result.isValid) {
        return result;
      }
    }

    // Validate status if provided
    let validatedStatus: "open" | "closed" | undefined;
    if (input.status !== undefined) {
      const statusResult = this.validateStatus(input.status);
      if (!statusResult.isValid) {
        return statusResult;
      }
      validatedStatus = statusResult.value?.status;
    }

    // Validate numberOfOpenPositions if provided
    let validatedPositions: number | undefined;
    if (input.numberOfOpenPositions !== undefined) {
      const positionsResult = this.validateNumberOfOpenPositions(input.numberOfOpenPositions);
      if (!positionsResult.isValid) {
        return positionsResult;
      }
      validatedPositions = positionsResult.value?.numberOfOpenPositions;
    }

    // Validate closing date if provided
    let validatedClosingDate: string | undefined;
    if (input.closingDate !== undefined) {
      const closingDateResult = this.validateClosingDate(input.closingDate);
      if (!closingDateResult.isValid) {
        return closingDateResult;
      }
      validatedClosingDate = closingDateResult.value?.formattedClosingDate;
    }

    const result: {
      status?: "open" | "closed";
      numberOfOpenPositions?: number;
      formattedClosingDate?: string;
    } = {};

    if (validatedStatus !== undefined) {
      result.status = validatedStatus;
    }
    if (validatedPositions !== undefined) {
      result.numberOfOpenPositions = validatedPositions;
    }
    if (validatedClosingDate !== undefined) {
      result.formattedClosingDate = validatedClosingDate;
    }

    return {
      isValid: true,
      value: result,
    };
  }
}

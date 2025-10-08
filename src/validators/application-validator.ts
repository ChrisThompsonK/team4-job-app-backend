interface ValidationError {
  field: string;
  message: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export class ApplicationValidator {
  validateCvText(cvText: string): ValidationResult {
    const errors: ValidationError[] = [];

    if (!cvText || cvText.trim().length === 0) {
      errors.push({
        field: "cvText",
        message: "CV text is required",
      });
    } else if (cvText.trim().length < 50) {
      errors.push({
        field: "cvText",
        message: "CV text must be at least 50 characters long",
      });
    } else if (cvText.length > 10000) {
      errors.push({
        field: "cvText",
        message: "CV text must not exceed 10,000 characters",
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validateJobRoleId(jobRoleId: number): ValidationResult {
    const errors: ValidationError[] = [];

    if (!jobRoleId || !Number.isInteger(jobRoleId) || jobRoleId <= 0) {
      errors.push({
        field: "jobRoleId",
        message: "Valid job role ID is required",
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validateApplication(data: { jobRoleId: number; cvText: string }): ValidationResult {
    const jobRoleIdValidation = this.validateJobRoleId(data.jobRoleId);
    const cvTextValidation = this.validateCvText(data.cvText);

    const allErrors = [...jobRoleIdValidation.errors, ...cvTextValidation.errors];

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
    };
  }
}

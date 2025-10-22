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

  validateUserId(userId: number): ValidationResult {
    const errors: ValidationError[] = [];

    if (!userId || !Number.isInteger(userId) || userId <= 0) {
      errors.push({
        field: "userId",
        message: "Valid user ID is required",
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validateApplication(data: {
    userId: number;
    jobRoleId: number;
    applicantName: string;
    email: string;
    phoneNumber?: string;
    cvText: string;
  }): ValidationResult {
    // Note: userId validation is removed since it now comes from authentication
    // and is guaranteed to be valid by the auth middleware
    const jobRoleIdValidation = this.validateJobRoleId(data.jobRoleId);
    const cvTextValidation = this.validateCvText(data.cvText);
    const emailValidation = this.validateEmail(data.email);
    const nameValidation = this.validateApplicantName(data.applicantName);

    const allErrors = [
      ...jobRoleIdValidation.errors,
      ...cvTextValidation.errors,
      ...emailValidation.errors,
      ...nameValidation.errors,
    ];

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
    };
  }

  validateEmail(email: string): ValidationResult {
    const errors: ValidationError[] = [];

    if (!email || email.trim().length === 0) {
      errors.push({
        field: "email",
        message: "Email is required",
      });
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push({
          field: "email",
          message: "Invalid email format",
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validateApplicantName(name: string): ValidationResult {
    const errors: ValidationError[] = [];

    if (!name || name.trim().length === 0) {
      errors.push({
        field: "applicantName",
        message: "Applicant name is required",
      });
    } else if (name.trim().length < 2) {
      errors.push({
        field: "applicantName",
        message: "Applicant name must be at least 2 characters long",
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validateStatusTransition(currentStatus: string, newStatus: string): ValidationResult {
    const errors: ValidationError[] = [];

    // Can only hire or reject applications that are "in progress"
    if (currentStatus !== "in progress") {
      errors.push({
        field: "status",
        message: `Cannot change status from "${currentStatus}" to "${newStatus}". Only applications with status "in progress" can be hired or rejected.`,
      });
    }

    // Validate new status is valid
    if (newStatus !== "hired" && newStatus !== "rejected") {
      errors.push({
        field: "status",
        message: `Invalid status "${newStatus}". Must be "hired" or "rejected".`,
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

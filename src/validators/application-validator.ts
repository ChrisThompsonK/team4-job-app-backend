import path from "node:path";
import { FILE_UPLOAD_CONFIG } from "../config/file-upload.js";

interface ValidationError {
  field: string;
  message: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export class ApplicationValidator {
  validateCvFile(file: Express.Multer.File): ValidationResult {
    const errors: ValidationError[] = [];

    // Check if file exists
    if (!file) {
      errors.push({
        field: "cvFile",
        message: "CV file is required",
      });
      return { isValid: false, errors };
    }

    // Check file size
    if (file.size > FILE_UPLOAD_CONFIG.MAX_CV_FILE_SIZE) {
      errors.push({
        field: "cvFile",
        message: `File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds maximum allowed size (${
          FILE_UPLOAD_CONFIG.MAX_CV_FILE_SIZE / (1024 * 1024)
        }MB)`,
      });
    }

    // Check MIME type
    const isValidMimeType = FILE_UPLOAD_CONFIG.ALLOWED_CV_MIME_TYPES.some(
      (type) => type === file.mimetype
    );
    if (!isValidMimeType) {
      errors.push({
        field: "cvFile",
        message: `Invalid file type (${file.mimetype}). Allowed types: ${FILE_UPLOAD_CONFIG.ALLOWED_CV_MIME_TYPES.join(
          ", "
        )}`,
      });
    }

    // Check file extension
    const extension = path.extname(file.originalname).toLowerCase();
    const normalizedAllowedExtensions = FILE_UPLOAD_CONFIG.ALLOWED_CV_EXTENSIONS.map((ext) =>
      ext.startsWith(".") ? ext.toLowerCase() : `.${ext.toLowerCase()}`
    );
    const isValidExtension = normalizedAllowedExtensions.includes(extension);
    if (!isValidExtension) {
      errors.push({
        field: "cvFile",
        message: `Invalid file extension (${extension}). Allowed extensions: ${FILE_UPLOAD_CONFIG.ALLOWED_CV_EXTENSIONS.join(
          ", "
        )}`,
      });
    }

    // Check if filename is reasonable (not empty, not too long)
    if (!file.originalname || file.originalname.trim().length === 0) {
      errors.push({
        field: "cvFile",
        message: "File must have a valid filename",
      });
    } else if (file.originalname.length > 255) {
      errors.push({
        field: "cvFile",
        message: "Filename is too long (maximum 255 characters)",
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
    cvFile: Express.Multer.File;
  }): ValidationResult {
    const jobRoleIdValidation = this.validateJobRoleId(data.jobRoleId);
    const cvFileValidation = this.validateCvFile(data.cvFile);

    const allErrors = [...jobRoleIdValidation.errors, ...cvFileValidation.errors];

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
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

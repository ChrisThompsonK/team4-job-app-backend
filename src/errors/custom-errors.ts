/**
 * Custom error classes for better error handling and HTTP status code mapping
 */

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class BusinessLogicError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BusinessLogicError";
  }
}

/**
 * Custom error classes for better error handling and HTTP status code mapping
 */

import type { Response } from "express";

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

/**
 * Centralized error handler for API controllers
 */
export function handleError(error: unknown, res: Response, defaultMessage: string): void {
  console.error(`API Error: ${defaultMessage}`, error);

  if (error instanceof ValidationError) {
    res.status(400).json({
      error: error.message,
    });
  } else if (error instanceof NotFoundError) {
    res.status(404).json({
      error: error.message,
    });
  } else if (error instanceof BusinessLogicError) {
    res.status(400).json({
      error: error.message,
    });
  } else {
    res.status(500).json({
      error: defaultMessage,
    });
  }
}

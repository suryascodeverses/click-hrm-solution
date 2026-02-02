import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { ValidateError } from "tsoa";

export interface ApiError extends Error {
  statusCode?: number;
  errors?: any[];
}

/**
 * ========================================
 * ENHANCED ERROR HANDLER
 * ========================================
 * Location: backend/src/middlewares/errorHandler.ts
 *
 * Handles:
 * - Zod validation errors
 * - tsoa validation errors
 * - Custom API errors
 * - Generic errors
 */

export const errorHandler = (
  err: ApiError | ZodError | ValidateError | Error,
  req: Request,
  res: Response,
  _: NextFunction,
) => {
  // Zod validation errors
  if (err instanceof ZodError) {
    console.error("Zod Validation Error:", {
      path: req.path,
      method: req.method,
      errors: err.errors,
    });

    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
    return;
  }

  // tsoa validation errors
  if (err instanceof ValidateError) {
    console.error("tsoa Validation Error:", {
      path: req.path,
      method: req.method,
      fields: err.fields,
    });

    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: Object.entries(err.fields).map(([field, error]) => ({
        field,
        message: error.message,
      })),
    });
    return;
  }

  // Custom API errors with statusCode
  const apiErr = err as ApiError;
  const statusCode = apiErr.statusCode || 500;
  const message = apiErr.message || "Internal Server Error";

  console.error("Error:", {
    statusCode,
    message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(statusCode).json({
    success: false,
    message,
    errors: apiErr.errors || [],
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

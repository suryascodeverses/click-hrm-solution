import { z } from "zod";

/**
 * ========================================
 * DESIGNATION - BACKEND VALIDATION
 * ========================================
 * Location: backend/src/modules/designation/designation.types.ts
 */

export const CreateDesignationValidationSchema = z.object({
  departmentId: z.string().uuid("Invalid department ID"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100).trim(),
  code: z.string().min(1, "Code is required").max(20).trim(),
  level: z.number().int().min(1, "Level must be at least 1"),
  description: z.string().max(500).optional(),
});

export const UpdateDesignationValidationSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  code: z.string().min(1).max(20).trim().optional(),
  level: z.number().int().min(1).optional(),
  description: z.string().max(500).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

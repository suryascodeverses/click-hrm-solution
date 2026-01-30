import { z } from "zod";

/**
 * ========================================
 * DEPARTMENT - BACKEND VALIDATION
 * ========================================
 * Location: backend/src/modules/department/department.types.ts
 */

export const CreateDepartmentValidationSchema = z.object({
  organisationId: z.string().uuid("Invalid organisation ID"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100).trim(),
  code: z.string().min(1, "Code is required").max(20).trim(),
  description: z.string().max(500).optional(),
  headOfDepartment: z.string().uuid().optional(),
});

export const UpdateDepartmentValidationSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  code: z.string().min(1).max(20).trim().optional(),
  description: z.string().max(500).optional(),
  headOfDepartment: z.string().uuid().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

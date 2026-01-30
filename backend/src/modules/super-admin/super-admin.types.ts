import { z } from "zod";

/**
 * ========================================
 * SUPER ADMIN - BACKEND TYPES & VALIDATION
 * ========================================
 * Location: backend/src/modules/super-admin/super-admin.types.ts
 */

// ============================================
// VALIDATION SCHEMAS
// ============================================

export const UpdateTenantStatusValidationSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "INACTIVE"]),
});

export const UpdateTenantValidationSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  subscriptionTier: z.string().optional(),
  maxEmployees: z.number().int().positive().optional(),
  status: z.enum(["ACTIVE", "SUSPENDED", "INACTIVE"]).optional(),
});

export const UpdateUserValidationSchema = z.object({
  role: z
    .enum([
      "SUPER_ADMIN",
      "TENANT_ADMIN",
      "ORG_ADMIN",
      "HR_MANAGER",
      "MANAGER",
      "EMPLOYEE",
    ])
    .optional(),
  isActive: z.boolean().optional(),
});

import { z } from "zod";

/**
 * ========================================
 * TENANT - BACKEND TYPES & VALIDATION
 * ========================================
 * Location: backend/src/modules/tenant/tenant.types.ts
 */

export const UpdateTenantProfileValidationSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  phone: z.string().optional(),
  logo: z.string().url().optional(),
});

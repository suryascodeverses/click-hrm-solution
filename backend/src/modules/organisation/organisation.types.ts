import { z } from "zod";

/**
 * ========================================
 * ORGANISATION - BACKEND VALIDATION
 * ========================================
 * Location: backend/src/modules/organisation/organisation.types.ts
 */

export const CreateOrganisationValidationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100).trim(),
  code: z.string().min(1, "Code is required").max(20).trim(),
  address: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  zipCode: z.string().max(20).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
});

export const UpdateOrganisationValidationSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  code: z.string().min(1).max(20).trim().optional(),
  address: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  zipCode: z.string().max(20).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

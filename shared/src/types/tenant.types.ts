/**
 * ========================================
 * TENANT - ZOD SCHEMAS & TYPES
 * ========================================
 * Location: shared/src/types/tenant.types.ts
 */

import { z } from "zod";

// ============================================
// BASE SCHEMAS (Building Blocks)
// ============================================

/**
 * Base tenant fields - minimal common fields
 */
const TenantBaseSchema = z.object({
  name: z.string(),
  subdomain: z.string(),
  email: z.string(),
});

// ============================================
// REQUEST SCHEMAS & TYPES
// ============================================

/**
 * Update tenant profile request schema - all fields optional
 */
export const UpdateTenantProfileRequestSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  logo: z.string().optional(),
});
export type UpdateTenantProfileRequestDto = z.infer<
  typeof UpdateTenantProfileRequestSchema
>;

// ============================================
// RESPONSE SCHEMAS & TYPES
// ============================================

/**
 * Get tenant response DTO - extends base with all fields
 */
export const GetTenantResponseDtoSchema = TenantBaseSchema.extend({
  id: z.string(),
  phone: z.string().nullable(),
  logo: z.string().nullable(),
  status: z.string(),
  subscriptionTier: z.string().nullable(),
  maxEmployees: z.number().nullable(),
  settings: z.any(),
  createdAt: z.date(),
  updatedAt: z.date(),
  organisations: z.array(z.any()),
  _count: z.object({
    users: z.number(),
    organisations: z.number(),
  }),
});
export type GetTenantResponseDto = z.infer<typeof GetTenantResponseDtoSchema>;

/**
 * Update tenant profile response DTO
 */
export const UpdateTenantProfileResponseDtoSchema = TenantBaseSchema.extend({
  id: z.string(),
  phone: z.string().nullable(),
  logo: z.string().nullable(),
  status: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type UpdateTenantProfileResponseDto = z.infer<
  typeof UpdateTenantProfileResponseDtoSchema
>;

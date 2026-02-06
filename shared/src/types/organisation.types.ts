/**
 * ========================================
 * ORGANISATION - ZOD SCHEMAS & TYPES
 * ========================================
 * Location: shared/src/types/organisation.types.ts
 */

import { z } from "zod";

// ============================================
// BASE SCHEMAS (Building Blocks)
// ============================================

/**
 * Base organisation fields - minimal common fields
 */
const OrganisationBaseSchema = z.object({
  name: z.string(),
  code: z.string(),
});

// ============================================
// REQUEST SCHEMAS & TYPES
// ============================================

/**
 * Create organisation request schema
 */
export const CreateOrganisationRequestSchema = OrganisationBaseSchema.extend({
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zipCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
});
export type CreateOrganisationRequestDto = z.infer<
  typeof CreateOrganisationRequestSchema
>;

/**
 * Update organisation request schema - all fields optional
 */
export const UpdateOrganisationRequestSchema = z.object({
  name: z.string().optional(),
  code: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zipCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  status: z.string().optional(),
});
export type UpdateOrganisationRequestDto = z.infer<
  typeof UpdateOrganisationRequestSchema
>;

// ============================================
// RESPONSE SCHEMAS & TYPES
// ============================================

/**
 * Organisation DTO - extends base with response fields
 */
export const OrganisationDtoSchema = OrganisationBaseSchema.extend({
  id: z.string(),
  tenantId: z.string(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  country: z.string().nullable(),
  zipCode: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  status: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type OrganisationDto = z.infer<typeof OrganisationDtoSchema>;

/**
 * Organisation list item DTO - extends organisation with count
 */
export const OrganisationListItemDtoSchema = OrganisationDtoSchema.extend({
  _count: z.object({
    employees: z.number(),
    departments: z.number(),
  }),
});
export type OrganisationListItemDto = z.infer<
  typeof OrganisationListItemDtoSchema
>;

/**
 * Organisation detail DTO - extends organisation with nested arrays
 */
export const OrganisationDetailDtoSchema = OrganisationDtoSchema.extend({
  departments: z.array(z.any()),
  employees: z.array(z.any()),
  _count: z.object({
    employees: z.number(),
    departments: z.number(),
  }),
});
export type OrganisationDetailDto = z.infer<typeof OrganisationDetailDtoSchema>;

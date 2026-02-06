/**
 * ========================================
 * DESIGNATION - ZOD SCHEMAS & TYPES
 * ========================================
 * Location: shared/src/types/designation.types.ts
 */

import { z } from "zod";

// ============================================
// BASE SCHEMAS (Building Blocks)
// ============================================

/**
 * Base designation fields - minimal common fields
 */
const DesignationBaseSchema = z.object({
  name: z.string(),
  code: z.string(),
  level: z.number(),
});

/**
 * Department reference nested object
 */
const DepartmentReferenceSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
});

// ============================================
// REQUEST SCHEMAS & TYPES
// ============================================

/**
 * Create designation request schema
 */
export const CreateDesignationRequestSchema = DesignationBaseSchema.extend({
  departmentId: z.string(),
  description: z.string().optional(),
});
export type CreateDesignationRequestDto = z.infer<
  typeof CreateDesignationRequestSchema
>;

/**
 * Update designation request schema - all fields optional
 */
export const UpdateDesignationRequestSchema = z.object({
  name: z.string().optional(),
  code: z.string().optional(),
  level: z.number().optional(),
  description: z.string().optional(),
  status: z.string().optional(),
});
export type UpdateDesignationRequestDto = z.infer<
  typeof UpdateDesignationRequestSchema
>;

/**
 * Get designations query schema
 */
export const GetDesignationsQuerySchema = z.object({
  departmentId: z.string().optional(),
});
export type GetDesignationsQueryDto = z.infer<
  typeof GetDesignationsQuerySchema
>;

// ============================================
// RESPONSE SCHEMAS & TYPES
// ============================================

/**
 * Designation DTO - extends base with response fields
 */
export const DesignationDtoSchema = DesignationBaseSchema.extend({
  id: z.string(),
  departmentId: z.string(),
  description: z.string().nullable(),
  status: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type DesignationDto = z.infer<typeof DesignationDtoSchema>;

/**
 * Designation list item DTO - extends designation with nested objects
 */
export const DesignationListItemDtoSchema = DesignationDtoSchema.extend({
  department: DepartmentReferenceSchema,
  _count: z.object({
    employees: z.number(),
  }),
});
export type DesignationListItemDto = z.infer<
  typeof DesignationListItemDtoSchema
>;

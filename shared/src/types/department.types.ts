/**
 * ========================================
 * DEPARTMENT - ZOD SCHEMAS & TYPES
 * ========================================
 * Location: shared/src/types/department.types.ts
 */

import { z } from "zod";

// ============================================
// BASE SCHEMAS (Building Blocks)
// ============================================

/**
 * Base department fields - minimal common fields
 */
const DepartmentBaseSchema = z.object({
  name: z.string(),
  code: z.string(),
});

/**
 * Organisation reference nested object
 */
const OrganisationReferenceSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
});

// ============================================
// REQUEST SCHEMAS & TYPES
// ============================================

/**
 * Create department request schema
 */
export const CreateDepartmentRequestSchema = DepartmentBaseSchema.extend({
  organisationId: z.string(),
  description: z.string().optional(),
  headOfDepartment: z.string().optional(),
});
export type CreateDepartmentRequestDto = z.infer<
  typeof CreateDepartmentRequestSchema
>;

/**
 * Update department request schema - all fields optional
 */
export const UpdateDepartmentRequestSchema = z.object({
  name: z.string().optional(),
  code: z.string().optional(),
  description: z.string().optional(),
  headOfDepartment: z.string().optional(),
  status: z.string().optional(),
});
export type UpdateDepartmentRequestDto = z.infer<
  typeof UpdateDepartmentRequestSchema
>;

/**
 * Get departments query schema
 */
export const GetDepartmentsQuerySchema = z.object({
  organisationId: z.string().optional(),
});
export type GetDepartmentsQueryDto = z.infer<typeof GetDepartmentsQuerySchema>;

// ============================================
// RESPONSE SCHEMAS & TYPES
// ============================================

/**
 * Department DTO - extends base with response fields
 */
export const DepartmentDtoSchema = DepartmentBaseSchema.extend({
  id: z.string(),
  organisationId: z.string(),
  description: z.string().nullable(),
  headOfDepartment: z.string().nullable(),
  status: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type DepartmentDto = z.infer<typeof DepartmentDtoSchema>;

/**
 * Department list item DTO - extends department with nested objects
 */
export const DepartmentListItemDtoSchema = DepartmentDtoSchema.extend({
  organisation: OrganisationReferenceSchema,
  _count: z.object({
    employees: z.number(),
    designations: z.number(),
  }),
});
export type DepartmentListItemDto = z.infer<typeof DepartmentListItemDtoSchema>;

/**
 * Department detail DTO - extends department with detailed nested data
 */
export const DepartmentDetailDtoSchema = DepartmentDtoSchema.extend({
  organisation: z.any(),
  employees: z.array(z.any()),
  designations: z.array(z.any()),
});
export type DepartmentDetailDto = z.infer<typeof DepartmentDetailDtoSchema>;

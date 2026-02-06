/**
 * ========================================
 * EMPLOYEE - ZOD SCHEMAS & TYPES
 * ========================================
 * Location: shared/src/types/employee.types.ts
 */

import { z } from "zod";

// ============================================
// BASE SCHEMAS (Building Blocks)
// ============================================

/**
 * Base employee fields - minimal common fields
 */
const EmployeeBaseSchema = z.object({
  employeeCode: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
});

/**
 * Base user nested object
 */
const UserNestedBaseSchema = z.object({
  email: z.string(),
  role: z.string(),
  isActive: z.boolean(),
});

/**
 * Base manager/subordinate nested object
 */
const EmployeeReferenceSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  employeeCode: z.string(),
});

// ============================================
// REQUEST SCHEMAS & TYPES
// ============================================

/**
 * Create employee request schema
 */
export const CreateEmployeeRequestSchema = EmployeeBaseSchema.extend({
  organisationId: z.string(),
  phone: z.string().optional(),
  dateOfJoining: z.string(),
  departmentId: z.string().optional(),
  designationId: z.string().optional(),
  password: z.string().optional(),
});
export type CreateEmployeeRequestDto = z.infer<
  typeof CreateEmployeeRequestSchema
>;

/**
 * Update employee request schema - all fields optional
 */
export const UpdateEmployeeRequestSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  departmentId: z.string().optional(),
  designationId: z.string().optional(),
  managerId: z.string().optional(),
  status: z.string().optional(),
  employmentType: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
});
export type UpdateEmployeeRequestDto = z.infer<
  typeof UpdateEmployeeRequestSchema
>;

/**
 * Get employees query schema
 */
export const GetEmployeesQuerySchema = z.object({
  organisationId: z.string().optional(),
  departmentId: z.string().optional(),
  status: z.string().optional(),
});
export type GetEmployeesQueryDto = z.infer<typeof GetEmployeesQuerySchema>;

// ============================================
// RESPONSE SCHEMAS & TYPES
// ============================================

/**
 * Employee list item DTO - extends base with response fields
 */
export const EmployeeListItemDtoSchema = EmployeeBaseSchema.extend({
  id: z.string(),
  phone: z.string().nullable(),
  status: z.string(),
  dateOfJoining: z.date(),
  createdAt: z.date(),
  user: UserNestedBaseSchema,
  department: z.any(),
  designation: z.any(),
  organisation: z.any(),
});
export type EmployeeListItemDto = z.infer<typeof EmployeeListItemDtoSchema>;

/**
 * Employee detail DTO - extends list item with additional fields
 */
export const EmployeeDetailDtoSchema = EmployeeListItemDtoSchema.extend({
  dateOfBirth: z.date().nullable(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  country: z.string().nullable(),
  employmentType: z.string().nullable(),
  user: UserNestedBaseSchema.extend({
    lastLogin: z.date().nullable(),
  }),
  manager: EmployeeReferenceSchema.nullable(),
  subordinates: z.array(EmployeeReferenceSchema),
});
export type EmployeeDetailDto = z.infer<typeof EmployeeDetailDtoSchema>;

/**
 * Create employee response DTO
 */
export const CreateEmployeeResponseDtoSchema = z.object({
  id: z.string(),
  employeeCode: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  status: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    role: z.string(),
  }),
  department: z.any(),
  designation: z.any(),
});
export type CreateEmployeeResponseDto = z.infer<
  typeof CreateEmployeeResponseDtoSchema
>;

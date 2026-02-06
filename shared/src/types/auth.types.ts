/**
 * ========================================
 * AUTH MODULE - ZOD SCHEMAS & TYPES
 * ========================================
 * Location: shared/src/types/auth.types.ts
 * API contracts shared between frontend and backend
 */

import { z } from "zod";

// ============================================
// BASE SCHEMAS (Building Blocks)
// ============================================

/**
 * Base user fields - minimal common fields
 */
const UserBaseSchema = z.object({
  email: z.string(),
  role: z.string(),
});

/**
 * Base tenant fields - minimal common fields
 */
const TenantBaseSchema = z.object({
  name: z.string(),
  subdomain: z.string(),
});

/**
 * Base employee fields - minimal common fields
 */
const EmployeeBaseSchema = z.object({
  employeeCode: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  status: z.string(),
});

// ============================================
// REQUEST SCHEMAS & TYPES
// ============================================

/**
 * Register request schema
 */
export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  companyName: z.string().min(2),
});
export type RegisterRequestDto = z.infer<typeof RegisterRequestSchema>;

/**
 * Login request schema
 */
export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginRequestDto = z.infer<typeof LoginRequestSchema>;

/**
 * Logout request schema
 */
export const LogoutRequestSchema = z.object({
  refreshToken: z.string().optional(),
});
export type LogoutRequestDto = z.infer<typeof LogoutRequestSchema>;

/**
 * Refresh token request schema
 */
export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string(),
});
export type RefreshTokenRequestDto = z.infer<typeof RefreshTokenRequestSchema>;

// ============================================
// RESPONSE SCHEMAS & TYPES
// ============================================

/**
 * User data in API responses
 */
export const UserDtoSchema = UserBaseSchema.extend({
  id: z.string(),
  tenantId: z.string().nullable().optional(),
});
export type UserDto = z.infer<typeof UserDtoSchema>;

/**
 * Tenant data in API responses
 */
export const TenantDtoSchema = TenantBaseSchema.extend({
  id: z.string(),
});
export type TenantDto = z.infer<typeof TenantDtoSchema>;

/**
 * Employee data in API responses
 */
export const EmployeeDtoSchema = EmployeeBaseSchema.extend({
  id: z.string(),
  organisation: z.any().optional(),
  department: z.any().optional(),
  designation: z.any().optional(),
});
export type EmployeeDto = z.infer<typeof EmployeeDtoSchema>;

/**
 * Register response
 */
export const RegisterResponseSchema = z.object({
  user: UserDtoSchema,
  tenant: TenantDtoSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
});
export type RegisterResponseDto = z.infer<typeof RegisterResponseSchema>;

/**
 * Login response
 */
export const LoginResponseSchema = z.object({
  user: UserDtoSchema,
  tenant: TenantDtoSchema.nullable(),
  employee: EmployeeDtoSchema.nullable(),
  accessToken: z.string(),
  refreshToken: z.string(),
});
export type LoginResponseDto = z.infer<typeof LoginResponseSchema>;

/**
 * Get Me response
 */
export const GetMeResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z.string(),
  tenantId: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  lastLogin: z.date().nullable(),
  tenant: TenantDtoSchema.nullable(),
  employee: EmployeeDtoSchema.nullable(),
});
export type GetMeResponseDto = z.infer<typeof GetMeResponseSchema>;

/**
 * Refresh token response
 */
export const RefreshTokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});
export type RefreshTokenResponseDto = z.infer<
  typeof RefreshTokenResponseSchema
>;

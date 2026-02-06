/**
 * ========================================
 * SUPER ADMIN AUTH - ZOD SCHEMAS & TYPES
 * ========================================
 * Location: shared/src/types/super-admin-auth.types.ts
 */

import { z } from "zod";

// ============================================
// BASE SCHEMAS (Building Blocks)
// ============================================

/**
 * Base super admin fields - minimal common fields
 */
const SuperAdminBaseSchema = z.object({
  email: z.string().email(),
  name: z.string(),
});

// ============================================
// REQUEST SCHEMAS & TYPES
// ============================================

/**
 * Super admin login request schema
 */
export const SuperAdminLoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type SuperAdminLoginRequestDto = z.infer<
  typeof SuperAdminLoginRequestSchema
>;

/**
 * Create super admin request schema
 */
export const CreateSuperAdminRequestSchema = SuperAdminBaseSchema.extend({
  password: z.string().min(8),
  masterKey: z.string(),
});
export type CreateSuperAdminRequestDto = z.infer<
  typeof CreateSuperAdminRequestSchema
>;

/**
 * Super admin refresh token request schema
 */
export const SuperAdminRefreshTokenRequestSchema = z.object({
  refreshToken: z.string().optional(), // From cookie
});
export type SuperAdminRefreshTokenRequestDto = z.infer<
  typeof SuperAdminRefreshTokenRequestSchema
>;

// ============================================
// RESPONSE SCHEMAS & TYPES
// ============================================

/**
 * Super admin DTO
 */
export const SuperAdminDtoSchema = SuperAdminBaseSchema.extend({
  id: z.string(),
  role: z.literal("SUPER_ADMIN"),
});
export type SuperAdminDto = z.infer<typeof SuperAdminDtoSchema>;

/**
 * Super admin login response DTO
 */
export const SuperAdminLoginResponseDtoSchema = z.object({
  superAdmin: SuperAdminDtoSchema,
  accessToken: z.string(),
});
export type SuperAdminLoginResponseDto = z.infer<
  typeof SuperAdminLoginResponseDtoSchema
>;

/**
 * Super admin get me response DTO
 */
export const SuperAdminGetMeResponseDtoSchema = SuperAdminBaseSchema.extend({
  id: z.string(),
  isActive: z.boolean(),
  lastLogin: z.date().nullable(),
  createdAt: z.date(),
});
export type SuperAdminGetMeResponseDto = z.infer<
  typeof SuperAdminGetMeResponseDtoSchema
>;

/**
 * Super admin refresh token response DTO
 */
export const SuperAdminRefreshTokenResponseDtoSchema = z.object({
  accessToken: z.string(),
});
export type SuperAdminRefreshTokenResponseDto = z.infer<
  typeof SuperAdminRefreshTokenResponseDtoSchema
>;

/**
 * Create super admin response DTO
 */
export const CreateSuperAdminResponseDtoSchema = SuperAdminBaseSchema.extend({
  id: z.string(),
  createdAt: z.date(),
});
export type CreateSuperAdminResponseDto = z.infer<
  typeof CreateSuperAdminResponseDtoSchema
>;

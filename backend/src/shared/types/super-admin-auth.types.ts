/**
 * ========================================
 * SUPER ADMIN AUTH MODULE - TYPES & DTOs
 * ========================================
 * Location: shared/types/super-admin-auth.types.ts
 */

import { z } from "zod";

// ============================================
// VALIDATION SCHEMAS
// ============================================

export const SuperAdminLoginValidationSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const CreateSuperAdminValidationSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  masterKey: z.string().min(1, "Master key is required"),
});

export const UpdateSuperAdminValidationSchema = z.object({
  name: z.string().min(2).trim().optional(),
  email: z.string().email().optional(),
  isActive: z.boolean().optional(),
});

export const ChangeSuperAdminPasswordValidationSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

// ============================================
// INPUT DTOs
// ============================================

export interface SuperAdminLoginInput {
  email: string;
  password: string;
}

export interface CreateSuperAdminInput {
  email: string;
  password: string;
  name: string;
  masterKey: string;
}

export interface UpdateSuperAdminInput {
  name?: string;
  email?: string;
  isActive?: boolean;
}

export interface ChangeSuperAdminPasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface SuperAdminLogoutInput {
  refreshToken?: string;
}

export interface SuperAdminRefreshTokenInput {
  refreshToken: string;
}

// ============================================
// ENTITY DTOs
// ============================================

export interface SuperAdminDto {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SuperAdminRefreshTokenDto {
  id: string;
  superAdminId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

// ============================================
// POPULATED DTOs
// ============================================

export interface SuperAdminWithStatsDto extends SuperAdminDto {
  stats: {
    totalActions: number;
    lastActionDate: Date | null;
    tenantsManaged: number;
    usersManaged: number;
  };
  recentActivity: Array<{
    action: string;
    entity: string;
    timestamp: Date;
    description: string;
  }>;
}

// ============================================
// RESPONSE DTOs
// ============================================

export interface SuperAdminAuthTokensDto {
  accessToken: string;
  refreshToken: string;
}

export interface SuperAdminLoginResponseDto {
  superAdmin: SuperAdminDto;
  tokens: SuperAdminAuthTokensDto;
  message: string;
}

export interface CreateSuperAdminResponseDto {
  superAdmin: SuperAdminDto;
  message: string;
}

export interface SuperAdminRefreshTokenResponseDto {
  accessToken: string;
  message: string;
}

export interface SuperAdminLogoutResponseDto {
  message: string;
}

export interface ChangeSuperAdminPasswordResponseDto {
  message: string;
}

// ============================================
// JWT PAYLOAD
// ============================================

export interface SuperAdminJWTPayload {
  superAdminId: string;
  email: string;
  name: string;
}

export interface DecodedSuperAdminJWTPayload extends SuperAdminJWTPayload {
  iat: number;
  exp: number;
}

// ============================================
// SESSION DTOs
// ============================================

export interface SuperAdminSessionDto {
  superAdmin: SuperAdminDto;
  permissions: string[];
}

export interface SuperAdminAuthContextDto {
  isAuthenticated: boolean;
  superAdmin: SuperAdminDto | null;
  loading: boolean;
}

// ============================================
// QUERY/FILTER DTOs
// ============================================

export interface SuperAdminQueryParams {
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "name" | "email" | "createdAt" | "lastLogin";
  sortOrder?: "asc" | "desc";
}

// ============================================
// RESPONSE DTOs
// ============================================

export interface SuperAdminListResponseDto {
  superAdmins: SuperAdminWithStatsDto[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

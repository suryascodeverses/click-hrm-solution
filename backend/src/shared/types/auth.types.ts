/**
 * ========================================
 * AUTH MODULE - TYPES & DTOs
 * ========================================
 * Location: shared/types/auth.types.ts
 */

import { z } from "zod";

// ============================================
// ENUMS
// ============================================

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  TENANT_ADMIN = "TENANT_ADMIN",
  ORG_ADMIN = "ORG_ADMIN",
  HR_MANAGER = "HR_MANAGER",
  MANAGER = "MANAGER",
  EMPLOYEE = "EMPLOYEE",
}

export enum TenantStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  INACTIVE = "INACTIVE",
}

// ============================================
// VALIDATION SCHEMAS
// ============================================

export const RegisterValidationSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  companyName: z
    .string()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must not exceed 100 characters")
    .trim(),
});

export const LoginValidationSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const LogoutValidationSchema = z.object({
  refreshToken: z.string().optional(),
});

export const RefreshTokenValidationSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const ChangePasswordValidationSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const ForgotPasswordValidationSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const ResetPasswordValidationSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
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

export interface RegisterInput {
  email: string;
  password: string;
  companyName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LogoutInput {
  refreshToken?: string;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

// ============================================
// ENTITY DTOs
// ============================================

export interface UserDto {
  id: string;
  tenantId: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantDto {
  id: string;
  name: string;
  subdomain: string;
  email: string;
  phone: string | null;
  logo: string | null;
  status: TenantStatus;
  subscriptionTier: string;
  maxEmployees: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RefreshTokenDto {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

// ============================================
// POPULATED DTOs
// ============================================

export interface UserWithTenantDto extends UserDto {
  tenant: TenantDto;
}

export interface UserWithEmployeeDto extends UserDto {
  employee: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    departmentId: string | null;
    designationId: string | null;
    status: string;
  } | null;
}

export interface UserWithFullDetailsDto extends UserDto {
  tenant: TenantDto;
  employee: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    middleName: string | null;
    email: string;
    phone: string | null;
    department: {
      id: string;
      name: string;
      code: string;
    } | null;
    designation: {
      id: string;
      name: string;
      code: string;
    } | null;
    organisation: {
      id: string;
      name: string;
      code: string;
    };
  } | null;
}

// ============================================
// RESPONSE DTOs
// ============================================

export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponseDto {
  user: UserDto;
  tokens: AuthTokensDto;
  message: string;
}

export interface RegisterResponseDto {
  user: UserDto;
  tenant: TenantDto;
  tokens: AuthTokensDto;
  message: string;
}

export interface RefreshTokenResponseDto {
  accessToken: string;
  message: string;
}

export interface LogoutResponseDto {
  message: string;
}

export interface ChangePasswordResponseDto {
  message: string;
}

export interface ForgotPasswordResponseDto {
  message: string;
}

export interface ResetPasswordResponseDto {
  message: string;
}

// ============================================
// JWT PAYLOAD
// ============================================

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  tenantId: string | null;
}

export interface DecodedJWTPayload extends JWTPayload {
  iat: number;
  exp: number;
}

// ============================================
// SESSION DTOs
// ============================================

export interface SessionDto {
  user: UserWithFullDetailsDto;
  tenant: TenantDto;
  permissions: string[];
}

export interface AuthContextDto {
  isAuthenticated: boolean;
  user: UserDto | null;
  tenant: TenantDto | null;
  loading: boolean;
}

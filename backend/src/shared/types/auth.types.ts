/**
 * ========================================
 * AUTH MODULE - TYPES & DTOs
 * ========================================
 * Location: shared/types/auth.types.ts
 */

import { TenantStatus, UserRole } from "@prisma/client";


// ============================================
// INPUT DTOs
// ============================================

export interface RegisterRequestDto {
  email: string;
  password: string;
  companyName: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LogoutRequestDto {
  refreshToken?: string;
}

export interface RefreshTokenRequestDto {
  refreshToken: string;
}

export interface ChangePasswordRequestDto {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequestDto {
  email: string;
}

export interface ResetPasswordRequestDto {
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
  settings: any; // Json field from Prisma
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
  message?: string;
}

export interface RegisterResponseDto {
  user: UserDto;
  tenant: TenantDto;
  accessToken: string;
  refreshToken: string;
  message?: string;
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

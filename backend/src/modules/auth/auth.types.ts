import { z } from "zod";

/**
 * ========================================
 * AUTH MODULE - BACKEND TYPES & VALIDATION
 * ========================================
 * Location: backend/src/modules/auth/auth.types.ts
 *
 * Note: Request/Response DTOs are in shared package
 * This file contains backend-specific validation and internal types
 */

// ============================================
// VALIDATION SCHEMAS (Backend-only, strict)
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

// ============================================
// INTERNAL DOMAIN MODELS (Backend-only)
// ============================================

/**
 * Full User domain model (internal use only)
 * Contains sensitive data never exposed to frontend
 */
export interface UserDomainModel {
  id: string;
  email: string;
  password: string; // ← Never exposed to API
  role: string;
  tenantId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date | null;
  // Relations (loaded when needed)
  tenant?: TenantDomainModel;
  employee?: EmployeeDomainModel;
  refreshTokens?: RefreshTokenDomainModel[];
}

/**
 * Tenant domain model (internal)
 */
export interface TenantDomainModel {
  id: string;
  name: string;
  subdomain: string;
  email: string;
  phone: string | null;
  logo: string | null;
  status: string;
  settings: any;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Employee domain model (internal)
 */
export interface EmployeeDomainModel {
  id: string;
  userId: string;
  organisationId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  dateOfJoining: Date;
  dateOfBirth: Date | null;
  status: string;
  departmentId: string | null;
  designationId: string | null;
  // Relations
  organisation?: any;
  department?: any;
  designation?: any;
}

/**
 * Refresh Token domain model (internal)
 */
export interface RefreshTokenDomainModel {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

// ============================================
// SERVICE LAYER TYPES
// ============================================

/**
 * JWT Payload for token generation
 */
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  tenantId: string | null;
}

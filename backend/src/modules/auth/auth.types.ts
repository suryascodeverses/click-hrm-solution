import { z } from "zod";

/**
 * ========================================
 * AUTH MODULE - VALIDATION SCHEMAS & TYPES
 * ========================================
 */

// ============================================
// REQUEST SCHEMAS
// ============================================

export const RegisterSchema = z.object({
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
    .max(100, "Company name must not exceed 100 characters"),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const LogoutSchema = z.object({
  refreshToken: z.string().optional(),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

// ============================================
// TYPE INFERENCE
// ============================================

export type RegisterRequest = z.infer<typeof RegisterSchema>;
export type LoginRequest = z.infer<typeof LoginSchema>;
export type LogoutRequest = z.infer<typeof LogoutSchema>;
export type RefreshTokenRequest = z.infer<typeof RefreshTokenSchema>;

// ============================================
// RESPONSE TYPES
// ============================================

export interface UserData {
  id: string;
  email: string;
  role: string;
  tenantId?: string;
}

export interface TenantData {
  id: string;
  name: string;
  subdomain: string;
}

export interface EmployeeData {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfJoining: Date;
  status: string;
  organisationId: string;
  departmentId?: string;
  designationId?: string;
}

export interface RegisterResponse {
  user: UserData;
  tenant: TenantData;
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: UserData;
  tenant: TenantData | null;
  employee: EmployeeData | null;
  accessToken: string;
  refreshToken: string;
}

export interface GetMeResponse {
  id: string;
  email: string;
  role: string;
  tenantId: string | null;
  isActive: boolean;
  createdAt: Date;
  lastLogin: Date | null;
  tenant: TenantData | null;
  employee:
    | (EmployeeData & {
        organisation?: any;
        department?: any;
        designation?: any;
      })
    | null;
}

export interface LogoutResponse {
  message: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

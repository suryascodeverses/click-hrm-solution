import { z } from "zod";

/**
 * ========================================
 * SUPER ADMIN AUTH - BACKEND TYPES & VALIDATION
 * ========================================
 * Location: backend/src/modules/super-admin-auth/super-admin-auth.types.ts
 */

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

// ============================================
// INTERNAL DOMAIN MODELS
// ============================================

export interface SuperAdminDomainModel {
  id: string;
  email: string;
  password: string; // Never exposed to API
  name: string;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SuperAdminRefreshTokenDomainModel {
  id: string;
  superAdminId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

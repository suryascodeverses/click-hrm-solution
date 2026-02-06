/**
 * ========================================
 * SUPER ADMIN - ZOD SCHEMAS & TYPES
 * ========================================
 * Location: shared/src/types/super-admin.types.ts
 */

import { z } from "zod";

// ============================================
// BASE SCHEMAS (Building Blocks)
// ============================================

/**
 * Base tenant fields for super admin views
 */
const TenantBaseSchema = z.object({
  name: z.string(),
  subdomain: z.string(),
  email: z.string(),
});

/**
 * Tenant reference nested object
 */
const TenantReferenceSchema = z.object({
  id: z.string(),
  name: z.string(),
  subdomain: z.string(),
});

/**
 * Employee reference nested object
 */
const EmployeeReferenceSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  employeeCode: z.string(),
});

// ============================================
// REQUEST SCHEMAS & TYPES
// ============================================

/**
 * Update tenant status request schema
 */
export const UpdateTenantStatusRequestSchema = z.object({
  status: z.string(),
});
export type UpdateTenantStatusRequestDto = z.infer<
  typeof UpdateTenantStatusRequestSchema
>;

/**
 * Update tenant request schema - all fields optional
 */
export const UpdateTenantRequestSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  subscriptionTier: z.string().optional(),
  maxEmployees: z.number().optional(),
  status: z.string().optional(),
});
export type UpdateTenantRequestDto = z.infer<typeof UpdateTenantRequestSchema>;

/**
 * Update user request schema - all fields optional
 */
export const UpdateUserRequestSchema = z.object({
  role: z.string().optional(),
  isActive: z.boolean().optional(),
});
export type UpdateUserRequestDto = z.infer<typeof UpdateUserRequestSchema>;

// ============================================
// RESPONSE SCHEMAS & TYPES
// ============================================

/**
 * Dashboard stats DTO
 */
export const DashboardStatsDtoSchema = z.object({
  totalTenants: z.number(),
  activeTenants: z.number(),
  totalUsers: z.number(),
  totalEmployees: z.number(),
});
export type DashboardStatsDto = z.infer<typeof DashboardStatsDtoSchema>;

/**
 * Recent tenant DTO
 */
export const RecentTenantDtoSchema = TenantBaseSchema.extend({
  id: z.string(),
  status: z.string(),
  createdAt: z.date(),
  _count: z.object({
    users: z.number(),
    organisations: z.number(),
  }),
});
export type RecentTenantDto = z.infer<typeof RecentTenantDtoSchema>;

/**
 * Get dashboard stats response DTO
 */
export const GetDashboardStatsResponseDtoSchema = z.object({
  stats: DashboardStatsDtoSchema,
  recentTenants: z.array(RecentTenantDtoSchema),
});
export type GetDashboardStatsResponseDto = z.infer<
  typeof GetDashboardStatsResponseDtoSchema
>;

/**
 * Tenant detail DTO
 */
export const TenantDetailDtoSchema = TenantBaseSchema.extend({
  id: z.string(),
  phone: z.string().nullable(),
  logo: z.string().nullable(),
  status: z.string(),
  subscriptionTier: z.string().nullable(),
  maxEmployees: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  _count: z.object({
    users: z.number(),
    organisations: z.number(),
  }),
});
export type TenantDetailDto = z.infer<typeof TenantDetailDtoSchema>;

/**
 * User detail DTO
 */
export const UserDetailDtoSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z.string(),
  isActive: z.boolean(),
  tenantId: z.string().nullable(),
  createdAt: z.date(),
  lastLogin: z.date().nullable(),
  tenant: TenantReferenceSchema.nullable(),
  employee: EmployeeReferenceSchema.nullable(),
});
export type UserDetailDto = z.infer<typeof UserDetailDtoSchema>;

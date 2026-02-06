/**
 * ========================================
 * AUDIT LOGS - ZOD SCHEMAS & TYPES
 * ========================================
 * Location: shared/src/types/audit-logs.types.ts
 */

import { z } from "zod";

// ============================================
// BASE SCHEMAS (Building Blocks)
// ============================================

/**
 * Base audit log fields - minimal common fields
 */
const AuditLogBaseSchema = z.object({
  tenantId: z.string().nullable(),
  userId: z.string().nullable(),
  action: z.string(),
  entity: z.string().nullable(),
  entityId: z.string().nullable(),
});

/**
 * Pagination metadata schema
 */
const PaginationSchema = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

// ============================================
// REQUEST SCHEMAS & TYPES
// ============================================

/**
 * Get audit logs query schema
 */
export const GetAuditLogsQuerySchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  tenantId: z.string().optional(),
  userId: z.string().optional(),
  action: z.string().optional(),
  entity: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
});
export type GetAuditLogsQueryDto = z.infer<typeof GetAuditLogsQuerySchema>;

// ============================================
// RESPONSE SCHEMAS & TYPES
// ============================================

/**
 * Audit log DTO - extends base with response fields
 */
export const AuditLogDtoSchema = AuditLogBaseSchema.extend({
  id: z.string(),
  userEmail: z.string().nullable().optional(),
  userName: z.string().nullable().optional(),
  description: z.string().optional(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  metadata: z.any().optional(),
  createdAt: z.date(),
});
export type AuditLogDto = z.infer<typeof AuditLogDtoSchema>;

/**
 * Get audit logs response DTO
 */
export const GetAuditLogsResponseDtoSchema = z.object({
  logs: z.array(AuditLogDtoSchema),
  pagination: PaginationSchema,
});
export type GetAuditLogsResponseDto = z.infer<
  typeof GetAuditLogsResponseDtoSchema
>;

/**
 * Audit log stats DTO
 */
export const AuditLogStatsDtoSchema = z.object({
  stats: z.object({
    totalLogs: z.number(),
    last24Hours: z.number(),
    loginAttempts: z.number(),
    failedLogins: z.number(),
  }),
  topActions: z.array(
    z.object({
      action: z.string(),
      count: z.number(),
    }),
  ),
});
export type AuditLogStatsDto = z.infer<typeof AuditLogStatsDtoSchema>;

/**
 * Audit log filters DTO
 */
export const AuditLogFiltersDtoSchema = z.object({
  actions: z.array(z.string()),
  entities: z.array(z.string()),
});
export type AuditLogFiltersDto = z.infer<typeof AuditLogFiltersDtoSchema>;

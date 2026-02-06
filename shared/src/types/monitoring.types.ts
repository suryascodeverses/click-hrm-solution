/**
 * ========================================
 * MONITORING - ZOD SCHEMAS & TYPES
 * ========================================
 * Location: shared/src/types/monitoring.types.ts
 */

import { z } from "zod";

// ============================================
// BASE SCHEMAS (Building Blocks)
// ============================================

/**
 * Base system alert fields - minimal common fields
 */
const SystemAlertBaseSchema = z.object({
  alertType: z.string(),
  severity: z.string(),
  title: z.string(),
  message: z.string(),
});

// ============================================
// REQUEST SCHEMAS & TYPES
// ============================================

/**
 * Create system alert request schema
 */
export const CreateSystemAlertRequestSchema = SystemAlertBaseSchema.extend({
  metadata: z.any().optional(),
});
export type CreateSystemAlertRequestDto = z.infer<
  typeof CreateSystemAlertRequestSchema
>;

// ============================================
// RESPONSE SCHEMAS & TYPES
// ============================================

/**
 * System health DTO
 */
export const SystemHealthDtoSchema = z.object({
  cpu: z.object({
    usage: z.string(),
    cores: z.number(),
  }),
  memory: z.object({
    total: z.string(),
    used: z.string(),
    free: z.string(),
    usagePercent: z.string(),
  }),
  database: z.object({
    size: z.string(),
    connections: z.number(),
  }),
  uptime: z.number(),
  platform: z.string(),
  nodeVersion: z.string(),
});
export type SystemHealthDto = z.infer<typeof SystemHealthDtoSchema>;

/**
 * Metrics history DTO
 */
export const MetricsHistoryDtoSchema = z.record(
  z.string(),
  z.array(
    z.object({
      value: z.number(),
      unit: z.string(),
      timestamp: z.date(),
    }),
  ),
);
export type MetricsHistoryDto = z.infer<typeof MetricsHistoryDtoSchema>;

/**
 * Database stats DTO
 */
export const DatabaseStatsDtoSchema = z.object({
  recordCounts: z.object({
    tenants: z.number(),
    users: z.number(),
    employees: z.number(),
    auditLogs: z.number(),
    emailLogs: z.number(),
  }),
  tableSizes: z.array(
    z.object({
      schemaname: z.string(),
      tablename: z.string(),
      size: z.string(),
      size_bytes: z.string(),
    }),
  ),
});
export type DatabaseStatsDto = z.infer<typeof DatabaseStatsDtoSchema>;

/**
 * API usage stats DTO
 */
export const ApiUsageStatsDtoSchema = z.object({
  topEndpoints: z.array(z.any()),
  callsPerHour: z.array(
    z.object({
      hour: z.date(),
      count: z.number(),
    }),
  ),
  total24h: z.number(),
});
export type ApiUsageStatsDto = z.infer<typeof ApiUsageStatsDtoSchema>;

/**
 * System alert DTO - extends base with response fields
 */
export const SystemAlertDtoSchema = SystemAlertBaseSchema.extend({
  id: z.string(),
  metadata: z.any(),
  isResolved: z.boolean(),
  resolvedAt: z.date().nullable(),
  createdAt: z.date(),
});
export type SystemAlertDto = z.infer<typeof SystemAlertDtoSchema>;

/**
 * System alerts response DTO
 */
export const SystemAlertsResponseDtoSchema = z.object({
  alerts: z.array(SystemAlertDtoSchema),
  stats: z.object({
    total: z.number(),
    critical: z.number(),
    high: z.number(),
    unresolved: z.number(),
  }),
});
export type SystemAlertsResponseDto = z.infer<
  typeof SystemAlertsResponseDtoSchema
>;

/**
 * Error rate DTO
 */
export const ErrorRateDtoSchema = z.object({
  errorRate: z.string(),
  errors24h: z.number(),
  total24h: z.number(),
});
export type ErrorRateDto = z.infer<typeof ErrorRateDtoSchema>;

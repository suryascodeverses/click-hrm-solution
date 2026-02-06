/**
 * ========================================
 * EMAIL TEMPLATES - ZOD SCHEMAS & TYPES
 * ========================================
 * Location: shared/src/types/email-templates.types.ts
 */

import { z } from "zod";

// ============================================
// BASE SCHEMAS (Building Blocks)
// ============================================

/**
 * Base email template fields - minimal common fields
 */
const EmailTemplateBaseSchema = z.object({
  name: z.string(),
  displayName: z.string(),
  category: z.string(),
  subject: z.string(),
  htmlContent: z.string(),
});

/**
 * Base email log fields - minimal common fields
 */
const EmailLogBaseSchema = z.object({
  recipient: z.string(),
  subject: z.string(),
  status: z.string(),
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
 * Create email template request schema
 */
export const CreateEmailTemplateRequestSchema = EmailTemplateBaseSchema.extend({
  textContent: z.string().optional(),
  variables: z.any().optional(),
});
export type CreateEmailTemplateRequestDto = z.infer<
  typeof CreateEmailTemplateRequestSchema
>;

/**
 * Update email template request schema - all fields optional
 */
export const UpdateEmailTemplateRequestSchema = z.object({
  name: z.string().optional(),
  displayName: z.string().optional(),
  category: z.string().optional(),
  subject: z.string().optional(),
  htmlContent: z.string().optional(),
  textContent: z.string().optional(),
  variables: z.any().optional(),
  isActive: z.boolean().optional(),
});
export type UpdateEmailTemplateRequestDto = z.infer<
  typeof UpdateEmailTemplateRequestSchema
>;

/**
 * Send test email request schema
 */
export const SendTestEmailRequestSchema = z.object({
  templateId: z.string(),
  recipient: z.string(),
  variables: z.any().optional(),
});
export type SendTestEmailRequestDto = z.infer<
  typeof SendTestEmailRequestSchema
>;

// ============================================
// RESPONSE SCHEMAS & TYPES
// ============================================

/**
 * Email template DTO - extends base with response fields
 */
export const EmailTemplateDtoSchema = EmailTemplateBaseSchema.extend({
  id: z.string(),
  textContent: z.string().nullable(),
  variables: z.any(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type EmailTemplateDto = z.infer<typeof EmailTemplateDtoSchema>;

/**
 * Email log DTO - extends base with response fields
 */
export const EmailLogDtoSchema = EmailLogBaseSchema.extend({
  id: z.string(),
  templateId: z.string().nullable(),
  tenantId: z.string().nullable(),
  sentAt: z.date().nullable(),
  metadata: z.any(),
  createdAt: z.date(),
});
export type EmailLogDto = z.infer<typeof EmailLogDtoSchema>;

/**
 * Email logs response DTO
 */
export const EmailLogsResponseDtoSchema = z.object({
  logs: z.array(EmailLogDtoSchema),
  pagination: PaginationSchema,
});
export type EmailLogsResponseDto = z.infer<typeof EmailLogsResponseDtoSchema>;

/**
 * Email stats DTO
 */
export const EmailStatsDtoSchema = z.object({
  stats: z.object({
    totalSent: z.number(),
    sent: z.number(),
    failed: z.number(),
    pending: z.number(),
    last24Hours: z.number(),
    successRate: z.string(),
  }),
  byCategory: z.array(z.any()),
});
export type EmailStatsDto = z.infer<typeof EmailStatsDtoSchema>;

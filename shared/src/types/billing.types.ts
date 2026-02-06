/**
 * ========================================
 * BILLING - ZOD SCHEMAS & TYPES
 * ========================================
 * Location: shared/src/types/billing.types.ts
 */

import { z } from "zod";

// ============================================
// BASE SCHEMAS (Building Blocks)
// ============================================

/**
 * Base subscription plan fields - minimal common fields
 */
const SubscriptionPlanBaseSchema = z.object({
  name: z.string(),
  displayName: z.string(),
  price: z.number(),
  maxEmployees: z.number(),
  maxOrganisations: z.number(),
  features: z.any(),
});

/**
 * Base subscription fields - minimal common fields
 */
const SubscriptionBaseSchema = z.object({
  tenantId: z.string(),
  planId: z.string(),
  status: z.string(),
  billingCycle: z.string(),
});

/**
 * Base invoice fields - minimal common fields
 */
const InvoiceBaseSchema = z.object({
  subscriptionId: z.string(),
  tenantId: z.string(),
  invoiceNumber: z.string(),
  amount: z.number(),
  tax: z.number(),
  total: z.number(),
  status: z.string(),
});

/**
 * Base payment fields - minimal common fields
 */
const PaymentBaseSchema = z.object({
  subscriptionId: z.string(),
  tenantId: z.string(),
  amount: z.number(),
  paymentMethod: z.string(),
  status: z.string(),
});

/**
 * Tenant reference nested object
 */
const TenantReferenceSchema = z.object({
  id: z.string(),
  name: z.string(),
  subdomain: z.string(),
  email: z.string(),
});

// ============================================
// REQUEST SCHEMAS & TYPES
// ============================================

/**
 * Create subscription plan request schema
 */
export const CreateSubscriptionPlanRequestSchema =
  SubscriptionPlanBaseSchema.extend({
    yearlyPrice: z.number().nullable(),
  });
export type CreateSubscriptionPlanRequestDto = z.infer<
  typeof CreateSubscriptionPlanRequestSchema
>;

/**
 * Update subscription plan request schema - all fields optional
 */
export const UpdateSubscriptionPlanRequestSchema = z.object({
  name: z.string().optional(),
  displayName: z.string().optional(),
  price: z.number().optional(),
  yearlyPrice: z.number().nullable().optional(),
  maxEmployees: z.number().optional(),
  maxOrganisations: z.number().optional(),
  features: z.any().optional(),
  isActive: z.boolean().optional(),
});
export type UpdateSubscriptionPlanRequestDto = z.infer<
  typeof UpdateSubscriptionPlanRequestSchema
>;

/**
 * Mark invoice paid request schema
 */
export const MarkInvoicePaidRequestSchema = z.object({
  paymentMethod: z.string().optional(),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
});
export type MarkInvoicePaidRequestDto = z.infer<
  typeof MarkInvoicePaidRequestSchema
>;

/**
 * Cancel subscription request schema
 */
export const CancelSubscriptionRequestSchema = z.object({
  cancelAtPeriodEnd: z.boolean(),
});
export type CancelSubscriptionRequestDto = z.infer<
  typeof CancelSubscriptionRequestSchema
>;

// ============================================
// RESPONSE SCHEMAS & TYPES
// ============================================

/**
 * Subscription plan DTO - extends base with response fields
 */
export const SubscriptionPlanDtoSchema = SubscriptionPlanBaseSchema.extend({
  id: z.string(),
  yearlyPrice: z.number().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
});
export type SubscriptionPlanDto = z.infer<typeof SubscriptionPlanDtoSchema>;

/**
 * Subscription DTO - extends base with response fields
 */
export const SubscriptionDtoSchema = SubscriptionBaseSchema.extend({
  id: z.string(),
  currentPeriodStart: z.date(),
  currentPeriodEnd: z.date(),
  cancelAtPeriodEnd: z.boolean(),
  createdAt: z.date(),
});
export type SubscriptionDto = z.infer<typeof SubscriptionDtoSchema>;

/**
 * Subscription with details DTO - extends subscription with nested objects
 */
export const SubscriptionWithDetailsDtoSchema = SubscriptionDtoSchema.extend({
  tenant: TenantReferenceSchema,
  plan: SubscriptionPlanDtoSchema,
});
export type SubscriptionWithDetailsDto = z.infer<
  typeof SubscriptionWithDetailsDtoSchema
>;

/**
 * Subscription stats DTO
 */
export const SubscriptionStatsDtoSchema = z.object({
  stats: z.object({
    total: z.number(),
    active: z.number(),
    trial: z.number(),
    cancelled: z.number(),
    totalRevenue: z.number(),
  }),
  revenueByPlan: z.array(z.any()),
});
export type SubscriptionStatsDto = z.infer<typeof SubscriptionStatsDtoSchema>;

/**
 * Invoice DTO - extends base with response fields
 */
export const InvoiceDtoSchema = InvoiceBaseSchema.extend({
  id: z.string(),
  dueDate: z.date(),
  paidAt: z.date().nullable(),
  notes: z.string().nullable(),
  createdAt: z.date(),
});
export type InvoiceDto = z.infer<typeof InvoiceDtoSchema>;

/**
 * Payment DTO - extends base with response fields
 */
export const PaymentDtoSchema = PaymentBaseSchema.extend({
  id: z.string(),
  invoiceId: z.string().nullable(),
  transactionId: z.string().nullable(),
  paidAt: z.date().nullable(),
  createdAt: z.date(),
});
export type PaymentDto = z.infer<typeof PaymentDtoSchema>;

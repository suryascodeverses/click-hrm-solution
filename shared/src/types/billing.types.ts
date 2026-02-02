/**
 * ========================================
 * BILLING - REQUEST/RESPONSE DTOs
 * ========================================
 * Location: shared/src/types/billing.types.ts
 */

export interface CreateSubscriptionPlanRequestDto {
  name: string;
  displayName: string;
  price: number;
  yearlyPrice: number | null;
  maxEmployees: number;
  maxOrganisations: number;
  features: any;
}

export interface UpdateSubscriptionPlanRequestDto {
  name?: string;
  displayName?: string;
  price?: number;
  yearlyPrice?: number | null;
  maxEmployees?: number;
  maxOrganisations?: number;
  features?: any;
  isActive?: boolean;
}

export interface MarkInvoicePaidRequestDto {
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
}

export interface CancelSubscriptionRequestDto {
  cancelAtPeriodEnd: boolean;
}

export interface SubscriptionPlanDto {
  id: string;
  name: string;
  displayName: string;
  price: number;
  yearlyPrice: number | null;
  maxEmployees: number;
  maxOrganisations: number;
  features: any;
  isActive: boolean;
  createdAt: Date;
}

export interface SubscriptionDto {
  id: string;
  tenantId: string;
  planId: string;
  status: string;
  billingCycle: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
}

export interface SubscriptionWithDetailsDto extends SubscriptionDto {
  tenant: { id: string; name: string; subdomain: string; email: string };
  plan: SubscriptionPlanDto;
}

export interface SubscriptionStatsDto {
  stats: {
    total: number;
    active: number;
    trial: number;
    cancelled: number;
    totalRevenue: number;
  };
  revenueByPlan: any[];
}

export interface InvoiceDto {
  id: string;
  subscriptionId: string;
  tenantId: string;
  invoiceNumber: string;
  amount: number;
  tax: number;
  total: number;
  status: string;
  dueDate: Date;
  paidAt: Date | null;
  notes: string | null;
  createdAt: Date;
}

export interface PaymentDto {
  id: string;
  subscriptionId: string;
  invoiceId: string | null;
  tenantId: string;
  amount: number;
  paymentMethod: string;
  transactionId: string | null;
  status: string;
  paidAt: Date | null;
  createdAt: Date;
}

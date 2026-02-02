import { prisma } from "../../config/database";
import { NotFoundError } from "../../shared/errors";
import type {
  CreateSubscriptionPlanRequestDto,
  UpdateSubscriptionPlanRequestDto,
  MarkInvoicePaidRequestDto,
  CancelSubscriptionRequestDto,
  SubscriptionPlanDto,
  SubscriptionWithDetailsDto,
  SubscriptionStatsDto,
  InvoiceDto,
  PaymentDto,
} from "@arm/shared";

export class BillingService {
  async getSubscriptionPlans(): Promise<SubscriptionPlanDto[]> {
    return await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
    });
  }

  async createSubscriptionPlan(
    data: CreateSubscriptionPlanRequestDto,
  ): Promise<SubscriptionPlanDto> {
    return await prisma.subscriptionPlan.create({ data });
  }

  async updateSubscriptionPlan(
    planId: string,
    data: UpdateSubscriptionPlanRequestDto,
  ): Promise<SubscriptionPlanDto> {
    return await prisma.subscriptionPlan.update({
      where: { id: planId },
      data,
    });
  }

  async getAllSubscriptions(): Promise<SubscriptionWithDetailsDto[]> {
    return (await prisma.subscription.findMany({
      include: {
        tenant: {
          select: { id: true, name: true, subdomain: true, email: true },
        },
        plan: true,
      },
      orderBy: { createdAt: "desc" },
    })) as SubscriptionWithDetailsDto[];
  }

  async getSubscriptionStats(): Promise<SubscriptionStatsDto> {
    const [total, active, trial, cancelled, revenue] = await Promise.all([
      prisma.subscription.count(),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.subscription.count({ where: { status: "TRIAL" } }),
      prisma.subscription.count({ where: { status: "CANCELLED" } }),
      prisma.payment.aggregate({
        where: { status: "SUCCEEDED" },
        _sum: { amount: true },
      }),
    ]);

    const revenueByPlan = await prisma.payment.groupBy({
      by: ["subscriptionId"],
      where: { status: "SUCCEEDED" },
      _sum: { amount: true },
    });

    return {
      stats: {
        total,
        active,
        trial,
        cancelled,
        totalRevenue: revenue._sum.amount || 0,
      },
      revenueByPlan,
    };
  }

  async getAllInvoices(
    status?: string,
    tenantId?: string,
  ): Promise<InvoiceDto[]> {
    const where: any = {};
    if (status) where.status = status;
    if (tenantId) where.tenantId = tenantId;

    return (await prisma.invoice.findMany({
      where,
      include: {
        subscription: {
          include: {
            tenant: { select: { name: true, subdomain: true } },
            plan: { select: { displayName: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })) as any;
  }

  async getAllPayments(
    status?: string,
    tenantId?: string,
  ): Promise<PaymentDto[]> {
    const where: any = {};
    if (status) where.status = status;
    if (tenantId) where.tenantId = tenantId;

    return (await prisma.payment.findMany({
      where,
      include: {
        subscription: {
          include: { tenant: { select: { name: true, subdomain: true } } },
        },
        invoice: true,
      },
      orderBy: { createdAt: "desc" },
    })) as any;
  }

  async markInvoicePaid(
    invoiceId: string,
    data: MarkInvoicePaidRequestDto,
  ): Promise<InvoiceDto> {
    const { paymentMethod, transactionId, notes } = data;

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });
    if (!invoice) throw new NotFoundError("Invoice not found");

    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: "PAID", paidAt: new Date(), notes },
    });

    await prisma.payment.create({
      data: {
        subscriptionId: invoice.subscriptionId,
        invoiceId: invoice.id,
        tenantId: invoice.tenantId,
        amount: invoice.total,
        paymentMethod: paymentMethod || "MANUAL",
        status: "SUCCEEDED",
        transactionId,
        paidAt: new Date(),
      },
    });

    return updatedInvoice;
  }

  async cancelSubscription(
    subscriptionId: string,
    data: CancelSubscriptionRequestDto,
  ): Promise<any> {
    const { cancelAtPeriodEnd } = data;
    return await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: cancelAtPeriodEnd ? "ACTIVE" : "CANCELLED",
        cancelAtPeriodEnd: cancelAtPeriodEnd || false,
      },
    });
  }
}

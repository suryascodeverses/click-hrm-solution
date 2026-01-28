import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";

// Get all subscription plans
export const getSubscriptionPlans = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
    });

    res.json({
      success: true,
      data: plans,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Create subscription plan (Super Admin)
export const createSubscriptionPlan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      displayName,
      price,
      yearlyPrice,
      maxEmployees,
      maxOrganisations,
      features,
    } = req.body;

    const plan = await prisma.subscriptionPlan.create({
      data: {
        name,
        displayName,
        price,
        yearlyPrice,
        maxEmployees,
        maxOrganisations,
        features,
      },
    });

    res.status(201).json({
      success: true,
      message: "Subscription plan created",
      data: plan,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Update subscription plan
export const updateSubscriptionPlan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { planId } = req.params;
    const updates = req.body;

    const plan = await prisma.subscriptionPlan.update({
      where: { id: planId },
      data: updates,
    });

    res.json({
      success: true,
      message: "Plan updated",
      data: plan,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Get all subscriptions (Super Admin)
export const getAllSubscriptions = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            subdomain: true,
            email: true,
          },
        },
        plan: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: subscriptions,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Get subscription stats
export const getSubscriptionStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
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

    // Revenue by plan
    const revenueByPlan = await prisma.payment.groupBy({
      by: ["subscriptionId"],
      where: { status: "SUCCEEDED" },
      _sum: { amount: true },
    });

    res.json({
      success: true,
      data: {
        stats: {
          total,
          active,
          trial,
          cancelled,
          totalRevenue: revenue._sum.amount || 0,
        },
        revenueByPlan,
      },
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Get all invoices (Super Admin)
export const getAllInvoices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, tenantId } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (tenantId) where.tenantId = tenantId;

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        subscription: {
          include: {
            tenant: {
              select: { name: true, subdomain: true },
            },
            plan: {
              select: { displayName: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: invoices,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Get all payments (Super Admin)
export const getAllPayments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, tenantId } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (tenantId) where.tenantId = tenantId;

    const payments = await prisma.payment.findMany({
      where,
      include: {
        subscription: {
          include: {
            tenant: {
              select: { name: true, subdomain: true },
            },
          },
        },
        invoice: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: payments,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Mark invoice as paid (Manual)
export const markInvoicePaid = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { invoiceId } = req.params;
    const { paymentMethod, transactionId, notes } = req.body;

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
      return;
    }

    // Update invoice
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: "PAID",
        paidAt: new Date(),
        notes,
      },
    });

    // Create payment record
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

    res.json({
      success: true,
      message: "Invoice marked as paid",
      data: updatedInvoice,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Cancel subscription
export const cancelSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { subscriptionId } = req.params;
    const { cancelAtPeriodEnd } = req.body;

    const subscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: cancelAtPeriodEnd ? "ACTIVE" : "CANCELLED",
        cancelAtPeriodEnd: cancelAtPeriodEnd || false,
      },
    });

    res.json({
      success: true,
      message: "Subscription cancelled",
      data: subscription,
    });
    return;
  } catch (error) {
    next(error);
  }
};

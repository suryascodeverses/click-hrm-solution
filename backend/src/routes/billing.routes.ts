import { Router } from "express";
import { authenticateSuperAdmin } from "../middlewares/superAdminAuth.middleware";
import {
  getSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  getAllSubscriptions,
  getSubscriptionStats,
  getAllInvoices,
  getAllPayments,
  markInvoicePaid,
  cancelSubscription,
} from "../controllers/billing.controller";

const router: Router = Router();

// Subscription Plans
router.get("/plans", authenticateSuperAdmin, getSubscriptionPlans);
router.post("/plans", authenticateSuperAdmin, createSubscriptionPlan);
router.put("/plans/:planId", authenticateSuperAdmin, updateSubscriptionPlan);

// Subscriptions
router.get("/subscriptions", authenticateSuperAdmin, getAllSubscriptions);
router.get(
  "/subscriptions/stats",
  authenticateSuperAdmin,
  getSubscriptionStats
);
router.post(
  "/subscriptions/:subscriptionId/cancel",
  authenticateSuperAdmin,
  cancelSubscription
);

// Invoices
router.get("/invoices", authenticateSuperAdmin, getAllInvoices);
router.post(
  "/invoices/:invoiceId/mark-paid",
  authenticateSuperAdmin,
  markInvoicePaid
);

// Payments
router.get("/payments", authenticateSuperAdmin, getAllPayments);

export default router;

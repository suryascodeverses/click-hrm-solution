import { Router } from "express";
import { authenticateSuperAdmin } from "../middlewares/superAdminAuth.middleware";
import {
  getSystemHealth,
  getMetricsHistory,
  getDatabaseStats,
  getApiUsageStats,
  getSystemAlerts,
  createSystemAlert,
  resolveAlert,
  getErrorRate,
} from "../controllers/monitoring.controller";

const router: Router = Router();

// System Health
router.get("/health", authenticateSuperAdmin, getSystemHealth);
router.get("/metrics", authenticateSuperAdmin, getMetricsHistory);
router.get("/database", authenticateSuperAdmin, getDatabaseStats);
router.get("/api-usage", authenticateSuperAdmin, getApiUsageStats);
router.get("/error-rate", authenticateSuperAdmin, getErrorRate);

// Alerts
router.get("/alerts", authenticateSuperAdmin, getSystemAlerts);
router.post("/alerts", authenticateSuperAdmin, createSystemAlert);
router.post("/alerts/:alertId/resolve", authenticateSuperAdmin, resolveAlert);

export default router;

import { Router } from "express";
import {
  getAuditLogs,
  getAuditLogStats,
  getUniqueFilters,
} from "../controllers/auditLogs.controller";
import { authenticateSuperAdmin } from "../middlewares/superAdminAuth.middleware";

const router: Router = Router();

// All routes require super admin authentication
router.get("/", authenticateSuperAdmin, getAuditLogs);
router.get("/stats", authenticateSuperAdmin, getAuditLogStats);
router.get("/filters", authenticateSuperAdmin, getUniqueFilters);

export default router;


auditLogs.routes.ts
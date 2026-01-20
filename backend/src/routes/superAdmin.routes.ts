import { Router } from "express";

import { authenticateSuperAdmin } from "../middlewares/superAdminAuth.middleware";
import { getAllTenants, getDashboardStats, updateTenantStatus } from "../controllers/superAdmin.controller";

const router = Router();

router.get("/dashboard", authenticateSuperAdmin, getDashboardStats);
router.get("/tenants", authenticateSuperAdmin, getAllTenants);
router.put(
  "/tenants/:tenantId/status",
  authenticateSuperAdmin,
  updateTenantStatus,
);

export default router;

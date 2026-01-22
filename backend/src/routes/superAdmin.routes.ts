import { Router } from "express";
import {
  getDashboardStats,
  getAllTenants,
  updateTenantStatus,
  updateTenant,
  deleteTenant,
} from "../controllers/superAdmin.controller";
import { authenticateSuperAdmin } from "../middlewares/superAdminAuth.middleware";

const router: Router = Router();

router.get("/dashboard", authenticateSuperAdmin, getDashboardStats);
router.get("/tenants", authenticateSuperAdmin, getAllTenants);
router.put(
  "/tenants/:tenantId/status",
  authenticateSuperAdmin,
  updateTenantStatus,
);
router.put("/tenants/:tenantId", authenticateSuperAdmin, updateTenant);
router.delete("/tenants/:tenantId", authenticateSuperAdmin, deleteTenant);

export default router;

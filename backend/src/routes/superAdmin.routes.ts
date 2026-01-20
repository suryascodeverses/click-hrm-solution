import { Router } from "express";
import {
  getDashboardStats,
  getAllTenants,
  updateTenantStatus,
} from "../controllers/superAdmin.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "@prisma/client";

const router = Router();

router.get(
  "/dashboard",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  getDashboardStats,
);
router.get(
  "/tenants",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  getAllTenants,
);
router.put(
  "/tenants/:tenantId/status",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  updateTenantStatus,
);

export default router;

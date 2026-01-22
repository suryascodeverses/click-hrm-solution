import { Router } from "express";
import {
  getDashboardStats,
  getAllTenants,
  updateTenantStatus,
  updateTenant,
  deleteTenant,
  getAllUsers,
  updateUser,
  deleteUser,
} from "../controllers/superAdmin.controller";
import { authenticateSuperAdmin } from "../middlewares/superAdminAuth.middleware";

const router: Router = Router();

// Dashboard
router.get("/dashboard", authenticateSuperAdmin, getDashboardStats);

// Tenants
router.get("/tenants", authenticateSuperAdmin, getAllTenants);
router.put(
  "/tenants/:tenantId/status",
  authenticateSuperAdmin,
  updateTenantStatus,
);
router.put("/tenants/:tenantId", authenticateSuperAdmin, updateTenant);
router.delete("/tenants/:tenantId", authenticateSuperAdmin, deleteTenant);

// Users
router.get("/users", authenticateSuperAdmin, getAllUsers);
router.put("/users/:userId", authenticateSuperAdmin, updateUser);
router.delete("/users/:userId", authenticateSuperAdmin, deleteUser);

export default router;

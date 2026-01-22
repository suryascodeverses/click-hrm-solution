import { Router } from "express";
import {
  getAttendanceReport,
  getLeaveReport,
  getEmployeeHeadcount,
  getPayrollReport,
  getDashboardAnalytics,
} from "../controllers/reports.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "@prisma/client";

const router: Router = Router();

router.get(
  "/attendance",
  authenticate,
  authorize(UserRole.TENANT_ADMIN, UserRole.ORG_ADMIN, UserRole.HR_MANAGER),
  getAttendanceReport,
);
router.get(
  "/leave",
  authenticate,
  authorize(UserRole.TENANT_ADMIN, UserRole.ORG_ADMIN, UserRole.HR_MANAGER),
  getLeaveReport,
);
router.get(
  "/employee-headcount",
  authenticate,
  authorize(UserRole.TENANT_ADMIN, UserRole.ORG_ADMIN, UserRole.HR_MANAGER),
  getEmployeeHeadcount,
);
router.get(
  "/payroll",
  authenticate,
  authorize(UserRole.TENANT_ADMIN, UserRole.ORG_ADMIN, UserRole.HR_MANAGER),
  getPayrollReport,
);
router.get("/analytics", authenticate, getDashboardAnalytics);

export default router;

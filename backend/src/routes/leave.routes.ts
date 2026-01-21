import { Router } from "express";
import {
  applyLeave,
  approveLeave,
  rejectLeave,
  getMyLeaves,
  getMyLeaveBalance,
  getPendingLeaves,
  getLeaveTypes,
  createLeaveType,
} from "../controllers/leave.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "@prisma/client";

const router: Router = Router();

// Employee routes
router.post("/apply", authenticate, applyLeave);
router.get("/my-leaves/:employeeId", authenticate, getMyLeaves);
router.get("/my-balance/:employeeId", authenticate, getMyLeaveBalance);
router.get("/types", authenticate, getLeaveTypes);

// Manager/HR routes
router.get(
  "/pending",
  authenticate,
  authorize(
    UserRole.MANAGER,
    UserRole.HR_MANAGER,
    UserRole.ORG_ADMIN,
    UserRole.TENANT_ADMIN,
  ),
  getPendingLeaves,
);
router.put(
  "/:leaveId/approve",
  authenticate,
  authorize(
    UserRole.MANAGER,
    UserRole.HR_MANAGER,
    UserRole.ORG_ADMIN,
    UserRole.TENANT_ADMIN,
  ),
  approveLeave,
);
router.put(
  "/:leaveId/reject",
  authenticate,
  authorize(
    UserRole.MANAGER,
    UserRole.HR_MANAGER,
    UserRole.ORG_ADMIN,
    UserRole.TENANT_ADMIN,
  ),
  rejectLeave,
);

// Admin routes
router.post(
  "/types",
  authenticate,
  authorize(UserRole.TENANT_ADMIN, UserRole.ORG_ADMIN, UserRole.HR_MANAGER),
  createLeaveType,
);

export default router;

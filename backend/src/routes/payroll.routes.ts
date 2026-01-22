import { Router } from "express";
import {
  createSalaryStructure,
  getSalaryStructure,
  generatePayslips,
  getPayslips,
  getPayslip,
  getAllPayslips,
  updatePayslipStatus,
} from "../controllers/payroll.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "@prisma/client";

const router: Router = Router();

// Salary Structure
router.post(
  "/salary-structure",
  authenticate,
  authorize(UserRole.TENANT_ADMIN, UserRole.ORG_ADMIN, UserRole.HR_MANAGER),
  createSalaryStructure,
);
router.get("/salary-structure/:employeeId", authenticate, getSalaryStructure);

// Payslip Generation
router.post(
  "/generate/:month/:year",
  authenticate,
  authorize(UserRole.TENANT_ADMIN, UserRole.ORG_ADMIN, UserRole.HR_MANAGER),
  generatePayslips,
);

// Payslips
router.get(
  "/payslips",
  authenticate,
  authorize(UserRole.TENANT_ADMIN, UserRole.ORG_ADMIN, UserRole.HR_MANAGER),
  getAllPayslips,
);
router.get("/payslips/:employeeId", authenticate, getPayslips);
router.get("/payslip/:payslipId", authenticate, getPayslip);
router.put(
  "/payslip/:payslipId/status",
  authenticate,
  authorize(UserRole.TENANT_ADMIN, UserRole.ORG_ADMIN, UserRole.HR_MANAGER),
  updatePayslipStatus,
);

export default router;

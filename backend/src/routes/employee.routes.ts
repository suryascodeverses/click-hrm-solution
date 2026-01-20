import { Router } from "express";
import {
  createEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employee.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "@prisma/client";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize(UserRole.TENANT_ADMIN, UserRole.ORG_ADMIN, UserRole.HR_MANAGER),
  createEmployee,
);
router.get("/", authenticate, getEmployees);
router.get("/:id", authenticate, getEmployee);
router.put(
  "/:id",
  authenticate,
  authorize(UserRole.TENANT_ADMIN, UserRole.ORG_ADMIN, UserRole.HR_MANAGER),
  updateEmployee,
);
router.delete(
  "/:id",
  authenticate,
  authorize(UserRole.TENANT_ADMIN, UserRole.ORG_ADMIN),
  deleteEmployee,
);

export default router;

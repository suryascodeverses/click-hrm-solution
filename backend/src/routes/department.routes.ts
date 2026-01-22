import { Router } from "express";
import {
  createDepartment,
  getDepartments,
  getDepartment,
  updateDepartment,
  deleteDepartment,
} from "../controllers/department.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "@prisma/client";

const router: Router = Router();

router.post(
  "/",
  authenticate,
  authorize(UserRole.TENANT_ADMIN, UserRole.ORG_ADMIN),
  createDepartment,
);
router.get("/", authenticate, getDepartments);
router.get("/:id", authenticate, getDepartment);
router.put(
  "/:id",
  authenticate,
  authorize(UserRole.TENANT_ADMIN, UserRole.ORG_ADMIN),
  updateDepartment,
);
router.delete(
  "/:id",
  authenticate,
  authorize(UserRole.TENANT_ADMIN, UserRole.ORG_ADMIN),
  deleteDepartment,
);

export default router;

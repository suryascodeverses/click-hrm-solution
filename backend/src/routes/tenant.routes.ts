import { Router } from "express";
import { getTenant, updateTenant } from "../controllers/tenant.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "@prisma/client";

const router: Router = Router();

router.get("/", authenticate, getTenant);
router.put(
  "/",
  authenticate,
  authorize(UserRole.TENANT_ADMIN, UserRole.ORG_ADMIN),
  updateTenant,
);

export default router;

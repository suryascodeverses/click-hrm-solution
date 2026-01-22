import { Router } from "express";
import {
  createDesignation,
  getDesignations,
} from "../controllers/designation.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "@prisma/client";

const router: Router = Router();

router.post(
  "/",
  authenticate,
  authorize(UserRole.TENANT_ADMIN, UserRole.ORG_ADMIN),
  createDesignation,
);
router.get("/", authenticate, getDesignations);

export default router;

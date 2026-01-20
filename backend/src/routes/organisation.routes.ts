import { Router } from "express";
import {
  createOrganisation,
  getOrganisations,
  getOrganisation,
  updateOrganisation,
  deleteOrganisation,
} from "../controllers/organisation.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "@prisma/client";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize(UserRole.TENANT_ADMIN),
  createOrganisation,
);
router.get("/", authenticate, getOrganisations);
router.get("/:id", authenticate, getOrganisation);
router.put(
  "/:id",
  authenticate,
  authorize(UserRole.TENANT_ADMIN, UserRole.ORG_ADMIN),
  updateOrganisation,
);
router.delete(
  "/:id",
  authenticate,
  authorize(UserRole.TENANT_ADMIN),
  deleteOrganisation,
);

export default router;

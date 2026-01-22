import { Router } from "express";

import { authenticateSuperAdmin } from "../middlewares/superAdminAuth.middleware";
import {
  createSuperAdmin,
  superAdminGetMe,
  superAdminLogin,
  superAdminLogout,
  superAdminRefreshToken,
} from "../controllers/superAdminAuth.controller";

const router: Router = Router();

// Public routes
router.post("/login", superAdminLogin);
router.post("/refresh", superAdminRefreshToken);
router.post("/create", createSuperAdmin); // Protected by master key

// Protected routes
router.get("/me", authenticateSuperAdmin, superAdminGetMe);
router.post("/logout", authenticateSuperAdmin, superAdminLogout);

export default router;

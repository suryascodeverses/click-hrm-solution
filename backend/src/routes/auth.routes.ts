import { Router } from "express";
import { register, login, getMe, logout } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router: Router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, getMe);
router.post("/logout", authenticate, logout);

export default router;

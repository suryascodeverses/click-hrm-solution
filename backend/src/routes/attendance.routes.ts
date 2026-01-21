import { Router } from "express";
import {
  checkIn,
  checkOut,
  getMyAttendance,
  getTodayAttendance,
  getTeamAttendance,
} from "../controllers/attendance.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router: Router = Router();

router.post("/check-in", authenticate, checkIn);
router.post("/check-out", authenticate, checkOut);
router.get("/my-attendance", authenticate, getMyAttendance);
router.get("/today/:employeeId", authenticate, getTodayAttendance);
router.get("/team", authenticate, getTeamAttendance);

export default router;

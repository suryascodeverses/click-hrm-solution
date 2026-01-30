import { z } from "zod";

/**
 * ========================================
 * ATTENDANCE - BACKEND VALIDATION
 * ========================================
 * Location: backend/src/modules/attendance/attendance.types.ts
 */

export const CheckInValidationSchema = z.object({
  employeeId: z.string().uuid(),
});

export const CheckOutValidationSchema = z.object({
  employeeId: z.string().uuid(),
});

import { z } from "zod";

/**
 * ========================================
 * LEAVE - BACKEND VALIDATION
 * ========================================
 * Location: backend/src/modules/leave/leave.types.ts
 */

export const ApplyLeaveValidationSchema = z.object({
  employeeId: z.string().uuid(),
  leaveTypeId: z.string().uuid(),
  startDate: z.string(),
  endDate: z.string(),
  days: z.number().int().min(1),
  reason: z.string().min(10, "Reason must be at least 10 characters").max(500),
});

export const RejectLeaveValidationSchema = z.object({
  rejectedReason: z
    .string()
    .min(10, "Reason must be at least 10 characters")
    .max(500),
});

export const CreateLeaveTypeValidationSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().min(1).max(20),
  defaultDays: z.number().int().min(1),
  carryForward: z.boolean(),
  maxCarryForward: z.number().int().min(0).optional(),
  color: z.string().optional(),
  description: z.string().max(500).optional(),
});

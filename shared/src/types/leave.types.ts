/**
 * ========================================
 * LEAVE - ZOD SCHEMAS & TYPES
 * ========================================
 * Location: shared/src/types/leave.types.ts
 */

import { z } from "zod";

// ============================================
// BASE SCHEMAS (Building Blocks)
// ============================================

/**
 * Base leave fields - minimal common fields
 */
const LeaveBaseSchema = z.object({
  employeeId: z.string(),
  leaveTypeId: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  days: z.number(),
  reason: z.string(),
  status: z.string(),
});

/**
 * Base leave type fields - minimal common fields
 */
const LeaveTypeBaseSchema = z.object({
  name: z.string(),
  code: z.string(),
  defaultDays: z.number(),
  carryForward: z.boolean(),
});

/**
 * Leave type reference nested object
 */
const LeaveTypeReferenceSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  color: z.string().nullable(),
});

/**
 * Employee reference nested object
 */
const EmployeeReferenceSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  employeeCode: z.string(),
  department: z.any().optional(),
});

/**
 * Approver reference nested object
 */
const ApproverReferenceSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
});

// ============================================
// REQUEST SCHEMAS & TYPES
// ============================================

/**
 * Apply leave request schema
 */
export const ApplyLeaveRequestSchema = z.object({
  employeeId: z.string(),
  leaveTypeId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  days: z.number(),
  reason: z.string(),
});
export type ApplyLeaveRequestDto = z.infer<typeof ApplyLeaveRequestSchema>;

/**
 * Reject leave request schema
 */
export const RejectLeaveRequestSchema = z.object({
  rejectedReason: z.string(),
});
export type RejectLeaveRequestDto = z.infer<typeof RejectLeaveRequestSchema>;

/**
 * Create leave type request schema
 */
export const CreateLeaveTypeRequestSchema = LeaveTypeBaseSchema.extend({
  maxCarryForward: z.number().optional(),
  color: z.string().optional(),
  description: z.string().optional(),
});
export type CreateLeaveTypeRequestDto = z.infer<
  typeof CreateLeaveTypeRequestSchema
>;

// ============================================
// RESPONSE SCHEMAS & TYPES
// ============================================

/**
 * Leave DTO - extends base with response fields
 */
export const LeaveDtoSchema = LeaveBaseSchema.extend({
  id: z.string(),
  approvedBy: z.string().nullable(),
  approvedAt: z.date().nullable(),
  rejectedReason: z.string().nullable(),
  appliedAt: z.date(),
});
export type LeaveDto = z.infer<typeof LeaveDtoSchema>;

/**
 * Leave detail DTO - extends leave with nested objects
 */
export const LeaveDetailDtoSchema = LeaveDtoSchema.extend({
  leaveType: LeaveTypeReferenceSchema,
  employee: EmployeeReferenceSchema,
  approver: ApproverReferenceSchema.nullable(),
});
export type LeaveDetailDto = z.infer<typeof LeaveDetailDtoSchema>;

/**
 * Leave balance DTO
 */
export const LeaveBalanceDtoSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  leaveTypeId: z.string(),
  year: z.number(),
  totalDays: z.number(),
  usedDays: z.number(),
  pendingDays: z.number(),
  availableDays: z.number(),
  leaveType: LeaveTypeReferenceSchema,
});
export type LeaveBalanceDto = z.infer<typeof LeaveBalanceDtoSchema>;

/**
 * Leave type DTO - extends base with response fields
 */
export const LeaveTypeDtoSchema = LeaveTypeBaseSchema.extend({
  id: z.string(),
  maxCarryForward: z.number().nullable(),
  color: z.string().nullable(),
  description: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
});
export type LeaveTypeDto = z.infer<typeof LeaveTypeDtoSchema>;

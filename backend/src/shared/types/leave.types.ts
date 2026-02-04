/**
 * ========================================
 * LEAVE MODULE - TYPES & DTOs
 * ========================================
 * Location: shared/types/leave.types.ts
 */

import { z } from "zod";

// ============================================
// ENUMS
// ============================================

export enum LeaveStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

// ============================================
// VALIDATION SCHEMAS
// ============================================

export const ApplyLeaveValidationSchema = z.object({
  employeeId: z.string().uuid(),
  leaveTypeId: z.string().uuid(),
  startDate: z.string(),
  endDate: z.string(),
  days: z.number().min(0.5),
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

export const UpdateLeaveTypeValidationSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  code: z.string().min(1).max(20).optional(),
  defaultDays: z.number().int().min(1).optional(),
  carryForward: z.boolean().optional(),
  maxCarryForward: z.number().int().min(0).optional(),
  requiresApproval: z.boolean().optional(),
  color: z.string().optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
});

// ============================================
// INPUT DTOs
// ============================================

export interface ApplyLeaveInput {
  employeeId: string;
  leaveTypeId: string;
  startDate: Date | string;
  endDate: Date | string;
  days: number;
  reason: string;
}

export interface ApproveLeaveInput {
  approvedBy: string;
}

export interface RejectLeaveInput {
  approvedBy: string;
  rejectedReason: string;
}

export interface CancelLeaveInput {
  cancellationReason?: string;
}

export interface CreateLeaveTypeInput {
  name: string;
  code: string;
  defaultDays: number;
  carryForward: boolean;
  maxCarryForward?: number;
  requiresApproval?: boolean;
  color?: string;
  description?: string;
}

export interface UpdateLeaveTypeInput {
  name?: string;
  code?: string;
  defaultDays?: number;
  carryForward?: boolean;
  maxCarryForward?: number;
  requiresApproval?: boolean;
  color?: string;
  description?: string;
  isActive?: boolean;
}

export interface AllocateLeaveBalanceInput {
  employeeId: string;
  leaveTypeId: string;
  year: number;
  totalDays: number;
}

// ============================================
// ENTITY DTOs
// ============================================

export interface LeaveDto {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  days: number;
  reason: string;
  status: LeaveStatus;
  appliedAt: Date;
  approvedBy: string | null;
  approvedAt: Date | null;
  rejectedReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveTypeDto {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  defaultDays: number;
  carryForward: boolean;
  maxCarryForward: number | null;
  requiresApproval: boolean;
  color: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveBalanceDto {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  year: number;
  totalDays: number;
  usedDays: number;
  pendingDays: number;
  availableDays: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// POPULATED DTOs
// ============================================

export interface LeaveWithEmployeeDto extends LeaveDto {
  employee: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
    departmentId: string | null;
    designationId: string | null;
  };
}

export interface LeaveWithLeaveTypeDto extends LeaveDto {
  leaveType: {
    id: string;
    name: string;
    code: string;
    color: string | null;
  };
}

export interface LeaveWithApproverDto extends LeaveDto {
  approver: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export interface LeaveWithFullDetailsDto extends LeaveDto {
  employee: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
    department: {
      id: string;
      name: string;
    } | null;
    designation: {
      id: string;
      name: string;
    } | null;
    manager: {
      id: string;
      firstName: string;
      lastName: string;
    } | null;
  };
  leaveType: {
    id: string;
    name: string;
    code: string;
    color: string | null;
  };
  approver: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
  } | null;
}

export interface LeaveBalanceWithLeaveTypeDto extends LeaveBalanceDto {
  leaveType: {
    id: string;
    name: string;
    code: string;
    color: string | null;
  };
}

export interface LeaveBalanceWithEmployeeDto extends LeaveBalanceDto {
  employee: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// ============================================
// QUERY/FILTER DTOs
// ============================================

export interface LeaveQueryParams {
  employeeId?: string;
  departmentId?: string;
  leaveTypeId?: string;
  status?: LeaveStatus;
  startDate?: Date | string;
  endDate?: Date | string;
  year?: number;
  month?: number;
  page?: number;
  limit?: number;
  sortBy?: "appliedAt" | "startDate" | "endDate" | "status";
  sortOrder?: "asc" | "desc";
}

export interface LeaveBalanceQueryParams {
  employeeId?: string;
  leaveTypeId?: string;
  year?: number;
  departmentId?: string;
}

// ============================================
// RESPONSE DTOs
// ============================================

export interface LeaveListResponseDto {
  leaves: LeaveWithFullDetailsDto[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface LeaveBalanceResponseDto {
  balances: LeaveBalanceWithLeaveTypeDto[];
  summary: {
    totalLeaves: number;
    usedLeaves: number;
    pendingLeaves: number;
    availableLeaves: number;
  };
}

export interface LeaveStatsDto {
  totalLeaves: number;
  pendingLeaves: number;
  approvedLeaves: number;
  rejectedLeaves: number;
  cancelledLeaves: number;
  byLeaveType: Record<string, number>;
  byDepartment: Record<string, number>;
  byMonth: Record<string, number>;
  averageLeaveDays: number;
}

export interface EmployeeLeaveBalanceSummaryDto {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  balances: Array<{
    leaveType: string;
    leaveTypeCode: string;
    color: string | null;
    totalDays: number;
    usedDays: number;
    pendingDays: number;
    availableDays: number;
  }>;
  totalAvailableDays: number;
  totalUsedDays: number;
}

export interface LeaveCalendarDto {
  date: Date;
  leaves: Array<{
    id: string;
    employeeId: string;
    employeeName: string;
    leaveType: string;
    leaveTypeColor: string | null;
    days: number;
    status: LeaveStatus;
  }>;
  leaveCount: number;
}

export interface ApplyLeaveResponseDto {
  leave: LeaveWithFullDetailsDto;
  remainingBalance: number;
  message: string;
}

export interface ApproveLeaveResponseDto {
  leave: LeaveWithFullDetailsDto;
  message: string;
}

export interface RejectLeaveResponseDto {
  leave: LeaveWithFullDetailsDto;
  message: string;
}

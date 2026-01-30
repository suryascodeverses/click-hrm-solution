/**
 * ========================================
 * LEAVE - REQUEST/RESPONSE DTOs
 * ========================================
 * Location: shared/src/types/leave.types.ts
 */

// ============================================
// REQUEST DTOs
// ============================================

export interface ApplyLeaveRequestDto {
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
}

export interface RejectLeaveRequestDto {
  rejectedReason: string;
}

export interface CreateLeaveTypeRequestDto {
  name: string;
  code: string;
  defaultDays: number;
  carryForward: boolean;
  maxCarryForward?: number;
  color?: string;
  description?: string;
}

// ============================================
// RESPONSE DTOs
// ============================================

export interface LeaveDto {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  days: number;
  reason: string;
  status: string;
  approvedBy: string | null;
  approvedAt: Date | null;
  rejectedReason: string | null;
  appliedAt: Date;
}

export interface LeaveDetailDto extends LeaveDto {
  leaveType: {
    id: string;
    name: string;
    code: string;
    color: string | null;
  };
  employee: {
    firstName: string;
    lastName: string;
    employeeCode: string;
    department?: any;
  };
  approver: {
    firstName: string;
    lastName: string;
  } | null;
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
  leaveType: {
    id: string;
    name: string;
    code: string;
    color: string | null;
  };
}

export interface LeaveTypeDto {
  id: string;
  name: string;
  code: string;
  defaultDays: number;
  carryForward: boolean;
  maxCarryForward: number | null;
  color: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
}

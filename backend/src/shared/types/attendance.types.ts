/**
 * ========================================
 * ATTENDANCE MODULE - TYPES & DTOs
 * ========================================
 * Location: shared/types/attendance.types.ts
 */

import { AttendanceStatus } from "@prisma/client";
import { z } from "zod";

// ============================================
// ENUMS
// ============================================

// ============================================
// VALIDATION SCHEMAS
// ============================================

export const CheckInValidationSchema = z.object({
  employeeId: z.string().uuid(),
});

export const CheckOutValidationSchema = z.object({
  employeeId: z.string().uuid(),
});

export const CreateAttendanceValidationSchema = z.object({
  employeeId: z.string().uuid(),
  date: z.string().datetime(),
  checkIn: z.string().datetime().optional(),
  checkOut: z.string().datetime().optional(),
  status: z.nativeEnum(AttendanceStatus),
  remarks: z.string().max(500).optional(),
});

export const UpdateAttendanceValidationSchema = z.object({
  checkIn: z.string().datetime().optional(),
  checkOut: z.string().datetime().optional(),
  status: z.nativeEnum(AttendanceStatus).optional(),
  remarks: z.string().max(500).optional(),
});

// ============================================
// INPUT DTOs (without id, timestamps)
// ============================================

export interface CheckInInput {
  employeeId: string;
}

export interface CheckOutInput {
  employeeId: string;
}

export interface CreateAttendanceInput {
  employeeId: string;
  date: Date | string;
  checkIn?: Date | string;
  checkOut?: Date | string;
  status: AttendanceStatus;
  remarks?: string;
}

export interface UpdateAttendanceInput {
  checkIn?: Date | string;
  checkOut?: Date | string;
  status?: AttendanceStatus;
  remarks?: string;
}

// ============================================
// ENTITY DTOs (with all fields)
// ============================================

export interface AttendanceDto {
  id: string;
  employeeId: string;
  date: Date;
  checkIn: Date | null;
  checkOut: Date | null;
  status: AttendanceStatus;
  workHours: number | null;
  lateBy: number | null;
  earlyLeave: number | null;
  remarks: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// POPULATED DTOs (with relations)
// ============================================

export interface AttendanceWithEmployeeDto extends AttendanceDto {
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

export interface AttendanceWithFullEmployeeDto extends AttendanceDto {
  employee: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    middleName: string | null;
    email: string;
    phone: string | null;
    department: {
      id: string;
      name: string;
      code: string;
    } | null;
    designation: {
      id: string;
      name: string;
      code: string;
    } | null;
  };
}

// ============================================
// QUERY/FILTER DTOs
// ============================================

export interface AttendanceQueryParams {
  employeeId?: string;
  departmentId?: string;
  status?: AttendanceStatus;
  startDate?: Date | string;
  endDate?: Date | string;
  page?: number;
  limit?: number;
  sortBy?: "date" | "status" | "workHours";
  sortOrder?: "asc" | "desc";
}

export interface AttendanceSummaryDto {
  employeeId: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  halfDays: number;
  lateDays: number;
  leaveDays: number;
  holidayDays: number;
  weekendDays: number;
  totalWorkHours: number;
  averageWorkHours: number;
  period: {
    startDate: Date;
    endDate: Date;
  };
}

// ============================================
// RESPONSE DTOs
// ============================================

export interface CheckInResponseDto {
  id: string;
  employeeId: string;
  date: Date;
  checkIn: Date;
  status: AttendanceStatus;
  message: string;
}

export interface CheckOutResponseDto {
  id: string;
  employeeId: string;
  date: Date;
  checkIn: Date;
  checkOut: Date;
  workHours: number;
  status: AttendanceStatus;
  message: string;
}

export interface AttendanceReportDto {
  employee: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    department: string;
    designation: string;
  };
  summary: AttendanceSummaryDto;
  details: AttendanceDto[];
}

export interface MyAttendanceDto {
  attendances: AttendanceDto[];
  stats: {
    present: number;
    absent: number;
    late: number;
    halfDay: number;
    totalWorkHours: number;
  };
}

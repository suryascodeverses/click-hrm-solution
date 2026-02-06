/**
 * ========================================
 * ATTENDANCE - ZOD SCHEMAS & TYPES
 * ========================================
 * Location: shared/src/types/attendance.types.ts
 */

import { z } from "zod";

// ============================================
// BASE SCHEMAS (Building Blocks)
// ============================================

/**
 * Base attendance fields - minimal common fields
 */
const AttendanceBaseSchema = z.object({
  employeeId: z.string(),
  date: z.date(),
  checkIn: z.date().nullable(),
  checkOut: z.date().nullable(),
  workHours: z.number().nullable(),
  status: z.string(),
});

/**
 * Employee reference nested object
 */
const EmployeeReferenceSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  employeeCode: z.string(),
  department: z.any(),
});

// ============================================
// REQUEST SCHEMAS & TYPES
// ============================================

/**
 * Check in request schema
 */
export const CheckInRequestSchema = z.object({
  employeeId: z.string(),
});
export type CheckInRequestDto = z.infer<typeof CheckInRequestSchema>;

/**
 * Check out request schema
 */
export const CheckOutRequestSchema = z.object({
  employeeId: z.string(),
});
export type CheckOutRequestDto = z.infer<typeof CheckOutRequestSchema>;

/**
 * Get attendance query schema
 */
export const GetAttendanceQuerySchema = z.object({
  month: z.number().optional(),
  year: z.number().optional(),
});
export type GetAttendanceQueryDto = z.infer<typeof GetAttendanceQuerySchema>;

// ============================================
// RESPONSE SCHEMAS & TYPES
// ============================================

/**
 * Attendance DTO - extends base with response fields
 */
export const AttendanceDtoSchema = AttendanceBaseSchema.extend({
  id: z.string(),
  lateBy: z.number().nullable(),
  earlyLeave: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type AttendanceDto = z.infer<typeof AttendanceDtoSchema>;

/**
 * Attendance with employee DTO - extends attendance with employee details
 */
export const AttendanceWithEmployeeDtoSchema = AttendanceDtoSchema.extend({
  employee: EmployeeReferenceSchema,
});
export type AttendanceWithEmployeeDto = z.infer<
  typeof AttendanceWithEmployeeDtoSchema
>;

/**
 * My attendance response DTO
 */
export const MyAttendanceResponseDtoSchema = z.object({
  attendances: z.array(AttendanceDtoSchema),
  stats: z.object({
    present: z.number(),
    absent: z.number(),
    late: z.number(),
    halfDay: z.number(),
    totalWorkHours: z.number(),
  }),
});
export type MyAttendanceResponseDto = z.infer<
  typeof MyAttendanceResponseDtoSchema
>;

/**
 * ========================================
 * REPORTS - ZOD SCHEMAS & TYPES
 * ========================================
 * Location: shared/src/types/reports.types.ts
 */

import { z } from "zod";

// ============================================
// BASE SCHEMAS (Building Blocks)
// ============================================

/**
 * Base employee reference for reports
 */
const EmployeeReferenceSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  employeeCode: z.string(),
  department: z.any(),
});

// ============================================
// REQUEST SCHEMAS & TYPES (Query Params)
// ============================================

/**
 * Attendance report query schema
 */
export const AttendanceReportQuerySchema = z.object({
  month: z.number(),
  year: z.number(),
  departmentId: z.string().optional(),
});
export type AttendanceReportQueryDto = z.infer<
  typeof AttendanceReportQuerySchema
>;

/**
 * Leave report query schema
 */
export const LeaveReportQuerySchema = z.object({
  year: z.number().optional(),
});
export type LeaveReportQueryDto = z.infer<typeof LeaveReportQuerySchema>;

/**
 * Payroll report query schema
 */
export const PayrollReportQuerySchema = z.object({
  month: z.number(),
  year: z.number(),
});
export type PayrollReportQueryDto = z.infer<typeof PayrollReportQuerySchema>;

// ============================================
// RESPONSE SCHEMAS & TYPES
// ============================================

/**
 * Attendance report DTO
 */
export const AttendanceReportDtoSchema = z.object({
  employee: EmployeeReferenceSchema,
  present: z.number(),
  absent: z.number(),
  late: z.number(),
  onLeave: z.number(),
  totalHours: z.number(),
});
export type AttendanceReportDto = z.infer<typeof AttendanceReportDtoSchema>;

/**
 * Leave report employee DTO
 */
export const LeaveReportEmployeeDtoSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  employeeCode: z.string(),
  department: z.any(),
  leaveBalances: z.array(
    z.object({
      id: z.string(),
      totalDays: z.number(),
      usedDays: z.number(),
      pendingDays: z.number(),
      availableDays: z.number(),
      leaveType: z.object({
        id: z.string(),
        name: z.string(),
        code: z.string(),
      }),
    }),
  ),
});
export type LeaveReportEmployeeDto = z.infer<
  typeof LeaveReportEmployeeDtoSchema
>;

/**
 * Headcount report DTO
 */
export const HeadcountReportDtoSchema = z.object({
  byDepartment: z.array(
    z.object({
      department: z.string(),
      employees: z.number(),
    }),
  ),
  byStatus: z.array(
    z.object({
      status: z.string(),
      _count: z.number(),
    }),
  ),
  byEmploymentType: z.array(
    z.object({
      employmentType: z.string(),
      _count: z.number(),
    }),
  ),
});
export type HeadcountReportDto = z.infer<typeof HeadcountReportDtoSchema>;

/**
 * Payroll report DTO
 */
export const PayrollReportDtoSchema = z.object({
  payslips: z.array(z.any()),
  totals: z.object({
    totalEarnings: z.number(),
    totalDeductions: z.number(),
    netPay: z.number(),
  }),
  byDepartment: z.array(
    z.object({
      department: z.string(),
      employees: z.number(),
      totalCost: z.number(),
    }),
  ),
});
export type PayrollReportDto = z.infer<typeof PayrollReportDtoSchema>;

/**
 * Dashboard analytics DTO
 */
export const DashboardAnalyticsDtoSchema = z.object({
  todayAttendance: z.number(),
  pendingLeaves: z.number(),
  totalEmployees: z.number(),
  attendanceTrend: z.array(
    z.object({
      date: z.string(),
      present: z.number(),
    }),
  ),
});
export type DashboardAnalyticsDto = z.infer<typeof DashboardAnalyticsDtoSchema>;

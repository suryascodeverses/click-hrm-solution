/**
 * ========================================
 * REPORTS - REQUEST/RESPONSE DTOs
 * ========================================
 * Location: shared/src/types/reports.types.ts
 */

// ============================================
// REQUEST DTOs (Query Params)
// ============================================

export interface AttendanceReportQueryDto {
  month: number;
  year: number;
  departmentId?: string;
}

export interface LeaveReportQueryDto {
  year?: number;
}

export interface PayrollReportQueryDto {
  month: number;
  year: number;
}

// ============================================
// RESPONSE DTOs
// ============================================

export interface AttendanceReportDto {
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeCode: string;
    department: any;
  };
  present: number;
  absent: number;
  late: number;
  onLeave: number;
  totalHours: number;
}

export interface LeaveReportEmployeeDto {
  id: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
  department: any;
  leaveBalances: Array<{
    id: string;
    totalDays: number;
    usedDays: number;
    pendingDays: number;
    availableDays: number;
    leaveType: {
      id: string;
      name: string;
      code: string;
    };
  }>;
}

export interface HeadcountReportDto {
  byDepartment: Array<{
    department: string;
    employees: number;
  }>;
  byStatus: Array<{
    status: string;
    _count: number;
  }>;
  byEmploymentType: Array<{
    employmentType: string;
    _count: number;
  }>;
}

export interface PayrollReportDto {
  payslips: any[];
  totals: {
    totalEarnings: number;
    totalDeductions: number;
    netPay: number;
  };
  byDepartment: Array<{
    department: string;
    employees: number;
    totalCost: number;
  }>;
}

export interface DashboardAnalyticsDto {
  todayAttendance: number;
  pendingLeaves: number;
  totalEmployees: number;
  attendanceTrend: Array<{
    date: string;
    present: number;
  }>;
}

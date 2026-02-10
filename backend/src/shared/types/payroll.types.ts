/**
 * ========================================
 * PAYROLL MODULE - TYPES & DTOs
 * ========================================
 * Location: shared/types/payroll.types.ts
 */

import { PayslipStatus } from "@prisma/client";

// ============================================
// ENUMS
// ============================================

// export enum PayslipStatus {
//   DRAFT = "DRAFT",
//   PROCESSED = "PROCESSED",
//   PAID = "PAID",
// }

// ============================================
// INPUT DTOs
// ============================================

export interface CreateSalaryStructureRequestDto {
  employeeId: string;
  basicSalary: number;
  hra: number;
  conveyance: number;
  medical: number;
  specialAllowance: number;
  effectiveFrom?: Date | string;
}

export interface UpdatePayslipStatusRequestDto {
  basicSalary?: number;
  hra?: number;
  conveyance?: number;
  medical?: number;
  specialAllowance?: number;
  effectiveFrom?: Date | string;
}

export interface CreatePayslipRequestDto {
  employeeId: string;
  salaryStructureId: string;
  month: number;
  year: number;
  workingDays: number;
  presentDays: number;
  absentDays?: number;
  leaveDays?: number;
  bonus?: number;
  providentFund?: number;
  professionalTax?: number;
  incomeTax?: number;
  otherDeductions?: number;
}

export interface GetPayslipsQueryDto {
  employeeIds?: string[];
  departmentId?: string;
  organisationId?: string;
  month: number;
  year: number;
}

export interface UpdatePayslipStatusRequestDto {
  status: PayslipStatus;
  paidOn?: Date | string;
}

export interface ProcessPayslipRequestDto {
  payslipIds: string[];
  processDate?: Date | string;
}

// ============================================
// ENTITY DTOs
// ============================================

export interface SalaryStructureDto {
  id: string;
  employeeId: string;
  basicSalary: number;
  hra: number;
  conveyance: number;
  medical: number;
  specialAllowance: number;
  ctc: number;
  effectiveFrom: Date;
  createdAt: Date;
  updatedAt: Date;
  employee?: {
    firstName: string;
    lastName: string;
    employeeCode: string;
  };
}

export interface PayslipDto {
  id: string;
  employeeId: string;
  salaryStructureId: string;
  month: number;
  year: number;
  workingDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  basicPay: number;
  hra: number;
  conveyance: number;
  medical: number;
  specialAllowance: number;
  bonus: number;
  totalEarnings: number;
  providentFund: number;
  professionalTax: number;
  incomeTax: number;
  otherDeductions: number;
  totalDeductions: number;
  netPay: number;
  status: PayslipStatus;
  paidOn: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PayslipDetailDto {
  status: string;
  id: string;
  createdAt: Date;
  hra: number;
  conveyance: number;
  medical: number;
  specialAllowance: number;
  employeeId: string;
  employee: {
    firstName: string;
    lastName: string;
    employeeCode: string;
    department?: any;
    designation?: any;
    organisation?: any;
  };
  salaryStructureId: string;
  month: number;
  year: number;
  workingDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  basicPay: number;
  bonus: number;
  totalEarnings: number;
  providentFund: number;
  professionalTax: number;
  incomeTax: number;
  otherDeductions: number;
  totalDeductions: number;
  netPay: number;
  paidOn: Date | null;
  salaryStructure: SalaryStructureDto;
}

export interface GeneratePayslipsResponseDto {
  message: string;
  count: number;
  payslips: {
    status: string;
    id: string;
    employee: {
      firstName: string;
      lastName: string;
      employeeCode: string;
      department?: any;
    };
    month: number;
    year: number;
    netPay: number;
    paidOn: Date | null;
  }[];
}

// ============================================
// POPULATED DTOs
// ============================================

export interface SalaryStructureWithEmployeeDto extends SalaryStructureDto {
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

export interface SalaryStructureWithFullDetailsDto extends SalaryStructureDto {
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
  };
  breakdown: {
    grossSalary: number;
    ctc: number;
    monthlyGross: number;
    monthlyCTC: number;
  };
}

export interface PayslipWithEmployeeDto extends PayslipDto {
  employee: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    departmentId: string | null;
    designationId: string | null;
  };
}

export interface PayslipWithSalaryStructureDto extends PayslipDto {
  salaryStructure: {
    id: string;
    basicSalary: number;
    hra: number;
    conveyance: number;
    medical: number;
    specialAllowance: number;
    ctc: number;
  };
}

export interface PayslipListItemDto {
  status: string;
  id: string;
  employee: {
    firstName: string;
    lastName: string;
    employeeCode: string;
    department?: any;
  };
  month: number;
  year: number;
  netPay: number;
  paidOn: Date | null;
}

export interface PayslipWithFullDetailsDto extends PayslipDto {
  employee: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    dateOfJoining: Date;
    department: {
      id: string;
      name: string;
    } | null;
    designation: {
      id: string;
      name: string;
    } | null;
    organisation: {
      id: string;
      name: string;
      address: string | null;
    };
  };
  salaryStructure: SalaryStructureDto;
  breakdown: {
    earnings: {
      basicPay: number;
      hra: number;
      conveyance: number;
      medical: number;
      specialAllowance: number;
      bonus: number;
      total: number;
    };
    deductions: {
      providentFund: number;
      professionalTax: number;
      incomeTax: number;
      otherDeductions: number;
      total: number;
    };
    netPay: number;
  };
}

export interface PayslipListItemDto {
  status: string;
  id: string;
  employee: {
    firstName: string;
    lastName: string;
    employeeCode: string;
    department?: any;
  };
  month: number;
  year: number;
  netPay: number;
  paidOn: Date | null;
}

// ============================================
// QUERY/FILTER DTOs
// ============================================

export interface PayslipQueryParams {
  employeeId?: string;
  departmentId?: string;
  month?: number;
  year?: number;
  status?: PayslipStatus;
  page?: number;
  limit?: number;
  sortBy?: "month" | "year" | "netPay" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface SalaryStructureQueryParams {
  employeeId?: string;
  departmentId?: string;
  organisationId?: string;
  minCTC?: number;
  maxCTC?: number;
  page?: number;
  limit?: number;
}

// ============================================
// RESPONSE DTOs
// ============================================

export interface PayslipListResponseDto {
  payslips: PayslipWithFullDetailsDto[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SalaryStructureListResponseDto {
  salaryStructures: SalaryStructureWithFullDetailsDto[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PayrollStatsDto {
  totalPayslips: number;
  draftPayslips: number;
  processedPayslips: number;
  paidPayslips: number;
  totalSalaryPaid: number;
  totalSalaryPending: number;
  averageSalary: number;
  highestSalary: number;
  lowestSalary: number;
  byDepartment: Record<
    string,
    {
      totalEmployees: number;
      totalSalary: number;
      averageSalary: number;
    }
  >;
  byMonth: Record<
    string,
    {
      totalPaid: number;
      employeeCount: number;
    }
  >;
}

export interface PayslipSummaryDto {
  month: number;
  year: number;
  totalEmployees: number;
  totalGrossPay: number;
  totalDeductions: number;
  totalNetPay: number;
  payslipsByStatus: Record<PayslipStatus, number>;
  departmentWise: Array<{
    departmentId: string;
    departmentName: string;
    employeeCount: number;
    totalNetPay: number;
  }>;
}

export interface EmployeePayrollSummaryDto {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  currentSalaryStructure: SalaryStructureDto;
  yearToDateEarnings: number;
  yearToDateDeductions: number;
  yearToDateNetPay: number;
  recentPayslips: PayslipDto[];
  averageMonthlyPay: number;
}

export interface GeneratePayslipResponseDto {
  generatedPayslips: PayslipWithEmployeeDto[];
  successCount: number;
  failureCount: number;
  errors: Array<{
    employeeId: string;
    employeeName: string;
    error: string;
  }>;
  message: string;
}

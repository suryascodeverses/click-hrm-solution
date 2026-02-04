/**
 * ========================================
 * PAYROLL MODULE - TYPES & DTOs
 * ========================================
 * Location: shared/types/payroll.types.ts
 */

import { z } from "zod";

// ============================================
// ENUMS
// ============================================

export enum PayslipStatus {
  DRAFT = "DRAFT",
  PROCESSED = "PROCESSED",
  PAID = "PAID",
}

// ============================================
// VALIDATION SCHEMAS
// ============================================

export const CreateSalaryStructureValidationSchema = z.object({
  employeeId: z.string().uuid(),
  basicSalary: z.number().min(0),
  hra: z.number().min(0),
  conveyance: z.number().min(0),
  medical: z.number().min(0),
  specialAllowance: z.number().min(0),
  effectiveFrom: z.string().optional(),
});

export const UpdateSalaryStructureValidationSchema = z.object({
  basicSalary: z.number().min(0).optional(),
  hra: z.number().min(0).optional(),
  conveyance: z.number().min(0).optional(),
  medical: z.number().min(0).optional(),
  specialAllowance: z.number().min(0).optional(),
  effectiveFrom: z.string().optional(),
});

export const CreatePayslipValidationSchema = z.object({
  employeeId: z.string().uuid(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000),
  workingDays: z.number().int().min(0),
  presentDays: z.number().int().min(0),
  bonus: z.number().min(0).optional(),
  providentFund: z.number().min(0).optional(),
  professionalTax: z.number().min(0).optional(),
  incomeTax: z.number().min(0).optional(),
  otherDeductions: z.number().min(0).optional(),
});

export const UpdatePayslipStatusValidationSchema = z.object({
  status: z.nativeEnum(PayslipStatus),
});

export const ProcessPayslipValidationSchema = z.object({
  payslipIds: z.array(z.string().uuid()),
  processDate: z.string().optional(),
});

// ============================================
// INPUT DTOs
// ============================================

export interface CreateSalaryStructureInput {
  employeeId: string;
  basicSalary: number;
  hra: number;
  conveyance: number;
  medical: number;
  specialAllowance: number;
  effectiveFrom?: Date | string;
}

export interface UpdateSalaryStructureInput {
  basicSalary?: number;
  hra?: number;
  conveyance?: number;
  medical?: number;
  specialAllowance?: number;
  effectiveFrom?: Date | string;
}

export interface CreatePayslipInput {
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

export interface GeneratePayslipInput {
  employeeIds?: string[];
  departmentId?: string;
  organisationId?: string;
  month: number;
  year: number;
}

export interface UpdatePayslipStatusInput {
  status: PayslipStatus;
  paidOn?: Date | string;
}

export interface ProcessPayslipInput {
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
  createdAt: Date;
  updatedAt: Date;
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

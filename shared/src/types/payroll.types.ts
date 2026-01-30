/**
 * ========================================
 * PAYROLL - REQUEST/RESPONSE DTOs
 * ========================================
 * Location: shared/src/types/payroll.types.ts
 */

// ============================================
// REQUEST DTOs
// ============================================

export interface CreateSalaryStructureRequestDto {
  employeeId: string;
  basicSalary: number;
  hra: number;
  conveyance: number;
  medical: number;
  specialAllowance: number;
}

export interface UpdatePayslipStatusRequestDto {
  status: string;
}

export interface GetPayslipsQueryDto {
  month?: number;
  year?: number;
}

// ============================================
// RESPONSE DTOs
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
  status: string;
  paidOn: Date | null;
  createdAt: Date;
}

export interface PayslipDetailDto extends PayslipDto {
  employee: {
    firstName: string;
    lastName: string;
    employeeCode: string;
    department: any;
    designation: any;
    organisation: any;
  };
  salaryStructure: SalaryStructureDto;
}

export interface PayslipListItemDto {
  id: string;
  month: number;
  year: number;
  netPay: number;
  status: string;
  paidOn: Date | null;
  employee: {
    firstName: string;
    lastName: string;
    employeeCode: string;
    department: any;
  };
}

export interface GeneratePayslipsResponseDto {
  message: string;
  count: number;
  payslips: PayslipListItemDto[];
}

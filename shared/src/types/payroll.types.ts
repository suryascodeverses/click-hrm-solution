/**
 * ========================================
 * PAYROLL - ZOD SCHEMAS & TYPES
 * ========================================
 * Location: shared/src/types/payroll.types.ts
 */

import { z } from "zod";

// ============================================
// BASE SCHEMAS (Building Blocks)
// ============================================

/**
 * Base salary structure fields - minimal common fields
 */
const SalaryStructureBaseSchema = z.object({
  basicSalary: z.number(),
  hra: z.number(),
  conveyance: z.number(),
  medical: z.number(),
  specialAllowance: z.number(),
});

/**
 * Base payslip fields - minimal common fields
 */
const PayslipBaseSchema = z.object({
  employeeId: z.string(),
  salaryStructureId: z.string(),
  month: z.number(),
  year: z.number(),
  status: z.string(),
});

/**
 * Employee reference nested object
 */
const EmployeeReferenceSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  employeeCode: z.string(),
});

/**
 * Employee detail reference nested object
 */
const EmployeeDetailReferenceSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  employeeCode: z.string(),
  department: z.any(),
  designation: z.any(),
  organisation: z.any(),
});

// ============================================
// REQUEST SCHEMAS & TYPES
// ============================================

/**
 * Create salary structure request schema
 */
export const CreateSalaryStructureRequestSchema =
  SalaryStructureBaseSchema.extend({
    employeeId: z.string(),
  });
export type CreateSalaryStructureRequestDto = z.infer<
  typeof CreateSalaryStructureRequestSchema
>;

/**
 * Update payslip status request schema
 */
export const UpdatePayslipStatusRequestSchema = z.object({
  status: z.string(),
});
export type UpdatePayslipStatusRequestDto = z.infer<
  typeof UpdatePayslipStatusRequestSchema
>;

/**
 * Get payslips query schema
 */
export const GetPayslipsQuerySchema = z.object({
  month: z.number().optional(),
  year: z.number().optional(),
});
export type GetPayslipsQueryDto = z.infer<typeof GetPayslipsQuerySchema>;

// ============================================
// RESPONSE SCHEMAS & TYPES
// ============================================

/**
 * Salary structure DTO - extends base with response fields
 */
export const SalaryStructureDtoSchema = SalaryStructureBaseSchema.extend({
  id: z.string(),
  employeeId: z.string(),
  ctc: z.number(),
  effectiveFrom: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
  employee: EmployeeReferenceSchema.optional(),
});
export type SalaryStructureDto = z.infer<typeof SalaryStructureDtoSchema>;

/**
 * Payslip DTO - extends base with response fields
 */
export const PayslipDtoSchema = PayslipBaseSchema.extend({
  id: z.string(),
  workingDays: z.number(),
  presentDays: z.number(),
  absentDays: z.number(),
  leaveDays: z.number(),
  basicPay: z.number(),
  hra: z.number(),
  conveyance: z.number(),
  medical: z.number(),
  specialAllowance: z.number(),
  bonus: z.number(),
  totalEarnings: z.number(),
  providentFund: z.number(),
  professionalTax: z.number(),
  incomeTax: z.number(),
  otherDeductions: z.number(),
  totalDeductions: z.number(),
  netPay: z.number(),
  paidOn: z.date().nullable(),
  createdAt: z.date(),
});
export type PayslipDto = z.infer<typeof PayslipDtoSchema>;

/**
 * Payslip detail DTO - extends payslip with nested objects
 */
export const PayslipDetailDtoSchema = PayslipDtoSchema.extend({
  employee: EmployeeDetailReferenceSchema,
  salaryStructure: SalaryStructureDtoSchema,
});
export type PayslipDetailDto = z.infer<typeof PayslipDetailDtoSchema>;

/**
 * Payslip list item DTO
 */
export const PayslipListItemDtoSchema = z.object({
  id: z.string(),
  month: z.number(),
  year: z.number(),
  netPay: z.number(),
  status: z.string(),
  paidOn: z.date().nullable(),
  employee: z.object({
    firstName: z.string(),
    lastName: z.string(),
    employeeCode: z.string(),
    department: z.any(),
  }),
});
export type PayslipListItemDto = z.infer<typeof PayslipListItemDtoSchema>;

/**
 * Generate payslips response DTO
 */
export const GeneratePayslipsResponseDtoSchema = z.object({
  message: z.string(),
  count: z.number(),
  payslips: z.array(PayslipListItemDtoSchema),
});
export type GeneratePayslipsResponseDto = z.infer<
  typeof GeneratePayslipsResponseDtoSchema
>;

import { z } from "zod";

/**
 * ========================================
 * PAYROLL - BACKEND VALIDATION
 * ========================================
 * Location: backend/src/modules/payroll/payroll.types.ts
 */

export const CreateSalaryStructureValidationSchema = z.object({
  employeeId: z.string().uuid(),
  basicSalary: z.number().min(0),
  hra: z.number().min(0),
  conveyance: z.number().min(0),
  medical: z.number().min(0),
  specialAllowance: z.number().min(0),
});

export const UpdatePayslipStatusValidationSchema = z.object({
  status: z.enum(["DRAFT", "APPROVED", "PAID"]),
});

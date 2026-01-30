import { z } from "zod";

/**
 * ========================================
 * EMPLOYEE - BACKEND VALIDATION
 * ========================================
 * Location: backend/src/modules/employee/employee.types.ts
 */

export const CreateEmployeeValidationSchema = z.object({
  organisationId: z.string().uuid(),
  employeeCode: z.string().min(1).max(50),
  firstName: z.string().min(2).max(100).trim(),
  lastName: z.string().min(2).max(100).trim(),
  email: z.string().email(),
  phone: z.string().max(20).optional(),
  dateOfJoining: z.string(),
  departmentId: z.string().uuid().optional(),
  designationId: z.string().uuid().optional(),
  password: z.string().min(8).optional(),
});

export const UpdateEmployeeValidationSchema = z.object({
  firstName: z.string().min(2).max(100).trim().optional(),
  lastName: z.string().min(2).max(100).trim().optional(),
  phone: z.string().max(20).optional(),
  departmentId: z.string().uuid().optional(),
  designationId: z.string().uuid().optional(),
  managerId: z.string().uuid().optional(),
  status: z
    .enum(["ACTIVE", "INACTIVE", "ON_LEAVE", "TERMINATED", "RESIGNED"])
    .optional(),
  employmentType: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
});

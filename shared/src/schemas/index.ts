import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
});

export const createEmployeeSchema = z.object({
  organisationId: z.string().uuid(),
  employeeCode: z.string().min(1, "Employee code is required"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  dateOfJoining: z.string(),
  departmentId: z.string().uuid().optional(),
  designationId: z.string().uuid().optional(),
  password: z.string().min(8).optional(),
});

export const createOrganisationSchema = z.object({
  name: z.string().min(2, "Organisation name must be at least 2 characters"),
  code: z.string().min(1, "Organisation code is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zipCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

export const createDepartmentSchema = z.object({
  organisationId: z.string().uuid(),
  name: z.string().min(2, "Department name must be at least 2 characters"),
  code: z.string().min(1, "Department code is required"),
  description: z.string().optional(),
  headOfDepartment: z.string().uuid().optional(),
});

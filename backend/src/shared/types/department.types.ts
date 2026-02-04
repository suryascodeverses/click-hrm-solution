/**
 * ========================================
 * DEPARTMENT MODULE - TYPES & DTOs
 * ========================================
 * Location: shared/types/department.types.ts
 */

import { z } from "zod";

// ============================================
// ENUMS
// ============================================

export enum DeptStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

// ============================================
// VALIDATION SCHEMAS
// ============================================

export const CreateDepartmentValidationSchema = z.object({
  organisationId: z.string().uuid("Invalid organisation ID"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100).trim(),
  code: z.string().min(1, "Code is required").max(20).trim(),
  description: z.string().max(500).optional(),
  headOfDepartment: z.string().uuid().optional(),
});

export const UpdateDepartmentValidationSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  code: z.string().min(1).max(20).trim().optional(),
  description: z.string().max(500).optional(),
  headOfDepartment: z.string().uuid().optional(),
  status: z.nativeEnum(DeptStatus).optional(),
});

// ============================================
// INPUT DTOs
// ============================================

export interface CreateDepartmentInput {
  organisationId: string;
  name: string;
  code: string;
  description?: string;
  headOfDepartment?: string;
}

export interface UpdateDepartmentInput {
  name?: string;
  code?: string;
  description?: string;
  headOfDepartment?: string;
  status?: DeptStatus;
}

// ============================================
// ENTITY DTOs
// ============================================

export interface DepartmentDto {
  id: string;
  organisationId: string;
  name: string;
  code: string;
  description: string | null;
  headOfDepartment: string | null;
  status: DeptStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// POPULATED DTOs
// ============================================

export interface DepartmentWithOrganisationDto extends DepartmentDto {
  organisation: {
    id: string;
    name: string;
    code: string;
    tenantId: string;
  };
}

export interface DepartmentWithHeadDto extends DepartmentDto {
  head: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  } | null;
}

export interface DepartmentWithEmployeesDto extends DepartmentDto {
  employees: Array<{
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
    designationId: string | null;
    status: string;
  }>;
  employeeCount: number;
}

export interface DepartmentWithDesignationsDto extends DepartmentDto {
  designations: Array<{
    id: string;
    name: string;
    code: string;
    level: number;
    status: string;
  }>;
  designationCount: number;
}

export interface DepartmentWithFullDetailsDto extends DepartmentDto {
  organisation: {
    id: string;
    name: string;
    code: string;
  };
  head: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  employees: Array<{
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    designation: {
      id: string;
      name: string;
    } | null;
  }>;
  designations: Array<{
    id: string;
    name: string;
    code: string;
    level: number;
  }>;
  stats: {
    totalEmployees: number;
    activeEmployees: number;
    designationsCount: number;
  };
}

// ============================================
// QUERY/FILTER DTOs
// ============================================

export interface DepartmentQueryParams {
  organisationId?: string;
  status?: DeptStatus;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "name" | "code" | "createdAt";
  sortOrder?: "asc" | "desc";
}

// ============================================
// RESPONSE DTOs
// ============================================

export interface DepartmentListResponseDto {
  departments: DepartmentWithFullDetailsDto[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DepartmentStatsDto {
  id: string;
  name: string;
  code: string;
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  designationsCount: number;
  averageEmployeesPerDesignation: number;
}

export interface DepartmentHierarchyDto {
  id: string;
  name: string;
  code: string;
  head: {
    id: string;
    name: string;
    employeeCode: string;
  } | null;
  designations: Array<{
    id: string;
    name: string;
    level: number;
    employeeCount: number;
  }>;
}

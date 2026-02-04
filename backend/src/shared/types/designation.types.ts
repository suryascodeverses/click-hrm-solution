/**
 * ========================================
 * DESIGNATION MODULE - TYPES & DTOs
 * ========================================
 * Location: shared/types/designation.types.ts
 */

import { z } from "zod";

// ============================================
// ENUMS
// ============================================

export enum DesignationStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

// ============================================
// VALIDATION SCHEMAS
// ============================================

export const CreateDesignationValidationSchema = z.object({
  departmentId: z.string().uuid("Invalid department ID"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100).trim(),
  code: z.string().min(1, "Code is required").max(20).trim(),
  level: z.number().int().min(1, "Level must be at least 1"),
  description: z.string().max(500).optional(),
});

export const UpdateDesignationValidationSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  code: z.string().min(1).max(20).trim().optional(),
  level: z.number().int().min(1).optional(),
  description: z.string().max(500).optional(),
  status: z.nativeEnum(DesignationStatus).optional(),
});

// ============================================
// INPUT DTOs
// ============================================

export interface CreateDesignationInput {
  departmentId: string;
  name: string;
  code: string;
  level: number;
  description?: string;
}

export interface UpdateDesignationInput {
  name?: string;
  code?: string;
  level?: number;
  description?: string;
  status?: DesignationStatus;
}

// ============================================
// ENTITY DTOs
// ============================================

export interface DesignationDto {
  id: string;
  departmentId: string;
  name: string;
  code: string;
  level: number;
  description: string | null;
  status: DesignationStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// POPULATED DTOs
// ============================================

export interface DesignationWithDepartmentDto extends DesignationDto {
  department: {
    id: string;
    name: string;
    code: string;
    organisationId: string;
  };
}

export interface DesignationWithEmployeesDto extends DesignationDto {
  employees: Array<{
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
    status: string;
  }>;
  employeeCount: number;
}

export interface DesignationWithFullDetailsDto extends DesignationDto {
  department: {
    id: string;
    name: string;
    code: string;
    organisation: {
      id: string;
      name: string;
      code: string;
    };
  };
  employees: Array<{
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
    status: string;
  }>;
  stats: {
    totalEmployees: number;
    activeEmployees: number;
  };
}

// ============================================
// QUERY/FILTER DTOs
// ============================================

export interface DesignationQueryParams {
  departmentId?: string;
  organisationId?: string;
  status?: DesignationStatus;
  minLevel?: number;
  maxLevel?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "name" | "code" | "level" | "createdAt";
  sortOrder?: "asc" | "desc";
}

// ============================================
// RESPONSE DTOs
// ============================================

export interface DesignationListResponseDto {
  designations: DesignationWithFullDetailsDto[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DesignationStatsDto {
  id: string;
  name: string;
  code: string;
  level: number;
  departmentName: string;
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
}

export interface DesignationHierarchyDto {
  id: string;
  name: string;
  code: string;
  level: number;
  department: {
    id: string;
    name: string;
  };
  employeeCount: number;
  subordinateDesignations?: DesignationHierarchyDto[];
}

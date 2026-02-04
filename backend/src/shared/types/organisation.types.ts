/**
 * ========================================
 * ORGANISATION MODULE - TYPES & DTOs
 * ========================================
 * Location: shared/types/organisation.types.ts
 */

import { z } from "zod";

// ============================================
// ENUMS
// ============================================

export enum OrgStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

// ============================================
// VALIDATION SCHEMAS
// ============================================

export const CreateOrganisationValidationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100).trim(),
  code: z.string().min(1, "Code is required").max(20).trim(),
  address: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  zipCode: z.string().max(20).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
});

export const UpdateOrganisationValidationSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  code: z.string().min(1).max(20).trim().optional(),
  address: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  zipCode: z.string().max(20).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
  logo: z.string().url().optional(),
  status: z.nativeEnum(OrgStatus).optional(),
});

// ============================================
// INPUT DTOs
// ============================================

export interface CreateOrganisationInput {
  tenantId: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  logo?: string;
}

export interface UpdateOrganisationInput {
  name?: string;
  code?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  logo?: string;
  status?: OrgStatus;
}

// ============================================
// ENTITY DTOs
// ============================================

export interface OrganisationDto {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zipCode: string | null;
  phone: string | null;
  email: string | null;
  logo: string | null;
  status: OrgStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// POPULATED DTOs
// ============================================

export interface OrganisationWithTenantDto extends OrganisationDto {
  tenant: {
    id: string;
    name: string;
    subdomain: string;
    email: string;
    status: string;
  };
}

export interface OrganisationWithEmployeesDto extends OrganisationDto {
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

export interface OrganisationWithDepartmentsDto extends OrganisationDto {
  departments: Array<{
    id: string;
    name: string;
    code: string;
    employeeCount: number;
  }>;
  departmentCount: number;
}

export interface OrganisationWithFullDetailsDto extends OrganisationDto {
  tenant: {
    id: string;
    name: string;
    subdomain: string;
  };
  departments: Array<{
    id: string;
    name: string;
    code: string;
    employeeCount: number;
    designationCount: number;
  }>;
  employees: Array<{
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    department: {
      name: string;
    } | null;
    designation: {
      name: string;
    } | null;
  }>;
  stats: {
    totalEmployees: number;
    activeEmployees: number;
    totalDepartments: number;
    totalDesignations: number;
  };
}

// ============================================
// QUERY/FILTER DTOs
// ============================================

export interface OrganisationQueryParams {
  tenantId?: string;
  status?: OrgStatus;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "name" | "code" | "createdAt";
  sortOrder?: "asc" | "desc";
}

// ============================================
// RESPONSE DTOs
// ============================================

export interface OrganisationListResponseDto {
  organisations: OrganisationWithFullDetailsDto[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface OrganisationStatsDto {
  id: string;
  name: string;
  code: string;
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  onLeaveEmployees: number;
  totalDepartments: number;
  totalDesignations: number;
  employeesByDepartment: Record<string, number>;
  employeesByEmploymentType: Record<string, number>;
  recentJoiners: number; // Last 30 days
  turnoverRate: number; // Percentage
}

export interface OrganisationHierarchyDto {
  id: string;
  name: string;
  code: string;
  departments: Array<{
    id: string;
    name: string;
    code: string;
    head: {
      id: string;
      name: string;
    } | null;
    designations: Array<{
      id: string;
      name: string;
      level: number;
      employeeCount: number;
    }>;
  }>;
}

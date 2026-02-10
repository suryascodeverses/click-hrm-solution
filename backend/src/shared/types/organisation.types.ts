/**
 * ========================================
 * ORGANISATION MODULE - TYPES & DTOs
 * ========================================
 * Location: shared/types/organisation.types.ts
 */


// ============================================
// ENUMS
// ============================================

export enum OrgStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

// ============================================
// INPUT DTOs
// ============================================

export interface CreateOrganisationRequestDto {
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

export interface UpdateOrganisationRequestDto {
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

/**
 * ========================================
 * DEPARTMENT MODULE - TYPES & DTOs
 * ========================================
 * Location: shared/types/department.types.ts
 */

// ============================================
// ENUMS
// ============================================

export enum DeptStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

// ============================================
// INPUT DTOs
// ============================================

export interface CreateDepartmentRequestDto {
  organisationId: string;
  name: string;
  code: string;
  description?: string;
  headOfDepartment?: string;
}

export interface UpdateDepartmentRequestDto {
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

export interface DepartmentListItemDto extends DepartmentDto {
  organisation: {
    id: string;
    name: string;
    code: string;
  };
  _count: {
    employees: number;
    designations: number;
  };
}

export interface DepartmentDetailDto extends DepartmentDto {
  organisation: any;
  employees: any[];
  designations: any[];
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

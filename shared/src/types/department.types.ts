/**
 * ========================================
 * DEPARTMENT - REQUEST/RESPONSE DTOs
 * ========================================
 * Location: shared/src/types/department.types.ts
 */

// ============================================
// REQUEST DTOs
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
  status?: string;
}

export interface GetDepartmentsQueryDto {
  organisationId?: string;
}

// ============================================
// RESPONSE DTOs
// ============================================

export interface DepartmentDto {
  id: string;
  organisationId: string;
  name: string;
  code: string;
  description: string | null;
  headOfDepartment: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

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

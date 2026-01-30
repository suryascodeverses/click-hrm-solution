/**
 * ========================================
 * DESIGNATION - REQUEST/RESPONSE DTOs
 * ========================================
 * Location: shared/src/types/designation.types.ts
 */

// ============================================
// REQUEST DTOs
// ============================================

export interface CreateDesignationRequestDto {
  departmentId: string;
  name: string;
  code: string;
  level: number;
  description?: string;
}

export interface UpdateDesignationRequestDto {
  name?: string;
  code?: string;
  level?: number;
  description?: string;
  status?: string;
}

export interface GetDesignationsQueryDto {
  departmentId?: string;
}

// ============================================
// RESPONSE DTOs
// ============================================

export interface DesignationDto {
  id: string;
  departmentId: string;
  name: string;
  code: string;
  level: number;
  description: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DesignationListItemDto extends DesignationDto {
  department: {
    id: string;
    name: string;
    code: string;
  };
  _count: {
    employees: number;
  };
}

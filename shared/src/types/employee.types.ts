/**
 * ========================================
 * EMPLOYEE - REQUEST/RESPONSE DTOs
 * ========================================
 * Location: shared/src/types/employee.types.ts
 */

// ============================================
// REQUEST DTOs
// ============================================

export interface CreateEmployeeRequestDto {
  organisationId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfJoining: string;
  departmentId?: string;
  designationId?: string;
  password?: string;
}

export interface UpdateEmployeeRequestDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  departmentId?: string;
  designationId?: string;
  managerId?: string;
  status?: string;
  employmentType?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface GetEmployeesQueryDto {
  organisationId?: string;
  departmentId?: string;
  status?: string;
}

// ============================================
// RESPONSE DTOs
// ============================================

export interface EmployeeListItemDto {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  status: string;
  dateOfJoining: Date;
  createdAt: Date;
  user: {
    email: string;
    role: string;
    isActive: boolean;
  };
  department: any;
  designation: any;
  organisation: any;
}

export interface EmployeeDetailDto extends EmployeeListItemDto {
  dateOfBirth: Date | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  employmentType: string | null;
  user: {
    email: string;
    role: string;
    isActive: boolean;
    lastLogin: Date | null;
  };
  manager: {
    id: string;
    firstName: string;
    lastName: string;
    employeeCode: string;
  } | null;
  subordinates: Array<{
    id: string;
    firstName: string;
    lastName: string;
    employeeCode: string;
  }>;
}

export interface CreateEmployeeResponseDto {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
  department: any;
  designation: any;
}

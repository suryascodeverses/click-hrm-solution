/**
 * ========================================
 * EMPLOYEE MODULE - TYPES & DTOs
 * ========================================
 * Location: shared/types/employee.types.ts
 */

import { EmploymentType } from "@prisma/client";

// ============================================
// ENUMS
// ============================================

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export enum MaritalStatus {
  SINGLE = "SINGLE",
  MARRIED = "MARRIED",
  DIVORCED = "DIVORCED",
  WIDOWED = "WIDOWED",
}

// export enum EmploymentType {
//   FULL_TIME = "FULL_TIME",
//   PART_TIME = "PART_TIME",
//   CONTRACT = "CONTRACT",
//   INTERN = "INTERN",
//   CONSULTANT = "CONSULTANT",
// }

export enum EmployeeStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  ON_LEAVE = "ON_LEAVE",
  TERMINATED = "TERMINATED",
  RESIGNED = "RESIGNED",
}

// ============================================
// INPUT DTOs
// ============================================

export interface CreateEmployeeRequestDto {
  organisationId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date | string;
  gender?: Gender;
  maritalStatus?: MaritalStatus;
  bloodGroup?: string;
  dateOfJoining: Date | string;
  departmentId?: string;
  designationId?: string;
  reportingTo?: string;
  employmentType?: EmploymentType;
  currentAddress?: string;
  permanentAddress?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  profilePicture?: string;
  password?: string;
}

export interface UpdateEmployeeRequestDto {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  phone?: string;
  dateOfBirth?: Date | string;
  gender?: Gender;
  maritalStatus?: MaritalStatus;
  bloodGroup?: string;
  departmentId?: string;
  designationId?: string;
  reportingTo?: string;
  employmentType: EmploymentType;
  status?: EmployeeStatus;
  currentAddress?: string;
  permanentAddress?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  profilePicture?: string;
}

// ============================================
// ENTITY DTOs
// ============================================

export interface EmployeeDto {
  id: string;
  userId: string;
  organisationId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  email: string;
  phone: string | null;
  dateOfBirth: Date | null;
  gender: Gender | null;
  maritalStatus: MaritalStatus | null;
  bloodGroup: string | null;
  dateOfJoining: Date;
  designationId: string | null;
  departmentId: string | null;
  reportingTo: string | null;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  currentAddress: string | null;
  permanentAddress: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zipCode: string | null;
  profilePicture: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// POPULATED DTOs
// ============================================

export interface EmployeeWithUserDto extends EmployeeDto {
  user: {
    id: string;
    email: string;
    role: string;
    isActive: boolean;
    lastLogin: Date | null;
  };
}

export interface EmployeeWithOrganisationDto extends EmployeeDto {
  organisation: {
    id: string;
    name: string;
    code: string;
    tenantId: string;
  };
}

export interface EmployeeWithDepartmentDto extends EmployeeDto {
  department: {
    id: string;
    name: string;
    code: string;
  } | null;
}

export interface EmployeeWithDesignationDto extends EmployeeDto {
  designation: {
    id: string;
    name: string;
    code: string;
    level: number;
  } | null;
}

export interface EmployeeWithManagerDto extends EmployeeDto {
  manager: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
    designation: {
      id: string;
      name: string;
    } | null;
  } | null;
}

export interface EmployeeWithSubordinatesDto extends EmployeeDto {
  subordinates: Array<{
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
    designation: {
      id: string;
      name: string;
    } | null;
  }>;
  subordinateCount: number;
}

export interface EmployeeWithFullDetailsDto extends EmployeeDto {
  user: {
    id: string;
    email: string;
    role: string;
    isActive: boolean;
  };
  organisation: {
    id: string;
    name: string;
    code: string;
  };
  department: {
    id: string;
    name: string;
    code: string;
  } | null;
  designation: {
    id: string;
    name: string;
    code: string;
    level: number;
  } | null;
  manager: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    designation: {
      name: string;
    } | null;
  } | null;
  subordinates: Array<{
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
  }>;
}

// ============================================
// QUERY/FILTER DTOs
// ============================================

export interface EmployeeQueryParams {
  organisationId?: string;
  departmentId?: string;
  designationId?: string;
  managerId?: string;
  status?: EmployeeStatus;
  employmentType?: EmploymentType;
  search?: string; // Search by name, email, employee code
  page?: number;
  limit?: number;
  sortBy?:
    | "firstName"
    | "lastName"
    | "employeeCode"
    | "dateOfJoining"
    | "createdAt";
  sortOrder?: "asc" | "desc";
}

// ============================================
// RESPONSE DTOs
// ============================================

export interface EmployeeListResponseDto {
  employees: EmployeeWithFullDetailsDto[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface EmployeeStatsDto {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  onLeaveEmployees: number;
  terminatedEmployees: number;
  resignedEmployees: number;
  byDepartment: Record<string, number>;
  byDesignation: Record<string, number>;
  byEmploymentType: Record<string, number>;
}

export interface EmployeeProfileDto extends EmployeeWithFullDetailsDto {
  attendanceStats: {
    totalPresent: number;
    totalAbsent: number;
    totalLeaves: number;
    attendancePercentage: number;
  };
  leaveBalance: Array<{
    leaveType: string;
    totalDays: number;
    usedDays: number;
    availableDays: number;
  }>;
  recentAttendance: Array<{
    date: Date;
    status: string;
    workHours: number | null;
  }>;
  recentLeaves: Array<{
    id: string;
    leaveType: string;
    startDate: Date;
    endDate: Date;
    days: number;
    status: string;
  }>;
}

export interface EmployeeHierarchyDto {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  designation: {
    id: string;
    name: string;
    level: number;
  } | null;
  subordinates?: EmployeeHierarchyDto[];
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

export interface EmployeeListItemDto {
  status: string;
  id: string;
  createdAt: Date;
  email: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
  phone: string | null;
  dateOfJoining: Date;
  user: {
    email: string;
    role: string;
    isActive: boolean;
  };
  department?: any;
  organisation?: any;
  designation?: any;
}

export interface EmployeeDetailDto {
  status: EmployeeStatus;
  id: string;
  createdAt: Date;
  email: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
  phone: string | null;
  dateOfJoining: Date;
  employmentType: EmploymentType | null;
  dateOfBirth: Date | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
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
  subordinates: {
    id: string;
    firstName: string;
    lastName: string;
    employeeCode: string;
  }[];
  department?: any;
  organisation?: any;
  designation?: any;
}

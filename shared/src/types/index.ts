export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  TENANT_ADMIN = "TENANT_ADMIN",
  ORG_ADMIN = "ORG_ADMIN",
  HR_MANAGER = "HR_MANAGER",
  MANAGER = "MANAGER",
  EMPLOYEE = "EMPLOYEE",
}

export enum EmployeeStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  ON_LEAVE = "ON_LEAVE",
  TERMINATED = "TERMINATED",
  RESIGNED = "RESIGNED",
}

export enum TenantStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  INACTIVE = "INACTIVE",
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  tenantId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  email: string;
  phone?: string;
  logo?: string;
  status: TenantStatus;
  createdAt: string;
}

export interface Organisation {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  status: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfJoining: string;
  status: EmployeeStatus;
  department?: Department;
  designation?: Designation;
  organisation: Organisation;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: string;
}

export interface Designation {
  id: string;
  name: string;
  code: string;
  level: number;
  description?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

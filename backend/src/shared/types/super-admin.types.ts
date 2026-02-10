/**
 * ========================================
 * SUPER ADMIN MODULE - TYPES & DTOs
 * ========================================
 * Location: shared/types/super-admin.types.ts
 */

import { TenantStatus } from "@prisma/client";

// ============================================
// INPUT DTOs
// ============================================

export interface UpdateTenantStatusRequestDto {
  status: TenantStatus;
}

export interface UpdateTenantRequestDto {
  name?: string;
  email?: string;
  phone?: string;
  logo?: string;
  subscriptionTier?: string;
  maxEmployees?: number;
  status?: TenantStatus;
}

export interface UpdateUserRequestDto {
  role?: string;
  isActive?: boolean;
}

// ============================================
// ENTITY DTOs (from Tenant module)
// ============================================

export interface TenantManagementDto {
  id: string;
  name: string;
  subdomain: string;
  email: string;
  phone: string | null;
  logo: string | null;
  status: TenantStatus;
  subscriptionTier: string;
  maxEmployees: number;
  settings: any; // Json field from Prisma
  createdAt: Date;
  updatedAt: Date;
}

export interface UserManagementDto {
  id: string;
  tenantId: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// POPULATED DTOs
// ============================================

export interface TenantWithStatsDto extends TenantManagementDto {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalOrganisations: number;
    totalEmployees: number;
    totalDepartments: number;
  };
  subscription: {
    id: string;
    planId: string;
    status: string;
    billingCycle: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
  } | null;
}

export interface TenantWithOrganisationsDto extends TenantManagementDto {
  organisations: Array<{
    id: string;
    name: string;
    code: string;
    status: string;
    employeeCount: number;
  }>;
}

export interface TenantWithUsersDto extends TenantManagementDto {
  users: Array<{
    id: string;
    email: string;
    role: string;
    isActive: boolean;
    lastLogin: Date | null;
  }>;
}

export interface TenantWithFullDetailsDto extends TenantManagementDto {
  stats: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    totalOrganisations: number;
    totalEmployees: number;
    activeEmployees: number;
    totalDepartments: number;
    totalDesignations: number;
  };
  organisations: Array<{
    id: string;
    name: string;
    code: string;
    status: string;
    employeeCount: number;
    departmentCount: number;
  }>;
  subscription: {
    id: string;
    planName: string;
    status: string;
    billingCycle: string;
    currentPeriodEnd: Date;
    price: number;
  } | null;
  recentActivity: Array<{
    date: Date;
    action: string;
    description: string;
  }>;
}

export interface UserWithTenantDetailsDto extends UserManagementDto {
  tenant: {
    id: string;
    name: string;
    subdomain: string;
    status: string;
  };
  employee: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

// ============================================
// QUERY/FILTER DTOs
// ============================================

export interface TenantQueryParams {
  status?: TenantStatus;
  subscriptionTier?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "name" | "createdAt" | "status";
  sortOrder?: "asc" | "desc";
}

export interface UserQueryParams {
  tenantId?: string;
  role?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "email" | "createdAt" | "lastLogin";
  sortOrder?: "asc" | "desc";
}

// ============================================
// RESPONSE DTOs
// ============================================

export interface TenantListResponseDto {
  tenants: TenantWithStatsDto[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserListResponseDto {
  users: UserWithTenantDetailsDto[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SuperAdminDashboardStatsDto {
  totalTenants: number;
  activeTenants: number;
  suspendedTenants: number;
  inactiveTenants: number;
  totalUsers: number;
  activeUsers: number;
  totalOrganisations: number;
  totalEmployees: number;
  totalRevenue: number;
  monthlyRevenue: number;
  tenantGrowth: {
    thisMonth: number;
    lastMonth: number;
    percentageChange: number;
  };
  revenueGrowth: {
    thisMonth: number;
    lastMonth: number;
    percentageChange: number;
  };
  subscriptionDistribution: Record<string, number>;
  tenantsByStatus: Record<TenantStatus, number>;
}

export interface TenantActivityLogDto {
  tenantId: string;
  tenantName: string;
  activities: Array<{
    id: string;
    action: string;
    entity: string;
    description: string;
    performedBy: string;
    timestamp: Date;
  }>;
}

export interface SystemHealthDto {
  status: "healthy" | "degraded" | "down";
  database: {
    status: string;
    responseTime: number;
  };
  apiServer: {
    status: string;
    uptime: number;
  };
  metrics: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    activeConnections: number;
  };
  lastChecked: Date;
}

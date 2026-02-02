/**
 * ========================================
 * SUPER ADMIN - REQUEST/RESPONSE DTOs
 * ========================================
 * Location: shared/src/types/super-admin.types.ts
 */

// ============================================
// REQUEST DTOs
// ============================================

export interface UpdateTenantStatusRequestDto {
  status: string;
}

export interface UpdateTenantRequestDto {
  name?: string;
  email?: string;
  phone?: string;
  subscriptionTier?: string;
  maxEmployees?: number;
  status?: string;
}

export interface UpdateUserRequestDto {
  role?: string;
  isActive?: boolean;
}

// ============================================
// RESPONSE DTOs
// ============================================

export interface DashboardStatsDto {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  totalEmployees: number;
}

export interface RecentTenantDto {
  id: string;
  name: string;
  subdomain: string;
  email: string;
  status: string;
  createdAt: Date;
  _count: {
    users: number;
    organisations: number;
  };
}

export interface GetDashboardStatsResponseDto {
  stats: DashboardStatsDto;
  recentTenants: RecentTenantDto[];
}

export interface TenantDetailDto {
  id: string;
  name: string;
  subdomain: string;
  email: string;
  phone: string | null;
  logo: string | null;
  status: string;
  subscriptionTier: string | null;
  maxEmployees: number | null;
  // settings?: any;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    users: number;
    organisations: number;
  };
}

export interface UserDetailDto {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  tenantId: string | null;
  createdAt: Date;
  lastLogin: Date | null;
  tenant: {
    id: string;
    name: string;
    subdomain: string;
  } | null;
  employee: {
    firstName: string;
    lastName: string;
    employeeCode: string;
  } | null;
}

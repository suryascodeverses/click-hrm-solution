/**
 * ========================================
 * TENANT MODULE - TYPES & DTOs
 * ========================================
 * Location: shared/types/tenant.types.ts
 */

import { z } from "zod";
import { TenantStatus } from "./auth.types";

// ============================================
// VALIDATION SCHEMAS
// ============================================

export const UpdateTenantProfileValidationSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  phone: z.string().optional(),
  logo: z.string().url().optional(),
});

export const UpdateTenantSettingsValidationSchema = z.object({
  workingHoursStart: z.string().optional(),
  workingHoursEnd: z.string().optional(),
  weekendDays: z.array(z.number().int().min(0).max(6)).optional(),
  timezone: z.string().optional(),
  dateFormat: z.string().optional(),
  currency: z.string().optional(),
});

// ============================================
// INPUT DTOs
// ============================================

export interface UpdateTenantProfileInput {
  name?: string;
  phone?: string;
  logo?: string;
  email?: string;
}

export interface UpdateTenantSettingsInput {
  workingHoursStart?: string;
  workingHoursEnd?: string;
  weekendDays?: number[];
  timezone?: string;
  dateFormat?: string;
  currency?: string;
  leaveApprovalWorkflow?: string;
  attendanceSettings?: Record<string, any>;
  payrollSettings?: Record<string, any>;
}

// ============================================
// ENTITY DTOs
// ============================================

export interface TenantProfileDto {
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

export interface TenantSettingsDto {
  workingHoursStart: string;
  workingHoursEnd: string;
  weekendDays: number[];
  timezone: string;
  dateFormat: string;
  currency: string;
  leaveApprovalWorkflow: string;
  attendanceSettings: Record<string, any>;
  payrollSettings: Record<string, any>;
}

// ============================================
// POPULATED DTOs
// ============================================

export interface TenantWithSubscriptionDto extends TenantProfileDto {
  subscription: {
    id: string;
    planId: string;
    planName: string;
    status: string;
    billingCycle: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    price: number;
    features: string[];
  } | null;
}

export interface TenantWithOrganisationsDto extends TenantProfileDto {
  organisations: Array<{
    id: string;
    name: string;
    code: string;
    status: string;
    employeeCount: number;
    departmentCount: number;
  }>;
  organisationCount: number;
}

export interface TenantWithUsersDto extends TenantProfileDto {
  users: Array<{
    id: string;
    email: string;
    role: string;
    isActive: boolean;
    employee: {
      id: string;
      firstName: string;
      lastName: string;
    } | null;
  }>;
  userCount: number;
}

export interface TenantWithFullDetailsDto extends TenantProfileDto {
  subscription: {
    id: string;
    planName: string;
    status: string;
    currentPeriodEnd: Date;
    features: string[];
  } | null;
  organisations: Array<{
    id: string;
    name: string;
    code: string;
    employeeCount: number;
  }>;
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalOrganisations: number;
    totalEmployees: number;
    activeEmployees: number;
    totalDepartments: number;
    totalDesignations: number;
  };
  settings: TenantSettingsDto;
}

// ============================================
// QUERY/FILTER DTOs
// ============================================

export interface TenantStatsQueryParams {
  startDate?: Date | string;
  endDate?: Date | string;
}

// ============================================
// RESPONSE DTOs
// ============================================

export interface TenantProfileResponseDto {
  tenant: TenantWithFullDetailsDto;
}

export interface UpdateTenantProfileResponseDto {
  tenant: TenantProfileDto;
  message: string;
}

export interface TenantStatsDto {
  overview: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    totalOrganisations: number;
    totalEmployees: number;
    activeEmployees: number;
    totalDepartments: number;
    totalDesignations: number;
  };
  employees: {
    byStatus: Record<string, number>;
    byDepartment: Record<string, number>;
    byEmploymentType: Record<string, number>;
    recentJoiners: number;
    recentLeavers: number;
  };
  attendance: {
    todayPresent: number;
    todayAbsent: number;
    todayOnLeave: number;
    averageAttendanceRate: number;
  };
  leaves: {
    pendingLeaves: number;
    approvedLeaves: number;
    rejectedLeaves: number;
    totalLeavesTaken: number;
  };
  payroll: {
    totalSalaryPaid: number;
    totalSalaryPending: number;
    averageSalary: number;
  };
  growth: {
    employeeGrowth: {
      thisMonth: number;
      lastMonth: number;
      percentageChange: number;
    };
    departmentGrowth: {
      thisMonth: number;
      lastMonth: number;
      percentageChange: number;
    };
  };
}

export interface TenantUsageDto {
  subscription: {
    planName: string;
    maxEmployees: number;
    currentEmployees: number;
    utilizationPercentage: number;
    daysUntilRenewal: number;
  };
  features: {
    attendanceTracking: boolean;
    leaveManagement: boolean;
    payrollManagement: boolean;
    performanceManagement: boolean;
    recruitmentManagement: boolean;
  };
  storage: {
    usedStorage: number;
    maxStorage: number;
    utilizationPercentage: number;
  };
  apiUsage: {
    totalCalls: number;
    limitPerMonth: number;
    utilizationPercentage: number;
  };
}

export interface TenantActivityDto {
  date: Date;
  activities: Array<{
    id: string;
    action: string;
    entity: string;
    entityId: string;
    performedBy: {
      id: string;
      name: string;
      email: string;
    };
    description: string;
    timestamp: Date;
  }>;
}

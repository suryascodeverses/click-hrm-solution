import { TenantStatus } from "@prisma/client";
import { prisma } from "../../config/database";

import type {
  GetDashboardStatsResponseDto,
  TenantDetailDto,
  UpdateTenantStatusRequestDto,
  UpdateTenantRequestDto,
  UserDetailDto,
  UpdateUserRequestDto,
} from "@arm/shared";

/**
 * ========================================
 * SUPER ADMIN SERVICE
 * ========================================
 */

export class SuperAdminService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<GetDashboardStatsResponseDto> {
    const [totalTenants, activeTenants, totalUsers, totalEmployees] =
      await Promise.all([
        prisma.tenant.count(),
        prisma.tenant.count({ where: { status: "ACTIVE" } }),
        prisma.user.count(),
        prisma.employee.count(),
      ]);

    const recentTenants = await prisma.tenant.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            users: true,
            organisations: true,
          },
        },
      },
    });

    return {
      stats: {
        totalTenants,
        activeTenants,
        totalUsers,
        totalEmployees,
      },
      recentTenants,
    };
  }

  /**
   * Get all tenants
   */
  async getAllTenants(): Promise<TenantDetailDto[]> {
    const tenants = await prisma.tenant.findMany({
      include: {
        _count: {
          select: {
            users: true,
            organisations: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return tenants;
  }

  /**
   * Update tenant status
   */
  async updateTenantStatus(
    tenantId: string,
    data: UpdateTenantStatusRequestDto,
  ): Promise<TenantDetailDto> {
    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: { status: data.status as TenantStatus },
      include: {
        _count: {
          select: {
            users: true,
            organisations: true,
          },
        },
      },
    });

    return tenant;
  }

  /**
   * Update tenant
   */
  async updateTenant(
    tenantId: string,
    data: UpdateTenantRequestDto,
  ): Promise<TenantDetailDto> {
    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data,
      include: {
        _count: {
          select: {
            users: true,
            organisations: true,
          },
        },
      },
    });

    return tenant;
  }

  /**
   * Delete tenant
   */
  async deleteTenant(tenantId: string): Promise<void> {
    await prisma.tenant.delete({
      where: { id: tenantId },
    });
  }

  /**
   * Get all users
   */
  async getAllUsers(): Promise<UserDetailDto[]> {
    const users = await prisma.user.findMany({
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            subdomain: true,
          },
        },
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return users;
  }

  /**
   * Update user
   */
  async updateUser(
    userId: string,
    data: UpdateUserRequestDto,
  ): Promise<UserDetailDto> {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            subdomain: true,
          },
        },
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
      },
    });

    return user;
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<void> {
    await prisma.user.delete({
      where: { id: userId },
    });
  }
}


import { prisma } from "../../config/database";
import type {
  GetAuditLogsQueryDto,
  GetAuditLogsResponseDto,
  AuditLogStatsDto,
  AuditLogFiltersDto,
} from "@arm/shared";

export class AuditLogsService {
  async getAuditLogs(
    filters: GetAuditLogsQueryDto,
  ): Promise<GetAuditLogsResponseDto> {
    const {
      page = 1,
      limit = 50,
      tenantId,
      userId,
      action,
      entity,
      startDate,
      endDate,
      search,
    } = filters;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (entity) where.entity = entity;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    if (search) {
      where.OR = [
        { userEmail: { contains: search, mode: "insensitive" } },
        { userName: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { entity: { contains: search, mode: "insensitive" } },
      ];
    }

    const total = await prisma.auditLog.count({ where });
    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limitNum,
    });

    return {
      logs: logs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async getAuditLogStats(): Promise<AuditLogStatsDto> {
    const [totalLogs, last24Hours, loginAttempts, failedLogins] =
      await Promise.all([
        prisma.auditLog.count(),
        prisma.auditLog.count({
          where: {
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
        }),
        prisma.auditLog.count({
          where: { action: { in: ["LOGIN", "SUPER_ADMIN_LOGIN"] } },
        }),
        prisma.auditLog.count({ where: { action: "LOGIN_FAILED" } }),
      ]);

    const actionStats = await prisma.auditLog.groupBy({
      by: ["action"],
      _count: { action: true },
      orderBy: { _count: { action: "desc" } },
      take: 10,
    });

    return {
      stats: { totalLogs, last24Hours, loginAttempts, failedLogins },
      topActions: actionStats.map((stat) => ({
        action: stat.action,
        count: stat._count.action,
      })),
    };
  }

  async getUniqueFilters(): Promise<AuditLogFiltersDto> {
    const actions = await prisma.auditLog.findMany({
      select: { action: true },
      distinct: ["action"],
      orderBy: { action: "asc" },
    });
    const entities = await prisma.auditLog.findMany({
      select: { entity: true },
      distinct: ["entity"],
      where: { entity: { not: null } },
      orderBy: { entity: "asc" },
    });
    return {
      actions: actions.map((a) => a.action),
      entities: entities.map((e) => e.entity!),
    };
  }
}

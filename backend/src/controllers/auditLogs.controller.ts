import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";

export const getAuditLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      page = "1",
      limit = "50",
      tenantId,
      userId,
      action,
      entity,
      startDate,
      endDate,
      search,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter conditions
    const where: any = {};

    if (tenantId) {
      where.tenantId = tenantId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (action) {
      where.action = action;
    }

    if (entity) {
      where.entity = entity;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }

    if (search) {
      where.OR = [
        { userEmail: { contains: search as string, mode: "insensitive" } },
        { userName: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
        { entity: { contains: search as string, mode: "insensitive" } },
      ];
    }

    // Get total count
    const total = await prisma.auditLog.count({ where });

    // Get logs
    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limitNum,
    });

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getAuditLogStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [totalLogs, last24Hours, loginAttempts, failedLogins] =
      await Promise.all([
        prisma.auditLog.count(),
        prisma.auditLog.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
        }),
        prisma.auditLog.count({
          where: {
            action: {
              in: ["LOGIN", "SUPER_ADMIN_LOGIN"],
            },
          },
        }),
        prisma.auditLog.count({
          where: {
            action: "LOGIN_FAILED",
          },
        }),
      ]);

    // Get activity by action type
    const actionStats = await prisma.auditLog.groupBy({
      by: ["action"],
      _count: {
        action: true,
      },
      orderBy: {
        _count: {
          action: "desc",
        },
      },
      take: 10,
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalLogs,
          last24Hours,
          loginAttempts,
          failedLogins,
        },
        topActions: actionStats.map((stat) => ({
          action: stat.action,
          count: stat._count.action,
        })),
      },
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getUniqueFilters = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get unique actions
    const actions = await prisma.auditLog.findMany({
      select: { action: true },
      distinct: ["action"],
      orderBy: { action: "asc" },
    });

    // Get unique entities
    const entities = await prisma.auditLog.findMany({
      select: { entity: true },
      distinct: ["entity"],
      where: {
        entity: {
          not: null,
        },
      },
      orderBy: { entity: "asc" },
    });

    res.json({
      success: true,
      data: {
        actions: actions.map((a) => a.action),
        entities: entities.map((e) => e.entity),
      },
    });
    return;
  } catch (error) {
    next(error);
  }
};

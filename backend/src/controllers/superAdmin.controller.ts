import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";

export const getDashboardStats = async (
  _: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
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

    res.json({
      success: true,
      data: {
        stats: {
          totalTenants,
          activeTenants,
          totalUsers,
          totalEmployees,
        },
        recentTenants,
      },
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getAllTenants = async (
  _: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
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

    res.json({
      success: true,
      data: tenants,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const updateTenantStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { tenantId } = req.params;
    const { status } = req.body;

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: { status },
    });

    res.json({
      success: true,
      message: "Tenant status updated",
      data: tenant,
    });
    return;
  } catch (error) {
    next(error);
  }
};

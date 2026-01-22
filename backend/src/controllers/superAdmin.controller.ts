import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";

export const getDashboardStats = async (
  _req: Request,
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
  _req: Request,
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

export const updateTenant = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { tenantId } = req.params;
    const { name, email, phone, subscriptionTier, maxEmployees, status } =
      req.body;

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        name,
        email,
        phone,
        subscriptionTier,
        maxEmployees,
        status,
      },
    });

    res.json({
      success: true,
      message: "Tenant updated successfully",
      data: tenant,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const deleteTenant = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { tenantId } = req.params;

    // This will cascade delete all related data
    await prisma.tenant.delete({
      where: { id: tenantId },
    });

    res.json({
      success: true,
      message: "Tenant deleted successfully",
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
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

    res.json({
      success: true,
      data: users,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.params;
    const { role, isActive } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        role,
        isActive,
      },
    });

    res.json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.params;

    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({
      success: true,
      message: "User deleted successfully",
    });
    return;
  } catch (error) {
    next(error);
  }
};

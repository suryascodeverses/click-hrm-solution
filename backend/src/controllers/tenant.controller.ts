import { Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { AuthRequest } from "../middlewares/auth.middleware";

export const getTenant = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.user!.tenantId! },
      include: {
        organisations: true,
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
      data: tenant,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const updateTenant = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, phone, logo } = req.body;

    const tenant = await prisma.tenant.update({
      where: { id: req.user!.tenantId! },
      data: { name, phone, logo },
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

import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { AuthRequest } from "../middlewares/auth.middleware";

export const createOrganisation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, code, address, city, state, country, zipCode, phone, email } =
      req.body;

    const organisation = await prisma.organisation.create({
      data: {
        tenantId: req.user!.tenantId!,
        name,
        code,
        address,
        city,
        state,
        country,
        zipCode,
        phone,
        email,
      },
    });

    res.status(201).json({
      success: true,
      message: "Organisation created successfully",
      data: organisation,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getOrganisations = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organisations = await prisma.organisation.findMany({
      where: { tenantId: req.user!.tenantId! },
      include: {
        _count: {
          select: {
            employees: true,
            departments: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: organisations,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getOrganisation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const organisation = await prisma.organisation.findUnique({
      where: { id },
      include: {
        departments: true,
        employees: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            employees: true,
            departments: true,
          },
        },
      },
    });

    if (!organisation) {
      res.status(404).json({
        success: false,
        message: "Organisation not found",
      });
      return;
    }

    res.json({
      success: true,
      data: organisation,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const updateOrganisation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const organisation = await prisma.organisation.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      message: "Organisation updated successfully",
      data: organisation,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const deleteOrganisation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    await prisma.organisation.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Organisation deleted successfully",
    });
    return;
  } catch (error) {
    next(error);
  }
};

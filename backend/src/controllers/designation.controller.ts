import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";

export const createDesignation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { departmentId, name, code, level, description } = req.body;

    const designation = await prisma.designation.create({
      data: {
        departmentId,
        name,
        code,
        level,
        description,
      },
    });

    res.status(201).json({
      success: true,
      message: "Designation created successfully",
      data: designation,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getDesignations = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { departmentId } = req.query;

    const designations = await prisma.designation.findMany({
      where: departmentId ? { departmentId: String(departmentId) } : {},
      include: {
        department: true,
        _count: {
          select: {
            employees: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: designations,
    });
    return;
  } catch (error) {
    next(error);
  }
};

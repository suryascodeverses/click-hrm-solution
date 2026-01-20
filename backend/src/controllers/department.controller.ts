import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";

export const createDepartment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { organisationId, name, code, description, headOfDepartment } =
      req.body;

    const department = await prisma.department.create({
      data: {
        organisationId,
        name,
        code,
        description,
        headOfDepartment,
      },
    });

    res.status(201).json({
      success: true,
      message: "Department created successfully",
      data: department,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getDepartments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { organisationId } = req.query;

    const departments = await prisma.department.findMany({
      where: organisationId ? { organisationId: String(organisationId) } : {},
      include: {
        organisation: true,
        _count: {
          select: {
            employees: true,
            designations: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: departments,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getDepartment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        organisation: true,
        employees: {
          take: 10,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            designation: true,
          },
        },
        designations: true,
      },
    });

    if (!department) {
      res.status(404).json({
        success: false,
        message: "Department not found",
      });
      return;
    }

    res.json({
      success: true,
      data: department,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const department = await prisma.department.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      message: "Department updated successfully",
      data: department,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const deleteDepartment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    await prisma.department.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Department deleted successfully",
    });
    return;
  } catch (error) {
    next(error);
  }
};

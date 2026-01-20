import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { AuthRequest } from "../middlewares/auth.middleware";
import { hashPassword } from "../utils/password.utils";

export const createEmployee = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      organisationId,
      employeeCode,
      firstName,
      lastName,
      email,
      phone,
      dateOfJoining,
      departmentId,
      designationId,
      password,
    } = req.body;

    // Check if email already exists in this tenant
    const existingUser = await prisma.user.findFirst({
      where: {
        tenantId: req.user!.tenantId!,
        email,
      },
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "Email already exists",
      });
      return;
    }

    // Create user first
    const hashedPassword = await hashPassword(password || "Welcome@123");
    const user = await prisma.user.create({
      data: {
        tenantId: req.user!.tenantId!,
        email,
        password: hashedPassword,
        role: "EMPLOYEE",
      },
    });

    // Create employee
    const employee = await prisma.employee.create({
      data: {
        userId: user.id,
        organisationId,
        employeeCode,
        firstName,
        lastName,
        email,
        phone,
        dateOfJoining: new Date(dateOfJoining),
        departmentId,
        designationId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        department: true,
        designation: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: employee,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getEmployees = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { organisationId, departmentId, status } = req.query;

    const where: any = {
      organisation: {
        tenantId: req.user!.tenantId!,
      },
    };

    if (organisationId) where.organisationId = organisationId;
    if (departmentId) where.departmentId = departmentId;
    if (status) where.status = status;

    const employees = await prisma.employee.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
            role: true,
            isActive: true,
          },
        },
        department: true,
        designation: true,
        organisation: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: employees,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            role: true,
            isActive: true,
            lastLogin: true,
          },
        },
        department: true,
        designation: true,
        organisation: true,
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
        subordinates: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
      },
    });

    if (!employee) {
      res.status(404).json({
        success: false,
        message: "Employee not found",
      });
      return;
    }

    res.json({
      success: true,
      data: employee,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const updateEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const employee = await prisma.employee.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
        department: true,
        designation: true,
      },
    });

    res.json({
      success: true,
      message: "Employee updated successfully",
      data: employee,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const deleteEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const employee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      res.status(404).json({
        success: false,
        message: "Employee not found",
      });
      return;
    }

    // Delete user (will cascade delete employee)
    await prisma.user.delete({
      where: { id: employee.userId },
    });

    res.json({
      success: true,
      message: "Employee deleted successfully",
    });
    return;
  } catch (error) {
    next(error);
  }
};

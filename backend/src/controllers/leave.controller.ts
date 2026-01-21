import { Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { AuthRequest } from "../middlewares/auth.middleware";

export const applyLeave = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { employeeId, leaveTypeId, startDate, endDate, reason, days } =
      req.body;

    // Check leave balance
    const currentYear = new Date().getFullYear();
    const balance = await prisma.leaveBalance.findUnique({
      where: {
        employeeId_leaveTypeId_year: {
          employeeId,
          leaveTypeId,
          year: currentYear,
        },
      },
    });

    if (!balance || balance.availableDays < days) {
      res.status(400).json({
        success: false,
        message: "Insufficient leave balance",
      });
      return;
    }

    // Create leave application
    const leave = await prisma.leave.create({
      data: {
        employeeId,
        leaveTypeId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        days,
        reason,
      },
      include: {
        leaveType: true,
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
      },
    });

    // Update pending days in balance
    await prisma.leaveBalance.update({
      where: { id: balance.id },
      data: {
        pendingDays: balance.pendingDays + days,
        availableDays:
          balance.totalDays - balance.usedDays - (balance.pendingDays + days),
      },
    });

    res.status(201).json({
      success: true,
      message: "Leave application submitted successfully",
      data: leave,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const approveLeave = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { leaveId } = req.params;
    const approverId = req.user!.id;

    const leave = await prisma.leave.findUnique({
      where: { id: leaveId },
      include: {
        employee: true,
        leaveType: true,
      },
    });

    if (!leave) {
      res.status(404).json({
        success: false,
        message: "Leave not found",
      });
      return;
    }

    if (leave.status !== "PENDING") {
      res.status(400).json({
        success: false,
        message: "Leave already processed",
      });
      return;
    }

    // Update leave status
    const updatedLeave = await prisma.leave.update({
      where: { id: leaveId },
      data: {
        status: "APPROVED",
        approvedBy: approverId,
        approvedAt: new Date(),
      },
    });

    // Update leave balance
    const currentYear = new Date().getFullYear();
    const balance = await prisma.leaveBalance.findUnique({
      where: {
        employeeId_leaveTypeId_year: {
          employeeId: leave.employeeId,
          leaveTypeId: leave.leaveTypeId,
          year: currentYear,
        },
      },
    });

    if (balance) {
      await prisma.leaveBalance.update({
        where: { id: balance.id },
        data: {
          usedDays: balance.usedDays + leave.days,
          pendingDays: balance.pendingDays - leave.days,
          availableDays:
            balance.totalDays -
            (balance.usedDays + leave.days) -
            (balance.pendingDays - leave.days),
        },
      });
    }

    res.json({
      success: true,
      message: "Leave approved successfully",
      data: updatedLeave,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const rejectLeave = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { leaveId } = req.params;
    const { rejectedReason } = req.body;
    const approverId = req.user!.id;

    const leave = await prisma.leave.findUnique({
      where: { id: leaveId },
    });

    if (!leave || leave.status !== "PENDING") {
      res.status(400).json({
        success: false,
        message: "Invalid leave or already processed",
      });
      return;
    }

    // Update leave status
    const updatedLeave = await prisma.leave.update({
      where: { id: leaveId },
      data: {
        status: "REJECTED",
        approvedBy: approverId,
        approvedAt: new Date(),
        rejectedReason,
      },
    });

    // Restore pending days
    const currentYear = new Date().getFullYear();
    const balance = await prisma.leaveBalance.findUnique({
      where: {
        employeeId_leaveTypeId_year: {
          employeeId: leave.employeeId,
          leaveTypeId: leave.leaveTypeId,
          year: currentYear,
        },
      },
    });

    if (balance) {
      await prisma.leaveBalance.update({
        where: { id: balance.id },
        data: {
          pendingDays: balance.pendingDays - leave.days,
          availableDays:
            balance.totalDays -
            balance.usedDays -
            (balance.pendingDays - leave.days),
        },
      });
    }

    res.json({
      success: true,
      message: "Leave rejected",
      data: updatedLeave,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getMyLeaves = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { employeeId } = req.params;

    const leaves = await prisma.leave.findMany({
      where: { employeeId },
      include: {
        leaveType: true,
        approver: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { appliedAt: "desc" },
    });

    res.json({
      success: true,
      data: leaves,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getMyLeaveBalance = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { employeeId } = req.params;
    const currentYear = new Date().getFullYear();

    const balances = await prisma.leaveBalance.findMany({
      where: {
        employeeId,
        year: currentYear,
      },
      include: {
        leaveType: true,
      },
    });

    res.json({
      success: true,
      data: balances,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getPendingLeaves = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const leaves = await prisma.leave.findMany({
      where: {
        status: "PENDING",
        employee: {
          organisation: {
            tenantId: req.user!.tenantId!,
          },
        },
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeCode: true,
            department: true,
          },
        },
        leaveType: true,
      },
      orderBy: { appliedAt: "desc" },
    });

    res.json({
      success: true,
      data: leaves,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getLeaveTypes = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const leaveTypes = await prisma.leaveType.findMany({
      where: {
        tenantId: req.user!.tenantId!,
        isActive: true,
      },
    });

    res.json({
      success: true,
      data: leaveTypes,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const createLeaveType = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      name,
      code,
      defaultDays,
      carryForward,
      maxCarryForward,
      color,
      description,
    } = req.body;

    const leaveType = await prisma.leaveType.create({
      data: {
        tenantId: req.user!.tenantId!,
        name,
        code: code.toUpperCase(),
        defaultDays,
        carryForward,
        maxCarryForward,
        color,
        description,
      },
    });

    res.status(201).json({
      success: true,
      message: "Leave type created successfully",
      data: leaveType,
    });
    return;
  } catch (error) {
    next(error);
  }
};

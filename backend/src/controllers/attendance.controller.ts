import { Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { AuthRequest } from "../middlewares/auth.middleware";

export const checkIn = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { employeeId } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: today,
        },
      },
    });

    if (existingAttendance && existingAttendance.checkIn) {
      res.status(400).json({
        success: false,
        message: "Already checked in today",
      });
      return;
    }

    const checkInTime = new Date();

    // Standard office time: 9:00 AM
    const standardTime = new Date(checkInTime);
    standardTime.setHours(9, 0, 0, 0);

    const lateBy =
      checkInTime > standardTime
        ? Math.floor((checkInTime.getTime() - standardTime.getTime()) / 60000)
        : 0;

    const attendance = existingAttendance
      ? await prisma.attendance.update({
          where: { id: existingAttendance.id },
          data: {
            checkIn: checkInTime,
            status: lateBy > 0 ? "LATE" : "PRESENT",
            lateBy,
          },
        })
      : await prisma.attendance.create({
          data: {
            employeeId,
            date: today,
            checkIn: checkInTime,
            status: lateBy > 0 ? "LATE" : "PRESENT",
            lateBy,
          },
        });

    res.json({
      success: true,
      message: "Checked in successfully",
      data: attendance,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const checkOut = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { employeeId } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: today,
        },
      },
    });

    if (!attendance || !attendance.checkIn) {
      res.status(400).json({
        success: false,
        message: "Please check in first",
      });
      return;
    }

    if (attendance.checkOut) {
      res.status(400).json({
        success: false,
        message: "Already checked out today",
      });
      return;
    }

    const checkOutTime = new Date();
    const workHours =
      (checkOutTime.getTime() - attendance.checkIn.getTime()) /
      (1000 * 60 * 60);

    // Standard checkout: 6:00 PM
    const standardCheckout = new Date(checkOutTime);
    standardCheckout.setHours(18, 0, 0, 0);

    const earlyLeave =
      checkOutTime < standardCheckout
        ? Math.floor(
            (standardCheckout.getTime() - checkOutTime.getTime()) / 60000,
          )
        : 0;

    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut: checkOutTime,
        workHours: parseFloat(workHours.toFixed(2)),
        earlyLeave,
        status: workHours < 4 ? "HALF_DAY" : attendance.status,
      },
    });

    res.json({
      success: true,
      message: "Checked out successfully",
      data: updatedAttendance,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getMyAttendance = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { month, year } = req.query;
    const employeeId = req.body.employeeId || req.params.employeeId;

    const startDate =
      month && year
        ? new Date(Number(year), Number(month) - 1, 1)
        : new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const endDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      0,
    );

    const attendances = await prisma.attendance.findMany({
      where: {
        employeeId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: "desc" },
    });

    // Calculate stats
    const stats = {
      present: attendances.filter((a) => a.status === "PRESENT").length,
      absent: attendances.filter((a) => a.status === "ABSENT").length,
      late: attendances.filter((a) => a.status === "LATE").length,
      halfDay: attendances.filter((a) => a.status === "HALF_DAY").length,
      totalWorkHours: attendances.reduce(
        (sum, a) => sum + (a.workHours || 0),
        0,
      ),
    };

    res.json({
      success: true,
      data: {
        attendances,
        stats,
      },
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getTodayAttendance = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { employeeId } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: today,
        },
      },
    });

    res.json({
      success: true,
      data: attendance,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getTeamAttendance = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendances = await prisma.attendance.findMany({
      where: {
        date: today,
        employee: {
          organisation: {
            tenantId: req.user!.tenantId!,
          },
        },
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            department: true,
          },
        },
      },
      orderBy: {
        checkIn: "asc",
      },
    });

    res.json({
      success: true,
      data: attendances,
    });
    return;
  } catch (error) {
    next(error);
  }
};

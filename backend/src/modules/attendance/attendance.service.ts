import { prisma } from "../../config/database";
import { BadRequestError } from "../../shared/errors";

import {
  AttendanceDto,
  AttendanceWithFullEmployeeDto,
  CheckInInput,
  CheckOutInput,
  MyAttendanceDto,
} from "../../shared/types/attendance.types";

/**
 * ========================================
 * ATTENDANCE SERVICE
 * ========================================
 * Location: backend/src/modules/attendance/attendance.service.ts
 */

export class AttendanceService {
  /**
   * Check in
   */
  async checkIn(data: CheckInInput): Promise<AttendanceDto> {
    const { employeeId } = data;
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
      throw new BadRequestError("Already checked in today");
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

    return attendance;
  }

  /**
   * Check out
   */
  async checkOut(data: CheckOutInput): Promise<AttendanceDto> {
    const { employeeId } = data;
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
      throw new BadRequestError("Please check in first");
    }

    if (attendance.checkOut) {
      throw new BadRequestError("Already checked out today");
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

    return updatedAttendance;
  }

  /**
   * Get my attendance
   */
  async getMyAttendance(
    employeeId: string,
    month?: number,
    year?: number,
  ): Promise<MyAttendanceDto> {
    const startDate =
      month && year
        ? new Date(year, month - 1, 1)
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

    return {
      attendances,
      stats,
    };
  }

  /**
   * Get today's attendance for an employee
   */
  async getTodayAttendance(employeeId: string): Promise<AttendanceDto | null> {
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

    return attendance;
  }

  /**
   * Get team attendance for today
   */
  async getTeamAttendance(
    tenantId: string,
  ): Promise<AttendanceWithFullEmployeeDto[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendances = await prisma.attendance.findMany({
      where: {
        date: today,
        employee: {
          organisation: {
            tenantId,
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

    return attendances as AttendanceWithFullEmployeeDto[];
  }
}

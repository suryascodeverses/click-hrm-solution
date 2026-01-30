import { prisma } from "../../config/database";
import { NotFoundError, BadRequestError } from "../../shared/errors";

import type {
  ApplyLeaveRequestDto,
  RejectLeaveRequestDto,
  CreateLeaveTypeRequestDto,
  LeaveDetailDto,
  LeaveBalanceDto,
  LeaveTypeDto,
} from "@arm/shared";

/**
 * ========================================
 * LEAVE SERVICE
 * ========================================
 * Location: backend/src/modules/leave/leave.service.ts
 */

export class LeaveService {
  /**
   * Apply for leave
   */
  async applyLeave(data: ApplyLeaveRequestDto): Promise<LeaveDetailDto> {
    const { employeeId, leaveTypeId, startDate, endDate, reason, days } = data;

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
      throw new BadRequestError("Insufficient leave balance");
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
        leaveType: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
          },
        },
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeCode: true,
            department: true,
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

    return leave as LeaveDetailDto;
  }

  /**
   * Approve leave
   */
  async approveLeave(
    leaveId: string,
    approverId: string,
  ): Promise<LeaveDetailDto> {
    const leave = await prisma.leave.findUnique({
      where: { id: leaveId },
      include: {
        employee: true,
        leaveType: true,
      },
    });

    if (!leave) {
      throw new NotFoundError("Leave not found");
    }

    if (leave.status !== "PENDING") {
      throw new BadRequestError("Leave already processed");
    }

    // Update leave status
    const updatedLeave = await prisma.leave.update({
      where: { id: leaveId },
      data: {
        status: "APPROVED",
        approvedBy: approverId,
        approvedAt: new Date(),
      },
      include: {
        leaveType: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
          },
        },
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeCode: true,
            department: true,
          },
        },
        approver: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
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

    return updatedLeave as LeaveDetailDto;
  }

  /**
   * Reject leave
   */
  async rejectLeave(
    leaveId: string,
    approverId: string,
    data: RejectLeaveRequestDto,
  ): Promise<LeaveDetailDto> {
    const { rejectedReason } = data;

    const leave = await prisma.leave.findUnique({
      where: { id: leaveId },
    });

    if (!leave || leave.status !== "PENDING") {
      throw new BadRequestError("Invalid leave or already processed");
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
      include: {
        leaveType: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
          },
        },
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeCode: true,
            department: true,
          },
        },
        approver: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
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

    return updatedLeave as LeaveDetailDto;
  }

  /**
   * Get employee's leaves
   */
  async getMyLeaves(employeeId: string): Promise<LeaveDetailDto[]> {
    const leaves = await prisma.leave.findMany({
      where: { employeeId },
      include: {
        leaveType: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
          },
        },
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeCode: true,
            department: true,
          },
        },
        approver: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { appliedAt: "desc" },
    });

    return leaves as LeaveDetailDto[];
  }

  /**
   * Get employee's leave balance
   */
  async getMyLeaveBalance(employeeId: string): Promise<LeaveBalanceDto[]> {
    const currentYear = new Date().getFullYear();

    const balances = await prisma.leaveBalance.findMany({
      where: {
        employeeId,
        year: currentYear,
      },
      include: {
        leaveType: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
          },
        },
      },
    });

    return balances as LeaveBalanceDto[];
  }

  /**
   * Get all pending leaves (for managers/HR)
   */
  async getPendingLeaves(tenantId: string): Promise<LeaveDetailDto[]> {
    const leaves = await prisma.leave.findMany({
      where: {
        status: "PENDING",
        employee: {
          organisation: {
            tenantId,
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
        leaveType: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
          },
        },
      },
      orderBy: { appliedAt: "desc" },
    });

    return leaves as LeaveDetailDto[];
  }

  /**
   * Get active leave types
   */
  async getLeaveTypes(tenantId: string): Promise<LeaveTypeDto[]> {
    const leaveTypes = await prisma.leaveType.findMany({
      where: {
        tenantId,
        isActive: true,
      },
    });

    return leaveTypes;
  }

  /**
   * Create leave type
   */
  async createLeaveType(
    tenantId: string,
    data: CreateLeaveTypeRequestDto,
  ): Promise<LeaveTypeDto> {
    const {
      name,
      code,
      defaultDays,
      carryForward,
      maxCarryForward,
      color,
      description,
    } = data;

    const leaveType = await prisma.leaveType.create({
      data: {
        tenantId,
        name,
        code: code.toUpperCase(),
        defaultDays,
        carryForward,
        maxCarryForward,
        color,
        description,
      },
    });

    return leaveType;
  }
}

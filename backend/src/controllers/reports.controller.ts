import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { AuthRequest } from "../middlewares/auth.middleware";

export const getAttendanceReport = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { month, year, departmentId } = req.query;
    const monthNum = parseInt(month as string);
    const yearNum = parseInt(year as string);

    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0);

    const where: any = {
      employee: {
        organisation: {
          tenantId: req.user!.tenantId!,
        },
      },
      date: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (departmentId) {
      where.employee.departmentId = departmentId as string;
    }

    const attendances = await prisma.attendance.findMany({
      where,
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
    });

    // Group by employee
    const employeeMap = new Map();
    attendances.forEach((att) => {
      const key = att.employee.id;
      if (!employeeMap.has(key)) {
        employeeMap.set(key, {
          employee: att.employee,
          present: 0,
          absent: 0,
          late: 0,
          onLeave: 0,
          totalHours: 0,
        });
      }
      const stats = employeeMap.get(key);
      if (att.status === "PRESENT") stats.present++;
      if (att.status === "ABSENT") stats.absent++;
      if (att.status === "LATE") stats.late++;
      if (att.status === "ON_LEAVE") stats.onLeave++;
      if (att.workHours) stats.totalHours += att.workHours;
    });

    const report = Array.from(employeeMap.values());

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

export const getLeaveReport = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { year } = req.query;
    const currentYear = year
      ? parseInt(year as string)
      : new Date().getFullYear();

    const employees = await prisma.employee.findMany({
      where: {
        organisation: {
          tenantId: req.user!.tenantId!,
        },
        status: "ACTIVE",
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        employeeCode: true,
        department: true,
        leaveBalances: {
          where: { year: currentYear },
          include: { leaveType: true },
        },
      },
    });

    res.json({
      success: true,
      data: employees,
    });
  } catch (error) {
    next(error);
  }
};

export const getEmployeeHeadcount = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const departments = await prisma.department.findMany({
      where: {
        organisation: {
          tenantId: req.user!.tenantId!,
        },
      },
      include: {
        _count: {
          select: {
            employees: true,
          },
        },
      },
    });

    const headcount = departments.map((dept) => ({
      department: dept.name,
      employees: dept._count.employees,
    }));

    // Get total and by status
    const statusCounts = await prisma.employee.groupBy({
      by: ["status"],
      where: {
        organisation: {
          tenantId: req.user!.tenantId!,
        },
      },
      _count: true,
    });

    const employmentTypeCounts = await prisma.employee.groupBy({
      by: ["employmentType"],
      where: {
        organisation: {
          tenantId: req.user!.tenantId!,
        },
      },
      _count: true,
    });

    res.json({
      success: true,
      data: {
        byDepartment: headcount,
        byStatus: statusCounts,
        byEmploymentType: employmentTypeCounts,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPayrollReport = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { month, year } = req.query;
    const monthNum = parseInt(month as string);
    const yearNum = parseInt(year as string);

    const payslips = await prisma.payslip.findMany({
      where: {
        month: monthNum,
        year: yearNum,
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
      },
    });

    // Calculate totals
    const totals = {
      totalEarnings: 0,
      totalDeductions: 0,
      netPay: 0,
    };

    payslips.forEach((p) => {
      totals.totalEarnings += parseFloat(p.totalEarnings.toString());
      totals.totalDeductions += parseFloat(p.totalDeductions.toString());
      totals.netPay += parseFloat(p.netPay.toString());
    });

    // Group by department
    const deptMap = new Map();
    payslips.forEach((p) => {
      const deptName = p.employee.department?.name || "Unassigned";
      if (!deptMap.has(deptName)) {
        deptMap.set(deptName, {
          department: deptName,
          employees: 0,
          totalCost: 0,
        });
      }
      const deptData = deptMap.get(deptName);
      deptData.employees++;
      deptData.totalCost += parseFloat(p.netPay.toString());
    });

    res.json({
      success: true,
      data: {
        payslips,
        totals,
        byDepartment: Array.from(deptMap.values()),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardAnalytics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today's attendance
    const todayAttendance = await prisma.attendance.count({
      where: {
        date: today,
        employee: {
          organisation: {
            tenantId: req.user!.tenantId!,
          },
        },
      },
    });

    // Pending leaves
    const pendingLeaves = await prisma.leave.count({
      where: {
        status: "PENDING",
        employee: {
          organisation: {
            tenantId: req.user!.tenantId!,
          },
        },
      },
    });

    // Total employees
    const totalEmployees = await prisma.employee.count({
      where: {
        organisation: {
          tenantId: req.user!.tenantId!,
        },
        status: "ACTIVE",
      },
    });

    // Attendance trend (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      return date;
    }).reverse();

    const attendanceTrend = await Promise.all(
      last7Days.map(async (date) => {
        const count = await prisma.attendance.count({
          where: {
            date,
            status: "PRESENT",
            employee: {
              organisation: {
                tenantId: req.user!.tenantId!,
              },
            },
          },
        });
        return {
          date: date.toISOString().split("T")[0],
          present: count,
        };
      }),
    );

    res.json({
      success: true,
      data: {
        todayAttendance,
        pendingLeaves,
        totalEmployees,
        attendanceTrend,
      },
    });
  } catch (error) {
    next(error);
  }
};

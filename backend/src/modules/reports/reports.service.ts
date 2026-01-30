import { prisma } from "../../config/database";

import type {
  AttendanceReportDto,
  LeaveReportEmployeeDto,
  HeadcountReportDto,
  PayrollReportDto,
  DashboardAnalyticsDto,
} from "@arm/shared";

/**
 * ========================================
 * REPORTS SERVICE
 * ========================================
 * Location: backend/src/modules/reports/reports.service.ts
 */

export class ReportsService {
  /**
   * Get attendance report
   */
  async getAttendanceReport(
    tenantId: string,
    month: number,
    year: number,
    departmentId?: string,
  ): Promise<AttendanceReportDto[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const where: any = {
      employee: {
        organisation: { tenantId },
      },
      date: { gte: startDate, lte: endDate },
    };

    if (departmentId) {
      where.employee.departmentId = departmentId;
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

    return Array.from(employeeMap.values());
  }

  /**
   * Get leave report
   */
  async getLeaveReport(
    tenantId: string,
    year?: number,
  ): Promise<LeaveReportEmployeeDto[]> {
    const currentYear = year || new Date().getFullYear();

    const employees = await prisma.employee.findMany({
      where: {
        organisation: { tenantId },
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
          include: {
            leaveType: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });

    return employees as LeaveReportEmployeeDto[];
  }

  /**
   * Get employee headcount report
   */
  async getEmployeeHeadcount(tenantId: string): Promise<HeadcountReportDto> {
    const departments = await prisma.department.findMany({
      where: {
        organisation: { tenantId },
      },
      include: {
        _count: {
          select: { employees: true },
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
        organisation: { tenantId },
      },
      _count: true,
    });

    const employmentTypeCounts = await prisma.employee.groupBy({
      by: ["employmentType"],
      where: {
        organisation: { tenantId },
      },
      _count: true,
    });

    return {
      byDepartment: headcount,
      byStatus: statusCounts,
      byEmploymentType: employmentTypeCounts,
    };
  }

  /**
   * Get payroll report
   */
  async getPayrollReport(
    tenantId: string,
    month: number,
    year: number,
  ): Promise<PayrollReportDto> {
    const payslips = await prisma.payslip.findMany({
      where: {
        month,
        year,
        employee: {
          organisation: { tenantId },
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

    return {
      payslips,
      totals,
      byDepartment: Array.from(deptMap.values()),
    };
  }

  /**
   * Get dashboard analytics
   */
  async getDashboardAnalytics(
    tenantId: string,
  ): Promise<DashboardAnalyticsDto> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today's attendance
    const todayAttendance = await prisma.attendance.count({
      where: {
        date: today,
        employee: {
          organisation: { tenantId },
        },
      },
    });

    // Pending leaves
    const pendingLeaves = await prisma.leave.count({
      where: {
        status: "PENDING",
        employee: {
          organisation: { tenantId },
        },
      },
    });

    // Total employees
    const totalEmployees = await prisma.employee.count({
      where: {
        organisation: { tenantId },
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
              organisation: { tenantId },
            },
          },
        });
        return {
          date: date.toISOString().split("T")[0],
          present: count,
        };
      }),
    );

    return {
      todayAttendance,
      pendingLeaves,
      totalEmployees,
      attendanceTrend,
    };
  }
}

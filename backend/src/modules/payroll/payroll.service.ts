import { prisma } from "../../config/database";
import { NotFoundError } from "../../shared/errors";
import { Decimal } from "@prisma/client/runtime/library";

import type {
  CreateSalaryStructureRequestDto,
  UpdatePayslipStatusRequestDto,
  SalaryStructureDto,
  PayslipDto,
  PayslipDetailDto,
  PayslipListItemDto,
  GeneratePayslipsResponseDto,
} from "@arm/shared";

/**
 * ========================================
 * PAYROLL SERVICE
 * ========================================
 * Location: backend/src/modules/payroll/payroll.service.ts
 */

export class PayrollService {
  /**
   * Create or update salary structure
   */
  async createSalaryStructure(
    data: CreateSalaryStructureRequestDto,
  ): Promise<SalaryStructureDto> {
    const {
      employeeId,
      basicSalary,
      hra,
      conveyance,
      medical,
      specialAllowance,
    } = data;

    const ctc = basicSalary + hra + conveyance + medical + specialAllowance;

    const salaryStructure = await prisma.salaryStructure.upsert({
      where: { employeeId },
      update: {
        basicSalary,
        hra,
        conveyance,
        medical,
        specialAllowance,
        ctc,
        effectiveFrom: new Date(),
      },
      create: {
        employeeId,
        basicSalary,
        hra,
        conveyance,
        medical,
        specialAllowance,
        ctc,
        effectiveFrom: new Date(),
      },
    });

    return salaryStructure as SalaryStructureDto;
  }

  /**
   * Get salary structure by employee ID
   */
  async getSalaryStructure(
    employeeId: string,
  ): Promise<SalaryStructureDto | null> {
    const salaryStructure = await prisma.salaryStructure.findUnique({
      where: { employeeId },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
      },
    });

    return salaryStructure as SalaryStructureDto | null;
  }

  /**
   * Generate payslips for a month
   */
  async generatePayslips(
    tenantId: string,
    month: number,
    year: number,
  ): Promise<GeneratePayslipsResponseDto> {
    // Get all active employees with salary structure
    const employees = await prisma.employee.findMany({
      where: {
        status: "ACTIVE",
        organisation: { tenantId },
        salaryStructure: { isNot: null },
      },
      include: {
        salaryStructure: true,
      },
    });

    const payslips: any[] = [];

    for (const emp of employees) {
      // Check if payslip already exists
      const existing = await prisma.payslip.findUnique({
        where: {
          employeeId_month_year: {
            employeeId: emp.id,
            month,
            year,
          },
        },
      });

      if (existing) continue;

      // Get attendance for the month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const attendances = await prisma.attendance.findMany({
        where: {
          employeeId: emp.id,
          date: { gte: startDate, lte: endDate },
        },
      });

      // Calculate days
      const workingDays = endDate.getDate();
      const presentDays = attendances.filter((a) =>
        ["PRESENT", "LATE"].includes(a.status),
      ).length;
      const leaveDays = attendances.filter(
        (a) => a.status === "ON_LEAVE",
      ).length;
      const absentDays = workingDays - presentDays - leaveDays;

      // Calculate pro-rated salary
      const attendanceRatio = (presentDays + leaveDays) / workingDays;

      const basicPay =
        parseFloat(emp.salaryStructure!.basicSalary.toString()) *
        attendanceRatio;
      const hra =
        parseFloat(emp.salaryStructure!.hra.toString()) * attendanceRatio;
      const conveyance =
        parseFloat(emp.salaryStructure!.conveyance.toString()) *
        attendanceRatio;
      const medical =
        parseFloat(emp.salaryStructure!.medical.toString()) * attendanceRatio;
      const specialAllowance =
        parseFloat(emp.salaryStructure!.specialAllowance.toString()) *
        attendanceRatio;

      const totalEarnings =
        basicPay + hra + conveyance + medical + specialAllowance;

      // Calculate deductions
      const providentFund = basicPay * 0.12; // 12% of basic
      const professionalTax = 200; // Fixed PT
      const totalDeductions = providentFund + professionalTax;

      const netPay = totalEarnings - totalDeductions;

      // Create payslip
      const payslip = await prisma.payslip.create({
        data: {
          employeeId: emp.id,
          salaryStructureId: emp.salaryStructure!.id,
          month,
          year,
          workingDays,
          presentDays,
          absentDays,
          leaveDays,
          basicPay: new Decimal(basicPay.toFixed(2)),
          hra: new Decimal(hra.toFixed(2)),
          conveyance: new Decimal(conveyance.toFixed(2)),
          medical: new Decimal(medical.toFixed(2)),
          specialAllowance: new Decimal(specialAllowance.toFixed(2)),
          bonus: new Decimal(0),
          totalEarnings: new Decimal(totalEarnings.toFixed(2)),
          providentFund: new Decimal(providentFund.toFixed(2)),
          professionalTax: new Decimal(professionalTax.toFixed(2)),
          incomeTax: new Decimal(0),
          otherDeductions: new Decimal(0),
          totalDeductions: new Decimal(totalDeductions.toFixed(2)),
          netPay: new Decimal(netPay.toFixed(2)),
          status: "DRAFT",
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

      payslips.push(payslip);
    }

    return {
      message: `Generated ${payslips.length} payslips`,
      count: payslips.length,
      payslips,
    };
  }

  /**
   * Get payslips for an employee
   */
  async getPayslips(employeeId: string): Promise<PayslipDto[]> {
    const payslips = await prisma.payslip.findMany({
      where: { employeeId },
      include: {
        salaryStructure: true,
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    return payslips as PayslipDto[];
  }

  /**
   * Get payslip by ID
   */
  async getPayslip(payslipId: string): Promise<PayslipDetailDto> {
    const payslip = await prisma.payslip.findUnique({
      where: { id: payslipId },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeCode: true,
            department: true,
            designation: true,
            organisation: true,
          },
        },
        salaryStructure: true,
      },
    });

    if (!payslip) {
      throw new NotFoundError("Payslip not found");
    }

    return payslip as PayslipDetailDto;
  }

  /**
   * Get all payslips (with filters)
   */
  async getAllPayslips(
    tenantId: string,
    month?: number,
    year?: number,
  ): Promise<PayslipListItemDto[]> {
    const where: any = {
      employee: {
        organisation: { tenantId },
      },
    };

    if (month) where.month = month;
    if (year) where.year = year;

    const payslips = await prisma.payslip.findMany({
      where,
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
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    return payslips as PayslipListItemDto[];
  }

  /**
   * Update payslip status
   */
  async updatePayslipStatus(
    payslipId: string,
    data: UpdatePayslipStatusRequestDto,
  ): Promise<PayslipDto> {
    const { status } = data;

    const updateData: any = { status };
    if (status === "PAID") {
      updateData.paidOn = new Date();
    }

    const payslip = await prisma.payslip.update({
      where: { id: payslipId },
      data: updateData,
    });

    return payslip as PayslipDto;
  }
}

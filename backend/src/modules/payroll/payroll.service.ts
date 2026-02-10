import { prisma } from "../../config/database";
import { NotFoundError } from "../../shared/errors";
import { Decimal } from "@prisma/client/runtime/library";
import {
  CreateSalaryStructureRequestDto,
  GeneratePayslipsResponseDto,
  PayslipDetailDto,
  PayslipDto,
  PayslipListItemDto,
  PayslipWithFullDetailsDto,
  SalaryStructureDto,
  UpdatePayslipStatusRequestDto,
} from "../../shared/types/payroll.types";

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

    return {
      ...salaryStructure,
      hra: salaryStructure.hra.toNumber(),
      basicSalary: salaryStructure.basicSalary.toNumber(),
      specialAllowance: salaryStructure.specialAllowance.toNumber(),
      conveyance: salaryStructure.conveyance.toNumber(),
      medical: salaryStructure.medical.toNumber(),
      ctc: salaryStructure.ctc.toNumber(),
    } as SalaryStructureDto;
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

    return payslips.map((p) => ({
      ...p,
      hra: p.hra.toNumber(),
      basicPay: p.basicPay.toNumber(),
      conveyance: p.conveyance.toNumber(),
      medical: p.medical.toNumber(),
      specialAllowance: p.specialAllowance.toNumber(),
      totalEarnings: p.totalEarnings.toNumber(),
      providentFund: p.providentFund.toNumber(),
      professionalTax: p.professionalTax.toNumber(),
      otherDeductions: p.otherDeductions.toNumber(),
      totalDeductions: p.totalDeductions.toNumber(),
      netPay: p.netPay.toNumber(),
      bonus: p.bonus.toNumber(),
      incomeTax: p.incomeTax.toNumber(),
    })) as PayslipDto[];
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

    return {
      ...payslip,
      hra: payslip.hra.toNumber(),
      basicPay: payslip.basicPay.toNumber(),
      conveyance: payslip.conveyance.toNumber(),
      medical: payslip.medical.toNumber(),
      specialAllowance: payslip.specialAllowance.toNumber(),
      totalEarnings: payslip.totalEarnings.toNumber(),
      providentFund: payslip.providentFund.toNumber(),
      professionalTax: payslip.professionalTax.toNumber(),
      otherDeductions: payslip.otherDeductions.toNumber(),
      totalDeductions: payslip.totalDeductions.toNumber(),
      netPay: payslip.netPay.toNumber(),
      bonus: payslip.bonus.toNumber(),
      incomeTax: payslip.incomeTax.toNumber(),
      salaryStructure: {
        ...payslip.salaryStructure,
        hra: payslip.salaryStructure.hra.toNumber(),
        basicSalary: payslip.salaryStructure.basicSalary.toNumber(),
        specialAllowance: payslip.salaryStructure.specialAllowance.toNumber(),
        conveyance: payslip.salaryStructure.conveyance.toNumber(),
        medical: payslip.salaryStructure.medical.toNumber(),
        ctc: payslip.salaryStructure.ctc.toNumber(),
      },
    } as PayslipDetailDto;
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
    return payslips.map((p) => ({
      ...p,
      hra: p.hra.toNumber(),
      basicPay: p.basicPay.toNumber(),
      conveyance: p.conveyance.toNumber(),
      medical: p.medical.toNumber(),
      specialAllowance: p.specialAllowance.toNumber(),
      totalEarnings: p.totalEarnings.toNumber(),
      providentFund: p.providentFund.toNumber(),
      professionalTax: p.professionalTax.toNumber(),
      otherDeductions: p.otherDeductions.toNumber(),
      totalDeductions: p.totalDeductions.toNumber(),
      netPay: p.netPay.toNumber(),
    })) as PayslipListItemDto[];
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

    return {
      ...payslip,
      hra: payslip.hra.toNumber(),
      basicSalary: payslip.basicPay.toNumber(),
      specialAllowance: payslip.specialAllowance.toNumber(),
      conveyance: payslip.conveyance.toNumber(),
      medical: payslip.medical.toNumber(),
      ctc: payslip.netPay.toNumber(),
      basicPay: payslip.basicPay.toNumber(),

      totalEarnings: payslip.totalEarnings.toNumber(),
      providentFund: payslip.providentFund.toNumber(),
      professionalTax: payslip.professionalTax.toNumber(),
      otherDeductions: payslip.otherDeductions.toNumber(),
      totalDeductions: payslip.totalDeductions.toNumber(),
      netPay: payslip.netPay.toNumber(),
      bonus: payslip.bonus.toNumber(),
      incomeTax: payslip.incomeTax.toNumber(),
    } as PayslipDto;
  }
}

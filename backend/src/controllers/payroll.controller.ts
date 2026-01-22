import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { AuthRequest } from "../middlewares/auth.middleware";
import { Decimal } from "@prisma/client/runtime/library";

export const createSalaryStructure = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      employeeId,
      basicSalary,
      hra,
      conveyance,
      medical,
      specialAllowance,
    } = req.body;

    const ctc =
      parseFloat(basicSalary) +
      parseFloat(hra) +
      parseFloat(conveyance) +
      parseFloat(medical) +
      parseFloat(specialAllowance);

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

    res.status(201).json({
      success: true,
      message: "Salary structure saved successfully",
      data: salaryStructure,
    });
  } catch (error) {
    next(error);
  }
};

export const getSalaryStructure = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { employeeId } = req.params;

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

    res.json({
      success: true,
      data: salaryStructure,
    });
  } catch (error) {
    next(error);
  }
};

export const generatePayslips = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { month, year } = req.params;
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    // Get all active employees with salary structure
    const employees = await prisma.employee.findMany({
      where: {
        status: "ACTIVE",
        organisation: {
          tenantId: req.user!.tenantId!,
        },
        salaryStructure: {
          isNot: null,
        },
      },
      include: {
        salaryStructure: true,
      },
    });

    const payslips = [];

    for (const emp of employees) {
      // Check if payslip already exists
      const existing = await prisma.payslip.findUnique({
        where: {
          employeeId_month_year: {
            employeeId: emp.id,
            month: monthNum,
            year: yearNum,
          },
        },
      });

      if (existing) continue;

      // Get attendance for the month
      const startDate = new Date(yearNum, monthNum - 1, 1);
      const endDate = new Date(yearNum, monthNum, 0);

      const attendances = await prisma.attendance.findMany({
        where: {
          employeeId: emp.id,
          date: {
            gte: startDate,
            lte: endDate,
          },
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
          month: monthNum,
          year: yearNum,
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
            },
          },
        },
      });

      payslips.push(payslip);
    }

    res.json({
      success: true,
      message: `Generated ${payslips.length} payslips`,
      data: payslips,
    });
  } catch (error) {
    next(error);
  }
};

export const getPayslips = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { employeeId } = req.params;

    const payslips = await prisma.payslip.findMany({
      where: { employeeId },
      include: {
        salaryStructure: true,
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    res.json({
      success: true,
      data: payslips,
    });
  } catch (error) {
    next(error);
  }
};

export const getPayslip = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { payslipId } = req.params;

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
      return res.status(404).json({
        success: false,
        message: "Payslip not found",
      });
    }

    res.json({
      success: true,
      data: payslip,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPayslips = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { month, year } = req.query;

    const where: any = {
      employee: {
        organisation: {
          tenantId: req.user!.tenantId!,
        },
      },
    };

    if (month) where.month = parseInt(month as string);
    if (year) where.year = parseInt(year as string);

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

    res.json({
      success: true,
      data: payslips,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePayslipStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { payslipId } = req.params;
    const { status } = req.body;

    const data: any = { status };
    if (status === "PAID") {
      data.paidOn = new Date();
    }

    const payslip = await prisma.payslip.update({
      where: { id: payslipId },
      data,
    });

    res.json({
      success: true,
      message: "Payslip status updated",
      data: payslip,
    });
  } catch (error) {
    next(error);
  }
};

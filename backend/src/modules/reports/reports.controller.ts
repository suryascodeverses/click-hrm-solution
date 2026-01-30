import {
  Route,
  Tags,
  Get,
  Query,
  Security,
  Request,
  SuccessResponse,
  Controller,
} from "tsoa";
import { Request as ExpressRequest } from "express";
import { ReportsService } from "./reports.service";

import type {
  AttendanceReportDto,
  LeaveReportEmployeeDto,
  HeadcountReportDto,
  PayrollReportDto,
  DashboardAnalyticsDto,
  ApiResponse,
} from "@arm/shared";

/**
 * ========================================
 * REPORTS CONTROLLER
 * ========================================
 * Location: backend/src/modules/reports/reports.controller.ts
 */

@Route("reports")
@Tags("Reports")
@Security("jwt")
export class ReportsController extends Controller {
  private service: ReportsService;

  constructor() {
    super();
    this.service = new ReportsService();
  }

  /**
   * Get attendance report
   */
  @Get("attendance")
  @SuccessResponse(200, "Attendance report retrieved")
  public async getAttendanceReport(
    @Request() request: ExpressRequest & { user?: any },
    @Query() month: number,
    @Query() year: number,
    @Query() departmentId?: string,
  ): Promise<ApiResponse<AttendanceReportDto[]>> {
    const tenantId = request.user?.tenantId;

    if (!tenantId) {
      this.setStatus(403);
      throw new Error("Tenant ID required");
    }

    const result = await this.service.getAttendanceReport(
      tenantId,
      month,
      year,
      departmentId,
    );

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Get leave report
   */
  @Get("leaves")
  @SuccessResponse(200, "Leave report retrieved")
  public async getLeaveReport(
    @Request() request: ExpressRequest & { user?: any },
    @Query() year?: number,
  ): Promise<ApiResponse<LeaveReportEmployeeDto[]>> {
    const tenantId = request.user?.tenantId;

    if (!tenantId) {
      this.setStatus(403);
      throw new Error("Tenant ID required");
    }

    const result = await this.service.getLeaveReport(tenantId, year);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Get employee headcount report
   */
  @Get("headcount")
  @SuccessResponse(200, "Headcount report retrieved")
  public async getEmployeeHeadcount(
    @Request() request: ExpressRequest & { user?: any },
  ): Promise<ApiResponse<HeadcountReportDto>> {
    const tenantId = request.user?.tenantId;

    if (!tenantId) {
      this.setStatus(403);
      throw new Error("Tenant ID required");
    }

    const result = await this.service.getEmployeeHeadcount(tenantId);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Get payroll report
   */
  @Get("payroll")
  @SuccessResponse(200, "Payroll report retrieved")
  public async getPayrollReport(
    @Request() request: ExpressRequest & { user?: any },
    @Query() month: number,
    @Query() year: number,
  ): Promise<ApiResponse<PayrollReportDto>> {
    const tenantId = request.user?.tenantId;

    if (!tenantId) {
      this.setStatus(403);
      throw new Error("Tenant ID required");
    }

    const result = await this.service.getPayrollReport(tenantId, month, year);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Get dashboard analytics
   */
  @Get("analytics/dashboard")
  @SuccessResponse(200, "Dashboard analytics retrieved")
  public async getDashboardAnalytics(
    @Request() request: ExpressRequest & { user?: any },
  ): Promise<ApiResponse<DashboardAnalyticsDto>> {
    const tenantId = request.user?.tenantId;

    if (!tenantId) {
      this.setStatus(403);
      throw new Error("Tenant ID required");
    }

    const result = await this.service.getDashboardAnalytics(tenantId);

    return {
      success: true,
      data: result,
    };
  }
}

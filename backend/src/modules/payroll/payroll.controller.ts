import {
  Route,
  Tags,
  Post,
  Get,
  Put,
  Body,
  Path,
  Query,
  Security,
  Request,
  SuccessResponse,
  Response as TsoaResponse,
  Controller,
} from "tsoa";
import { Request as ExpressRequest } from "express";
import { PayrollService } from "./payroll.service";
import {
  CreateSalaryStructureValidationSchema,
  UpdatePayslipStatusValidationSchema,
} from "./payroll.types";

import type {
  CreateSalaryStructureRequestDto,
  UpdatePayslipStatusRequestDto,
  SalaryStructureDto,
  PayslipDto,
  PayslipDetailDto,
  PayslipListItemDto,
  GeneratePayslipsResponseDto,
  ApiResponse,
  ApiErrorResponse,
} from "@arm/shared";

/**
 * ========================================
 * PAYROLL CONTROLLER
 * ========================================
 * Location: backend/src/modules/payroll/payroll.controller.ts
 */

@Route("payroll")
@Tags("Payroll")
@Security("jwt")
export class PayrollController extends Controller {
  private service: PayrollService;

  constructor() {
    super();
    this.service = new PayrollService();
  }

  /**
   * Create or update salary structure
   */
  @Post("salary-structure")
  @SuccessResponse(201, "Salary structure saved")
  public async createSalaryStructure(
    @Body() body: CreateSalaryStructureRequestDto,
  ): Promise<ApiResponse<SalaryStructureDto>> {
    const validated = CreateSalaryStructureValidationSchema.parse(body);
    const result = await this.service.createSalaryStructure(validated);

    this.setStatus(201);

    return {
      success: true,
      message: "Salary structure saved successfully",
      data: result,
    };
  }

  /**
   * Get salary structure by employee ID
   */
  @Get("salary-structure/{employeeId}")
  @SuccessResponse(200, "Salary structure retrieved")
  public async getSalaryStructure(
    @Path() employeeId: string,
  ): Promise<ApiResponse<SalaryStructureDto | null>> {
    const result = await this.service.getSalaryStructure(employeeId);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Generate payslips for a month/year
   */
  @Post("payslips/generate/{month}/{year}")
  @SuccessResponse(200, "Payslips generated")
  public async generatePayslips(
    @Request() request: ExpressRequest & { user?: any },
    @Path() month: string,
    @Path() year: string,
  ): Promise<ApiResponse<GeneratePayslipsResponseDto>> {
    const tenantId = request.user?.tenantId;

    if (!tenantId) {
      this.setStatus(403);
      throw new Error("Tenant ID required");
    }

    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    const result = await this.service.generatePayslips(
      tenantId,
      monthNum,
      yearNum,
    );

    return {
      success: true,
      message: result.message,
      data: result,
    };
  }

  /**
   * Get payslips for an employee
   */
  @Get("payslips/employee/{employeeId}")
  @SuccessResponse(200, "Payslips retrieved")
  public async getPayslips(
    @Path() employeeId: string,
  ): Promise<ApiResponse<PayslipDto[]>> {
    const result = await this.service.getPayslips(employeeId);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Get payslip by ID
   */
  @Get("payslips/{payslipId}")
  @SuccessResponse(200, "Payslip retrieved")
  @TsoaResponse<ApiErrorResponse>(404, "Payslip not found")
  public async getPayslip(
    @Path() payslipId: string,
  ): Promise<ApiResponse<PayslipDetailDto>> {
    const result = await this.service.getPayslip(payslipId);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Get all payslips (with optional filters)
   */
  @Get("payslips")
  @SuccessResponse(200, "Payslips retrieved")
  public async getAllPayslips(
    @Request() request: ExpressRequest & { user?: any },
    @Query() month?: number,
    @Query() year?: number,
  ): Promise<ApiResponse<PayslipListItemDto[]>> {
    const tenantId = request.user?.tenantId;

    if (!tenantId) {
      this.setStatus(403);
      throw new Error("Tenant ID required");
    }

    const result = await this.service.getAllPayslips(tenantId, month, year);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Update payslip status
   */
  @Put("payslips/{payslipId}/status")
  @SuccessResponse(200, "Payslip status updated")
  public async updatePayslipStatus(
    @Path() payslipId: string,
    @Body() body: UpdatePayslipStatusRequestDto,
  ): Promise<ApiResponse<PayslipDto>> {
    const validated = UpdatePayslipStatusValidationSchema.parse(body);
    const result = await this.service.updatePayslipStatus(payslipId, validated);

    return {
      success: true,
      message: "Payslip status updated",
      data: result,
    };
  }
}

import {
  Route,
  Tags,
  Post,
  Get,
  Put,
  Delete,
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
import { EmployeeService } from "./employee.service";
import {
  CreateEmployeeValidationSchema,
  UpdateEmployeeValidationSchema,
} from "../../shared/types/employee.types";

import type {
  CreateEmployeeRequestDto,
  UpdateEmployeeRequestDto,
  EmployeeListItemDto,
  EmployeeDetailDto,
  CreateEmployeeResponseDto,
  ApiResponse,
  ApiErrorResponse,
} from "@arm/shared";

/**
 * ========================================
 * EMPLOYEE CONTROLLER
 * ========================================
 * Location: backend/src/modules/employee/employee.controller.ts
 */

@Route("employees")
@Tags("Employees")
@Security("jwt")
export class EmployeeController extends Controller {
  private service: EmployeeService;

  constructor() {
    super();
    this.service = new EmployeeService();
  }

  /**
   * Create employee
   */
  @Post()
  @SuccessResponse(201, "Employee created")
  @TsoaResponse<ApiErrorResponse>(400, "Validation error or email exists")
  public async createEmployee(
    @Request() request: ExpressRequest & { user?: any },
    @Body() body: CreateEmployeeRequestDto,
  ): Promise<ApiResponse<CreateEmployeeResponseDto>> {
    const tenantId = request.user?.tenantId;

    if (!tenantId) {
      this.setStatus(403);
      throw new Error("Tenant ID required");
    }

    const validated = CreateEmployeeValidationSchema.parse(body);
    const result = await this.service.createEmployee(tenantId, validated);

    this.setStatus(201);

    return {
      success: true,
      message: "Employee created successfully",
      data: result,
    };
  }

  /**
   * Get employees (with optional filters)
   */
  @Get()
  @SuccessResponse(200, "Employees retrieved")
  public async getEmployees(
    @Request() request: ExpressRequest & { user?: any },
    @Query() organisationId?: string,
    @Query() departmentId?: string,
    @Query() status?: string,
  ): Promise<ApiResponse<EmployeeListItemDto[]>> {
    const tenantId = request.user?.tenantId;

    if (!tenantId) {
      this.setStatus(403);
      throw new Error("Tenant ID required");
    }

    const result = await this.service.getEmployees(tenantId, {
      organisationId,
      departmentId,
      status,
    });

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Get employee by ID
   */
  @Get("{id}")
  @SuccessResponse(200, "Employee retrieved")
  @TsoaResponse<ApiErrorResponse>(404, "Employee not found")
  public async getEmployee(
    @Path() id: string,
  ): Promise<ApiResponse<EmployeeDetailDto>> {
    const result = await this.service.getEmployee(id);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Update employee
   */
  @Put("{id}")
  @SuccessResponse(200, "Employee updated")
  @TsoaResponse<ApiErrorResponse>(404, "Employee not found")
  public async updateEmployee(
    @Path() id: string,
    @Body() body: UpdateEmployeeRequestDto,
  ): Promise<ApiResponse<EmployeeDetailDto>> {
    const validated = UpdateEmployeeValidationSchema.parse(body);
    const result = await this.service.updateEmployee(id, validated);

    return {
      success: true,
      message: "Employee updated successfully",
      data: result,
    };
  }

  /**
   * Delete employee
   */
  @Delete("{id}")
  @SuccessResponse(200, "Employee deleted")
  @TsoaResponse<ApiErrorResponse>(404, "Employee not found")
  public async deleteEmployee(
    @Path() id: string,
  ): Promise<ApiResponse<{ message: string }>> {
    await this.service.deleteEmployee(id);

    return {
      success: true,
      message: "Employee deleted successfully",
      data: { message: "Employee deleted successfully" },
    };
  }
}

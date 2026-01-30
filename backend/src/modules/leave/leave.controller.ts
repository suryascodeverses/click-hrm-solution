import {
  Route,
  Tags,
  Post,
  Get,
  Put,
  Body,
  Path,
  Security,
  Request,
  SuccessResponse,
  Response as TsoaResponse,
  Controller,
} from "tsoa";
import { Request as ExpressRequest } from "express";
import { LeaveService } from "./leave.service";
import {
  ApplyLeaveValidationSchema,
  RejectLeaveValidationSchema,
  CreateLeaveTypeValidationSchema,
} from "./leave.types";

import type {
  ApplyLeaveRequestDto,
  RejectLeaveRequestDto,
  CreateLeaveTypeRequestDto,
  LeaveDetailDto,
  LeaveBalanceDto,
  LeaveTypeDto,
  ApiResponse,
  ApiErrorResponse,
} from "@arm/shared";

/**
 * ========================================
 * LEAVE CONTROLLER
 * ========================================
 * Location: backend/src/modules/leave/leave.controller.ts
 */

@Route("leaves")
@Tags("Leaves")
@Security("jwt")
export class LeaveController extends Controller {
  private service: LeaveService;

  constructor() {
    super();
    this.service = new LeaveService();
  }

  /**
   * Apply for leave
   */
  @Post("apply")
  @SuccessResponse(201, "Leave application submitted")
  @TsoaResponse<ApiErrorResponse>(
    400,
    "Insufficient balance or validation error",
  )
  public async applyLeave(
    @Body() body: ApplyLeaveRequestDto,
  ): Promise<ApiResponse<LeaveDetailDto>> {
    const validated = ApplyLeaveValidationSchema.parse(body);
    const result = await this.service.applyLeave(validated);

    this.setStatus(201);

    return {
      success: true,
      message: "Leave application submitted successfully",
      data: result,
    };
  }

  /**
   * Approve leave
   */
  @Put("{leaveId}/approve")
  @SuccessResponse(200, "Leave approved")
  @TsoaResponse<ApiErrorResponse>(404, "Leave not found")
  @TsoaResponse<ApiErrorResponse>(400, "Leave already processed")
  public async approveLeave(
    @Path() leaveId: string,
    @Request() request: ExpressRequest & { user?: any },
  ): Promise<ApiResponse<LeaveDetailDto>> {
    const approverId = request.user?.id;

    if (!approverId) {
      this.setStatus(401);
      throw new Error("Unauthorized");
    }

    const result = await this.service.approveLeave(leaveId, approverId);

    return {
      success: true,
      message: "Leave approved successfully",
      data: result,
    };
  }

  /**
   * Reject leave
   */
  @Put("{leaveId}/reject")
  @SuccessResponse(200, "Leave rejected")
  @TsoaResponse<ApiErrorResponse>(404, "Leave not found")
  @TsoaResponse<ApiErrorResponse>(400, "Leave already processed")
  public async rejectLeave(
    @Path() leaveId: string,
    @Request() request: ExpressRequest & { user?: any },
    @Body() body: RejectLeaveRequestDto,
  ): Promise<ApiResponse<LeaveDetailDto>> {
    const approverId = request.user?.id;

    if (!approverId) {
      this.setStatus(401);
      throw new Error("Unauthorized");
    }

    const validated = RejectLeaveValidationSchema.parse(body);
    const result = await this.service.rejectLeave(
      leaveId,
      approverId,
      validated,
    );

    return {
      success: true,
      message: "Leave rejected",
      data: result,
    };
  }

  /**
   * Get employee's leaves
   */
  @Get("employee/{employeeId}")
  @SuccessResponse(200, "Leaves retrieved")
  public async getMyLeaves(
    @Path() employeeId: string,
  ): Promise<ApiResponse<LeaveDetailDto[]>> {
    const result = await this.service.getMyLeaves(employeeId);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Get employee's leave balance
   */
  @Get("employee/{employeeId}/balance")
  @SuccessResponse(200, "Leave balance retrieved")
  public async getMyLeaveBalance(
    @Path() employeeId: string,
  ): Promise<ApiResponse<LeaveBalanceDto[]>> {
    const result = await this.service.getMyLeaveBalance(employeeId);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Get pending leaves (for managers/HR)
   */
  @Get("pending")
  @SuccessResponse(200, "Pending leaves retrieved")
  public async getPendingLeaves(
    @Request() request: ExpressRequest & { user?: any },
  ): Promise<ApiResponse<LeaveDetailDto[]>> {
    const tenantId = request.user?.tenantId;

    if (!tenantId) {
      this.setStatus(403);
      throw new Error("Tenant ID required");
    }

    const result = await this.service.getPendingLeaves(tenantId);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Get leave types
   */
  @Get("types")
  @SuccessResponse(200, "Leave types retrieved")
  public async getLeaveTypes(
    @Request() request: ExpressRequest & { user?: any },
  ): Promise<ApiResponse<LeaveTypeDto[]>> {
    const tenantId = request.user?.tenantId;

    if (!tenantId) {
      this.setStatus(403);
      throw new Error("Tenant ID required");
    }

    const result = await this.service.getLeaveTypes(tenantId);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Create leave type
   */
  @Post("types")
  @SuccessResponse(201, "Leave type created")
  public async createLeaveType(
    @Request() request: ExpressRequest & { user?: any },
    @Body() body: CreateLeaveTypeRequestDto,
  ): Promise<ApiResponse<LeaveTypeDto>> {
    const tenantId = request.user?.tenantId;

    if (!tenantId) {
      this.setStatus(403);
      throw new Error("Tenant ID required");
    }

    const validated = CreateLeaveTypeValidationSchema.parse(body);
    const result = await this.service.createLeaveType(tenantId, validated);

    this.setStatus(201);

    return {
      success: true,
      message: "Leave type created successfully",
      data: result,
    };
  }
}

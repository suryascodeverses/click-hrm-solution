import {
  Route,
  Tags,
  Post,
  Get,
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
import { AttendanceService } from "./attendance.service";
import {
  CheckInInput,
  CheckInValidationSchema,
  CheckOutValidationSchema,
} from "../../shared/types/attendance.types";

import type {
  CheckInRequestDto,
  CheckOutRequestDto,
  AttendanceDto,
  AttendanceWithEmployeeDto,
  MyAttendanceResponseDto,
  ApiResponse,
  ApiErrorResponse,
} from "@arm/shared";

/**
 * ========================================
 * ATTENDANCE CONTROLLER
 * ========================================
 * Location: backend/src/modules/attendance/attendance.controller.ts
 */

@Route("attendance")
@Tags("Attendance")
@Security("jwt")
export class AttendanceController extends Controller {
  private service: AttendanceService;

  constructor() {
    super();
    this.service = new AttendanceService();
  }

  /**
   * Check in
   */
  @Post("check-in")
  @SuccessResponse(200, "Checked in successfully")
  @TsoaResponse<ApiErrorResponse>(400, "Already checked in")
  public async checkIn(
    @Body() body: CheckInRequestDto,
  ): Promise<ApiResponse<AttendanceDto>> {
    const validated: CheckInInput = CheckInValidationSchema.parse(body);
    const result = await this.service.checkIn(validated);

    return {
      success: true,
      message: "Checked in successfully",
      data: result,
    };
  }

  /**
   * Check out
   */
  @Post("check-out")
  @SuccessResponse(200, "Checked out successfully")
  @TsoaResponse<ApiErrorResponse>(
    400,
    "Please check in first or already checked out",
  )
  public async checkOut(
    @Body() body: CheckOutRequestDto,
  ): Promise<ApiResponse<AttendanceDto>> {
    const validated = CheckOutValidationSchema.parse(body);
    const result = await this.service.checkOut(validated);

    return {
      success: true,
      message: "Checked out successfully",
      data: result,
    };
  }

  /**
   * Get my attendance
   */
  @Get("my/{employeeId}")
  @SuccessResponse(200, "Attendance retrieved")
  public async getMyAttendance(
    @Path() employeeId: string,
    @Query() month?: number,
    @Query() year?: number,
  ): Promise<ApiResponse<MyAttendanceResponseDto>> {
    const result = await this.service.getMyAttendance(employeeId, month, year);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Get today's attendance for an employee
   */
  @Get("today/{employeeId}")
  @SuccessResponse(200, "Today's attendance retrieved")
  public async getTodayAttendance(
    @Path() employeeId: string,
  ): Promise<ApiResponse<AttendanceDto | null>> {
    const result = await this.service.getTodayAttendance(employeeId);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Get team attendance for today
   */
  @Get("team")
  @SuccessResponse(200, "Team attendance retrieved")
  public async getTeamAttendance(
    @Request() request: ExpressRequest & { user?: any },
  ): Promise<ApiResponse<AttendanceWithEmployeeDto[]>> {
    const tenantId = request.user?.tenantId;

    if (!tenantId) {
      this.setStatus(403);
      throw new Error("Tenant ID required");
    }

    const result = await this.service.getTeamAttendance(tenantId);

    return {
      success: true,
      data: result,
    };
  }
}

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
  SuccessResponse,
  Response as TsoaResponse,
  Controller,
} from "tsoa";
import { DesignationService } from "./designation.service";
import {
  CreateDesignationValidationSchema,
  UpdateDesignationValidationSchema,
} from "../../shared/types/designation.types";

import type {
  CreateDesignationRequestDto,
  UpdateDesignationRequestDto,
  DesignationDto,
  DesignationListItemDto,
  ApiResponse,
  ApiErrorResponse,
} from "@arm/shared";

/**
 * ========================================
 * DESIGNATION CONTROLLER
 * ========================================
 * Location: backend/src/modules/designation/designation.controller.ts
 */

@Route("designations")
@Tags("Designations")
@Security("jwt")
export class DesignationController extends Controller {
  private service: DesignationService;

  constructor() {
    super();
    this.service = new DesignationService();
  }

  /**
   * Create designation
   */
  @Post()
  @SuccessResponse(201, "Designation created")
  @TsoaResponse<ApiErrorResponse>(400, "Validation error")
  public async createDesignation(
    @Body() body: CreateDesignationRequestDto,
  ): Promise<ApiResponse<DesignationDto>> {
    const validated = CreateDesignationValidationSchema.parse(body);
    const result = await this.service.createDesignation(validated);

    this.setStatus(201);

    return {
      success: true,
      message: "Designation created successfully",
      data: result,
    };
  }

  /**
   * Get designations (optionally filtered by department)
   */
  @Get()
  @SuccessResponse(200, "Designations retrieved")
  public async getDesignations(
    @Query() departmentId?: string,
  ): Promise<ApiResponse<DesignationListItemDto[]>> {
    const result = await this.service.getDesignations(departmentId);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Get designation by ID
   */
  @Get("{id}")
  @SuccessResponse(200, "Designation retrieved")
  @TsoaResponse<ApiErrorResponse>(404, "Designation not found")
  public async getDesignation(
    @Path() id: string,
  ): Promise<ApiResponse<DesignationDto>> {
    const result = await this.service.getDesignation(id);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Update designation
   */
  @Put("{id}")
  @SuccessResponse(200, "Designation updated")
  @TsoaResponse<ApiErrorResponse>(404, "Designation not found")
  public async updateDesignation(
    @Path() id: string,
    @Body() body: UpdateDesignationRequestDto,
  ): Promise<ApiResponse<DesignationDto>> {
    const validated = UpdateDesignationValidationSchema.parse(body);
    const result = await this.service.updateDesignation(id, validated);

    return {
      success: true,
      message: "Designation updated successfully",
      data: result,
    };
  }

  /**
   * Delete designation
   */
  @Delete("{id}")
  @SuccessResponse(200, "Designation deleted")
  @TsoaResponse<ApiErrorResponse>(404, "Designation not found")
  public async deleteDesignation(
    @Path() id: string,
  ): Promise<ApiResponse<{ message: string }>> {
    await this.service.deleteDesignation(id);

    return {
      success: true,
      message: "Designation deleted successfully",
      data: { message: "Designation deleted successfully" },
    };
  }
}

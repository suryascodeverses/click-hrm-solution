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
import { DepartmentService } from "./department.service";
import {
  CreateDepartmentValidationSchema,
  UpdateDepartmentValidationSchema,
} from "./department.types";

import type {
  CreateDepartmentRequestDto,
  UpdateDepartmentRequestDto,
  DepartmentDto,
  DepartmentListItemDto,
  DepartmentDetailDto,
  ApiResponse,
  ApiErrorResponse,
} from "@arm/shared";

/**
 * ========================================
 * DEPARTMENT CONTROLLER
 * ========================================
 */

@Route("departments")
@Tags("Departments")
@Security("jwt")
export class DepartmentController extends Controller {
  private service: DepartmentService;

  constructor() {
    super();
    this.service = new DepartmentService();
  }

  /**
   * Create department
   */
  @Post()
  @SuccessResponse(201, "Department created")
  @TsoaResponse<ApiErrorResponse>(400, "Validation error")
  public async createDepartment(
    @Body() body: CreateDepartmentRequestDto,
  ): Promise<ApiResponse<DepartmentDto>> {
    const validated = CreateDepartmentValidationSchema.parse(body);
    const result = await this.service.createDepartment(validated);

    this.setStatus(201);

    return {
      success: true,
      message: "Department created successfully",
      data: result,
    };
  }

  /**
   * Get departments (optionally filtered by organisation)
   */
  @Get()
  @SuccessResponse(200, "Departments retrieved")
  public async getDepartments(
    @Query() organisationId?: string,
  ): Promise<ApiResponse<DepartmentListItemDto[]>> {
    const result = await this.service.getDepartments(organisationId);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Get department by ID
   */
  @Get("{id}")
  @SuccessResponse(200, "Department retrieved")
  @TsoaResponse<ApiErrorResponse>(404, "Department not found")
  public async getDepartment(
    @Path() id: string,
  ): Promise<ApiResponse<DepartmentDetailDto>> {
    const result = await this.service.getDepartment(id);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Update department
   */
  @Put("{id}")
  @SuccessResponse(200, "Department updated")
  @TsoaResponse<ApiErrorResponse>(404, "Department not found")
  public async updateDepartment(
    @Path() id: string,
    @Body() body: UpdateDepartmentRequestDto,
  ): Promise<ApiResponse<DepartmentDto>> {
    const validated = UpdateDepartmentValidationSchema.parse(body);
    const result = await this.service.updateDepartment(id, validated);

    return {
      success: true,
      message: "Department updated successfully",
      data: result,
    };
  }

  /**
   * Delete department
   */
  @Delete("{id}")
  @SuccessResponse(200, "Department deleted")
  @TsoaResponse<ApiErrorResponse>(404, "Department not found")
  public async deleteDepartment(
    @Path() id: string,
  ): Promise<ApiResponse<{ message: string }>> {
    await this.service.deleteDepartment(id);

    return {
      success: true,
      message: "Department deleted successfully",
      data: { message: "Department deleted successfully" },
    };
  }
}

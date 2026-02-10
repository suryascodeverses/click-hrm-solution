import {
  Route,
  Tags,
  Get,
  Put,
  Delete,
  Body,
  Path,
  Security,
  SuccessResponse,
  Response as TsoaResponse,
  Controller,
} from "tsoa";
import { SuperAdminService } from "./super-admin.service";
import { ApiErrorResponse, ApiResponse } from "../../shared/types/common.types";
import {
  GetDashboardStatsResponseDto,
  TenantDetailDto,
  UpdateTenantRequestDto,
  UpdateTenantStatusRequestDto,
  UpdateUserRequestDto,
  UserDetailDto,
} from "../../shared/types/super-admin.types";
import {
  UpdateTenantRequestSchema,
  UpdateTenantStatusRequestSchema,
  UpdateUserRequestSchema,
} from "@arm/shared";
import { UserRole } from "@prisma/client";

/**
 * ========================================
 * SUPER ADMIN CONTROLLER
 * ========================================
 */

@Route("super-admin")
@Tags("Super Admin")
@Security("jwt")
export class SuperAdminController extends Controller {
  private service: SuperAdminService;

  constructor() {
    super();
    this.service = new SuperAdminService();
  }

  /**
   * Get dashboard statistics
   */
  @Get("dashboard")
  @SuccessResponse(200, "Dashboard stats retrieved")
  public async getDashboardStats(): Promise<
    ApiResponse<GetDashboardStatsResponseDto>
  > {
    const result = await this.service.getDashboardStats();

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Get all tenants
   */
  @Get("tenants")
  @SuccessResponse(200, "Tenants retrieved")
  public async getAllTenants(): Promise<ApiResponse<TenantDetailDto[]>> {
    const result = await this.service.getAllTenants();

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Update tenant status
   */
  @Put("tenants/{tenantId}/status")
  @SuccessResponse(200, "Tenant status updated")
  @TsoaResponse<ApiErrorResponse>(404, "Tenant not found")
  public async updateTenantStatus(
    @Path() tenantId: string,
    @Body() body: UpdateTenantStatusRequestDto,
  ): Promise<ApiResponse<TenantDetailDto>> {
    const validated = UpdateTenantStatusRequestSchema.parse(body);
    const result = await this.service.updateTenantStatus(tenantId, validated);

    return {
      success: true,
      message: "Tenant status updated",
      data: result,
    };
  }

  /**
   * Update tenant
   */
  @Put("tenants/{tenantId}")
  @SuccessResponse(200, "Tenant updated")
  @TsoaResponse<ApiErrorResponse>(404, "Tenant not found")
  public async updateTenant(
    @Path() tenantId: string,
    @Body() body: UpdateTenantRequestDto,
  ): Promise<ApiResponse<TenantDetailDto>> {
    const validated = UpdateTenantRequestSchema.parse(body);
    const result = await this.service.updateTenant(tenantId, validated);

    return {
      success: true,
      message: "Tenant updated successfully",
      data: result,
    };
  }

  /**
   * Delete tenant
   */
  @Delete("tenants/{tenantId}")
  @SuccessResponse(200, "Tenant deleted")
  @TsoaResponse<ApiErrorResponse>(404, "Tenant not found")
  public async deleteTenant(
    @Path() tenantId: string,
  ): Promise<ApiResponse<{ message: string }>> {
    await this.service.deleteTenant(tenantId);

    return {
      success: true,
      message: "Tenant deleted successfully",
      data: { message: "Tenant deleted successfully" },
    };
  }

  /**
   * Get all users
   */
  @Get("users")
  @SuccessResponse(200, "Users retrieved")
  public async getAllUsers(): Promise<ApiResponse<UserDetailDto[]>> {
    const result = await this.service.getAllUsers();

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Update user
   */
  @Put("users/{userId}")
  @SuccessResponse(200, "User updated")
  @TsoaResponse<ApiErrorResponse>(404, "User not found")
  public async updateUser(
    @Path() userId: string,
    @Body() body: UpdateUserRequestDto,
  ): Promise<ApiResponse<UserDetailDto>> {
    const validated = UpdateUserRequestSchema.parse(body);
    const result = await this.service.updateUser(userId, {
      ...validated,
      role: validated.role as UserRole,
    });

    return {
      success: true,
      message: "User updated successfully",
      data: result,
    };
  }

  /**
   * Delete user
   */
  @Delete("users/{userId}")
  @SuccessResponse(200, "User deleted")
  @TsoaResponse<ApiErrorResponse>(404, "User not found")
  public async deleteUser(
    @Path() userId: string,
  ): Promise<ApiResponse<{ message: string }>> {
    await this.service.deleteUser(userId);

    return {
      success: true,
      message: "User deleted successfully",
      data: { message: "User deleted successfully" },
    };
  }
}

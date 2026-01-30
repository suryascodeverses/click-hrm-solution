import {
  Route,
  Tags,
  Get,
  Put,
  Body,
  Security,
  Request,
  SuccessResponse,
  Response as TsoaResponse,
  Controller,
} from "tsoa";
import { Request as ExpressRequest } from "express";
import { TenantService } from "./tenant.service";
import { UpdateTenantProfileValidationSchema } from "./tenant.types";

import type {
  GetTenantResponseDto,
  UpdateTenantProfileRequestDto,
  UpdateTenantProfileResponseDto,
  ApiResponse,
  ApiErrorResponse,
} from "@arm/shared";

/**
 * ========================================
 * TENANT CONTROLLER
 * ========================================
 */

@Route("tenants")
@Tags("Tenants")
@Security("jwt")
export class TenantController extends Controller {
  private service: TenantService;

  constructor() {
    super();
    this.service = new TenantService();
  }

  /**
   * Get current tenant
   */
  @Get("me")
  @SuccessResponse(200, "Tenant retrieved")
  @TsoaResponse<ApiErrorResponse>(404, "Tenant not found")
  public async getTenant(
    @Request() request: ExpressRequest & { user?: any },
  ): Promise<ApiResponse<GetTenantResponseDto>> {
    const tenantId = request.user?.tenantId;

    if (!tenantId) {
      this.setStatus(404);
      throw new Error("Tenant not found");
    }

    const result = await this.service.getTenant(tenantId);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Update current tenant
   */
  @Put("me")
  @SuccessResponse(200, "Tenant updated")
  @TsoaResponse<ApiErrorResponse>(404, "Tenant not found")
  public async updateTenant(
    @Request() request: ExpressRequest & { user?: any },
    @Body() body: UpdateTenantProfileRequestDto,
  ): Promise<ApiResponse<UpdateTenantProfileResponseDto>> {
    const tenantId = request.user?.tenantId;

    if (!tenantId) {
      this.setStatus(404);
      throw new Error("Tenant not found");
    }

    const validated = UpdateTenantProfileValidationSchema.parse(body);
    const result = await this.service.updateTenant(tenantId, validated);

    return {
      success: true,
      message: "Tenant updated successfully",
      data: result,
    };
  }
}

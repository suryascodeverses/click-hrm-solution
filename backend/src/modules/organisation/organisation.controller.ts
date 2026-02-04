import {
  Route,
  Tags,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Path,
  Security,
  Request,
  SuccessResponse,
  Response as TsoaResponse,
  Controller,
} from "tsoa";
import { Request as ExpressRequest } from "express";
import { OrganisationService } from "./organisation.service";
import {
  CreateOrganisationValidationSchema,
  UpdateOrganisationValidationSchema,
} from "../../shared/types/organisation.types";

import type {
  CreateOrganisationRequestDto,
  UpdateOrganisationRequestDto,
  OrganisationDto,
  OrganisationListItemDto,
  OrganisationDetailDto,
  ApiResponse,
  ApiErrorResponse,
} from "@arm/shared";

/**
 * ========================================
 * ORGANISATION CONTROLLER
 * ========================================
 */

@Route("organisations")
@Tags("Organisations")
@Security("jwt")
export class OrganisationController extends Controller {
  private service: OrganisationService;

  constructor() {
    super();
    this.service = new OrganisationService();
  }

  /**
   * Create organisation
   */
  @Post()
  @SuccessResponse(201, "Organisation created")
  @TsoaResponse<ApiErrorResponse>(400, "Validation error")
  public async createOrganisation(
    @Request() request: ExpressRequest & { user?: any },
    @Body() body: CreateOrganisationRequestDto,
  ): Promise<ApiResponse<OrganisationDto>> {
    const tenantId = request.user?.tenantId;

    if (!tenantId) {
      this.setStatus(403);
      throw new Error("Tenant ID required");
    }

    const validated = CreateOrganisationValidationSchema.parse(body);
    const result = await this.service.createOrganisation(tenantId, validated);

    this.setStatus(201);

    return {
      success: true,
      message: "Organisation created successfully",
      data: result,
    };
  }

  /**
   * Get all organisations
   */
  @Get()
  @SuccessResponse(200, "Organisations retrieved")
  public async getOrganisations(
    @Request() request: ExpressRequest & { user?: any },
  ): Promise<ApiResponse<OrganisationListItemDto[]>> {
    const tenantId = request.user?.tenantId;

    if (!tenantId) {
      this.setStatus(403);
      throw new Error("Tenant ID required");
    }

    const result = await this.service.getOrganisations(tenantId);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Get organisation by ID
   */
  @Get("{id}")
  @SuccessResponse(200, "Organisation retrieved")
  @TsoaResponse<ApiErrorResponse>(404, "Organisation not found")
  public async getOrganisation(
    @Path() id: string,
  ): Promise<ApiResponse<OrganisationDetailDto>> {
    const result = await this.service.getOrganisation(id);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Update organisation
   */
  @Put("{id}")
  @SuccessResponse(200, "Organisation updated")
  @TsoaResponse<ApiErrorResponse>(404, "Organisation not found")
  public async updateOrganisation(
    @Path() id: string,
    @Body() body: UpdateOrganisationRequestDto,
  ): Promise<ApiResponse<OrganisationDto>> {
    const validated = UpdateOrganisationValidationSchema.parse(body);
    const result = await this.service.updateOrganisation(id, validated);

    return {
      success: true,
      message: "Organisation updated successfully",
      data: result,
    };
  }

  /**
   * Delete organisation
   */
  @Delete("{id}")
  @SuccessResponse(200, "Organisation deleted")
  @TsoaResponse<ApiErrorResponse>(404, "Organisation not found")
  public async deleteOrganisation(
    @Path() id: string,
  ): Promise<ApiResponse<{ message: string }>> {
    await this.service.deleteOrganisation(id);

    return {
      success: true,
      message: "Organisation deleted successfully",
      data: { message: "Organisation deleted successfully" },
    };
  }
}

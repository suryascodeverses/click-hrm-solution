import {
  Route,
  Tags,
  Get,
  Query,
  Security,
  SuccessResponse,
  Controller,
} from "tsoa";
import { AuditLogsService } from "./audit-logs.service";
import type {
  GetAuditLogsQueryDto,
  GetAuditLogsResponseDto,
  AuditLogStatsDto,
  AuditLogFiltersDto,
  ApiResponse,
} from "@arm/shared";

@Route("super-admin/audit-logs")
@Tags("Super Admin - Audit Logs")
@Security("jwt")
export class AuditLogsController extends Controller {
  private service = new AuditLogsService();

  @Get()
  @SuccessResponse(200, "Audit logs retrieved")
  public async getAuditLogs(
    @Query() page?: number,
    @Query() limit?: number,
    @Query() tenantId?: string,
    @Query() userId?: string,
    @Query() action?: string,
    @Query() entity?: string,
    @Query() startDate?: string,
    @Query() endDate?: string,
    @Query() search?: string,
  ): Promise<ApiResponse<GetAuditLogsResponseDto>> {
    const result = await this.service.getAuditLogs({
      page,
      limit,
      tenantId,
      userId,
      action,
      entity,
      startDate,
      endDate,
      search,
    });
    return { success: true, data: result };
  }

  @Get("stats")
  @SuccessResponse(200, "Audit log stats retrieved")
  public async getAuditLogStats(): Promise<ApiResponse<AuditLogStatsDto>> {
    const result = await this.service.getAuditLogStats();
    return { success: true, data: result };
  }

  @Get("filters")
  @SuccessResponse(200, "Filters retrieved")
  public async getUniqueFilters(): Promise<ApiResponse<AuditLogFiltersDto>> {
    const result = await this.service.getUniqueFilters();
    return { success: true, data: result };
  }
}

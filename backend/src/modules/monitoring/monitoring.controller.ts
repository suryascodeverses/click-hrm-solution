import {
  Route,
  Tags,
  Get,
  Post,
  Put,
  Path,
  Query,
  Body,
  Security,
  SuccessResponse,
  Controller,
} from "tsoa";
import { MonitoringService } from "./monitoring.service";
import type {
  CreateSystemAlertRequestDto,
  SystemHealthDto,
  MetricsHistoryDto,
  DatabaseStatsDto,
  ApiUsageStatsDto,
  SystemAlertsResponseDto,
  ErrorRateDto,
  ApiResponse,
} from "@arm/shared";

@Route("super-admin/monitoring")
@Tags("Super Admin - Monitoring")
@Security("jwt")
export class MonitoringController extends Controller {
  private service = new MonitoringService();

  @Get("health")
  @SuccessResponse(200, "System health retrieved")
  public async getSystemHealth(): Promise<ApiResponse<SystemHealthDto>> {
    const result = await this.service.getSystemHealth();
    return { success: true, data: result };
  }

  @Get("metrics/history")
  @SuccessResponse(200, "Metrics history retrieved")
  public async getMetricsHistory(
    @Query() metricType?: string,
    @Query() hours?: number,
  ): Promise<ApiResponse<MetricsHistoryDto>> {
    const result = await this.service.getMetricsHistory(metricType, hours);
    return { success: true, data: result };
  }

  @Get("database/stats")
  @SuccessResponse(200, "Database stats retrieved")
  public async getDatabaseStats(): Promise<ApiResponse<DatabaseStatsDto>> {
    const result = await this.service.getDatabaseStats();
    return { success: true, data: result };
  }

  @Get("api/usage")
  @SuccessResponse(200, "API usage stats retrieved")
  public async getApiUsageStats(): Promise<ApiResponse<ApiUsageStatsDto>> {
    const result = await this.service.getApiUsageStats();
    return { success: true, data: result };
  }

  @Get("alerts")
  @SuccessResponse(200, "System alerts retrieved")
  public async getSystemAlerts(
    @Query() severity?: string,
    @Query() isResolved?: string,
  ): Promise<ApiResponse<SystemAlertsResponseDto>> {
    const resolved =
      isResolved === "true" ? true : isResolved === "false" ? false : undefined;
    const result = await this.service.getSystemAlerts(severity, resolved);
    return { success: true, data: result };
  }

  @Post("alerts")
  @SuccessResponse(201, "Alert created")
  public async createSystemAlert(
    @Body() body: CreateSystemAlertRequestDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.service.createSystemAlert(body);
    this.setStatus(201);
    return { success: true, message: "Alert created", data: result };
  }

  @Put("alerts/{alertId}/resolve")
  @SuccessResponse(200, "Alert resolved")
  public async resolveAlert(
    @Path() alertId: string,
  ): Promise<ApiResponse<any>> {
    const result = await this.service.resolveAlert(alertId);
    return { success: true, message: "Alert resolved", data: result };
  }

  @Get("error-rate")
  @SuccessResponse(200, "Error rate retrieved")
  public async getErrorRate(): Promise<ApiResponse<ErrorRateDto>> {
    const result = await this.service.getErrorRate();
    return { success: true, data: result };
  }
}

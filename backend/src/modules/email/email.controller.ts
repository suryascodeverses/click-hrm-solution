import {
  Route,
  Tags,
  Get,
  Post,
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
import { EmailTemplatesService } from "./email-templates.service";
import type {
  CreateEmailTemplateRequestDto,
  UpdateEmailTemplateRequestDto,
  SendTestEmailRequestDto,
  EmailTemplateDto,
  EmailLogsResponseDto,
  EmailStatsDto,
  ApiResponse,
  ApiErrorResponse,
} from "@arm/shared";

@Route("super-admin/email-templates")
@Tags("Super Admin - Email Templates")
@Security("jwt")
export class EmailTemplatesController extends Controller {
  private service = new EmailTemplatesService();

  @Get()
  @SuccessResponse(200, "Templates retrieved")
  public async getEmailTemplates(
    @Query() category?: string,
  ): Promise<ApiResponse<EmailTemplateDto[]>> {
    const result = await this.service.getEmailTemplates(category);
    return { success: true, data: result };
  }

  @Get("{templateId}")
  @SuccessResponse(200, "Template retrieved")
  @TsoaResponse<ApiErrorResponse>(404, "Template not found")
  public async getEmailTemplate(
    @Path() templateId: string,
  ): Promise<ApiResponse<EmailTemplateDto>> {
    const result = await this.service.getEmailTemplate(templateId);
    return { success: true, data: result };
  }

  @Post()
  @SuccessResponse(201, "Template created")
  public async createEmailTemplate(
    @Body() body: CreateEmailTemplateRequestDto,
  ): Promise<ApiResponse<EmailTemplateDto>> {
    const result = await this.service.createEmailTemplate(body);
    this.setStatus(201);
    return { success: true, message: "Email template created", data: result };
  }

  @Put("{templateId}")
  @SuccessResponse(200, "Template updated")
  public async updateEmailTemplate(
    @Path() templateId: string,
    @Body() body: UpdateEmailTemplateRequestDto,
  ): Promise<ApiResponse<EmailTemplateDto>> {
    const result = await this.service.updateEmailTemplate(templateId, body);
    return { success: true, message: "Template updated", data: result };
  }

  @Delete("{templateId}")
  @SuccessResponse(200, "Template deleted")
  public async deleteEmailTemplate(
    @Path() templateId: string,
  ): Promise<ApiResponse<{ message: string }>> {
    await this.service.deleteEmailTemplate(templateId);
    return {
      success: true,
      message: "Template deleted",
      data: { message: "Template deleted" },
    };
  }

  @Get("logs/all")
  @SuccessResponse(200, "Email logs retrieved")
  public async getEmailLogs(
    @Query() status?: string,
    @Query() tenantId?: string,
    @Query() page?: number,
    @Query() limit?: number,
  ): Promise<ApiResponse<EmailLogsResponseDto>> {
    const result = await this.service.getEmailLogs(
      status,
      tenantId,
      page,
      limit,
    );
    return { success: true, data: result };
  }

  @Get("logs/stats")
  @SuccessResponse(200, "Email stats retrieved")
  public async getEmailStats(): Promise<ApiResponse<EmailStatsDto>> {
    const result = await this.service.getEmailStats();
    return { success: true, data: result };
  }

  @Post("test")
  @SuccessResponse(200, "Test email sent")
  @TsoaResponse<ApiErrorResponse>(404, "Template not found")
  public async sendTestEmail(
    @Body() body: SendTestEmailRequestDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.service.sendTestEmail(body);
    return {
      success: true,
      message: "Test email sent (simulated)",
      data: result,
    };
  }
}

import {
  Route,
  Tags,
  Get,
  Post,
  Put,
  Body,
  Path,
  Query,
  Security,
  SuccessResponse,
  Response as TsoaResponse,
  Controller,
} from "tsoa";
import { BillingService } from "./billing.service";
import type {
  CreateSubscriptionPlanRequestDto,
  UpdateSubscriptionPlanRequestDto,
  MarkInvoicePaidRequestDto,
  CancelSubscriptionRequestDto,
  SubscriptionPlanDto,
  SubscriptionWithDetailsDto,
  SubscriptionStatsDto,
  InvoiceDto,
  PaymentDto,
  ApiResponse,
  ApiErrorResponse,
} from "@arm/shared";

@Route("super-admin/billing")
@Tags("Super Admin - Billing")
@Security("jwt")
export class BillingController extends Controller {
  private service = new BillingService();

  @Get("plans")
  @SuccessResponse(200, "Plans retrieved")
  public async getSubscriptionPlans(): Promise<
    ApiResponse<SubscriptionPlanDto[]>
  > {
    const result = await this.service.getSubscriptionPlans();
    return { success: true, data: result };
  }

  @Post("plans")
  @SuccessResponse(201, "Plan created")
  public async createSubscriptionPlan(
    @Body() body: CreateSubscriptionPlanRequestDto,
  ): Promise<ApiResponse<SubscriptionPlanDto>> {
    const result = await this.service.createSubscriptionPlan(body);
    this.setStatus(201);
    return {
      success: true,
      message: "Subscription plan created",
      data: result,
    };
  }

  @Put("plans/{planId}")
  @SuccessResponse(200, "Plan updated")
  public async updateSubscriptionPlan(
    @Path() planId: string,
    @Body() body: UpdateSubscriptionPlanRequestDto,
  ): Promise<ApiResponse<SubscriptionPlanDto>> {
    const result = await this.service.updateSubscriptionPlan(planId, body);
    return { success: true, message: "Plan updated", data: result };
  }

  @Get("subscriptions")
  @SuccessResponse(200, "Subscriptions retrieved")
  public async getAllSubscriptions(): Promise<
    ApiResponse<SubscriptionWithDetailsDto[]>
  > {
    const result = await this.service.getAllSubscriptions();
    return { success: true, data: result };
  }

  @Get("subscriptions/stats")
  @SuccessResponse(200, "Stats retrieved")
  public async getSubscriptionStats(): Promise<
    ApiResponse<SubscriptionStatsDto>
  > {
    const result = await this.service.getSubscriptionStats();
    return { success: true, data: result };
  }

  @Get("invoices")
  @SuccessResponse(200, "Invoices retrieved")
  public async getAllInvoices(
    @Query() status?: string,
    @Query() tenantId?: string,
  ): Promise<ApiResponse<InvoiceDto[]>> {
    const result = await this.service.getAllInvoices(status, tenantId);
    return { success: true, data: result };
  }

  @Get("payments")
  @SuccessResponse(200, "Payments retrieved")
  public async getAllPayments(
    @Query() status?: string,
    @Query() tenantId?: string,
  ): Promise<ApiResponse<PaymentDto[]>> {
    const result = await this.service.getAllPayments(status, tenantId);
    return { success: true, data: result };
  }

  @Post("invoices/{invoiceId}/mark-paid")
  @SuccessResponse(200, "Invoice marked as paid")
  @TsoaResponse<ApiErrorResponse>(404, "Invoice not found")
  public async markInvoicePaid(
    @Path() invoiceId: string,
    @Body() body: MarkInvoicePaidRequestDto,
  ): Promise<ApiResponse<InvoiceDto>> {
    const result = await this.service.markInvoicePaid(invoiceId, body);
    return { success: true, message: "Invoice marked as paid", data: result };
  }

  @Post("subscriptions/{subscriptionId}/cancel")
  @SuccessResponse(200, "Subscription cancelled")
  public async cancelSubscription(
    @Path() subscriptionId: string,
    @Body() body: CancelSubscriptionRequestDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.service.cancelSubscription(subscriptionId, body);
    return { success: true, message: "Subscription cancelled", data: result };
  }
}

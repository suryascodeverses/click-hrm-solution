import {
  Route,
  Tags,
  Post,
  Get,
  Body,
  Security,
  Request,
  SuccessResponse,
  Response as TsoaResponse,
  Controller,
} from "tsoa";
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
import { SuperAdminAuthService } from "./super-admin-auth.service";
import {
  SuperAdminLoginValidationSchema,
  CreateSuperAdminValidationSchema,
} from "./super-admin-auth.types";

import type {
  SuperAdminLoginRequestDto,
  SuperAdminLoginResponseDto,
  SuperAdminGetMeResponseDto,
  SuperAdminRefreshTokenResponseDto,
  CreateSuperAdminRequestDto,
  CreateSuperAdminResponseDto,
  ApiResponse,
  ApiErrorResponse,
} from "@arm/shared";

/**
 * ========================================
 * SUPER ADMIN AUTH CONTROLLER
 * ========================================
 */

@Route("super-admin/auth")
@Tags("Super Admin Authentication")
export class SuperAdminAuthController extends Controller {
  private service: SuperAdminAuthService;

  constructor() {
    super();
    this.service = new SuperAdminAuthService();
  }

  /**
   * Super admin login
   */
  @Post("login")
  @SuccessResponse(200, "Login successful")
  @TsoaResponse<ApiErrorResponse>(401, "Invalid credentials")
  @TsoaResponse<ApiErrorResponse>(403, "Account inactive")
  public async login(
    @Body() body: SuperAdminLoginRequestDto,
    @Request() request: ExpressRequest & { res?: ExpressResponse },
  ): Promise<ApiResponse<SuperAdminLoginResponseDto>> {
    const validated = SuperAdminLoginValidationSchema.parse(body);
    const result = await this.service.login(validated);

    // Set refresh token in cookie
    const isProd = process.env.NODE_ENV === "production";
    request.res?.cookie("superAdminRefreshToken", result.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
    });

    return {
      success: true,
      message: "Login successful",
      data: result,
    };
  }

  /**
   * Get super admin profile
   */
  @Get("me")
  @Security("jwt")
  @SuccessResponse(200, "Profile retrieved")
  @TsoaResponse<ApiErrorResponse>(401, "Unauthorized")
  public async getMe(
    @Request() request: ExpressRequest & { superAdmin?: any },
  ): Promise<ApiResponse<SuperAdminGetMeResponseDto>> {
    const superAdminId = request.superAdmin?.id;

    if (!superAdminId) {
      this.setStatus(401);
      throw new Error("Unauthorized");
    }

    const result = await this.service.getMe(superAdminId);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Logout super admin
   */
  @Post("logout")
  @Security("jwt")
  @SuccessResponse(200, "Logout successful")
  public async logout(
    @Request()
    request: ExpressRequest & {
      superAdmin?: any;
      cookies?: any;
      res?: ExpressResponse;
    },
  ): Promise<ApiResponse<{ message: string }>> {
    const superAdminId = request.superAdmin?.id;
    const refreshToken = request.cookies?.superAdminRefreshToken;

    if (!superAdminId) {
      this.setStatus(401);
      throw new Error("Unauthorized");
    }

    await this.service.logout(superAdminId, refreshToken);

    request.res?.clearCookie("superAdminRefreshToken", { path: "/" });

    return {
      success: true,
      message: "Logout successful",
      data: { message: "Logout successful" },
    };
  }

  /**
   * Refresh access token
   */
  @Post("refresh")
  @SuccessResponse(200, "Token refreshed")
  @TsoaResponse<ApiErrorResponse>(401, "Invalid or expired token")
  public async refreshToken(
    @Request()
    request: ExpressRequest & { cookies?: any; res?: ExpressResponse },
  ): Promise<ApiResponse<SuperAdminRefreshTokenResponseDto>> {
    const refreshToken = request.cookies?.superAdminRefreshToken;

    if (!refreshToken) {
      this.setStatus(401);
      throw new Error("Refresh token missing");
    }

    const result = await this.service.refreshToken(refreshToken);

    // Update cookie with new refresh token
    const isProd = process.env.NODE_ENV === "production";
    request.res?.cookie("superAdminRefreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
    });

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Create super admin (protected by master key)
   */
  @Post("create")
  @SuccessResponse(201, "Super admin created")
  @TsoaResponse<ApiErrorResponse>(400, "Validation error")
  @TsoaResponse<ApiErrorResponse>(403, "Invalid master key")
  @TsoaResponse<ApiErrorResponse>(409, "Super admin already exists")
  public async createSuperAdmin(
    @Body() body: CreateSuperAdminRequestDto,
  ): Promise<ApiResponse<CreateSuperAdminResponseDto>> {
    const validated = CreateSuperAdminValidationSchema.parse(body);
    const result = await this.service.createSuperAdmin(validated);

    this.setStatus(201);

    return {
      success: true,
      message: "Super admin created successfully",
      data: result,
    };
  }
}

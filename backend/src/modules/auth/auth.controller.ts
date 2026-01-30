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
import { Request as ExpressRequest } from "express";
import { AuthService } from "./auth.service";
import {
  RegisterSchema,
  LoginSchema,
  LogoutSchema,
  type RegisterRequest,
  type RegisterResponse,
  type LoginRequest,
  type LoginResponse,
  type GetMeResponse,
  type LogoutRequest,
} from "./auth.types";
import { createSuccessResponse } from "../../shared/types/response.types";
import type {
  ApiResponse,
  ApiErrorResponse,
} from "../../shared/types/response.types";

/**
 * ========================================
 * AUTH CONTROLLER
 * ========================================
 * Handles authentication endpoints with tsoa routing
 */

@Route("auth")
@Tags("Authentication")
export class AuthController extends Controller {
  private authService: AuthService;

  constructor() {
    super();
    this.authService = new AuthService();
  }

  /**
   * Register a new tenant admin and create tenant
   * @summary Register new tenant
   */
  @Post("register")
  @SuccessResponse(201, "Registration successful")
  @TsoaResponse<ApiErrorResponse>(400, "Validation error")
  @TsoaResponse<ApiErrorResponse>(409, "Email already registered")
  public async register(
    @Body() body: RegisterRequest,
  ): Promise<ApiResponse<RegisterResponse>> {
    // Validate with Zod
    const validated = RegisterSchema.parse(body);

    // Call service
    const result = await this.authService.register(validated);

    // Set status code
    this.setStatus(201);

    return createSuccessResponse(result, "Registration successful");
  }

  /**
   * Login user
   * @summary User login
   */
  @Post("login")
  @SuccessResponse(200, "Login successful")
  @TsoaResponse<ApiErrorResponse>(401, "Invalid credentials")
  @TsoaResponse<ApiErrorResponse>(403, "Account inactive")
  public async login(
    @Body() body: LoginRequest,
  ): Promise<ApiResponse<LoginResponse>> {
    // Validate with Zod
    const validated = LoginSchema.parse(body);

    // Call service
    const result = await this.authService.login(validated);

    return createSuccessResponse(result, "Login successful");
  }

  /**
   * Get current user profile
   * @summary Get authenticated user
   */
  @Get("me")
  @Security("jwt")
  @SuccessResponse(200, "Profile retrieved")
  @TsoaResponse<ApiErrorResponse>(401, "Unauthorized")
  public async getMe(
    @Request() request: ExpressRequest & { user?: any },
  ): Promise<ApiResponse<GetMeResponse>> {
    const userId = request.user?.id;

    if (!userId) {
      this.setStatus(401);
      throw new Error("Unauthorized");
    }

    const result = await this.authService.getMe(userId);

    return createSuccessResponse(result);
  }

  /**
   * Logout user (invalidate refresh token)
   * @summary User logout
   */
  @Post("logout")
  @Security("jwt")
  @SuccessResponse(200, "Logout successful")
  @TsoaResponse<ApiErrorResponse>(401, "Unauthorized")
  public async logout(
    @Request() request: ExpressRequest & { user?: any },
    @Body() body: LogoutRequest,
  ): Promise<ApiResponse<{ message: string }>> {
    const userId = request.user?.id;

    if (!userId) {
      this.setStatus(401);
      throw new Error("Unauthorized");
    }

    // Validate with Zod
    const validated = LogoutSchema.parse(body);

    // Call service
    await this.authService.logout(userId, validated);

    return createSuccessResponse(
      { message: "Logout successful" },
      "Logout successful",
    );
  }
}

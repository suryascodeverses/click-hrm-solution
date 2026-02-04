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

// Import validation schemas (backend-only)
import {
  RegisterValidationSchema,
  LoginValidationSchema,
  LogoutValidationSchema,
} from "../../shared/types/auth.types";

// Import DTOs from shared package (API contracts)
import type {
  RegisterRequestDto,
  RegisterResponseDto,
  LoginRequestDto,
  LoginResponseDto,
  GetMeResponseDto,
  LogoutRequestDto,
  ApiResponse,
  ApiErrorResponse,
} from "@arm/shared";

/**
 * ========================================
 * AUTH CONTROLLER
 * ========================================
 * Handles authentication endpoints with tsoa routing
 * Uses shared DTOs for API contracts
 * Uses backend validation schemas for security
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
    @Body() body: RegisterRequestDto,
  ): Promise<ApiResponse<RegisterResponseDto>> {
    // Validate with backend schema (strict validation)
    const validated = RegisterValidationSchema.parse(body);

    // Call service
    const result = await this.authService.register(validated);

    // Set status code
    this.setStatus(201);

    return {
      success: true,
      message: "Registration successful",
      data: result,
    };
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
    @Body() body: LoginRequestDto,
  ): Promise<ApiResponse<LoginResponseDto>> {
    // Validate with backend schema
    const validated = LoginValidationSchema.parse(body);

    // Call service
    const result = await this.authService.login(validated);

    return {
      success: true,
      message: "Login successful",
      data: result,
    };
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
  ): Promise<ApiResponse<GetMeResponseDto>> {
    const userId = request.user?.id;

    if (!userId) {
      this.setStatus(401);
      throw new Error("Unauthorized");
    }

    const result = await this.authService.getMe(userId);

    return {
      success: true,
      data: result,
    };
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
    @Body() body: LogoutRequestDto,
  ): Promise<ApiResponse<{ message: string }>> {
    const userId = request.user?.id;

    if (!userId) {
      this.setStatus(401);
      throw new Error("Unauthorized");
    }

    // Validate with backend schema
    const validated = LogoutValidationSchema.parse(body);

    // Call service
    await this.authService.logout(userId, validated.refreshToken);

    return {
      success: true,
      message: "Logout successful",
      data: { message: "Logout successful" },
    };
  }
}

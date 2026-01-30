import { prisma } from "../../config/database";
import { hashPassword, comparePassword } from "../../utils/password.utils";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/jwt.utils";
import {
  UnauthorizedError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../shared/errors";
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  GetMeResponse,
  LogoutRequest,
} from "./auth.types";

/**
 * ========================================
 * AUTH SERVICE
 * ========================================
 * Business logic for authentication operations
 */

export class AuthService {
  /**
   * Register new tenant admin and create tenant
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const { email, password, companyName } = data;

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictError("Email already registered");
    }

    // Create tenant first
    const subdomain = companyName.toLowerCase().replace(/\s+/g, "-");
    const tenant = await prisma.tenant.create({
      data: {
        name: companyName,
        subdomain,
        email,
      },
    });

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        tenantId: tenant.id,
        role: "TENANT_ADMIN",
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    });

    // Save refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId!,
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const { email, password } = data;

    // Find user
    const user = await prisma.user.findFirst({
      where: { email },
      include: {
        tenant: true,
        employee: {
          include: {
            organisation: true,
            department: true,
            designation: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    // Check password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedError("Invalid credentials");
    }

    // Check if user is active
    if (!user.isActive) {
      throw new ForbiddenError("Account is inactive");
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    });

    // Save refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
      tenant: user.tenant,
      employee: user.employee,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Get current user profile
   */
  async getMe(userId: string): Promise<GetMeResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenant: true,
        employee: {
          include: {
            organisation: true,
            department: true,
            designation: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user as GetMeResponse;
  }

  /**
   * Logout user (invalidate refresh token)
   */
  async logout(userId: string, data: LogoutRequest): Promise<void> {
    const { refreshToken } = data;

    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: {
          userId,
          token: refreshToken,
        },
      });
    }
  }
}

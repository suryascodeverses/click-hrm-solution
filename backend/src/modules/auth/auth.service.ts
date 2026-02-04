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

// Import DTOs from shared package (API contracts)

// Import internal types and validation
import type {
  JWTPayload,
  LoginInput,
  LoginResponseDto,
  RegisterInput,
  RegisterResponseDto,
} from "../../shared/types/auth.types";

/**
 * ========================================
 * AUTH SERVICE
 * ========================================
 * Business logic for authentication operations
 * Uses DTOs from shared package for API contracts
 * Uses internal domain models for business logic
 */

export class AuthService {
  /**
   * Register new tenant admin and create tenant
   */
  async register(data: RegisterInput): Promise<RegisterResponseDto> {
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
    const jwtPayload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);

    // Save refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Return DTO (API contract from shared)
    return {
      user: {
        id: user.id,
        tenantId: user.tenantId,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        email: tenant.email,
        phone: tenant.phone,
        logo: tenant.logo,
        status: tenant.status,
        subscriptionTier: tenant.subscriptionTier,
        maxEmployees: tenant.maxEmployees,
        settings: "",
        createdAt: tenant.createdAt,
        updatedAt: tenant.updatedAt,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Login user
   */
  async login(data: LoginInput): Promise<LoginResponseDto> {
    const { email, password } = data;

    // Find user with relations
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
    const jwtPayload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);

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

    // Return DTO (API contract from shared)
    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
      tenant: user.tenant
        ? {
            id: user.tenant.id,
            name: user.tenant.name,
            subdomain: user.tenant.subdomain,
          }
        : null,
      employee: user.employee
        ? {
            id: user.employee.id,
            employeeCode: user.employee.employeeCode,
            firstName: user.employee.firstName,
            lastName: user.employee.lastName,
            email: user.employee.email,
            status: user.employee.status,
            organisation: user.employee.organisation,
            department: user.employee.department,
            designation: user.employee.designation,
          }
        : null,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Get current user profile
   */
  async getMe(userId: string): Promise<GetMeResponseDto> {
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

    // Return DTO (API contract from shared)
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      tenant: user.tenant
        ? {
            id: user.tenant.id,
            name: user.tenant.name,
            subdomain: user.tenant.subdomain,
          }
        : null,
      employee: user.employee
        ? {
            id: user.employee.id,
            employeeCode: user.employee.employeeCode,
            firstName: user.employee.firstName,
            lastName: user.employee.lastName,
            email: user.employee.email,
            status: user.employee.status,
            organisation: user.employee.organisation,
            department: user.employee.department,
            designation: user.employee.designation,
          }
        : null,
    };
  }

  /**
   * Logout user (invalidate refresh token)
   */
  async logout(userId: string, refreshToken?: string): Promise<void> {
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

import { prisma } from "../../config/database";
import { hashPassword, comparePassword } from "../../utils/password.utils";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/jwt.utils";
import {
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
} from "../../shared/errors";

import type {
  SuperAdminLoginRequestDto,
  SuperAdminLoginResponseDto,
  SuperAdminGetMeResponseDto,
  SuperAdminRefreshTokenResponseDto,
  CreateSuperAdminRequestDto,
  CreateSuperAdminResponseDto,
} from "@arm/shared";

/**
 * ========================================
 * SUPER ADMIN AUTH SERVICE
 * ========================================
 */

export class SuperAdminAuthService {
  /**
   * Super admin login
   */
  async login(
    data: SuperAdminLoginRequestDto,
  ): Promise<SuperAdminLoginResponseDto> {
    const { email, password } = data;

    const superAdmin = await prisma.superAdmin.findUnique({
      where: { email },
    });

    if (!superAdmin) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const isValidPassword = await comparePassword(
      password,
      superAdmin.password,
    );
    if (!isValidPassword) {
      throw new UnauthorizedError("Invalid credentials");
    }

    if (!superAdmin.isActive) {
      throw new ForbiddenError("Account is inactive");
    }

    const accessToken = generateAccessToken({
      userId: superAdmin.id,
      email: superAdmin.email,
      role: "SUPER_ADMIN",
      tenantId: undefined,
    });

    const refreshToken = generateRefreshToken({
      userId: superAdmin.id,
      email: superAdmin.email,
      role: "SUPER_ADMIN",
      tenantId: undefined,
    });

    await prisma.superAdminRefreshToken.create({
      data: {
        superAdminId: superAdmin.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      superAdmin: {
        id: superAdmin.id,
        email: superAdmin.email,
        name: superAdmin.name,
        role: "SUPER_ADMIN",
      },
      accessToken,
    };
  }

  /**
   * Get super admin profile
   */
  async getMe(superAdminId: string): Promise<SuperAdminGetMeResponseDto> {
    const superAdmin = await prisma.superAdmin.findUnique({
      where: { id: superAdminId },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
    });

    if (!superAdmin) {
      throw new UnauthorizedError("Super admin not found");
    }

    return superAdmin;
  }

  /**
   * Logout super admin
   */
  async logout(superAdminId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      await prisma.superAdminRefreshToken.deleteMany({
        where: {
          superAdminId,
          token: refreshToken,
        },
      });
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(
    token: string,
  ): Promise<SuperAdminRefreshTokenResponseDto> {
    const tokenRecord = await prisma.superAdminRefreshToken.findUnique({
      where: { token },
      include: { superAdmin: true },
    });

    if (!tokenRecord) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    if (new Date() > tokenRecord.expiresAt) {
      await prisma.superAdminRefreshToken.delete({
        where: { id: tokenRecord.id },
      });
      throw new UnauthorizedError("Refresh token expired");
    }

    // Rotate refresh token
    await prisma.superAdminRefreshToken.delete({
      where: { id: tokenRecord.id },
    });

    const newRefreshToken = generateRefreshToken({
      userId: tokenRecord.superAdmin.id,
      email: tokenRecord.superAdmin.email,
      role: "SUPER_ADMIN",
      tenantId: undefined,
    });

    await prisma.superAdminRefreshToken.create({
      data: {
        superAdminId: tokenRecord.superAdmin.id,
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const newAccessToken = generateAccessToken({
      userId: tokenRecord.superAdmin.id,
      email: tokenRecord.superAdmin.email,
      role: "SUPER_ADMIN",
      tenantId: undefined,
    });

    return {
      accessToken: newAccessToken,
    };
  }

  /**
   * Create super admin (protected by master key)
   */
  async createSuperAdmin(
    data: CreateSuperAdminRequestDto,
  ): Promise<CreateSuperAdminResponseDto> {
    const { email, password, name, masterKey } = data;

    // Verify master key
    if (masterKey !== process.env.SUPER_ADMIN_MASTER_KEY) {
      throw new ForbiddenError("Invalid master key");
    }

    const existingSuperAdmin = await prisma.superAdmin.findUnique({
      where: { email },
    });

    if (existingSuperAdmin) {
      throw new ConflictError("Super admin with this email already exists");
    }

    const hashedPassword = await hashPassword(password);

    const superAdmin = await prisma.superAdmin.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return superAdmin;
  }
}

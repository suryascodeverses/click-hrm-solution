import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { hashPassword, comparePassword } from "../utils/password.utils";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.utils";

interface SuperAdminAuthRequest extends Request {
  superAdmin?: {
    id: string;
    email: string;
    name: string;
  };
}

export const superAdminLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    // Find super admin
    const superAdmin = await prisma.superAdmin.findUnique({
      where: { email },
    });

    if (!superAdmin) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    // Check password
    const isValidPassword = await comparePassword(
      password,
      superAdmin.password,
    );
    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    // Check if active
    if (!superAdmin.isActive) {
      res.status(403).json({
        success: false,
        message: "Account is inactive",
      });
      return;
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: superAdmin.id,
      email: superAdmin.email,
      role: "SUPER_ADMIN",
    });

    const refreshToken = generateRefreshToken({
      userId: superAdmin.id,
      email: superAdmin.email,
      role: "SUPER_ADMIN",
    });

    // Save refresh token
    await prisma.superAdminRefreshToken.create({
      data: {
        superAdminId: superAdmin.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Update last login
    await prisma.superAdmin.update({
      where: { id: superAdmin.id },
      data: { lastLogin: new Date() },
    });

    res.json({
      success: true,
      message: "Login successful",
      data: {
        superAdmin: {
          id: superAdmin.id,
          email: superAdmin.email,
          name: superAdmin.name,
          role: "SUPER_ADMIN",
        },
        accessToken,
        refreshToken,
      },
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const superAdminGetMe = async (
  req: SuperAdminAuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const superAdmin = await prisma.superAdmin.findUnique({
      where: { id: req.superAdmin!.id },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      data: superAdmin,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const superAdminLogout = async (
  req: SuperAdminAuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await prisma.superAdminRefreshToken.deleteMany({
        where: {
          superAdminId: req.superAdmin!.id,
          token: refreshToken,
        },
      });
    }

    res.json({
      success: true,
      message: "Logout successful",
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const superAdminRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: "Refresh token required",
      });
      return;
    }

    // Find refresh token
    const tokenRecord = await prisma.superAdminRefreshToken.findUnique({
      where: { token: refreshToken },
      include: { superAdmin: true },
    });

    if (!tokenRecord) {
      res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
      return;
    }

    // Check if expired
    if (new Date() > tokenRecord.expiresAt) {
      await prisma.superAdminRefreshToken.delete({
        where: { id: tokenRecord.id },
      });
      res.status(401).json({
        success: false,
        message: "Refresh token expired",
      });
      return;
    }

    // Generate new access token
    const newAccessToken = generateAccessToken({
      userId: tokenRecord.superAdmin.id,
      email: tokenRecord.superAdmin.email,
      role: "SUPER_ADMIN",
    });

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const createSuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password, name, masterKey } = req.body;

    // Check master key (set this in .env)
    if (masterKey !== process.env.SUPER_ADMIN_MASTER_KEY) {
      res.status(403).json({
        success: false,
        message: "Invalid master key",
      });
      return;
    }

    // Check if super admin exists
    const existingSuperAdmin = await prisma.superAdmin.findUnique({
      where: { email },
    });

    if (existingSuperAdmin) {
      res.status(400).json({
        success: false,
        message: "Super admin with this email already exists",
      });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create super admin
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

    res.status(201).json({
      success: true,
      message: "Super admin created successfully",
      data: superAdmin,
    });
    return;
  } catch (error) {
    next(error);
  }
};

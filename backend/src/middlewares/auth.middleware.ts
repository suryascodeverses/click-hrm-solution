import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/database";
import { UserRole } from "@prisma/client";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    tenantId?: string;
    role: UserRole;
    email: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as any;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        tenantId: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
      return;
    }

    req.user = {
      id: user.id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email,
    };

    next();
    return;
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
    return;
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
      return;
    }

    next();
  };
};

export const checkTenantAccess = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tenantId = req.params.tenantId || req.body.tenantId;

    if (!tenantId) {
      res.status(400).json({
        success: false,
        message: "Tenant ID required",
      });
      return;
    }

    // Super admin can access all tenants
    if (req.user?.role === UserRole.SUPER_ADMIN) {
      next();
      return;
    }

    // Check if user belongs to this tenant
    if (req.user?.tenantId !== tenantId) {
      res.status(403).json({
        success: false,
        message: "Access denied to this tenant",
      });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};

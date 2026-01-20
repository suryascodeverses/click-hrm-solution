import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/database";

export interface SuperAdminAuthRequest extends Request {
  superAdmin?: {
    id: string;
    email: string;
    name: string;
  };
}

export const authenticateSuperAdmin = async (
  req: SuperAdminAuthRequest,
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

    // Verify it's a super admin token
    if (decoded.role !== "SUPER_ADMIN") {
      res.status(403).json({
        success: false,
        message: "Super admin access required",
      });
      return;
    }

    const superAdmin = await prisma.superAdmin.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
      },
    });

    if (!superAdmin || !superAdmin.isActive) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
      return;
    }

    req.superAdmin = {
      id: superAdmin.id,
      email: superAdmin.email,
      name: superAdmin.name,
    };
    return;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
    return;
  }
};

import { Request } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "./config/database";
import { UserRole } from "@prisma/client";

/**
 * ========================================
 * TSOA AUTHENTICATION HANDLER
 * ========================================
 * Location: backend/src/authentication.ts
 *
 * This is called automatically by tsoa when @Security() decorator is used
 */

export interface AuthenticatedUser {
  id: string;
  tenantId?: string;
  role: UserRole;
  email: string;
}

export interface AuthenticatedSuperAdmin {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN";
}

/**
 * tsoa authentication function
 * Called automatically when @Security("jwt") or @Security("jwt", ["ADMIN"]) is used
 */
export async function expressAuthentication(
  request: Request,
  securityName: string,
  scopes?: string[],
): Promise<AuthenticatedUser | AuthenticatedSuperAdmin> {
  if (securityName === "jwt") {
    const token = request.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new Error("Authentication required");
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as any;

      // Check if it's a super admin token
      if (decoded.role === "SUPER_ADMIN") {
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
          throw new Error("Invalid or expired token");
        }

        // Attach to request for controller access
        (request as any).superAdmin = {
          id: superAdmin.id,
          email: superAdmin.email,
          name: superAdmin.name,
          role: "SUPER_ADMIN" as const,
        };

        return {
          id: superAdmin.id,
          email: superAdmin.email,
          name: superAdmin.name,
          role: "SUPER_ADMIN" as const,
        };
      }

      // Regular user authentication
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
        throw new Error("Invalid or expired token");
      }

      // Check role-based access if scopes provided
      if (scopes && scopes.length > 0) {
        if (!scopes.includes(user.role)) {
          throw new Error("Insufficient permissions");
        }
      }

      // Attach to request for controller access
      (request as any).user = {
        id: user.id,
        tenantId: user.tenantId,
        role: user.role,
        email: user.email,
      };

      return {
        id: user.id,
        tenantId: user.tenantId,
        role: user.role,
        email: user.email,
      };
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  throw new Error("Unknown authentication type");
}

/**
 * Legacy middleware exports for backwards compatibility
 * (if you have any non-tsoa routes that still need them)
 */
export {
  authenticate,
  authorize,
  checkTenantAccess,
} from "./middlewares/auth.middleware";
export { authenticateSuperAdmin } from "./middlewares/superAdminAuth.middleware";

import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    tenantId?: string;
  };
  superAdmin?: {
    id: string;
    email: string;
    name: string;
  };
}

export const createAuditLog = async (data: {
  tenantId?: string | null;
  userId?: string;
  userEmail?: string;
  userName?: string;
  action: string;
  entity?: string;
  entityId?: string;
  description?: string;
  changes?: any;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}) => {
  try {
    await prisma.auditLog.create({
      data: {
        tenantId: data.tenantId || null,
        userId: data.userId,
        userEmail: data.userEmail,
        userName: data.userName,
        action: data.action as any,
        entity: data.entity,
        entityId: data.entityId,
        description: data.description,
        changes: data.changes || null,
        metadata: data.metadata || null,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
    // Don't throw - audit logging should not break the main flow
  }
};

export const auditMiddleware = (action: string, entity?: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Store original methods
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    // Capture response data
    let responseData: any;

    res.json = function (data: any) {
      responseData = data;
      return originalJson(data);
    };

    res.send = function (data: any) {
      responseData = data;
      return originalSend(data);
    };

    // Wait for response to complete
    res.on("finish", async () => {
      // Only log successful operations (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const user = req.user;
        const superAdmin = req.superAdmin;

        await createAuditLog({
          tenantId: user?.tenantId || null,
          userId: user?.id || superAdmin?.id,
          userEmail: user?.email || superAdmin?.email,
          userName: superAdmin?.name,
          action,
          entity,
          entityId:
            req.params?.id ||
            req.params?.employeeId ||
            req.params?.tenantId ||
            req.params?.userId,
          description: `${action.replace(/_/g, " ").toLowerCase()}`,
          changes: req.body ? { input: req.body } : null,
          metadata: {
            method: req.method,
            path: req.path,
            query: req.query,
          },
          ipAddress:
            req.ip ||
            req.headers["x-forwarded-for"]?.toString() ||
            req.socket.remoteAddress,
          userAgent: req.headers["user-agent"],
        });
      }
    });

    next();
  };
};

// Helper to log specific actions manually
export const logAudit = async (
  req: AuthRequest,
  action: string,
  entity: string,
  entityId: string,
  description: string,
  changes?: any
) => {
  const user = req.user;
  const superAdmin = req.superAdmin;

  await createAuditLog({
    tenantId: user?.tenantId || null,
    userId: user?.id || superAdmin?.id,
    userEmail: user?.email || superAdmin?.email,
    userName: superAdmin?.name,
    action,
    entity,
    entityId,
    description,
    changes,
    ipAddress:
      req.ip ||
      req.headers["x-forwarded-for"]?.toString() ||
      req.socket.remoteAddress,
    userAgent: req.headers["user-agent"],
  });
};

import "reflect-metadata";

import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { errorHandler } from "./middlewares/errorHandler";
import { notFound } from "./middlewares/notFound";
import { RegisterRoutes } from "./generated/routes"; // tsoa auto-generated
import { checkPrismaConnection } from "./config/database";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARES
// ============================================
app.use(helmet()); // Security headers
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:4000",
    credentials: true,
  }),
);
app.use(compression()); // Compress responses
app.use(morgan("dev")); // Logging
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ============================================
// OPTIONAL: GLOBAL AUDIT LOGGING MIDDLEWARE
// ============================================
// Uncomment if you want audit logging on ALL routes
/*
import { createAuditLog } from "./middlewares/audit.middleware";

app.use(async (req: any, res, next) => {
  const originalJson = res.json.bind(res);
  let responseData: any;

  res.json = function (data: any) {
    responseData = data;
    return originalJson(data);
  };

  res.on("finish", async () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const user = req.user;
      const superAdmin = req.superAdmin;
      
      if (user || superAdmin) {
        await createAuditLog({
          tenantId: user?.tenantId || null,
          userId: user?.id || superAdmin?.id,
          userEmail: user?.email || superAdmin?.email,
          userName: superAdmin?.name,
          action: `${req.method}_${req.path.split('/').filter(Boolean).join('_').toUpperCase()}`,
          description: `${req.method} ${req.path}`,
          metadata: {
            method: req.method,
            path: req.path,
            query: req.query,
          },
          ipAddress: req.ip || req.headers["x-forwarded-for"]?.toString() || req.socket.remoteAddress,
          userAgent: req.headers["user-agent"],
        });
      }
    }
  });

  next();
});
*/

// ============================================
// HEALTH CHECK
// ============================================
app.get("/api/health", (_, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// ============================================
// SWAGGER UI DOCUMENTATION
// ============================================
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    swaggerOptions: {
      url: "/api/swagger.json",
    },
  }),
);

// Serve swagger.json
app.get("/api/swagger.json", (_req: Request, res: Response) => {
  res.sendFile(__dirname + "/swagger.json");
});

// ============================================
// TSOA AUTO-GENERATED ROUTES
// ============================================
RegisterRoutes(app);

// ============================================
// ERROR HANDLING
// ============================================
app.use(notFound);
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================
const startServer = async () => {
  try {
    // Check database connection
    await checkPrismaConnection();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 API: http://localhost:${PORT}/api`);
      console.log(`📖 Swagger Docs: http://localhost:${PORT}/api/docs`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;

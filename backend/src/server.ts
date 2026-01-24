import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { errorHandler } from "./middlewares/errorHandler";
import { notFound } from "./middlewares/notFound";

// Import Routes
import authRoutes from "./routes/auth.routes";
import tenantRoutes from "./routes/tenant.routes";
import organisationRoutes from "./routes/organisation.routes";
import employeeRoutes from "./routes/employee.routes";
import departmentRoutes from "./routes/department.routes";
import designationRoutes from "./routes/designation.routes";
import superAdminRoutes from "./routes/superAdmin.routes";
import superAdminAuthRoutes from "./routes/superAdminAuth.routes";
import attendanceRoutes from "./routes/attendance.routes";
import leaveRoutes from "./routes/leave.routes";
import payrollRoutes from "./routes/payroll.routes";
import reportsRoutes from "./routes/reports.routes";
import auditLogsRoutes from "./routes/auditLogs.routes";
import billingRoutes from "./routes/billing.routes";
import emailTemplatesRoutes from "./routes/emailTemplates.routes";
import monitoringRoutes from "./routes/monitoring.routes";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARES
// ============================================
app.use(helmet()); // Security headers
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(compression()); // Compress responses
app.use(morgan("dev")); // Logging
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ============================================
// ROUTES
// ============================================
app.get("/api/health", (_, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/organisations", organisationRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/designations", designationRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/super-admin", superAdminRoutes);
app.use("/api/super-admin/auth", superAdminAuthRoutes);
app.use("/api/super-admin/audit-logs", auditLogsRoutes);
app.use("/api/super-admin/billing", billingRoutes);
app.use("/api/super-admin/email-templates", emailTemplatesRoutes);
app.use("/api/super-admin/monitoring", monitoringRoutes);

// ============================================
// ERROR HANDLING
// ============================================
app.use(notFound);
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
});

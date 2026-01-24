import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import os from "os";

// Get system health
export const getSystemHealth = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // CPU Usage
    const cpus = os.cpus();
    const cpuUsage =
      cpus.reduce((acc, cpu) => {
        const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
        const idle = cpu.times.idle;
        return acc + (100 - (idle / total) * 100);
      }, 0) / cpus.length;

    // Memory Usage
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsagePercent = (usedMemory / totalMemory) * 100;

    // Database size (PostgreSQL specific)
    const dbSize = await prisma.$queryRaw<any[]>`
      SELECT pg_database_size(current_database()) as size
    `;

    // Active connections
    const activeConnections = await prisma.$queryRaw<any[]>`
      SELECT count(*) as count FROM pg_stat_activity 
      WHERE datname = current_database()
    `;

    // Record metrics
    await Promise.all([
      prisma.systemMetric.create({
        data: {
          metricType: "CPU_USAGE",
          value: cpuUsage,
          unit: "%",
        },
      }),
      prisma.systemMetric.create({
        data: {
          metricType: "MEMORY_USAGE",
          value: memoryUsagePercent,
          unit: "%",
        },
      }),
      prisma.systemMetric.create({
        data: {
          metricType: "DATABASE_SIZE",
          value: parseInt(dbSize[0].size) / (1024 * 1024), // Convert to MB
          unit: "MB",
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        cpu: {
          usage: cpuUsage.toFixed(2),
          cores: cpus.length,
        },
        memory: {
          total: (totalMemory / (1024 * 1024 * 1024)).toFixed(2), // GB
          used: (usedMemory / (1024 * 1024 * 1024)).toFixed(2),
          free: (freeMemory / (1024 * 1024 * 1024)).toFixed(2),
          usagePercent: memoryUsagePercent.toFixed(2),
        },
        database: {
          size: (parseInt(dbSize[0].size) / (1024 * 1024)).toFixed(2), // MB
          connections: parseInt(activeConnections[0].count),
        },
        uptime: os.uptime(),
        platform: os.platform(),
        nodeVersion: process.version,
      },
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Get metrics history
export const getMetricsHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { metricType, hours = "24" } = req.query;

    const hoursNum = parseInt(hours as string);
    const startDate = new Date(Date.now() - hoursNum * 60 * 60 * 1000);

    const where: any = {
      recordedAt: { gte: startDate },
    };

    if (metricType) {
      where.metricType = metricType;
    }

    const metrics = await prisma.systemMetric.findMany({
      where,
      orderBy: { recordedAt: "asc" },
    });

    // Group by metric type
    const groupedMetrics: any = {};
    metrics.forEach((metric) => {
      if (!groupedMetrics[metric.metricType]) {
        groupedMetrics[metric.metricType] = [];
      }
      groupedMetrics[metric.metricType].push({
        value: metric.value,
        unit: metric.unit,
        timestamp: metric.recordedAt,
      });
    });

    res.json({
      success: true,
      data: groupedMetrics,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Get database stats
export const getDatabaseStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [
      tenantCount,
      userCount,
      employeeCount,
      auditLogCount,
      emailLogCount,
    ] = await Promise.all([
      prisma.tenant.count(),
      prisma.user.count(),
      prisma.employee.count(),
      prisma.auditLog.count(),
      prisma.emailLog.count(),
    ]);

    // Table sizes
    const tableSizes = await prisma.$queryRaw<any[]>`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
        pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
      LIMIT 10
    `;

    res.json({
      success: true,
      data: {
        recordCounts: {
          tenants: tenantCount,
          users: userCount,
          employees: employeeCount,
          auditLogs: auditLogCount,
          emailLogs: emailLogCount,
        },
        tableSizes,
      },
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Get API usage stats
export const getApiUsageStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get audit logs grouped by action (as proxy for API usage)
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const apiCalls = await prisma.auditLog.groupBy({
      by: ["action"],
      where: {
        createdAt: { gte: last24Hours },
      },
      _count: { action: true },
      orderBy: {
        _count: {
          action: "desc",
        },
      },
      take: 10,
    });

    // Calls per hour
    const callsPerHour = await prisma.$queryRaw<any[]>`
      SELECT 
        DATE_TRUNC('hour', "createdAt") as hour,
        COUNT(*) as count
      FROM audit_logs
      WHERE "createdAt" >= NOW() - INTERVAL '24 hours'
      GROUP BY hour
      ORDER BY hour ASC
    `;

    res.json({
      success: true,
      data: {
        topEndpoints: apiCalls,
        callsPerHour,
        total24h: apiCalls.reduce((sum, item) => sum + item._count.action, 0),
      },
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Get system alerts
export const getSystemAlerts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { severity, isResolved } = req.query;

    const where: any = {};
    if (severity) where.severity = severity;
    if (isResolved !== undefined) where.isResolved = isResolved === "true";

    const alerts = await prisma.systemAlert.findMany({
      where,
      orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
      take: 100,
    });

    const stats = {
      total: alerts.length,
      critical: alerts.filter((a) => a.severity === "CRITICAL").length,
      high: alerts.filter((a) => a.severity === "HIGH").length,
      unresolved: alerts.filter((a) => !a.isResolved).length,
    };

    res.json({
      success: true,
      data: {
        alerts,
        stats,
      },
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Create system alert
export const createSystemAlert = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { alertType, severity, title, message, metadata } = req.body;

    const alert = await prisma.systemAlert.create({
      data: {
        alertType,
        severity,
        title,
        message,
        metadata,
      },
    });

    res.status(201).json({
      success: true,
      message: "Alert created",
      data: alert,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Resolve alert
export const resolveAlert = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { alertId } = req.params;

    const alert = await prisma.systemAlert.update({
      where: { id: alertId },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: "Alert resolved",
      data: alert,
    });
    return;
  } catch (error) {
    next(error);
  }
};

// Get error rate
export const getErrorRate = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const errorLogs = await prisma.auditLog.count({
      where: {
        action: "LOGIN_FAILED",
        createdAt: { gte: last24Hours },
      },
    });

    const totalLogs = await prisma.auditLog.count({
      where: {
        createdAt: { gte: last24Hours },
      },
    });

    const errorRate = totalLogs > 0 ? (errorLogs / totalLogs) * 100 : 0;

    res.json({
      success: true,
      data: {
        errorRate: errorRate.toFixed(2),
        errors24h: errorLogs,
        total24h: totalLogs,
      },
    });
    return;
  } catch (error) {
    next(error);
  }
};

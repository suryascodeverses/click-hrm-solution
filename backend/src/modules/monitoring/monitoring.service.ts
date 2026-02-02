import { prisma } from "../../config/database";
import os from "os";
import type {
  CreateSystemAlertRequestDto,
  SystemHealthDto,
  MetricsHistoryDto,
  DatabaseStatsDto,
  ApiUsageStatsDto,
  SystemAlertsResponseDto,
  ErrorRateDto,
} from "@arm/shared";

export class MonitoringService {
  async getSystemHealth(): Promise<SystemHealthDto> {
    const cpus = os.cpus();
    const cpuUsage =
      cpus.reduce((acc, cpu) => {
        const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
        const idle = cpu.times.idle;
        return acc + (100 - (idle / total) * 100);
      }, 0) / cpus.length;

    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsagePercent = (usedMemory / totalMemory) * 100;

    const dbSize = await prisma.$queryRaw<
      any[]
    >`SELECT pg_database_size(current_database()) as size`;
    const activeConnections = await prisma.$queryRaw<
      any[]
    >`SELECT count(*) as count FROM pg_stat_activity WHERE datname = current_database()`;

    await Promise.all([
      prisma.systemMetric.create({
        data: { metricType: "CPU_USAGE", value: cpuUsage, unit: "%" },
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
          value: parseInt(dbSize[0].size) / (1024 * 1024),
          unit: "MB",
        },
      }),
    ]);

    return {
      cpu: { usage: cpuUsage.toFixed(2), cores: cpus.length },
      memory: {
        total: (totalMemory / (1024 * 1024 * 1024)).toFixed(2),
        used: (usedMemory / (1024 * 1024 * 1024)).toFixed(2),
        free: (freeMemory / (1024 * 1024 * 1024)).toFixed(2),
        usagePercent: memoryUsagePercent.toFixed(2),
      },
      database: {
        size: (parseInt(dbSize[0].size) / (1024 * 1024)).toFixed(2),
        connections: parseInt(activeConnections[0].count),
      },
      uptime: os.uptime(),
      platform: os.platform(),
      nodeVersion: process.version,
    };
  }

  async getMetricsHistory(
    metricType?: string,
    hours = 24,
  ): Promise<MetricsHistoryDto> {
    const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);
    const where: any = { recordedAt: { gte: startDate } };
    if (metricType) where.metricType = metricType;

    const metrics = await prisma.systemMetric.findMany({
      where,
      orderBy: { recordedAt: "asc" },
    });

    const groupedMetrics: any = {};
    metrics.forEach((metric) => {
      if (!groupedMetrics[metric.metricType])
        groupedMetrics[metric.metricType] = [];
      groupedMetrics[metric.metricType].push({
        value: metric.value,
        unit: metric.unit,
        timestamp: metric.recordedAt,
      });
    });

    return groupedMetrics;
  }

  async getDatabaseStats(): Promise<DatabaseStatsDto> {
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

    const tableSizes = await prisma.$queryRaw<any[]>`
      SELECT schemaname, tablename, 
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
        pg_total_relation_size(schemaname||'.'||tablename)::text AS size_bytes
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
      LIMIT 10
    `;

    return {
      recordCounts: {
        tenants: tenantCount,
        users: userCount,
        employees: employeeCount,
        auditLogs: auditLogCount,
        emailLogs: emailLogCount,
      },
      tableSizes,
    };
  }

  async getApiUsageStats(): Promise<ApiUsageStatsDto> {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const apiCalls = await prisma.auditLog.groupBy({
      by: ["action"],
      where: { createdAt: { gte: last24Hours } },
      _count: { action: true },
      orderBy: { _count: { action: "desc" } },
      take: 10,
    });

    const callsPerHour = await prisma.$queryRaw<any[]>`
      SELECT DATE_TRUNC('hour', "createdAt") as hour, COUNT(*) as count
      FROM audit_logs WHERE "createdAt" >= NOW() - INTERVAL '24 hours'
      GROUP BY hour ORDER BY hour ASC
    `;

    return {
      topEndpoints: apiCalls,
      callsPerHour,
      total24h: apiCalls.reduce((sum, item) => sum + item._count.action, 0),
    };
  }

  async getSystemAlerts(
    severity?: string,
    isResolved?: boolean,
  ): Promise<SystemAlertsResponseDto> {
    const where: any = {};
    if (severity) where.severity = severity;
    if (isResolved !== undefined) where.isResolved = isResolved;

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

    return { alerts, stats };
  }

  async createSystemAlert(data: CreateSystemAlertRequestDto): Promise<any> {
    return await prisma.systemAlert.create({ data });
  }

  async resolveAlert(alertId: string): Promise<any> {
    return await prisma.systemAlert.update({
      where: { id: alertId },
      data: { isResolved: true, resolvedAt: new Date() },
    });
  }

  async getErrorRate(): Promise<ErrorRateDto> {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const errorLogs = await prisma.auditLog.count({
      where: { action: "LOGIN_FAILED", createdAt: { gte: last24Hours } },
    });
    const totalLogs = await prisma.auditLog.count({
      where: { createdAt: { gte: last24Hours } },
    });
    const errorRate = totalLogs > 0 ? (errorLogs / totalLogs) * 100 : 0;

    return {
      errorRate: errorRate.toFixed(2),
      errors24h: errorLogs,
      total24h: totalLogs,
    };
  }
}

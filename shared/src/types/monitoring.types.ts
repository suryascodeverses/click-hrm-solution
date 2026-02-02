/**
 * ========================================
 * MONITORING - REQUEST/RESPONSE DTOs
 * ========================================
 * Location: shared/src/types/monitoring.types.ts
 */

export interface CreateSystemAlertRequestDto {
  alertType: string;
  severity: string;
  title: string;
  message: string;
  metadata?: any;
}

export interface SystemHealthDto {
  cpu: { usage: string; cores: number };
  memory: { total: string; used: string; free: string; usagePercent: string };
  database: { size: string; connections: number };
  uptime: number;
  platform: string;
  nodeVersion: string;
}

export interface MetricsHistoryDto {
  [metricType: string]: Array<{ value: number; unit: string; timestamp: Date }>;
}

export interface DatabaseStatsDto {
  recordCounts: {
    tenants: number;
    users: number;
    employees: number;
    auditLogs: number;
    emailLogs: number;
  };
  tableSizes: Array<{
    schemaname: string;
    tablename: string;
    size: string;
    size_bytes: string;
  }>;
}

export interface ApiUsageStatsDto {
  topEndpoints: any[];
  callsPerHour: Array<{ hour: Date; count: number }>;
  total24h: number;
}

export interface SystemAlertDto {
  id: string;
  alertType: string;
  severity: string;
  title: string;
  message: string;
  metadata: any;
  isResolved: boolean;
  resolvedAt: Date | null;
  createdAt: Date;
}

export interface SystemAlertsResponseDto {
  alerts: SystemAlertDto[];
  stats: {
    total: number;
    critical: number;
    high: number;
    unresolved: number;
  };
}

export interface ErrorRateDto {
  errorRate: string;
  errors24h: number;
  total24h: number;
}

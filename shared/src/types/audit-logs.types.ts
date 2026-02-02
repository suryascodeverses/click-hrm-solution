/**
 * ========================================
 * AUDIT LOGS - REQUEST/RESPONSE DTOs
 * ========================================
 * Location: shared/src/types/audit-logs.types.ts
 */

// ============================================
// REQUEST DTOs
// ============================================

export interface GetAuditLogsQueryDto {
  page?: number;
  limit?: number;
  tenantId?: string;
  userId?: string;
  action?: string;
  entity?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

// ============================================
// RESPONSE DTOs
// ============================================

export interface AuditLogDto {
  id: string;
  tenantId: string | null;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  action: string;
  entity: string | null;
  entityId: string | null;
  description: string;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: any;
  createdAt: Date;
}

export interface GetAuditLogsResponseDto {
  logs: AuditLogDto[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuditLogStatsDto {
  stats: {
    totalLogs: number;
    last24Hours: number;
    loginAttempts: number;
    failedLogins: number;
  };
  topActions: Array<{
    action: string;
    count: number;
  }>;
}

export interface AuditLogFiltersDto {
  actions: string[];
  entities: string[];
}

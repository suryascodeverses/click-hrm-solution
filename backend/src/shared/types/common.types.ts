/**
 * ========================================
 * COMMON/SHARED TYPES & DTOs
 * ========================================
 * Location: shared/types/common.types.ts
 */

// ============================================
// PAGINATION
// ============================================

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponseDto<T> {
  data: T[];
  pagination: PaginationMeta;
}

// ============================================
// API RESPONSES
// ============================================

export interface SuccessResponseDto<T = any> {
  success: true;
  message: string;
  data: T;
}

export interface ErrorResponseDto {
  success: false;
  message: string;
  errors?: Array<{
    field?: string;
    message: string;
    code?: string;
  }>;
  statusCode: number;
}

export interface ValidationErrorDto {
  field: string;
  message: string;
  code: string;
}

// ============================================
// COMMON FILTERS
// ============================================

export interface DateRangeFilter {
  startDate?: Date | string;
  endDate?: Date | string;
}

export interface SearchFilter {
  search?: string;
  searchFields?: string[];
}

export interface StatusFilter {
  status?: string | string[];
}

// ============================================
// AUDIT & METADATA
// ============================================

export interface AuditFields {
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface TimestampFields {
  createdAt: Date;
  updatedAt: Date;
}

export interface SoftDeleteFields extends TimestampFields {
  deletedAt: Date | null;
  deletedBy?: string | null;
}

// ============================================
// FILE UPLOAD
// ============================================

export interface FileUploadDto {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  url?: string;
}

export interface MultipleFileUploadDto {
  files: FileUploadDto[];
  totalSize: number;
  count: number;
}

// ============================================
// BULK OPERATIONS
// ============================================

export interface BulkOperationInput<T> {
  items: T[];
  options?: {
    skipValidation?: boolean;
    continueOnError?: boolean;
  };
}

export interface BulkOperationResultDto<T> {
  successCount: number;
  failureCount: number;
  totalCount: number;
  successItems: T[];
  failedItems: Array<{
    item: Partial<T>;
    error: string;
    index: number;
  }>;
  message: string;
}

// ============================================
// EXPORT/IMPORT
// ============================================

export interface ExportOptionsDto {
  format: "csv" | "xlsx" | "pdf";
  fields?: string[];
  filters?: Record<string, any>;
  includeHeaders?: boolean;
  fileName?: string;
}

export interface ExportResultDto {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  recordCount: number;
  format: string;
  generatedAt: Date;
}

export interface ImportOptionsDto {
  file: FileUploadDto;
  validateOnly?: boolean;
  skipDuplicates?: boolean;
  updateExisting?: boolean;
  mapping?: Record<string, string>;
}

export interface ImportResultDto<T> {
  totalRecords: number;
  successCount: number;
  failureCount: number;
  duplicateCount: number;
  updatedCount: number;
  successRecords: T[];
  failedRecords: Array<{
    row: number;
    data: Partial<T>;
    error: string;
  }>;
  message: string;
}

// ============================================
// NOTIFICATIONS
// ============================================

export enum NotificationType {
  INFO = "INFO",
  SUCCESS = "SUCCESS",
  WARNING = "WARNING",
  ERROR = "ERROR",
}

export enum NotificationChannel {
  EMAIL = "EMAIL",
  SMS = "SMS",
  PUSH = "PUSH",
  IN_APP = "IN_APP",
}

export interface NotificationDto {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  channel: NotificationChannel;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface SendNotificationInput {
  userId: string | string[];
  type: NotificationType;
  title: string;
  message: string;
  channels: NotificationChannel[];
  metadata?: Record<string, any>;
}

// ============================================
// SETTINGS
// ============================================

export interface SettingDto {
  key: string;
  value: any;
  category: string;
  description?: string;
  isPublic: boolean;
  isEditable: boolean;
}

export interface UpdateSettingInput {
  value: any;
}

// ============================================
// ANALYTICS
// ============================================

export interface AnalyticsDataPointDto {
  date: Date;
  value: number;
  label?: string;
  metadata?: Record<string, any>;
}

export interface AnalyticsTimeSeriesDto {
  data: AnalyticsDataPointDto[];
  total: number;
  average: number;
  min: number;
  max: number;
  period: {
    startDate: Date;
    endDate: Date;
  };
}

export interface AnalyticsComparisonDto {
  current: AnalyticsTimeSeriesDto;
  previous: AnalyticsTimeSeriesDto;
  percentageChange: number;
  trend: "up" | "down" | "stable";
}

// ============================================
// PERMISSIONS & RBAC
// ============================================

export enum Module {
  DASHBOARD = "DASHBOARD",
  EMPLOYEES = "EMPLOYEES",
  DEPARTMENTS = "DEPARTMENTS",
  ATTENDANCE = "ATTENDANCE",
  LEAVE = "LEAVE",
  PAYROLL = "PAYROLL",
  PERFORMANCE = "PERFORMANCE",
  RECRUITMENT = "RECRUITMENT",
  REPORTS = "REPORTS",
  SETTINGS = "SETTINGS",
  ORGANISATION = "ORGANISATION",
  TENANT_MANAGEMENT = "TENANT_MANAGEMENT",
}

export enum Action {
  VIEW = "VIEW",
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  APPROVE = "APPROVE",
  EXPORT = "EXPORT",
  MANAGE = "MANAGE",
}

export interface PermissionDto {
  id: string;
  module: Module;
  action: Action;
  description: string | null;
  createdAt: Date;
}

export interface RolePermissionDto {
  id: string;
  role: string;
  permissionId: string;
  permission: PermissionDto;
  createdAt: Date;
}

export interface CheckPermissionInput {
  module: Module;
  action: Action;
}

// ============================================
// AUDIT LOGS
// ============================================

export enum AuditAction {
  // Authentication
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  LOGIN_FAILED = "LOGIN_FAILED",
  REFRESH_TOKEN = "REFRESH_TOKEN",

  // Super Admin
  SUPER_ADMIN_LOGIN = "SUPER_ADMIN_LOGIN",
  TENANT_CREATED = "TENANT_CREATED",
  TENANT_UPDATED = "TENANT_UPDATED",
  TENANT_DELETED = "TENANT_DELETED",
  TENANT_SUSPENDED = "TENANT_SUSPENDED",
  TENANT_ACTIVATED = "TENANT_ACTIVATED",

  // User Management
  USER_CREATED = "USER_CREATED",
  USER_UPDATED = "USER_UPDATED",
  USER_DELETED = "USER_DELETED",
  USER_ACTIVATED = "USER_ACTIVATED",
  USER_DEACTIVATED = "USER_DEACTIVATED",
  ROLE_CHANGED = "ROLE_CHANGED",

  // Employee Management
  EMPLOYEE_CREATED = "EMPLOYEE_CREATED",
  EMPLOYEE_UPDATED = "EMPLOYEE_UPDATED",
  EMPLOYEE_DELETED = "EMPLOYEE_DELETED",
  EMPLOYEE_STATUS_CHANGED = "EMPLOYEE_STATUS_CHANGED",

  // Organisation
  ORGANISATION_CREATED = "ORGANISATION_CREATED",
  ORGANISATION_UPDATED = "ORGANISATION_UPDATED",
  ORGANISATION_DELETED = "ORGANISATION_DELETED",

  // Department
  DEPARTMENT_CREATED = "DEPARTMENT_CREATED",
  DEPARTMENT_UPDATED = "DEPARTMENT_UPDATED",
  DEPARTMENT_DELETED = "DEPARTMENT_DELETED",

  // Attendance
  ATTENDANCE_MARKED = "ATTENDANCE_MARKED",
  ATTENDANCE_UPDATED = "ATTENDANCE_UPDATED",

  // Leave
  LEAVE_APPLIED = "LEAVE_APPLIED",
  LEAVE_APPROVED = "LEAVE_APPROVED",
  LEAVE_REJECTED = "LEAVE_REJECTED",
  LEAVE_CANCELLED = "LEAVE_CANCELLED",

  // Payroll
  SALARY_STRUCTURE_CREATED = "SALARY_STRUCTURE_CREATED",
  SALARY_STRUCTURE_UPDATED = "SALARY_STRUCTURE_UPDATED",
  PAYSLIP_GENERATED = "PAYSLIP_GENERATED",
  PAYSLIP_PROCESSED = "PAYSLIP_PROCESSED",

  // Settings
  SETTINGS_UPDATED = "SETTINGS_UPDATED",

  // Other
  DATA_EXPORTED = "DATA_EXPORTED",
  BULK_OPERATION = "BULK_OPERATION",
}

export interface AuditLogDto {
  id: string;
  tenantId: string | null;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  action: AuditAction;
  entity: string | null;
  entityId: string | null;
  description: string | null;
  changes: Record<string, any> | null;
  metadata: Record<string, any> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export interface CreateAuditLogInput {
  tenantId?: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  action: AuditAction;
  entity?: string;
  entityId?: string;
  description?: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditLogQueryParams {
  tenantId?: string;
  userId?: string;
  action?: AuditAction | AuditAction[];
  entity?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "action";
  sortOrder?: "asc" | "desc";
}

// ============================================
// DASHBOARD WIDGETS
// ============================================

export interface DashboardWidgetDto {
  id: string;
  title: string;
  type: "stat" | "chart" | "table" | "list";
  data: any;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  refreshInterval?: number;
}

export interface DashboardConfigDto {
  userId: string;
  widgets: DashboardWidgetDto[];
  layout: string;
  theme: "light" | "dark";
}

// ============================================
// SYSTEM HEALTH
// ============================================

export interface SystemHealthDto {
  status: "healthy" | "degraded" | "down";
  uptime: number;
  database: {
    status: string;
    responseTime: number;
    connections: number;
  };
  cache: {
    status: string;
    hitRate: number;
  };
  queue: {
    status: string;
    pending: number;
    failed: number;
  };
  lastChecked: Date;
}

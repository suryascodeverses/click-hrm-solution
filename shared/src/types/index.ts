/**
 * ========================================
 * SHARED TYPES - INDEX
 * ========================================
 * Central export file for all shared types
 */

// ============================================
// ENUMS
// ============================================

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  TENANT_ADMIN = "TENANT_ADMIN",
  ORG_ADMIN = "ORG_ADMIN",
  HR_MANAGER = "HR_MANAGER",
  MANAGER = "MANAGER",
  EMPLOYEE = "EMPLOYEE",
}

export enum EmployeeStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  ON_LEAVE = "ON_LEAVE",
  TERMINATED = "TERMINATED",
  RESIGNED = "RESIGNED",
}

export enum TenantStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  INACTIVE = "INACTIVE",
}

// ============================================
// TYPE EXPORTS
// ============================================

// Common types
export * from "./common.types";

// Auth
export * from "./auth.types";

// Super admin auth
export * from "./super-admin-auth.types";

// Super admin
export * from "./super-admin.types";

// Attendance
export * from "./attendance.types";

// Audit logs
export * from "./audit-logs.types";

// Billing
export * from "./billing.types";

// Department
export * from "./department.types";

// Designation
export * from "./designation.types";

// Email templates
export * from "./email-templates.types";

// Employee
export * from "./employee.types";

// Leave
export * from "./leave.types";

// Monitoring
export * from "./monitoring.types";

// Organisation
export * from "./organisation.types";

// Payroll
export * from "./payroll.types";

// Reports
export * from "./reports.types";

// Tenant
export * from "./tenant.types";
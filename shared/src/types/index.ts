// Export existing types (keep your original enums)
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

// Export new common types
export * from "./common.types";

// Export auth DTOs
export * from "./auth.types";

export * from "./attendance.types";

export * from "./audit-logs.types";

export * from "./billing.types";

export * from "./employee.types";

export * from "./tenant.types";

export * from "./employee.types";

export * from "./email-templates.types";

export * from "./organisation.types";

export * from "./department.types";

export * from "./designation.types";

export * from "./leave.types";

export * from "./reports.types";

export * from "./monitoring.types";

export * from "./payroll.types";

export * from "./super-admin-auth.types";

export * from "./super-admin.types";

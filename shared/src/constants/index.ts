import { UserRole } from "../types";

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 6,
  [UserRole.TENANT_ADMIN]: 5,
  [UserRole.ORG_ADMIN]: 4,
  [UserRole.HR_MANAGER]: 3,
  [UserRole.MANAGER]: 2,
  [UserRole.EMPLOYEE]: 1,
};

export const ROLE_PERMISSIONS = {
  [UserRole.SUPER_ADMIN]: ["*"], // All permissions
  [UserRole.TENANT_ADMIN]: [
    "manage_organisations",
    "manage_employees",
    "manage_departments",
    "view_reports",
    "manage_payroll",
  ],
  [UserRole.ORG_ADMIN]: [
    "manage_employees",
    "manage_departments",
    "view_reports",
  ],
  [UserRole.HR_MANAGER]: ["manage_employees", "view_reports", "manage_payroll"],
  [UserRole.MANAGER]: ["view_team", "approve_leaves"],
  [UserRole.EMPLOYEE]: ["view_profile", "apply_leave", "mark_attendance"],
};

export const API_ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
  },
  EMPLOYEES: "/employees",
  ORGANISATIONS: "/organisations",
  DEPARTMENTS: "/departments",
  DESIGNATIONS: "/designations",
  TENANTS: "/tenants",
  SUPER_ADMIN: {
    DASHBOARD: "/super-admin/dashboard",
    TENANTS: "/super-admin/tenants",
  },
};

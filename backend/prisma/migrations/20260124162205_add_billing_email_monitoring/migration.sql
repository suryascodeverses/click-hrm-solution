/*
  Warnings:

  - Changed the type of `action` on the `audit_logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'REFRESH_TOKEN', 'SUPER_ADMIN_LOGIN', 'TENANT_CREATED', 'TENANT_UPDATED', 'TENANT_DELETED', 'TENANT_SUSPENDED', 'TENANT_ACTIVATED', 'USER_CREATED', 'USER_UPDATED', 'USER_DELETED', 'USER_ACTIVATED', 'USER_DEACTIVATED', 'ROLE_CHANGED', 'EMPLOYEE_CREATED', 'EMPLOYEE_UPDATED', 'EMPLOYEE_DELETED', 'EMPLOYEE_STATUS_CHANGED', 'ORGANISATION_CREATED', 'ORGANISATION_UPDATED', 'ORGANISATION_DELETED', 'DEPARTMENT_CREATED', 'DEPARTMENT_UPDATED', 'DEPARTMENT_DELETED', 'ATTENDANCE_MARKED', 'ATTENDANCE_UPDATED', 'LEAVE_APPLIED', 'LEAVE_APPROVED', 'LEAVE_REJECTED', 'LEAVE_CANCELLED', 'SALARY_STRUCTURE_CREATED', 'SALARY_STRUCTURE_UPDATED', 'PAYSLIP_GENERATED', 'PAYSLIP_PROCESSED', 'SETTINGS_UPDATED', 'DATA_EXPORTED', 'BULK_OPERATION');

-- AlterTable
ALTER TABLE "audit_logs" ADD COLUMN     "description" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "userEmail" TEXT,
ADD COLUMN     "userName" TEXT,
ALTER COLUMN "tenantId" DROP NOT NULL,
DROP COLUMN "action",
ADD COLUMN     "action" "AuditAction" NOT NULL;

-- CreateIndex
CREATE INDEX "audit_logs_userId_createdAt_idx" ON "audit_logs"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_action_createdAt_idx" ON "audit_logs"("action", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_entity_createdAt_idx" ON "audit_logs"("entity", "createdAt");

import { prisma } from "../../config/database";
import { hashPassword } from "../../utils/password.utils";
import { NotFoundError, ConflictError } from "../../shared/errors";

import type {
  CreateEmployeeRequestDto,
  UpdateEmployeeRequestDto,
  EmployeeListItemDto,
  EmployeeDetailDto,
  CreateEmployeeResponseDto,
} from "@arm/shared";

/**
 * ========================================
 * EMPLOYEE SERVICE
 * ========================================
 * Location: backend/src/modules/employee/employee.service.ts
 */

export class EmployeeService {
  /**
   * Create employee
   */
  async createEmployee(
    tenantId: string,
    data: CreateEmployeeRequestDto,
  ): Promise<CreateEmployeeResponseDto> {
    const {
      organisationId,
      employeeCode,
      firstName,
      lastName,
      email,
      phone,
      dateOfJoining,
      departmentId,
      designationId,
      password,
    } = data;

    // Check if email already exists
    const existingUser = await prisma.user.findFirst({
      where: { tenantId, email },
    });

    if (existingUser) {
      throw new ConflictError("Email already exists");
    }

    // Create user first
    const hashedPassword = await hashPassword(password || "Welcome@123");
    const user = await prisma.user.create({
      data: {
        tenantId,
        email,
        password: hashedPassword,
        role: "EMPLOYEE",
      },
    });

    // Create employee
    const employee = await prisma.employee.create({
      data: {
        userId: user.id,
        organisationId,
        employeeCode,
        firstName,
        lastName,
        email,
        phone,
        dateOfJoining: new Date(dateOfJoining),
        departmentId,
        designationId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        department: true,
        designation: true,
      },
    });

    return employee;
  }

  /**
   * Get employees (with filters)
   */
  async getEmployees(
    tenantId: string,
    filters?: {
      organisationId?: string;
      departmentId?: string;
      status?: string;
    },
  ): Promise<EmployeeListItemDto[]> {
    const where: any = {
      organisation: { tenantId },
    };

    if (filters?.organisationId) where.organisationId = filters.organisationId;
    if (filters?.departmentId) where.departmentId = filters.departmentId;
    if (filters?.status) where.status = filters.status;

    const employees = await prisma.employee.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
            role: true,
            isActive: true,
          },
        },
        department: true,
        designation: true,
        organisation: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return employees;
  }

  /**
   * Get employee by ID
   */
  async getEmployee(id: string): Promise<EmployeeDetailDto> {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            role: true,
            isActive: true,
            lastLogin: true,
          },
        },
        department: true,
        designation: true,
        organisation: true,
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
        subordinates: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
      },
    });

    if (!employee) {
      throw new NotFoundError("Employee not found");
    }

    return employee as EmployeeDetailDto;
  }

  /**
   * Update employee
   */
  async updateEmployee(
    id: string,
    data: UpdateEmployeeRequestDto,
  ): Promise<EmployeeDetailDto> {
    const employee = await prisma.employee.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            email: true,
            role: true,
            isActive: true,
            lastLogin: true,
          },
        },
        department: true,
        designation: true,
        organisation: true,
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
        subordinates: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
      },
    });

    return employee as EmployeeDetailDto;
  }

  /**
   * Delete employee
   */
  async deleteEmployee(id: string): Promise<void> {
    const employee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      throw new NotFoundError("Employee not found");
    }

    // Delete user (will cascade delete employee)
    await prisma.user.delete({
      where: { id: employee.userId },
    });
  }
}

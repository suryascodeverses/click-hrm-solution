import { prisma } from "../../config/database";
import { NotFoundError } from "../../shared/errors";

import type {
  CreateDepartmentRequestDto,
  UpdateDepartmentRequestDto,
  DepartmentDto,
  DepartmentListItemDto,
  DepartmentDetailDto,
} from "@arm/shared";

/**
 * ========================================
 * DEPARTMENT SERVICE
 * ========================================
 */

export class DepartmentService {
  /**
   * Create department
   */
  async createDepartment(
    data: CreateDepartmentRequestDto,
  ): Promise<DepartmentDto> {
    const department = await prisma.department.create({
      data,
    });

    return department;
  }

  /**
   * Get departments (optionally filtered by organisation)
   */
  async getDepartments(
    organisationId?: string,
  ): Promise<DepartmentListItemDto[]> {
    const departments = await prisma.department.findMany({
      where: organisationId ? { organisationId } : {},
      include: {
        organisation: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            employees: true,
            designations: true,
          },
        },
      },
    });

    return departments;
  }

  /**
   * Get department by ID
   */
  async getDepartment(id: string): Promise<DepartmentDetailDto> {
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        organisation: true,
        employees: {
          take: 10,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            designation: true,
          },
        },
        designations: true,
      },
    });

    if (!department) {
      throw new NotFoundError("Department not found");
    }

    return department;
  }

  /**
   * Update department
   */
  async updateDepartment(
    id: string,
    data: UpdateDepartmentRequestDto,
  ): Promise<DepartmentDto> {
    const department = await prisma.department.update({
      where: { id },
      data,
    });

    return department;
  }

  /**
   * Delete department
   */
  async deleteDepartment(id: string): Promise<void> {
    await prisma.department.delete({
      where: { id },
    });
  }
}

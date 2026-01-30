import { prisma } from "../../config/database";
import { NotFoundError } from "../../shared/errors";

import type {
  CreateDesignationRequestDto,
  UpdateDesignationRequestDto,
  DesignationDto,
  DesignationListItemDto,
} from "@arm/shared";

/**
 * ========================================
 * DESIGNATION SERVICE
 * ========================================
 * Location: backend/src/modules/designation/designation.service.ts
 */

export class DesignationService {
  /**
   * Create designation
   */
  async createDesignation(
    data: CreateDesignationRequestDto,
  ): Promise<DesignationDto> {
    const designation = await prisma.designation.create({
      data,
    });

    return designation;
  }

  /**
   * Get designations (optionally filtered by department)
   */
  async getDesignations(
    departmentId?: string,
  ): Promise<DesignationListItemDto[]> {
    const designations = await prisma.designation.findMany({
      where: departmentId ? { departmentId } : {},
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            employees: true,
          },
        },
      },
    });

    return designations;
  }

  /**
   * Get designation by ID
   */
  async getDesignation(id: string): Promise<DesignationDto> {
    const designation = await prisma.designation.findUnique({
      where: { id },
    });

    if (!designation) {
      throw new NotFoundError("Designation not found");
    }

    return designation;
  }

  /**
   * Update designation
   */
  async updateDesignation(
    id: string,
    data: UpdateDesignationRequestDto,
  ): Promise<DesignationDto> {
    const designation = await prisma.designation.update({
      where: { id },
      data,
    });

    return designation;
  }

  /**
   * Delete designation
   */
  async deleteDesignation(id: string): Promise<void> {
    await prisma.designation.delete({
      where: { id },
    });
  }
}

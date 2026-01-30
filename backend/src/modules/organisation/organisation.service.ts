import { prisma } from "../../config/database";
import { NotFoundError } from "../../shared/errors";

import type {
  CreateOrganisationRequestDto,
  UpdateOrganisationRequestDto,
  OrganisationDto,
  OrganisationListItemDto,
  OrganisationDetailDto,
} from "@arm/shared";

/**
 * ========================================
 * ORGANISATION SERVICE
 * ========================================
 */

export class OrganisationService {
  /**
   * Create organisation
   */
  async createOrganisation(
    tenantId: string,
    data: CreateOrganisationRequestDto,
  ): Promise<OrganisationDto> {
    const organisation = await prisma.organisation.create({
      data: {
        tenantId,
        ...data,
      },
    });

    return organisation;
  }

  /**
   * Get all organisations for tenant
   */
  async getOrganisations(tenantId: string): Promise<OrganisationListItemDto[]> {
    const organisations = await prisma.organisation.findMany({
      where: { tenantId },
      include: {
        _count: {
          select: {
            employees: true,
            departments: true,
          },
        },
      },
    });

    return organisations;
  }

  /**
   * Get organisation by ID
   */
  async getOrganisation(id: string): Promise<OrganisationDetailDto> {
    const organisation = await prisma.organisation.findUnique({
      where: { id },
      include: {
        departments: true,
        employees: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            employees: true,
            departments: true,
          },
        },
      },
    });

    if (!organisation) {
      throw new NotFoundError("Organisation not found");
    }

    return organisation;
  }

  /**
   * Update organisation
   */
  async updateOrganisation(
    id: string,
    data: UpdateOrganisationRequestDto,
  ): Promise<OrganisationDto> {
    const organisation = await prisma.organisation.update({
      where: { id },
      data,
    });

    return organisation;
  }

  /**
   * Delete organisation
   */
  async deleteOrganisation(id: string): Promise<void> {
    await prisma.organisation.delete({
      where: { id },
    });
  }
}

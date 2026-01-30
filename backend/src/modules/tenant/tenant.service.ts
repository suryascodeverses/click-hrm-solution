import { prisma } from "../../config/database";
import { NotFoundError } from "../../shared/errors";

import type {
  GetTenantResponseDto,
  UpdateTenantProfileRequestDto,
  UpdateTenantProfileResponseDto,
} from "@arm/shared";

/**
 * ========================================
 * TENANT SERVICE
 * ========================================
 */

export class TenantService {
  /**
   * Get tenant by ID
   */
  async getTenant(tenantId: string): Promise<GetTenantResponseDto> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        organisations: true,
        _count: {
          select: {
            users: true,
            organisations: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundError("Tenant not found");
    }

    return tenant;
  }

  /**
   * Update tenant profile
   */
  async updateTenant(
    tenantId: string,
    data: UpdateTenantProfileRequestDto,
  ): Promise<UpdateTenantProfileResponseDto> {
    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data,
    });

    return tenant;
  }
}

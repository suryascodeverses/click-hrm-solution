/**
 * ========================================
 * ORGANISATION - REQUEST/RESPONSE DTOs
 * ========================================
 * Location: shared/src/types/organisation.types.ts
 */

// ============================================
// REQUEST DTOs
// ============================================

export interface CreateOrganisationRequestDto {
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
}

export interface UpdateOrganisationRequestDto {
  name?: string;
  code?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  status?: string;
}

// ============================================
// RESPONSE DTOs
// ============================================

export interface OrganisationDto {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zipCode: string | null;
  phone: string | null;
  email: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganisationListItemDto extends OrganisationDto {
  _count: {
    employees: number;
    departments: number;
  };
}

export interface OrganisationDetailDto extends OrganisationDto {
  departments: any[];
  employees: any[];
  _count: {
    employees: number;
    departments: number;
  };
}

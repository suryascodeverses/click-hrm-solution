/**
 * ========================================
 * TENANT - REQUEST/RESPONSE DTOs
 * ========================================
 * Location: shared/src/types/tenant.types.ts
 */

// ============================================
// REQUEST DTOs
// ============================================

export interface UpdateTenantProfileRequestDto {
  name?: string;
  phone?: string;
  logo?: string;
}

// ============================================
// RESPONSE DTOs
// ============================================

export interface GetTenantResponseDto {
  id: string;
  name: string;
  subdomain: string;
  email: string;
  phone: string | null;
  logo: string | null;
  status: string;
  subscriptionTier: string | null;
  maxEmployees: number | null;
  settings: any;
  createdAt: Date;
  updatedAt: Date;
  organisations: any[];
  _count: {
    users: number;
    organisations: number;
  };
}

export interface UpdateTenantProfileResponseDto {
  id: string;
  name: string;
  subdomain: string;
  email: string;
  phone: string | null;
  logo: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

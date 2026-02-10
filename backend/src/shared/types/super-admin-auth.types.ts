/**
 * ========================================
 * SUPER ADMIN AUTH MODULE - TYPES & DTOs
 * ========================================
 * Location: shared/types/super-admin-auth.types.ts
 */

// ============================================
// INPUT DTOs
// ============================================

export interface SuperAdminLoginRequestDto {
  email: string;
  password: string;
}

export interface CreateSuperAdminRequestDto {
  email: string;
  password: string;
  name: string;
  masterKey: string;
}

export interface UpdateSuperAdminRequestDto {
  name?: string;
  email?: string;
  isActive?: boolean;
}

export interface ChangeSuperAdminPasswordRequestDto {
  currentPassword: string;
  newPassword: string;
}

export interface SuperAdminLogoutRequestDto {
  refreshToken?: string;
}

export interface SuperAdminRefreshTokenRequestDto {
  refreshToken: string;
}

// ============================================
// ENTITY DTOs
// ============================================

export interface SuperAdminDto {
  id: string;
  email: string;
  name: string;
  isActive?: boolean;
  lastLogin: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SuperAdminRefreshTokenDto {
  id: string;
  superAdminId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

// ============================================
// POPULATED DTOs
// ============================================

export interface SuperAdminWithStatsDto extends SuperAdminDto {
  stats: {
    totalActions: number;
    lastActionDate: Date | null;
    tenantsManaged: number;
    usersManaged: number;
  };
  recentActivity: Array<{
    action: string;
    entity: string;
    timestamp: Date;
    description: string;
  }>;
}

// ============================================
// RESPONSE DTOs
// ============================================

export interface SuperAdminAuthTokensDto {
  accessToken: string;
  refreshToken: string;
}

export interface SuperAdminLoginResponseDto {
  superAdmin: SuperAdminDto;
  accessToken: string;
  refreshToken: string;
  message: string;
}

export interface CreateSuperAdminResponseDto {
  superAdmin: SuperAdminDto;
  message: string;
}

export interface SuperAdminRefreshTokenResponseDto {
  accessToken: string;
  message: string;
}

export interface SuperAdminLogoutResponseDto {
  message: string;
}

export interface ChangeSuperAdminPasswordResponseDto {
  message: string;
}

// ============================================
// JWT PAYLOAD
// ============================================

export interface SuperAdminJWTPayload {
  superAdminId: string;
  email: string;
  name: string;
}

export interface DecodedSuperAdminJWTPayload extends SuperAdminJWTPayload {
  iat: number;
  exp: number;
}

// ============================================
// SESSION DTOs
// ============================================

export interface SuperAdminSessionDto {
  superAdmin: SuperAdminDto;
  permissions: string[];
}

export interface SuperAdminAuthContextDto {
  isAuthenticated: boolean;
  superAdmin: SuperAdminDto | null;
  loading: boolean;
}

// ============================================
// QUERY/FILTER DTOs
// ============================================

export interface SuperAdminQueryParams {
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "name" | "email" | "createdAt" | "lastLogin";
  sortOrder?: "asc" | "desc";
}

// ============================================
// RESPONSE DTOs
// ============================================

export interface SuperAdminListResponseDto {
  superAdmins: SuperAdminWithStatsDto[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SuperAdminGetMeResponseDto {
  name: string;
  email: string;
  id: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin: Date | null;
}

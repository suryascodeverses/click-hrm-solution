/**
 * ========================================
 * SUPER ADMIN AUTH - REQUEST/RESPONSE DTOs
 * ========================================
 * Location: shared/src/types/super-admin-auth.types.ts
 */

// ============================================
// REQUEST DTOs
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

export interface SuperAdminRefreshTokenRequestDto {
  refreshToken?: string; // From cookie
}

// ============================================
// RESPONSE DTOs
// ============================================

export interface SuperAdminDto {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN";
}

export interface SuperAdminLoginResponseDto {
  superAdmin: SuperAdminDto;
  accessToken: string;
}

export interface SuperAdminGetMeResponseDto {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
}

export interface SuperAdminRefreshTokenResponseDto {
  accessToken: string;
}

export interface CreateSuperAdminResponseDto {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

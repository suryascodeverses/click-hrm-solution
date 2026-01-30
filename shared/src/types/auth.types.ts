/**
 * ========================================
 * AUTH MODULE - REQUEST/RESPONSE DTOs
 * ========================================
 * Location: shared/src/types/auth.types.ts
 * API contracts shared between frontend and backend
 */

// ============================================
// REQUEST DTOs
// ============================================

export interface RegisterRequestDto {
  email: string;
  password: string;
  companyName: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LogoutRequestDto {
  refreshToken?: string;
}

export interface RefreshTokenRequestDto {
  refreshToken: string;
}

// ============================================
// RESPONSE DTOs
// ============================================

/**
 * User data in API responses
 */
export interface UserDto {
  id: string;
  email: string;
  role: string;
  tenantId?: string | null;
}

/**
 * Tenant data in API responses
 */
export interface TenantDto {
  id: string;
  name: string;
  subdomain: string;
}

/**
 * Employee data in API responses
 */
export interface EmployeeDto {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  organisation?: any;
  department?: any;
  designation?: any;
}

/**
 * Register response
 */
export interface RegisterResponseDto {
  user: UserDto;
  tenant: TenantDto;
  accessToken: string;
  refreshToken: string;
}

/**
 * Login response
 */
export interface LoginResponseDto {
  user: UserDto;
  tenant: TenantDto | null;
  employee: EmployeeDto | null;
  accessToken: string;
  refreshToken: string;
}

/**
 * Get Me response
 */
export interface GetMeResponseDto {
  id: string;
  email: string;
  role: string;
  tenantId: string | null;
  isActive: boolean;
  createdAt: Date;
  lastLogin: Date | null;
  tenant: TenantDto | null;
  employee: EmployeeDto | null;
}

/**
 * Refresh token response
 */
export interface RefreshTokenResponseDto {
  accessToken: string;
  refreshToken: string;
}

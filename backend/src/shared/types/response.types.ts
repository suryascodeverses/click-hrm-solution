/**
 * Base Response Types
 * Ensures all API responses follow a consistent structure
 */

/**
 * Standard success response wrapper
 */
export interface ApiResponse<T = any> {
  success: true;
  message?: string;
  data: T;
}

/**
 * Standard error response wrapper
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: any[];
  stack?: string; // Only in development
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T = any> {
  success: true;
  message?: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Pagination query params
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Common query filters
 */
export interface FilterParams {
  search?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

/**
 * JWT Payload structure
 */
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  tenantId: string | null;
}

/**
 * Authenticated Request User
 */
export interface AuthUser {
  id: string;
  email: string;
  role: string;
  tenantId: string | null;
}

/**
 * Helper to create success response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
): ApiResponse<T> {
  return {
    success: true,
    ...(message && { message }),
    data,
  };
}

/**
 * Helper to create paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string,
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    success: true,
    ...(message && { message }),
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

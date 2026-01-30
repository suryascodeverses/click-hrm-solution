/**
 * ========================================
 * COMMON API TYPES
 * ========================================
 * Location: shared/src/types/common.types.ts
 * Shared between frontend and backend
 */

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
  success: true;
  message?: string;
  data: T;
}

/**
 * Standard API error response
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
}

/**
 * Paginated API response wrapper
 */
export interface PaginatedResponse<T = any> {
  success: true;
  message?: string;
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Pagination query parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Common filter parameters
 */
export interface FilterParams {
  search?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

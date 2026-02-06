/**
 * ========================================
 * COMMON API TYPES - ZOD SCHEMAS & TYPES
 * ========================================
 * Location: shared/src/types/common.types.ts
 * Shared between frontend and backend
 */

import { z } from "zod";

// ============================================
// BASE SCHEMAS (Building Blocks)
// ============================================

/**
 * Pagination metadata schema
 */
const PaginationMetaBaseSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

// ============================================
// RESPONSE SCHEMAS & TYPES
// ============================================

/**
 * Standard API response wrapper
 */
export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    message: z.string().optional(),
    data: dataSchema,
  });

export type ApiResponse<T = any> = {
  success: true;
  message?: string;
  data: T;
};

/**
 * Standard API error response
 */
export const ApiErrorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  errors: z
    .array(
      z.object({
        field: z.string().optional(),
        message: z.string(),
      }),
    )
    .optional(),
});
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;

/**
 * Paginated API response wrapper
 */
export const PaginatedResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    message: z.string().optional(),
    data: z.array(dataSchema),
    pagination: PaginationMetaBaseSchema.extend({
      hasNext: z.boolean(),
      hasPrev: z.boolean(),
    }),
  });

export type PaginatedResponse<T = any> = {
  success: true;
  message?: string;
  data: T[];
  pagination: PaginationMeta;
};

/**
 * Pagination metadata
 */
export const PaginationMetaSchema = PaginationMetaBaseSchema.extend({
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

/**
 * Pagination query parameters
 */
export const PaginationParamsSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
export type PaginationParams = z.infer<typeof PaginationParamsSchema>;

/**
 * Common filter parameters
 */
export const FilterParamsSchema = z.object({
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.string().optional(),
});
export type FilterParams = z.infer<typeof FilterParamsSchema>;

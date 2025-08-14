import { z } from 'zod';

// Common validation schemas
export const uuidSchema = z.string().uuid('Invalid UUID format');

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const sortOrderSchema = z.enum(['asc', 'desc']).default('desc');

export const dateRangeSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

// Response schemas
export const successResponseSchema = z.object({
  success: z.literal(true),
  message: z.string().optional(),
  data: z.any().optional(),
});

export const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  code: z.string(),
  statusCode: z.number(),
  timestamp: z.string().datetime(),
  details: z.any().optional(),
});

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    success: z.literal(true),
    data: z.array(itemSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
      hasNext: z.boolean(),
      hasPrev: z.boolean(),
    }),
  });

// Health check schemas
export const healthCheckResponseSchema = z.object({
  status: z.enum(['healthy', 'unhealthy']),
  timestamp: z.string().datetime(),
  uptime: z.number(),
  database: z.object({
    status: z.enum(['connected', 'disconnected', 'error']),
    latency: z.number().optional(),
  }),
  redis: z.object({
    status: z.enum(['connected', 'disconnected', 'error']),
    latency: z.number().optional(),
  }),
});

// Type exports
export type UUID = z.infer<typeof uuidSchema>;
export type PaginationQuery = z.infer<typeof paginationSchema>;
export type SortOrder = z.infer<typeof sortOrderSchema>;
export type DateRange = z.infer<typeof dateRangeSchema>;
export type SuccessResponse = z.infer<typeof successResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export type HealthCheckResponse = z.infer<typeof healthCheckResponseSchema>;
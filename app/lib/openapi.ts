// z from @hono/zod-openapi is pre-extended with .openapi() — no extendZodWithOpenApi needed
import { z } from '@hono/zod-openapi';

// Mirrors jsonSchemaBuilder from hono-boilerplate
export function jsonContent(schema: z.ZodTypeAny, description = '') {
  return {
    description,
    content: { 'application/json': { schema } },
  };
}

// Standard error response body shape
export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    message: z.string(),
    code: z.string(),
    statusCode: z.number(),
  }),
});

// Reusable default error responses (400 / 401 / 403 / 404 / 500)
export const defaultResponses = {
  400: jsonContent(ErrorResponseSchema, 'Validation error'),
  401: jsonContent(ErrorResponseSchema, 'Unauthorized'),
  403: jsonContent(ErrorResponseSchema, 'Forbidden'),
  404: jsonContent(ErrorResponseSchema, 'Not found'),
  500: jsonContent(ErrorResponseSchema, 'Internal server error'),
} as const;

// Reusable path / query schemas
export const IdParamSchema = z.object({
  id: z.string().describe('Resource ID'),
});

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional().describe('Page number'),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional().describe('Items per page'),
});

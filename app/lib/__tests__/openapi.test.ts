import { z } from '@hono/zod-openapi';
import { describe, expect, it } from 'vitest';
import { defaultResponses, ErrorResponseSchema, IdParamSchema, jsonContent, PaginationQuerySchema } from '../openapi';

// ─── jsonContent ──────────────────────────────────────────────────────────────

describe('jsonContent', () => {
  const schema = z.object({ id: z.string() });

  it('wraps schema in application/json content object', () => {
    const result = jsonContent(schema);
    expect(result.content).toHaveProperty('application/json');
    expect(result.content['application/json'].schema).toBe(schema);
  });

  it('sets description when provided', () => {
    const result = jsonContent(schema, 'My description');
    expect(result.description).toBe('My description');
  });

  it('uses empty string as default description', () => {
    const result = jsonContent(schema);
    expect(result.description).toBe('');
  });
});

// ─── ErrorResponseSchema ──────────────────────────────────────────────────────

describe('ErrorResponseSchema', () => {
  it('rejects success: true', () => {
    const result = ErrorResponseSchema.safeParse({
      success: true,
      error: { message: 'x', code: 'x', statusCode: 400 },
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid error response shape', () => {
    const result = ErrorResponseSchema.safeParse({
      success: false,
      error: { message: 'Not found', code: 'NOT_FOUND', statusCode: 404 },
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing error.message', () => {
    const result = ErrorResponseSchema.safeParse({
      success: false,
      error: { code: 'ERR', statusCode: 500 },
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing error.code', () => {
    const result = ErrorResponseSchema.safeParse({
      success: false,
      error: { message: 'oops', statusCode: 500 },
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-numeric statusCode', () => {
    const result = ErrorResponseSchema.safeParse({
      success: false,
      error: { message: 'oops', code: 'ERR', statusCode: '500' },
    });
    expect(result.success).toBe(false);
  });
});

// ─── defaultResponses ────────────────────────────────────────────────────────

describe('defaultResponses', () => {
  it('has entries for 400, 401, 403, 404, 500', () => {
    expect(defaultResponses).toHaveProperty('400');
    expect(defaultResponses).toHaveProperty('401');
    expect(defaultResponses).toHaveProperty('403');
    expect(defaultResponses).toHaveProperty('404');
    expect(defaultResponses).toHaveProperty('500');
  });

  it('each response has application/json content', () => {
    (Object.values(defaultResponses) as Array<{ content: Record<string, unknown>; description: string }>).forEach((resp) => {
      expect(resp.content).toHaveProperty('application/json');
    });
  });

  it('400 description is "Validation error"', () => {
    expect(defaultResponses[400].description).toBe('Validation error');
  });

  it('401 description is "Unauthorized"', () => {
    expect(defaultResponses[401].description).toBe('Unauthorized');
  });

  it('403 description is "Forbidden"', () => {
    expect(defaultResponses[403].description).toBe('Forbidden');
  });

  it('404 description is "Not found"', () => {
    expect(defaultResponses[404].description).toBe('Not found');
  });

  it('500 description is "Internal server error"', () => {
    expect(defaultResponses[500].description).toBe('Internal server error');
  });
});

// ─── IdParamSchema ────────────────────────────────────────────────────────────

describe('IdParamSchema', () => {
  it('accepts a valid id string', () => {
    const result = IdParamSchema.safeParse({ id: 'abc123' });
    expect(result.success).toBe(true);
  });

  it('rejects missing id', () => {
    const result = IdParamSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects non-string id', () => {
    const result = IdParamSchema.safeParse({ id: 123 });
    expect(result.success).toBe(false);
  });
});

// ─── PaginationQuerySchema ────────────────────────────────────────────────────

describe('PaginationQuerySchema', () => {
  it('uses defaults when fields are omitted', () => {
    const result = PaginationQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it('coerces string numbers to integers', () => {
    const result = PaginationQuerySchema.safeParse({ page: '3', limit: '50' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(50);
    }
  });

  it('rejects page < 1', () => {
    const result = PaginationQuerySchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects limit < 1', () => {
    const result = PaginationQuerySchema.safeParse({ limit: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects limit > 100', () => {
    const result = PaginationQuerySchema.safeParse({ limit: 101 });
    expect(result.success).toBe(false);
  });

  it('accepts limit = 100 (boundary)', () => {
    const result = PaginationQuerySchema.safeParse({ limit: 100 });
    expect(result.success).toBe(true);
  });

  it('accepts page = 1 (boundary)', () => {
    const result = PaginationQuerySchema.safeParse({ page: 1 });
    expect(result.success).toBe(true);
  });

  it('rejects non-integer page (float)', () => {
    const result = PaginationQuerySchema.safeParse({ page: 1.5 });
    expect(result.success).toBe(false);
  });
});

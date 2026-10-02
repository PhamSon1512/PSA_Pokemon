import type { ApiError, ApiMeta, ApiSuccess, PaginationParams } from './types';

export type { ApiError, ApiMeta, ApiSuccess };

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Build a standard error body and return a JSON Response */
function errorResponse(status: number, code: ApiError['code'], error: string, details?: unknown): Response {
  const body: ApiError = { success: false, error, code, ...(details !== undefined && { details }) };
  return Response.json(body, { status });
}

// ─── Success responses ────────────────────────────────────────────────────────

export function ok<T>(data: T, meta?: ApiMeta, status = 200, extraHeaders?: Headers): Response {
  const body: ApiSuccess<T> = { success: true, data };
  if (meta) body.meta = meta;
  return Response.json(body, { status, headers: extraHeaders });
}

export function created<T>(data: T): Response {
  return ok(data, undefined, 201);
}

export function noContent(): Response {
  return new Response(null, { status: 204 });
}

// ─── Error responses ──────────────────────────────────────────────────────────

export function badRequest(error: string, details?: unknown): Response {
  return errorResponse(400, 'BAD_REQUEST', error, details);
}

export function unauthorized(error = 'Unauthorized'): Response {
  return errorResponse(401, 'UNAUTHORIZED', error);
}

export function forbidden(error = 'Forbidden'): Response {
  return errorResponse(403, 'FORBIDDEN', error);
}

export function notFound(resource = 'Resource'): Response {
  return errorResponse(404, 'NOT_FOUND', `${resource} not found`);
}

export function conflict(error: string): Response {
  return errorResponse(409, 'CONFLICT', error);
}

export function internalError(error = 'Internal server error'): Response {
  return errorResponse(500, 'INTERNAL_SERVER_ERROR', error);
}

// ─── Utility ──────────────────────────────────────────────────────────────────

/** Parse pagination query params from URL */
export function parsePagination(url: string, defaultLimit = 20): PaginationParams {
  const { searchParams } = new URL(url);
  const page = Math.max(1, Number(searchParams.get('page') ?? 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? defaultLimit)));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

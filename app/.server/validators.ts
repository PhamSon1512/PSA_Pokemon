import { z } from 'zod';
import { ValidationError } from './errors';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Format Zod issues into a human-readable string.
 * In production, returns a generic message to avoid leaking schema details.
 */
function formatZodIssues(issues: z.ZodIssue[]): string {
  if (import.meta.env.PROD) return 'Invalid request data';
  return issues.map((i) => `${i.path.join('.') || 'field'}: ${i.message}`).join('; ');
}

// ─── Validators ───────────────────────────────────────────────────────────────

/**
 * Parse and validate a JSON request body against a Zod schema.
 * Throws a ValidationError (400) for invalid JSON or schema failures.
 */
export async function parseBody<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw new ValidationError('Invalid JSON body', 'JSON_PARSE_ERROR');
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new ValidationError(formatZodIssues(result.error.issues), 'VALIDATION_FAILED');
  }

  return result.data;
}

/**
 * Parse and validate URL query params against a Zod schema.
 * Throws a ValidationError (400) on schema failures.
 */
export function parseQuery<T>(url: string, schema: z.ZodType<T>): T {
  const params = Object.fromEntries(new URL(url).searchParams);
  const result = schema.safeParse(params);

  if (!result.success) {
    throw new ValidationError(formatZodIssues(result.error.issues), 'VALIDATION_FAILED');
  }

  return result.data;
}

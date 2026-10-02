import type { AuthUser } from './types';
import { AppError, getErrorCode, getStatusCode } from './errors';
import { Logger } from './logger';

/**
 * Handle any thrown error inside an API route — logs + returns a consistent JSON Response.
 */
export function handleApiError(error: unknown, request: Request, env: Cloudflare.Env, user?: AuthUser | null): Response {
  const isDev = (env.ENVIRONMENT as string) !== 'production';

  // Log full error details
  Logger.error(error, request, user, env.ENVIRONMENT);

  const statusCode = getStatusCode(error);
  const code = getErrorCode(error);
  const err = error instanceof Error ? error : new Error(String(error));

  const body = {
    success: false,
    error: {
      message: err.message ?? 'An unexpected error occurred',
      code,
      statusCode,
      timestamp: new Date().toISOString(),
      requestId: request.headers.get('cf-ray'),
      path: new URL(request.url).pathname,
      method: request.method,
      // Context only for operational AppErrors
      context: err instanceof AppError && err.isOperational ? err.context : undefined,
      // Stack trace and cause only in non-production to avoid leaking internals
      stack: isDev ? err.stack : undefined,
      cause: isDev && err.cause ? String(err.cause) : undefined,
    },
  };

  return Response.json(body, {
    status: statusCode,
    headers: {
      'X-Error-Code': String(code),
    },
  });
}

/**
 * Wrap a route handler so any thrown error returns a proper JSON error response instead of crashing.
 * Usage:
 *   export const action = withErrorHandling(async ({ request, context }) => { ... });
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<Response>>(handler: T): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof Response) throw error;
      // Extract request + env from first arg (React Router's ActionFunctionArgs / LoaderFunctionArgs)
      const arg = args[0] as { request: Request; context: { cloudflare: { env: Cloudflare.Env } } };
      return handleApiError(error, arg.request, arg.context.cloudflare.env);
    }
  }) as T;
}

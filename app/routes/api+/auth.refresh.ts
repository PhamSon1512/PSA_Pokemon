import type { Route } from './+types/auth.refresh';
import { getDb } from '~/.server/db';
import { withErrorHandling } from '~/.server/errorHandler';
import { ok, unauthorized } from '~/.server/response';
import { refreshAccessToken } from '~/.server/services/auth.service';
import { buildAuthCookies, parseCookie, REFRESH_TOKEN_COOKIE } from '~/.server/session';

// POST /api/auth/refresh
// The refreshToken is sent automatically by the browser as an HttpOnly cookie.
// We do NOT parse it from the request body to keep it fully server-controlled.
export const action = withErrorHandling(async ({ request, context }: Route.ActionArgs) => {
  const { env } = context.cloudflare;

  const refreshToken = parseCookie(request.headers.get('Cookie'), REFRESH_TOKEN_COOKIE);
  if (!refreshToken) throw unauthorized('Refresh token missing');

  const result = await refreshAccessToken(getDb(context), env.JWT_SECRET, refreshToken);

  const headers = new Headers();
  buildAuthCookies(result.token, result.refreshToken).forEach((c) => headers.append('Set-Cookie', c));

  return ok(result, undefined, 200, headers);
});

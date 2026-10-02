import type { Route } from './+types/auth.login';
import { getDb } from '~/.server/db';
import { withErrorHandling } from '~/.server/errorHandler';
import { ok } from '~/.server/response';
import { login } from '~/.server/services/auth.service';
import { buildAuthCookies } from '~/.server/session';
import { parseBody } from '~/.server/validators';
import { LoginBodySchema } from '~/openapi/auth-users.openapi';

// POST /api/auth/login
export const action = withErrorHandling(async ({ request, context }: Route.ActionArgs) => {
  const { env } = context.cloudflare;
  const body = await parseBody(request, LoginBodySchema);
  const result = await login(getDb(context), env.JWT_SECRET, body.email, body.password);

  // Set both cookies server-side so the refresh token gets HttpOnly protection.
  // The access token is non-HttpOnly (xior reads it client-side via js-cookie).
  const headers = new Headers();
  buildAuthCookies(result.token, result.refreshToken).forEach((c) => headers.append('Set-Cookie', c));

  return ok(result, undefined, 200, headers);
});

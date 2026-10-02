import type { AppLoadContext } from 'react-router';
import type { AuthUser } from './types';
import { redirect } from 'react-router';
import { refreshAccessToken } from '~/.server/services';
import { getDb } from './db';
import { verifyJwt } from './jwt';
import { enforce, ensurePolicies, httpMethodToAct, isPoliciesLoaded, normaliseResource } from './rbac';
import { forbidden, unauthorized } from './response';
import { buildAuthCookies, clearAuthCookies, parseCookie, REFRESH_TOKEN_COOKIE, TOKEN_COOKIE } from './session';

export type { AuthUser };

/** Result returned by requireAuthSession when a token was silently refreshed */
export type AuthSessionResult = {
  user: AuthUser;
  /** Forward these headers in your loader response so the browser updates the access-token cookie */
  headers: Headers | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Map a verified JWT payload to an AuthUser — single source of truth for the mapping */
function payloadToAuthUser(payload: { sub: string; email: string; role: string }): AuthUser {
  return { id: payload.sub, email: payload.email, role: payload.role };
}

// ─── API route guard ──────────────────────────────────────────────────────────
// Used by /api/* routes that receive an Authorization: Bearer header.

/**
 * Verify Bearer token AND ensure RBAC policies are loaded from DB.
 *
 * Combining both into one call ensures:
 *  1. Token is valid before any DB policy work
 *  2. Policies are always warm when requirePermission() is called next
 *  3. ensurePolicies() is a no-op if cache is already populated (fast path)
 *
 * Throws Response(401) on auth failure — callers never need to check the return type.
 */
export async function requireAuth(request: Request, context: AppLoadContext): Promise<AuthUser> {
  const { env } = context.cloudflare;
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) throw unauthorized();

  const token = authHeader.slice(7);
  try {
    // Enforce access-token type — prevents refresh tokens from being used as Bearer tokens
    const payload = await verifyJwt(token, env.JWT_SECRET, 'access');

    // Warm RBAC cache — only creates DB connection when cache is cold (first request per isolate).
    // isPoliciesLoaded() is a pure O(1) variable check — zero overhead on hot path.
    if (!isPoliciesLoaded()) await ensurePolicies(getDb(context));

    return payloadToAuthUser(payload);
  } catch (err) {
    // Re-throw Response errors (e.g. from ensurePolicies internals) as-is
    if (err instanceof Response) throw err;
    throw unauthorized('Token invalid or expired');
  }
}

// ─── RBAC permission guard ─────────────────────────────────────────────────────

/**
 * Check if the authenticated user's role has permission to perform the
 * request's HTTP method on the request's path.
 *
 * Derives resource + action from the live Request — no manual string wrangling.
 * Requires requireAuth() (or ensurePolicies()) to have been called first.
 *
 * @throws Response(403) if access is denied
 *
 * @example
 * const user = await requireAuth(request, env);
 * requirePermission(user, request);
 */
export function requirePermission(user: AuthUser, request: Request): void {
  const { pathname } = new URL(request.url);
  const resource = normaliseResource(pathname);
  const action = httpMethodToAct(request.method);

  if (!enforce(user.role, resource, action)) {
    throw forbidden(`Role '${user.role}' cannot ${action} ${resource}`);
  }
}

/**
 * Check permission for an explicit resource path + HTTP method
 * instead of deriving them from the live request.
 *
 * Useful when the check target differs from the current route
 * (e.g. checking a related resource during an action).
 *
 * @example
 * requirePermissionFor(user, '/api/users/:id', 'PATCH');
 */
export function requirePermissionFor(user: AuthUser, resource: string, action: string): void {
  if (!enforce(user.role, resource, action)) {
    throw forbidden(`Role '${user.role}' cannot ${action} ${resource}`);
  }
}

/**
 * Guard: require the "admin" role slug specifically.
 * Retained for quick bootstrapping — admin slug is still a convention, not hardcoded behaviour.
 */
export function requireAdmin(user: AuthUser): void {
  // 403 Forbidden — user IS authenticated but lacks the admin role
  if (user.role !== 'admin') throw forbidden('Admin access required');
}

// ─── SSR page guard ───────────────────────────────────────────────────────────
// Used by server-side loaders/actions. Reads tokens from cookies.
// Silently refreshes expired access tokens using the refresh token.
// Redirects to /login if refresh fails or no tokens present.

export async function requireAuthSession(request: Request, context: AppLoadContext): Promise<AuthSessionResult> {
  const { env } = context.cloudflare;
  const cookieHeader = request.headers.get('Cookie');

  const token = parseCookie(cookieHeader, TOKEN_COOKIE);
  const refreshToken = parseCookie(cookieHeader, REFRESH_TOKEN_COOKIE);

  if (!token) throw redirect('/login');

  try {
    const payload = await verifyJwt(token, env.JWT_SECRET, 'access');

    // Warm RBAC cache — skip DB creation if already loaded
    if (!isPoliciesLoaded()) await ensurePolicies(getDb(context));

    return { user: payloadToAuthUser(payload), headers: null };
  } catch {
    // Access token expired → try silent refresh
    if (!refreshToken) throw redirect('/login');

    try {
      const db = getDb(context);
      const { token: newToken, refreshToken: newRefreshToken } = await refreshAccessToken(db, env.JWT_SECRET, refreshToken);

      const headers = new Headers();
      buildAuthCookies(newToken, newRefreshToken).forEach((c) => headers.append('Set-Cookie', c));

      const newPayload = await verifyJwt(newToken, env.JWT_SECRET, 'access');

      // Warm RBAC cache with the fresh DB connection
      await ensurePolicies(db);

      return { user: payloadToAuthUser(newPayload), headers };
    } catch {
      const responseHeaders = new Headers();
      clearAuthCookies().forEach((c) => responseHeaders.append('Set-Cookie', c));
      throw redirect('/login', { headers: responseHeaders });
    }
  }
}

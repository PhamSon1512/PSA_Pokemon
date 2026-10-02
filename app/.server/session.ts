// Cookie-based auth — single source of truth for both SSR and client-side.
// No createCookieSessionStorage; we manage plain cookies directly so that
// js-cookie (client) and request headers (SSR) both read the same values.
// Cookie strings built with Hono's generateCookie helper (hono/cookie).

import { generateCookie } from 'hono/cookie';

// Cookie names
export const TOKEN_COOKIE = 'token';
export const REFRESH_TOKEN_COOKIE = 'refreshToken';

// Cookie max-ages (seconds)
export const TOKEN_MAX_AGE = 60 * 60 * 24; // 24h — matches JWT expiry
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const IS_PROD = import.meta.env.PROD;

/** Parse a specific cookie value from a raw Cookie header string */
export function parseCookie(cookieHeader: string | null, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  const match = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
}

/** Build Set-Cookie headers to persist tokens after login */
export function buildAuthCookies(token: string, refreshToken: string): string[] {
  return [
    // Access token — non-HttpOnly so xior/js-cookie can read it client-side
    generateCookie(TOKEN_COOKIE, token, {
      path: '/',
      sameSite: 'Lax',
      maxAge: TOKEN_MAX_AGE,
      secure: IS_PROD,
    }),
    // Refresh token — HttpOnly: client JS never needs to read this
    generateCookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      path: '/',
      sameSite: 'Lax',
      maxAge: REFRESH_TOKEN_MAX_AGE,
      secure: IS_PROD,
      httpOnly: true,
    }),
  ];
}

/** Build Set-Cookie headers to clear auth cookies on logout */
export function clearAuthCookies(): string[] {
  // maxAge=0 expires the cookie immediately — deleteCookie requires Hono context so we use generateCookie
  return [
    generateCookie(TOKEN_COOKIE, '', { path: '/', maxAge: 0 }),
    // Must include HttpOnly on clearance too so the HttpOnly refreshToken cookie gets cleared
    generateCookie(REFRESH_TOKEN_COOKIE, '', { path: '/', maxAge: 0, httpOnly: true }),
  ];
}

/** Build Set-Cookie header to update only the access token after a refresh */
export function buildTokenCookie(token: string): string {
  return generateCookie(TOKEN_COOKIE, token, {
    path: '/',
    sameSite: 'Lax',
    maxAge: TOKEN_MAX_AGE,
    secure: IS_PROD,
  });
}

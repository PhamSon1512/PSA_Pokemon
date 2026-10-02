// JWT utilities — signing/verification via Hono JWT helper (hono/jwt)

import { sign, verify } from 'hono/jwt';

type JwtPayload = {
  sub: string;
  email: string;
  role: string;
  /** Distinguishes access tokens from refresh tokens — prevents cross-use */
  type?: 'access' | 'refresh';
  iat: number;
  exp: number;
};

/**
 * Sign a JWT using Hono's sign() helper (HS256).
 * Adds iat and exp automatically.
 */
export async function signJwt(payload: Omit<JwtPayload, 'iat' | 'exp'>, secret: string, expiresInSeconds = 3600): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JwtPayload = { ...payload, iat: now, exp: now + expiresInSeconds };
  return sign(fullPayload, secret, 'HS256');
}

/**
 * Verify a JWT using Hono's verify() helper.
 * Hono automatically checks exp, nbf, iat.
 * Optionally enforces access/refresh token type separation.
 */
export async function verifyJwt(token: string, secret: string, expectedType?: 'access' | 'refresh'): Promise<JwtPayload> {
  // verify() throws Hono-specific errors (JwtTokenExpired, JwtTokenSignatureMismatched, etc.)
  // on invalid/expired tokens — callers should catch generically
  const payload = (await verify(token, secret, 'HS256')) as JwtPayload;

  // Strict type enforcement: if expectedType is given, payload.type MUST match.
  // Tokens without a `type` claim are also rejected — prevents legacy/forged tokens
  // from bypassing the access/refresh separation.
  if (expectedType && payload.type !== expectedType) {
    throw new Error(`Expected ${expectedType} token but received ${payload.type ?? 'untyped'} token`);
  }

  return payload;
}

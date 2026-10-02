import type { DrizzleDb } from '../db';
import type { AuthTokens, SafeUser } from '../types';
import { eq } from 'drizzle-orm';
import { users } from '~/models';
import { AuthenticationError, ConflictError, NotFoundError, ValidationError } from '../errors';
import { signJwt, verifyJwt } from '../jwt';
import { comparePassword, hashPassword, timingSafeEqual } from '../password';
import { toSafeUser } from './_user-mapper';

// ─── Token TTL constants ──────────────────────────────────────────────────────
const ACCESS_TOKEN_TTL = 60 * 60 * 24; // 24 hours
const REFRESH_TOKEN_TTL = 60 * 60 * 24 * 30; // 30 days

// ─── Dummy hash for timing-safe login ────────────────────────────────────────
// Prevents email enumeration via timing side-channel.
let _dummyHash: string | null = null;
async function getDummyHash(): Promise<string> {
  if (!_dummyHash) _dummyHash = await hashPassword('__dummy_password__');
  return _dummyHash;
}

// ─── Internal helpers (SRP) ───────────────────────────────────────────────────

function buildJwtPayload(user: { id: string; email: string; role: string | null }) {
  return { sub: user.id, email: user.email, role: user.role ?? 'user' };
}

async function issueTokens(payload: { sub: string; email: string; role: string }, jwtSecret: string): Promise<AuthTokens> {
  const [token, refreshToken] = await Promise.all([
    signJwt({ ...payload, type: 'access' }, jwtSecret, ACCESS_TOKEN_TTL),
    signJwt({ ...payload, type: 'refresh' }, jwtSecret, REFRESH_TOKEN_TTL),
  ]);
  return { token, refreshToken };
}

async function persistRefreshToken(db: DrizzleDb, userId: string, refreshToken: string): Promise<void> {
  await db.update(users).set({ refreshToken, updatedAt: new Date() }).where(eq(users.id, userId));
}

// ─── Service functions ───────────────────────────────────────────────────────

/**
 * Verify credentials and issue JWT + refresh token
 */
export async function login(
  db: DrizzleDb,
  jwtSecret: string,
  email: string,
  password: string,
): Promise<AuthTokens & { user: SafeUser }> {
  const user = await db.query.users.findFirst({
    where: { email: email.toLowerCase().trim() },
  });

  // Always run comparePassword regardless of user existence — prevents timing attack.
  const passwordMatch = await comparePassword(password, user?.password ?? (await getDummyHash()));

  if (!user || !passwordMatch) {
    throw new AuthenticationError('Invalid credentials', 'UNAUTHORIZED');
  }
  if (user.deletedAt) {
    throw new AuthenticationError('Account has been deactivated', 'UNAUTHORIZED');
  }

  const tokens = await issueTokens(buildJwtPayload(user), jwtSecret);
  await persistRefreshToken(db, user.id, tokens.refreshToken);

  return { ...tokens, user: toSafeUser(user) };
}

/**
 * Register a new user and return an access token
 */
export async function register(
  db: DrizzleDb,
  jwtSecret: string,
  input: { email: string; password: string; firstName?: string; lastName?: string },
): Promise<{ token: string; user: SafeUser }> {
  if (input.password.length < 8) {
    throw new ValidationError('Password must be at least 8 characters', 'VALIDATION_FAILED');
  }

  // Only block if a non-deleted user already has this email
  const existing = await db.query.users.findFirst({
    where: {
      AND: [{ email: input.email.toLowerCase().trim() }, { deletedAt: { isNull: true } }],
    },
  });

  if (existing) throw new ConflictError('Email already registered', 'CONFLICT');

  const hashedPassword = await hashPassword(input.password);
  const fullName = [input.firstName, input.lastName].filter(Boolean).join(' ') || undefined;

  const [user] = await db
    .insert(users)
    .values({
      email: input.email.toLowerCase().trim(),
      password: hashedPassword,
      firstName: input.firstName ?? null,
      lastName: input.lastName ?? null,
      fullName: fullName ?? null,
      role: 'user',
    })
    .returning();

  const token = await signJwt({ ...buildJwtPayload(user), type: 'access' }, jwtSecret, ACCESS_TOKEN_TTL);

  return { token, user: toSafeUser(user) };
}

/**
 * Rotate access token and refresh token using a valid refresh token
 */
export async function refreshAccessToken(
  db: DrizzleDb,
  jwtSecret: string,
  refreshToken: string,
): Promise<{ token: string; refreshToken: string }> {
  let payload: Awaited<ReturnType<typeof verifyJwt>>;
  try {
    // Enforce refresh-token type — prevents access tokens from being used to rotate
    payload = await verifyJwt(refreshToken, jwtSecret, 'refresh');
  } catch {
    throw new AuthenticationError('Refresh token invalid or expired', 'UNAUTHORIZED');
  }

  const user = await db.query.users.findFirst({
    where: { id: payload.sub },
  });

  if (!user) throw new AuthenticationError('Invalid refresh token', 'UNAUTHORIZED');

  // Constant-time comparison — prevents timing attacks on the token string
  const enc = new TextEncoder();
  if (!timingSafeEqual(enc.encode(user.refreshToken ?? ''), enc.encode(refreshToken))) {
    throw new AuthenticationError('Invalid refresh token', 'UNAUTHORIZED');
  }

  if (user.deletedAt) {
    throw new AuthenticationError('Account has been deactivated', 'UNAUTHORIZED');
  }

  const tokens = await issueTokens(buildJwtPayload(user), jwtSecret);
  await persistRefreshToken(db, user.id, tokens.refreshToken);

  return tokens;
}

/**
 * Fetch the currently authenticated user's profile
 */
export async function getMe(db: DrizzleDb, userId: string): Promise<SafeUser> {
  const user = await db.query.users.findFirst({
    where: { id: userId },
  });

  if (!user || user.deletedAt) throw new NotFoundError('User');

  return toSafeUser(user);
}

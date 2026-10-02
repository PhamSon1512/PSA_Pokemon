/// <reference types="@cloudflare/vitest-pool-workers" />
import { env } from 'cloudflare:test';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { roles } from '~/models';
import { hashPassword } from '../password';
import { getMe, login, refreshAccessToken, register } from '../services/auth.service';
import { execDDL, getDb, ROLES_DDL, USERS_DDL } from './helpers';

const JWT_SECRET = 'test-secret-32-chars-minimum-ok!!';

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeAll(async () => {
  await execDDL(ROLES_DDL, USERS_DDL);
  // Seed 'user' role — FK constraint on users.role
  await getDb().insert(roles).values({ slug: 'user', name: 'User' }).onConflictDoNothing();
});

beforeEach(async () => {
  await getDb().delete((await import('~/models')).users);
});

// ─── register ────────────────────────────────────────────────────────────────

describe('register', () => {
  it('creates a user and returns token + safeUser', async () => {
    const result = await register(getDb(), JWT_SECRET, {
      email: 'alice@example.com',
      password: 'password123',
      firstName: 'Alice',
    });
    expect(result.token).toBeTruthy();
    expect(result.user.email).toBe('alice@example.com');
    expect(result.user.firstName).toBe('Alice');
    expect((result.user as any).password).toBeUndefined();
  });

  it('normalises email to lowercase', async () => {
    const result = await register(getDb(), JWT_SECRET, { email: 'BOB@EXAMPLE.COM', password: 'password123' });
    expect(result.user.email).toBe('bob@example.com');
  });

  it('throws ConflictError for duplicate email', async () => {
    await register(getDb(), JWT_SECRET, { email: 'dup@example.com', password: 'password123' });
    await expect(register(getDb(), JWT_SECRET, { email: 'dup@example.com', password: 'password123' })).rejects.toThrow();
  });

  it('throws ValidationError for password shorter than 8 chars', async () => {
    await expect(register(getDb(), JWT_SECRET, { email: 'x@example.com', password: 'short' })).rejects.toThrow();
  });
});

// ─── login ───────────────────────────────────────────────────────────────────

describe('login', () => {
  beforeEach(async () => {
    await register(getDb(), JWT_SECRET, { email: 'user@example.com', password: 'mypassword' });
  });

  it('returns tokens + safeUser for valid credentials', async () => {
    const result = await login(getDb(), JWT_SECRET, 'user@example.com', 'mypassword');
    expect(result.token).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
    expect(result.user.email).toBe('user@example.com');
    expect((result.user as any).password).toBeUndefined();
  });

  it('throws AuthenticationError for wrong password', async () => {
    await expect(login(getDb(), JWT_SECRET, 'user@example.com', 'wrongpass')).rejects.toThrow();
  });

  it('throws AuthenticationError for non-existent email', async () => {
    await expect(login(getDb(), JWT_SECRET, 'ghost@example.com', 'anything')).rejects.toThrow();
  });

  it('email lookup is case-insensitive', async () => {
    const result = await login(getDb(), JWT_SECRET, 'USER@EXAMPLE.COM', 'mypassword');
    expect(result.user.email).toBe('user@example.com');
  });
});

// ─── getMe ───────────────────────────────────────────────────────────────────

describe('getMe', () => {
  it('returns safeUser for valid userId', async () => {
    const { user } = await register(getDb(), JWT_SECRET, { email: 'me@example.com', password: 'password123' });
    const me = await getMe(getDb(), user.id!);
    expect(me.email).toBe('me@example.com');
    expect((me as any).password).toBeUndefined();
    expect((me as any).refreshToken).toBeUndefined();
  });

  it('throws NotFoundError for non-existent userId', async () => {
    await expect(getMe(getDb(), 'nonexistent-id')).rejects.toThrow();
  });
});

// ─── refreshAccessToken ───────────────────────────────────────────────────────

describe('refreshAccessToken', () => {
  it('returns new token + refreshToken for valid refresh token', async () => {
    await register(getDb(), JWT_SECRET, { email: 'refresh@example.com', password: 'password123' });
    const { refreshToken } = await login(getDb(), JWT_SECRET, 'refresh@example.com', 'password123');

    const result = await refreshAccessToken(getDb(), JWT_SECRET, refreshToken!);
    expect(result.token).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
  });

  it('throws AuthenticationError for invalid refresh token string', async () => {
    await expect(refreshAccessToken(getDb(), JWT_SECRET, 'invalid.token.here')).rejects.toThrow();
  });
});

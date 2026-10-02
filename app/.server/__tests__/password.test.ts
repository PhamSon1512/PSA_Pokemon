import { describe, expect, it } from 'vitest';
import { comparePassword, hashPassword, timingSafeEqual } from '../password';

// ─── timingSafeEqual ──────────────────────────────────────────────────────────

describe('timingSafeEqual', () => {
  const enc = new TextEncoder();

  it('returns true for identical buffers', () => {
    expect(timingSafeEqual(enc.encode('password123'), enc.encode('password123'))).toBe(true);
  });

  it('returns false when buffers differ by one byte at end', () => {
    expect(timingSafeEqual(enc.encode('password123'), enc.encode('password124'))).toBe(false);
  });

  it('returns false when buffers differ by one byte at start', () => {
    expect(timingSafeEqual(enc.encode('apassword'), enc.encode('bpassword'))).toBe(false);
  });

  it('returns false when buffers differ in length', () => {
    expect(timingSafeEqual(enc.encode('short'), enc.encode('longer'))).toBe(false);
  });

  it('returns true for empty buffers', () => {
    expect(timingSafeEqual(new Uint8Array(0), new Uint8Array(0))).toBe(true);
  });

  it('returns false for empty vs non-empty', () => {
    expect(timingSafeEqual(new Uint8Array(0), enc.encode('x'))).toBe(false);
  });
});

// ─── hashPassword ─────────────────────────────────────────────────────────────

describe('hashPassword', () => {
  it('produces a string with format "<saltHex>:<hashHex>"', async () => {
    const hash = await hashPassword('mysecret');
    const parts = hash.split(':');
    expect(parts).toHaveLength(2);
    // salt: 16 bytes → 32 hex chars
    expect(parts[0]).toHaveLength(32);
    // hash: 256 bits → 32 bytes → 64 hex chars
    expect(parts[1]).toHaveLength(64);
  });

  it('produces different hashes on each call (random salt)', async () => {
    const h1 = await hashPassword('samepassword');
    const h2 = await hashPassword('samepassword');
    expect(h1).not.toBe(h2);
  });
});

// ─── comparePassword ─────────────────────────────────────────────────────────

describe('comparePassword', () => {
  it('returns true when password matches hash', async () => {
    const hash = await hashPassword('correct-horse-battery');
    expect(await comparePassword('correct-horse-battery', hash)).toBe(true);
  });

  it('returns false when password does not match hash', async () => {
    const hash = await hashPassword('original');
    expect(await comparePassword('wrong', hash)).toBe(false);
  });

  it('returns false for a malformed stored hash (missing colon)', async () => {
    expect(await comparePassword('anything', 'nocolon')).toBe(false);
  });

  it('returns false for empty stored hash', async () => {
    expect(await comparePassword('anything', '')).toBe(false);
  });
});

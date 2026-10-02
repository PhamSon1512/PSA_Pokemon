import { describe, expect, it } from 'vitest';
import { ConflictError } from '../errors';
import { buildPatch, ensureUniqueSlug, makeSlug } from '../services/_helpers';

// ─── makeSlug ─────────────────────────────────────────────────────────────────

describe('makeSlug', () => {
  it('converts string to lowercase-hyphenated slug', () => {
    expect(makeSlug('Hello World')).toBe('hello-world');
  });

  it('strips accents and special chars (strict mode)', () => {
    expect(makeSlug('Cà Phê Việt Nam')).toBe('ca-phe-viet-nam');
  });

  it('handles already-slugified input unchanged', () => {
    expect(makeSlug('my-slug')).toBe('my-slug');
  });

  it('trims leading/trailing whitespace', () => {
    expect(makeSlug('  trimmed  ')).toBe('trimmed');
  });

  it('collapses multiple spaces', () => {
    expect(makeSlug('one   two')).toBe('one-two');
  });
});

// ─── buildPatch ───────────────────────────────────────────────────────────────

describe('buildPatch', () => {
  it('picks only specified keys', () => {
    const patch = buildPatch({ name: 'foo', slug: 'bar', extra: 'nope' }, ['name', 'slug']);
    expect(patch).toHaveProperty('name', 'foo');
    expect(patch).toHaveProperty('slug', 'bar');
    expect(patch).not.toHaveProperty('extra');
  });

  it('includes updatedAt as a Date', () => {
    const patch = buildPatch({ name: 'foo' }, ['name']);
    expect(patch.updatedAt).toBeInstanceOf(Date);
  });

  it('skips keys where value is undefined', () => {
    const patch = buildPatch({ name: 'foo', slug: undefined }, ['name', 'slug']);
    expect(patch).toHaveProperty('name', 'foo');
    expect(patch).not.toHaveProperty('slug');
  });

  it('returns only updatedAt when no keys match', () => {
    const patch = buildPatch({ name: undefined }, ['name']);
    const keys = Object.keys(patch);
    expect(keys).toEqual(['updatedAt']);
  });

  it('returns updatedAt even with empty input', () => {
    const patch = buildPatch({}, []);
    expect(patch).toHaveProperty('updatedAt');
  });
});

// ─── ensureUniqueSlug ─────────────────────────────────────────────────────────

describe('ensureUniqueSlug', () => {
  it('returns baseSlug when no conflict exists', async () => {
    const check = async () => undefined;
    expect(await ensureUniqueSlug(check, 'foo')).toBe('foo');
  });

  it('appends counter when base slug conflicts', async () => {
    // Always returns a conflict (no id match)
    const check = async (s: string) => (s === 'foo' ? { id: 'other' } : undefined);
    expect(await ensureUniqueSlug(check, 'foo')).toBe('foo-1');
  });

  it('skips conflict for matching excludeId (update flow)', async () => {
    // Current record owns "foo"
    const check = async () => ({ id: 'current-record' });
    expect(await ensureUniqueSlug(check, 'foo', 'current-record')).toBe('foo');
  });

  it('increments counter until finding a free slot', async () => {
    // foo, foo-1, foo-2 all taken — foo-3 is free
    const taken = new Set(['foo', 'foo-1', 'foo-2']);
    const check = async (s: string) => (taken.has(s) ? { id: 'x' } : undefined);
    expect(await ensureUniqueSlug(check, 'foo')).toBe('foo-3');
  });

  it('throws ConflictError after MAX_ATTEMPTS exhausted', async () => {
    // Never free
    const check = async () => ({ id: 'blocker' });
    await expect(ensureUniqueSlug(check, 'foo')).rejects.toBeInstanceOf(ConflictError);
  });
});

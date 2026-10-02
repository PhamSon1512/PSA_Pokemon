import { describe, expect, it } from 'vitest';
import { cn, convertType, countryCodeToEmoji, metaBuilder, randomInt, sleep } from '../utils';

// ─── sleep ────────────────────────────────────────────────────────────────────

describe('sleep', () => {
  it('resolves after approximately the given ms', async () => {
    const before = Date.now();
    await sleep(50);
    const elapsed = Date.now() - before;
    // Allow 20ms slack for timer precision
    expect(elapsed).toBeGreaterThanOrEqual(40);
  });

  it('resolves with undefined', async () => {
    const result = await sleep(0);
    expect(result).toBeUndefined();
  });
});

// ─── cn ───────────────────────────────────────────────────────────────────────

describe('cn', () => {
  it('merges class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('resolves Tailwind conflicts (last wins)', () => {
    // tailwind-merge: p-2 overrides p-4
    expect(cn('p-4', 'p-2')).toBe('p-2');
  });

  it('ignores falsy values', () => {
    expect(cn('foo', false, undefined, null, 'bar')).toBe('foo bar');
  });

  it('handles conditional classes via object syntax', () => {
    expect(cn({ 'text-red-500': true, 'text-blue-500': false })).toBe('text-red-500');
  });

  it('returns empty string when no args', () => {
    expect(cn()).toBe('');
  });

  it('handles arrays of class names', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz');
  });
});

// ─── metaBuilder ──────────────────────────────────────────────────────────────

describe('metaBuilder', () => {
  it('returns array with one title entry', () => {
    const result = metaBuilder('Dashboard');
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ title: 'Dashboard | WinVu' });
  });

  it('appends " | WinVu" suffix', () => {
    const result = metaBuilder('Settings');
    expect(result[0].title).toBe('Settings | WinVu');
  });

  it('handles empty string', () => {
    const result = metaBuilder('');
    expect(result[0].title).toBe(' | WinVu');
  });
});

// ─── convertType ──────────────────────────────────────────────────────────────

describe('convertType', () => {
  it('returns NaN for string "NaN"', () => {
    expect(convertType('NaN')).toBeNaN();
  });

  it('returns null for string "null"', () => {
    expect(convertType('null')).toBeNull();
  });

  it('returns undefined for string "undefined"', () => {
    expect(convertType('undefined')).toBeUndefined();
  });

  it('returns Infinity for string "Infinity"', () => {
    expect(convertType('Infinity')).toBe(Infinity);
  });

  it('returns -Infinity for string "-Infinity"', () => {
    expect(convertType('-Infinity')).toBe(-Infinity);
  });

  it('returns the original string for unknown values', () => {
    expect(convertType('hello')).toBe('hello');
    expect(convertType('123')).toBe('123');
    expect(convertType('')).toBe('');
  });
});

// ─── countryCodeToEmoji ───────────────────────────────────────────────────────

describe('countryCodeToEmoji', () => {
  it('converts "VN" to the Vietnam flag emoji', () => {
    expect(countryCodeToEmoji('VN')).toBe('🇻🇳');
  });

  it('converts "US" to the USA flag emoji', () => {
    expect(countryCodeToEmoji('US')).toBe('🇺🇸');
  });

  it('handles lowercase input', () => {
    // toUpperCase() is called inside
    expect(countryCodeToEmoji('vn')).toBe('🇻🇳');
  });
});

// ─── randomInt ────────────────────────────────────────────────────────────────

describe('randomInt', () => {
  it('returns a number within [min, max] inclusive', () => {
    for (let i = 0; i < 100; i++) {
      const result = randomInt(1, 10);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(10);
    }
  });

  it('uses defaults [0, 100] when called with no args', () => {
    for (let i = 0; i < 50; i++) {
      const result = randomInt();
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(100);
    }
  });

  it('returns always the same value when min === max', () => {
    expect(randomInt(5, 5)).toBe(5);
  });

  it('returns an integer (no decimal)', () => {
    const result = randomInt(0, 1000);
    expect(Number.isInteger(result)).toBe(true);
  });

  it('handles float min/max by ceiling/flooring them', () => {
    // min=1.2 → ceil → 2, max=2.9 → floor → 2, always 2
    const result = randomInt(1.2, 2.9);
    expect(result).toBeGreaterThanOrEqual(2);
    expect(result).toBeLessThanOrEqual(2);
  });
});

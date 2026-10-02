import { describe, expect, it } from 'vitest';
import {
  ACCEPTED_MIME,
  ACCESS_TOKEN_COOKIE,
  CATEGORY_STYLES,
  DEFAULT_ROLE_STYLE,
  DEFAULT_USER_ROLE,
  FILTER_LABELS,
  HTTP_METHODS,
  MEDIA_PAGE_SIZE,
  REFRESH_TOKEN_COOKIE,
  ROLE_STYLES,
  USER_ROLES,
  USERS_PAGE_SIZE,
} from '../constants';

// ─── Auth cookie names ────────────────────────────────────────────────────────

describe('Auth cookie constants', () => {
  it('ACCESS_TOKEN_COOKIE is "token"', () => {
    expect(ACCESS_TOKEN_COOKIE).toBe('token');
  });

  it('REFRESH_TOKEN_COOKIE is "refreshToken"', () => {
    expect(REFRESH_TOKEN_COOKIE).toBe('refreshToken');
  });
});

// ─── HTTP_METHODS ─────────────────────────────────────────────────────────────

describe('HTTP_METHODS', () => {
  it('contains all standard HTTP verbs and wildcard', () => {
    expect(HTTP_METHODS).toContain('GET');
    expect(HTTP_METHODS).toContain('POST');
    expect(HTTP_METHODS).toContain('PUT');
    expect(HTTP_METHODS).toContain('PATCH');
    expect(HTTP_METHODS).toContain('DELETE');
    expect(HTTP_METHODS).toContain('HEAD');
    expect(HTTP_METHODS).toContain('OPTIONS');
    expect(HTTP_METHODS).toContain('*');
  });

  it('has exactly 8 entries', () => {
    expect(HTTP_METHODS).toHaveLength(8);
  });
});

// ─── Pagination constants ─────────────────────────────────────────────────────

describe('Pagination page sizes', () => {
  it('MEDIA_PAGE_SIZE is a positive integer', () => {
    expect(MEDIA_PAGE_SIZE).toBe(40);
    expect(Number.isInteger(MEDIA_PAGE_SIZE)).toBe(true);
  });

  it('USERS_PAGE_SIZE is a positive integer', () => {
    expect(USERS_PAGE_SIZE).toBe(20);
    expect(Number.isInteger(USERS_PAGE_SIZE)).toBe(true);
  });

  it('all page sizes are greater than 0', () => {
    expect(MEDIA_PAGE_SIZE).toBeGreaterThan(0);
    expect(USERS_PAGE_SIZE).toBeGreaterThan(0);
  });
});

// ─── USER_ROLES ───────────────────────────────────────────────────────────────

describe('USER_ROLES', () => {
  it('contains user and admin', () => {
    expect(USER_ROLES).toContain('user');
    expect(USER_ROLES).toContain('admin');
  });

  it('is readonly tuple', () => {
    expect(Array.isArray(USER_ROLES)).toBe(true);
  });

  it('DEFAULT_USER_ROLE is the first role', () => {
    expect(DEFAULT_USER_ROLE).toBe(USER_ROLES[0]);
  });
});

// ─── ROLE_STYLES ──────────────────────────────────────────────────────────────

describe('ROLE_STYLES', () => {
  it('has an entry for each role in USER_ROLES', () => {
    USER_ROLES.forEach((role) => {
      expect(ROLE_STYLES).toHaveProperty(role);
      expect(typeof ROLE_STYLES[role]).toBe('string');
      expect(ROLE_STYLES[role].length).toBeGreaterThan(0);
    });
  });

  it('each role style is a non-empty string', () => {
    Object.values(ROLE_STYLES).forEach((style) => {
      expect(typeof style).toBe('string');
      expect(style.length).toBeGreaterThan(0);
    });
  });

  it('DEFAULT_ROLE_STYLE is a non-empty string', () => {
    expect(typeof DEFAULT_ROLE_STYLE).toBe('string');
    expect(DEFAULT_ROLE_STYLE.length).toBeGreaterThan(0);
  });

  it('DEFAULT_ROLE_STYLE is different from any role-specific style', () => {
    Object.values(ROLE_STYLES).forEach((style) => {
      expect(DEFAULT_ROLE_STYLE).not.toBe(style);
    });
  });
});

// ─── Media constants ──────────────────────────────────────────────────────────

describe('ACCEPTED_MIME', () => {
  it('is a non-empty string', () => {
    expect(typeof ACCEPTED_MIME).toBe('string');
    expect(ACCEPTED_MIME.length).toBeGreaterThan(0);
  });

  it('accepts image/* and video/*', () => {
    expect(ACCEPTED_MIME).toContain('image/*');
    expect(ACCEPTED_MIME).toContain('video/*');
  });

  it('accepts PDF', () => {
    expect(ACCEPTED_MIME).toContain('application/pdf');
  });

  it('accepts common document extensions', () => {
    expect(ACCEPTED_MIME).toContain('.doc');
    expect(ACCEPTED_MIME).toContain('.xlsx');
    expect(ACCEPTED_MIME).toContain('.csv');
  });
});

describe('FILTER_LABELS', () => {
  const expectedKeys = ['all', 'image', 'video', 'audio', 'document'];

  it('has entries for all expected filter types', () => {
    expectedKeys.forEach((key) => {
      expect(FILTER_LABELS).toHaveProperty(key);
      expect(typeof FILTER_LABELS[key]).toBe('string');
    });
  });

  it('"all" label is non-empty', () => {
    expect(FILTER_LABELS['all'].length).toBeGreaterThan(0);
  });
});

describe('CATEGORY_STYLES', () => {
  const expectedKeys = ['all', 'image', 'video', 'audio', 'document'];

  it('has entries for all expected categories', () => {
    expectedKeys.forEach((key) => {
      expect(CATEGORY_STYLES).toHaveProperty(key);
    });
  });

  it('"all" category has empty string style (no badge)', () => {
    expect(CATEGORY_STYLES['all']).toBe('');
  });

  it('other categories have non-empty styles', () => {
    ['image', 'video', 'audio', 'document'].forEach((key) => {
      expect(CATEGORY_STYLES[key].length).toBeGreaterThan(0);
    });
  });
});

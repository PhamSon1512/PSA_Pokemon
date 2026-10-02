/**
 * Tests for http.ts — getApiError utility.
 *
 * NOTE: The http xior instance, interceptors, và plugins không được test ở đây
 * vì chúng phụ thuộc vào browser APIs (js-cookie, window.location, sonner toast)
 * không có trong CF Workers env. Các integration tests cho http client
 * nên được thực hiện bằng browser-level testing (Playwright, Cypress, etc).
 *
 * getApiError là pure function và được test đầy đủ bên dưới.
 */

import { describe, expect, it } from 'vitest';
import { getApiError } from '../http';

// ─── getApiError ──────────────────────────────────────────────────────────────

describe('getApiError', () => {
  it('extracts message from nested error response', () => {
    const err = {
      response: {
        data: {
          error: {
            message: 'User not found',
          },
        },
      },
    };
    expect(getApiError(err)).toBe('User not found');
  });

  it('returns fallback when response is missing', () => {
    expect(getApiError(null)).toBe('Something went wrong');
    expect(getApiError(undefined)).toBe('Something went wrong');
  });

  it('returns fallback when response.data is missing', () => {
    const err = { response: {} };
    expect(getApiError(err)).toBe('Something went wrong');
  });

  it('returns fallback when response.data.error is missing', () => {
    const err = { response: { data: {} } };
    expect(getApiError(err)).toBe('Something went wrong');
  });

  it('returns fallback when error.message is missing', () => {
    const err = { response: { data: { error: {} } } };
    expect(getApiError(err)).toBe('Something went wrong');
  });

  it('uses custom fallback string when provided', () => {
    expect(getApiError(null, 'Custom error')).toBe('Custom error');
  });

  it('returns message even when error is a plain Error object (no response)', () => {
    const err = new Error('plain error');
    expect(getApiError(err)).toBe('Something went wrong');
  });

  it('returns empty string when message is "" (nullish coalescing does not fallback on "")', () => {
    const err = {
      response: {
        data: {
          error: {
            message: '',
          },
        },
      },
    };
    // ?? only falls back for null/undefined — empty string passes through as-is
    expect(getApiError(err)).toBe('');
  });

  it('extracts message when nested deeply in a full xior error shape', () => {
    const err = {
      message: 'Network Error',
      config: { url: '/api/users' },
      response: {
        status: 422,
        data: {
          success: false,
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            statusCode: 422,
          },
        },
      },
    };
    expect(getApiError(err)).toBe('Validation failed');
  });
});

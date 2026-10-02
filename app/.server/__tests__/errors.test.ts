import { describe, expect, it } from 'vitest';
import {
  AppError,
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  DatabaseError,
  ExternalServiceError,
  getErrorCode,
  getStatusCode,
  isOperationalError,
  NotFoundError,
  raise,
  RateLimitError,
  TimeoutError,
  ValidationError,
} from '../errors';

// ─── AppError ─────────────────────────────────────────────────────────────────

describe('AppError', () => {
  it('constructs with string overload and correct defaults', () => {
    const err = new AppError('something went wrong', 400, 'BAD_REQUEST');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
    expect(err.message).toBe('something went wrong');
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('BAD_REQUEST');
    expect(err.isOperational).toBe(true);
    expect(err.timestamp).toBeInstanceOf(Date);
    expect(err.name).toBe('AppError');
  });

  it('constructs with options object overload', () => {
    const err = new AppError({
      message: 'options overload',
      statusCode: 422,
      code: 'VALIDATION_ERROR',
      isOperational: false,
      context: { field: 'email' },
      category: 'validation',
      severity: 'high',
    });
    expect(err.statusCode).toBe(422);
    expect(err.isOperational).toBe(false);
    expect(err.context).toEqual({ field: 'email' });
    expect(err.category).toBe('validation');
    expect(err.severity).toBe('high');
  });

  it('falls back to APP_ERROR_500 when code is omitted', () => {
    const err = new AppError('no code');
    expect(err.code).toBe('APP_ERROR_500');
    expect(err.statusCode).toBe(500);
  });

  it('timestamp is set at construction time', () => {
    const before = Date.now();
    const err = new AppError('ts test');
    const after = Date.now();
    expect(err.timestamp.getTime()).toBeGreaterThanOrEqual(before);
    expect(err.timestamp.getTime()).toBeLessThanOrEqual(after);
  });
});

// ─── Derived error classes ────────────────────────────────────────────────────

describe('DatabaseError', () => {
  it('statusCode 500, code DATABASE_ERROR', () => {
    const err = new DatabaseError('db failed');
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe('DATABASE_ERROR');
    expect(err).toBeInstanceOf(AppError);
  });
});

describe('ValidationError', () => {
  it('statusCode 400, code VALIDATION_ERROR', () => {
    const err = new ValidationError('bad input');
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
  });
});

describe('AuthenticationError', () => {
  it('statusCode 401, code AUTHENTICATION_ERROR', () => {
    const err = new AuthenticationError('not logged in');
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('AUTHENTICATION_ERROR');
  });
});

describe('AuthorizationError', () => {
  it('statusCode 403, code AUTHORIZATION_ERROR', () => {
    const err = new AuthorizationError('no permission');
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('AUTHORIZATION_ERROR');
  });
});

describe('NotFoundError', () => {
  it('statusCode 404, code RESOURCE_NOT_FOUND', () => {
    const err = new NotFoundError('not found');
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('RESOURCE_NOT_FOUND');
  });
});

describe('ConflictError', () => {
  it('statusCode 409, code RESOURCE_CONFLICT', () => {
    const err = new ConflictError('already exists');
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe('RESOURCE_CONFLICT');
  });
});

describe('RateLimitError', () => {
  it('statusCode 429, default message, code RATE_LIMIT_EXCEEDED', () => {
    const err = new RateLimitError();
    expect(err.statusCode).toBe(429);
    expect(err.message).toBe('Too many requests');
    expect(err.code).toBe('RATE_LIMIT_EXCEEDED');
  });
});

describe('ExternalServiceError', () => {
  it('statusCode 502, code EXTERNAL_SERVICE_ERROR', () => {
    const err = new ExternalServiceError('stripe is down');
    expect(err.statusCode).toBe(502);
    expect(err.code).toBe('EXTERNAL_SERVICE_ERROR');
  });
});

describe('TimeoutError', () => {
  it('statusCode 408, default message, code TIMEOUT_ERROR', () => {
    const err = new TimeoutError();
    expect(err.statusCode).toBe(408);
    expect(err.message).toBe('Operation timed out');
    expect(err.code).toBe('TIMEOUT_ERROR');
    expect(err).toBeInstanceOf(AppError);
  });

  it('accepts custom message', () => {
    const err = new TimeoutError('DB query timed out');
    expect(err.message).toBe('DB query timed out');
  });
});

// ─── raise helpers ────────────────────────────────────────────────────────────

describe('raise', () => {
  it('raise.badRequest throws AppError 400 BAD_REQUEST', () => {
    expect(() => raise.badRequest('invalid input')).toThrow(AppError);
    try {
      raise.badRequest('invalid input');
    } catch (e: any) {
      expect(e.statusCode).toBe(400);
      expect(e.code).toBe('BAD_REQUEST');
    }
  });

  it('raise.unauthorized throws AuthenticationError 401', () => {
    expect(() => raise.unauthorized()).toThrow(AuthenticationError);
    try {
      raise.unauthorized('no token');
    } catch (e: any) {
      expect(e.statusCode).toBe(401);
      expect(e.code).toBe('UNAUTHORIZED');
      expect(e.message).toBe('no token');
    }
  });

  it('raise.unauthorized — default message', () => {
    try {
      raise.unauthorized();
    } catch (e: any) {
      expect(e.message).toBe('Unauthorized access');
    }
  });

  it('raise.forbidden throws AuthorizationError 403', () => {
    expect(() => raise.forbidden()).toThrow(AuthorizationError);
    try {
      raise.forbidden();
    } catch (e: any) {
      expect(e.statusCode).toBe(403);
      expect(e.code).toBe('FORBIDDEN');
    }
  });

  it('raise.notFound throws NotFoundError 404 with resource name', () => {
    expect(() => raise.notFound('User')).toThrow(NotFoundError);
    try {
      raise.notFound('User', { id: '123' });
    } catch (e: any) {
      expect(e.statusCode).toBe(404);
      expect(e.code).toBe('NOT_FOUND');
      expect(e.message).toContain('User');
      expect(e.context).toEqual({ id: '123' });
    }
  });

  it('raise.conflict throws ConflictError 409', () => {
    expect(() => raise.conflict('exists')).toThrow(ConflictError);
    try {
      raise.conflict('exists');
    } catch (e: any) {
      expect(e.statusCode).toBe(409);
      expect(e.code).toBe('CONFLICT');
    }
  });

  it('raise.validation throws ValidationError 400 VALIDATION_FAILED', () => {
    expect(() => raise.validation('bad')).toThrow(ValidationError);
    try {
      raise.validation('bad', { field: 'email' });
    } catch (e: any) {
      expect(e.code).toBe('VALIDATION_FAILED');
      expect(e.context).toEqual({ field: 'email' });
    }
  });

  it('raise.database throws DatabaseError 500', () => {
    expect(() => raise.database('query failed')).toThrow(DatabaseError);
    try {
      raise.database('query failed');
    } catch (e: any) {
      expect(e.code).toBe('DATABASE_OPERATION_FAILED');
      expect(e.statusCode).toBe(500);
    }
  });

  it('raise.internal throws AppError 500 non-operational', () => {
    expect(() => raise.internal()).toThrow(AppError);
    try {
      raise.internal();
    } catch (e: any) {
      expect(e.statusCode).toBe(500);
      expect(e.code).toBe('INTERNAL_SERVER_ERROR');
      expect(e.isOperational).toBe(false);
    }
  });

  it('raise.rateLimit throws RateLimitError 429', () => {
    expect(() => raise.rateLimit()).toThrow(RateLimitError);
  });

  it('raise.timeout throws TimeoutError 408 with operation name', () => {
    expect(() => raise.timeout('DBQuery')).toThrow(TimeoutError);
    try {
      raise.timeout('DBQuery');
    } catch (e: any) {
      expect(e.statusCode).toBe(408);
      expect(e.code).toBe('TIMEOUT_ERROR');
      expect(e.message).toBe('DBQuery timed out');
    }
  });

  it('raise.externalService throws ExternalServiceError 502 with service in context', () => {
    expect(() => raise.externalService('stripe')).toThrow(ExternalServiceError);
    try {
      raise.externalService('stripe', 'payment failed', { txId: 'abc' });
    } catch (e: any) {
      expect(e.statusCode).toBe(502);
      expect(e.context?.service).toBe('stripe');
      expect(e.context?.txId).toBe('abc');
    }
  });
});

// ─── isOperationalError ───────────────────────────────────────────────────────

describe('isOperationalError', () => {
  it('returns true for operational AppError subclass', () => {
    expect(isOperationalError(new ValidationError('oops'))).toBe(true);
  });

  it('returns false for non-operational AppError', () => {
    const err = new AppError('crash', 500, 'INTERNAL_SERVER_ERROR', false);
    expect(isOperationalError(err)).toBe(false);
  });

  it('returns false for plain Error', () => {
    expect(isOperationalError(new Error('plain'))).toBe(false);
  });

  it('returns false for null/undefined', () => {
    expect(isOperationalError(null)).toBe(false);
    expect(isOperationalError(undefined)).toBe(false);
  });
});

// ─── getStatusCode ────────────────────────────────────────────────────────────

describe('getStatusCode', () => {
  it('reads statusCode from AppError', () => {
    expect(getStatusCode(new NotFoundError('x'))).toBe(404);
    expect(getStatusCode(new ConflictError('x'))).toBe(409);
  });

  it('returns 409 for UNIQUE constraint DB error', () => {
    expect(getStatusCode({ cause: 'UNIQUE constraint failed: users.email' })).toBe(409);
  });

  it('returns 400 for FOREIGN KEY constraint DB error', () => {
    expect(getStatusCode({ cause: 'FOREIGN KEY constraint failed' })).toBe(400);
  });

  it('returns 401 for Jwt-named errors', () => {
    expect(getStatusCode({ name: 'JwtTokenExpired' })).toBe(401);
  });

  it('returns 400 for SyntaxError with JSON in message', () => {
    const err = new SyntaxError('Unexpected token in JSON');
    expect(getStatusCode(err)).toBe(400);
  });

  it('falls back to 500 for unknown errors', () => {
    expect(getStatusCode(new Error('unknown'))).toBe(500);
    expect(getStatusCode('some string')).toBe(500);
  });
});

// ─── getErrorCode ─────────────────────────────────────────────────────────────

describe('getErrorCode', () => {
  it('reads code from AppError', () => {
    expect(getErrorCode(new NotFoundError('x'))).toBe('RESOURCE_NOT_FOUND');
  });

  it('returns DB_UNIQUE_CONSTRAINT for unique constraint error', () => {
    expect(getErrorCode({ cause: 'UNIQUE constraint failed: users.email' })).toBe('DB_UNIQUE_CONSTRAINT');
  });

  it('returns JWT_INVALID for Jwt errors', () => {
    expect(getErrorCode({ name: 'JwtTokenInvalid' })).toBe('JWT_INVALID');
  });

  it('returns VALIDATION_ERROR for ZodError', () => {
    expect(getErrorCode({ name: 'ZodError' })).toBe('VALIDATION_ERROR');
  });

  it('returns TYPE_ERROR for TypeError', () => {
    expect(getErrorCode(new TypeError('oops'))).toBe('TYPE_ERROR');
  });

  it('falls back to INTERNAL_SERVER_ERROR', () => {
    expect(getErrorCode(new Error('unknown'))).toBe('INTERNAL_SERVER_ERROR');
  });
});

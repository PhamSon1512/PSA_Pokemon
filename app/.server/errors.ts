import type { AppErrorOptions, ErrorCategory, ErrorCode, ErrorContext, ErrorSeverity } from './types';

/**
 * Base application error with typed metadata
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: ErrorContext;
  public readonly timestamp: Date;
  public readonly category?: ErrorCategory;
  public readonly severity?: ErrorSeverity;

  constructor(options: AppErrorOptions);
  constructor(message: string, statusCode?: number, code?: ErrorCode, isOperational?: boolean, context?: ErrorContext);
  constructor(
    optionsOrMessage: AppErrorOptions | string,
    statusCode: number = 500,
    code?: ErrorCode,
    isOperational: boolean = true,
    context?: ErrorContext,
  ) {
    const options: AppErrorOptions =
      typeof optionsOrMessage === 'string'
        ? { message: optionsOrMessage, statusCode, code, isOperational, context }
        : optionsOrMessage;

    super(options.message);

    this.name = this.constructor.name;
    this.statusCode = options.statusCode ?? 500;
    this.code = options.code ?? (`APP_ERROR_${this.statusCode}` as ErrorCode);
    this.isOperational = options.isOperational ?? true;
    this.context = options.context;
    this.category = options.category;
    this.severity = options.severity;
    this.timestamp = new Date();
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, code: ErrorCode = 'DATABASE_ERROR', context?: ErrorContext) {
    super({ message, statusCode: 500, code, isOperational: true, context, category: 'database', severity: 'high' });
  }
}

export class ValidationError extends AppError {
  constructor(message: string, code: ErrorCode = 'VALIDATION_ERROR', context?: ErrorContext) {
    super({ message, statusCode: 400, code, isOperational: true, context, category: 'validation', severity: 'low' });
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string, code: ErrorCode = 'AUTHENTICATION_ERROR', context?: ErrorContext) {
    super({ message, statusCode: 401, code, isOperational: true, context, category: 'auth', severity: 'medium' });
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string, code: ErrorCode = 'AUTHORIZATION_ERROR', context?: ErrorContext) {
    super({ message, statusCode: 403, code, isOperational: true, context, category: 'auth', severity: 'medium' });
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, code: ErrorCode = 'RESOURCE_NOT_FOUND', context?: ErrorContext) {
    super({ message, statusCode: 404, code, isOperational: true, context, category: 'business', severity: 'low' });
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code: ErrorCode = 'RESOURCE_CONFLICT', context?: ErrorContext) {
    super({ message, statusCode: 409, code, isOperational: true, context, category: 'business', severity: 'low' });
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests', code: ErrorCode = 'RATE_LIMIT_EXCEEDED', context?: ErrorContext) {
    super({ message, statusCode: 429, code, isOperational: true, context, category: 'system', severity: 'medium' });
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string, code: ErrorCode = 'EXTERNAL_SERVICE_ERROR', context?: ErrorContext) {
    super({ message, statusCode: 502, code, isOperational: true, context, category: 'network', severity: 'high' });
  }
}

export class TimeoutError extends AppError {
  constructor(message: string = 'Operation timed out', code: ErrorCode = 'TIMEOUT_ERROR', context?: ErrorContext) {
    super({ message, statusCode: 408, code, isOperational: true, context, category: 'system', severity: 'medium' });
  }
}

/**
 * Fluent throw helpers — use in services/business logic (not in route handlers).
 *
 * @example
 * // In a service:
 * raise.notFound('User');          // throws NotFoundError → caught by handleApiError
 *
 * // In a route handler (direct return):
 * return notFound('User');         // returns Response directly — from response.ts
 */
export const raise = {
  badRequest: (message: string, context?: ErrorContext): never => {
    // Generic 400 — not necessarily a validation issue
    throw new AppError({ message, statusCode: 400, code: 'BAD_REQUEST', isOperational: true, context });
  },
  unauthorized: (message = 'Unauthorized access', context?: ErrorContext): never => {
    throw new AuthenticationError(message, 'UNAUTHORIZED', context);
  },
  forbidden: (message = 'Access forbidden', context?: ErrorContext): never => {
    throw new AuthorizationError(message, 'FORBIDDEN', context);
  },
  notFound: (resource = 'Resource', context?: ErrorContext): never => {
    throw new NotFoundError(`${resource} not found`, 'NOT_FOUND', context);
  },
  conflict: (message: string, context?: ErrorContext): never => {
    throw new ConflictError(message, 'CONFLICT', context);
  },
  validation: (message: string, context?: ErrorContext): never => {
    throw new ValidationError(message, 'VALIDATION_FAILED', context);
  },
  database: (message: string, context?: ErrorContext): never => {
    throw new DatabaseError(message, 'DATABASE_OPERATION_FAILED', context);
  },
  internal: (message = 'Internal server error', context?: ErrorContext): never => {
    throw new AppError({ message, statusCode: 500, code: 'INTERNAL_SERVER_ERROR', isOperational: false, context });
  },
  rateLimit: (message?: string, context?: ErrorContext): never => {
    throw new RateLimitError(message, 'RATE_LIMIT_EXCEEDED', context);
  },
  timeout: (operation = 'Operation', context?: ErrorContext): never => {
    throw new TimeoutError(`${operation} timed out`, 'TIMEOUT_ERROR', context);
  },
  externalService: (service: string, message?: string, context?: ErrorContext): never => {
    throw new ExternalServiceError(message ?? `External service ${service} unavailable`, 'EXTERNAL_SERVICE_ERROR', {
      service,
      ...context,
    });
  },
};

/**
 * Derive an HTTP status code from any thrown value.
 * Used by errorHandler and logger.
 */
export function getStatusCode(error: unknown): number {
  if (error instanceof AppError) return error.statusCode;

  const err = error as any;
  const cause = String(err?.cause ?? '');

  if (cause.includes('UNIQUE constraint failed')) return 409;
  if (cause.includes('FOREIGN KEY constraint failed')) return 400;
  if (cause.includes('NOT NULL constraint failed')) return 400;

  if (err?.name?.includes('Jwt')) return 401;
  if (err?.code === 'ENOTFOUND' || err?.code === 'ECONNREFUSED') return 503;
  if (err?.name === 'TimeoutError' || err?.code === 'TIMEOUT' || String(err?.message).includes('timeout')) return 408;
  if (err instanceof SyntaxError && String(err.message).includes('JSON')) return 400;

  return 500;
}

/**
 * Derive a typed ErrorCode from any thrown value.
 * Used by errorHandler and logger.
 */
export function getErrorCode(error: unknown): ErrorCode | string {
  if (error instanceof AppError) return error.code;

  const err = error as any;
  const cause = String(err?.cause ?? '');

  if (cause.includes('UNIQUE constraint failed')) return 'DB_UNIQUE_CONSTRAINT';
  if (cause.includes('FOREIGN KEY constraint failed')) return 'DB_FOREIGN_KEY_CONSTRAINT';
  if (cause.includes('NOT NULL constraint failed')) return 'DB_NOT_NULL_CONSTRAINT';

  if (err?.name?.includes('Jwt')) return 'JWT_INVALID';
  if (err?.name === 'ZodError') return 'VALIDATION_ERROR';
  if (err?.name === 'TimeoutError' || err?.code === 'TIMEOUT') return 'TIMEOUT_ERROR';
  if (err instanceof SyntaxError && String(err?.message).includes('JSON')) return 'JSON_PARSE_ERROR';

  const nameMap: Record<string, ErrorCode> = {
    TypeError: 'TYPE_ERROR',
    ReferenceError: 'REFERENCE_ERROR',
    SyntaxError: 'SYNTAX_ERROR',
  };

  return nameMap[err?.name] ?? 'INTERNAL_SERVER_ERROR';
}

/**
 * Type guard — true if error is an operational (expected) AppError
 */
export const isOperationalError = (error: unknown): error is AppError => {
  return error instanceof AppError && error.isOperational;
};

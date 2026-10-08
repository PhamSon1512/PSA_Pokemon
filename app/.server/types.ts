import type { LoginBodySchema, RefreshBodySchema, RegisterBodySchema, UpdateUserBodySchema } from '~/openapi/auth-users.openapi';
import type { UpdateMediaBodySchema } from '~/openapi/media.openapi';
import type { z } from 'zod';

// ─── Auth / User ────────────────────────────────────────────────────────────

/** JWT-extracted identity attached to every authenticated request */
export type AuthUser = {
  id: string;
  email: string;
  role: string;
};

/** Token pair returned on login */
export type AuthTokens = {
  token: string;
  refreshToken: string;
};

/** User fields safe to expose — no password / refreshToken */
export type SafeUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  role: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export type UserRole = 'subscriber' | 'contributor' | 'author' | 'editor' | 'admin';

export type PaginatedUsers = {
  data: SafeUser[];
  total: number;
};

// ─── Media ────────────────────────────────────────────────────────────────────

export type MediaItem = {
  id: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  bucketKey: string;
  title: string | null;
  description: string | null;
  tags: string[] | null;
  createdBy: string | null;
  updatedBy: string | null;
  deletedBy: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  deletedAt: Date | null;
  url: string;
};

export type PaginatedMedia = {
  data: MediaItem[];
  total: number;
};

export type UploadMediaInput = {
  file: File;
  title?: string;
  description?: string;
  tags?: string[];
  uploadedBy: string | null;
};

// ─── API Response ─────────────────────────────────────────────────────────────

export type ApiMeta = {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: ApiMeta;
};

export type ApiError = {
  success: false;
  error: string;
  code?: ErrorCode | (string & {});
  details?: unknown;
};

// ─── Error ────────────────────────────────────────────────────────────────────

export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'JWT_EXPIRED'
  | 'JWT_INVALID'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'BAD_REQUEST'
  | 'VALIDATION_ERROR'
  | 'VALIDATION_FAILED'
  | 'JSON_PARSE_ERROR'
  | 'SERIALIZATION_ERROR'
  | 'NOT_FOUND'
  | 'RESOURCE_NOT_FOUND'
  | 'CONFLICT'
  | 'RESOURCE_CONFLICT'
  | 'RATE_LIMIT_EXCEEDED'
  | 'DATABASE_ERROR'
  | 'DATABASE_OPERATION_FAILED'
  | 'DB_UNIQUE_CONSTRAINT'
  | 'DB_FOREIGN_KEY_CONSTRAINT'
  | 'DB_NOT_NULL_CONSTRAINT'
  | 'EXTERNAL_SERVICE_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'RESOURCE_ERROR'
  | 'RESOURCE_EXHAUSTED'
  | 'FILE_SYSTEM_ERROR'
  | 'TYPE_ERROR'
  | 'REFERENCE_ERROR'
  | 'SYNTAX_ERROR'
  | 'STACK_OVERFLOW'
  | 'OUT_OF_MEMORY'
  | 'INTERNAL_SERVER_ERROR'
  | `APP_ERROR_${number}`;

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ErrorCategory = 'auth' | 'validation' | 'database' | 'network' | 'system' | 'business';

export type ErrorContext = Record<string, unknown>;

export interface AppErrorOptions {
  message: string;
  statusCode?: number;
  code?: ErrorCode;
  isOperational?: boolean;
  context?: ErrorContext;
  category?: ErrorCategory;
  severity?: ErrorSeverity;
  cause?: unknown;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export type PaginationParams = {
  page: number;
  limit: number;
  offset: number;
};

// ─── Validator input types ────────────────────────────────────────────────────
// Inferred from openapi Zod schemas — no manual duplication.
// If a schema changes, the type updates automatically.
export type LoginInput = z.infer<typeof LoginBodySchema>;
export type RegisterInput = z.infer<typeof RegisterBodySchema>;
export type RefreshTokenInput = z.infer<typeof RefreshBodySchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserBodySchema>;
export type UpdateMediaInput = z.infer<typeof UpdateMediaBodySchema>;

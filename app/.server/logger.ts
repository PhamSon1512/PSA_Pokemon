import type { AuthUser, ErrorCode } from './types';
import { AppError, getErrorCode, getStatusCode, isOperationalError } from './errors';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

type RequestMeta = {
  method: string;
  url: string;
  cfRay?: string | null;
  ip?: string | null;
  userAgent?: string | null;
};

type LogEntry = {
  timestamp: string;
  level: LogLevel;
  message: string;
  requestId?: string | null;
  request?: RequestMeta;
  user?: { id: string; email: string; role: string } | null;
  environment?: string;
  data?: unknown;
  error?: {
    name: string;
    message: string;
    code: ErrorCode | string;
    statusCode: number;
    stack?: string;
    cause?: string;
    context?: unknown;
    isOperational: boolean;
    severity?: string;
  };
  operation?: string;
  model?: string;
  metrics?: Record<string, unknown>;
};

export class Logger {
  // ─── Core ────────────────────────────────────────────────────────────────────

  private static emit(level: LogLevel, message: string, extra: Partial<LogEntry> = {}): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...extra,
    };

    // Structured output — Cloudflare Workers logs are picked up by Logpush as JSON
    console[level](JSON.stringify(entry));
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  /**
   * General info log — use for lifecycle events, successful operations
   */
  static info(message: string, data?: unknown, request?: Request, user?: AuthUser | null): void {
    this.emit('info', `ℹ️ ${message}`, {
      data,
      request: request ? this.extractRequestMeta(request) : undefined,
      user: user ?? null,
    });
  }

  /**
   * Debug log — only emitted when ENVIRONMENT !== 'production'
   */
  static debug(data: unknown, environment = 'development'): void {
    if (environment === 'production') return;
    this.emit('debug', '🐛 DEBUG', { data });
  }

  /**
   * Warning log — unexpected but non-fatal events
   */
  static warn(message: string, data?: unknown, request?: Request): void {
    this.emit('warn', `⚠️ ${message}`, {
      data,
      request: request ? this.extractRequestMeta(request) : undefined,
    });
  }

  /**
   * Error log — captures full error detail including AppError metadata
   */
  static error(error: unknown, request?: Request, user?: AuthUser | null, environment?: string): void {
    const err = error instanceof Error ? error : new Error(String(error));
    const isDev = environment !== 'production';

    this.emit('error', `🚨 ${err.name}: ${err.message}`, {
      request: request ? this.extractRequestMeta(request) : undefined,
      user: user ?? null,
      error: {
        name: err.name,
        message: err.message ?? 'Unexpected error',
        code: getErrorCode(err),
        statusCode: getStatusCode(err),
        stack: isDev ? err.stack : undefined,
        cause: err.cause ? String(err.cause) : undefined,
        context: err instanceof AppError ? err.context : undefined,
        isOperational: isOperationalError(err),
        severity: err instanceof AppError ? err.severity : undefined,
      },
    });
  }

  /**
   * Log a CRUD operation — table, operation type, affected records
   */
  static logOperation(
    operation: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'LIST',
    model: string,
    data?: { recordId?: string; affectedCount?: number; payload?: unknown; filters?: unknown },
    user?: AuthUser | null,
  ): void {
    const actor = user?.email ?? 'anonymous';
    this.emit('info', `ℹ️ ${operation} on "${model}" by ${actor}`, {
      operation,
      model,
      data,
      user: user ?? null,
    });
  }

  /**
   * Log performance metrics — auto-grades by execution time
   */
  static logPerformance(
    operation: string,
    model: string,
    metrics: {
      executionTime: number;
      queryCount?: number;
      cacheHits?: number;
      cacheMisses?: number;
      additionalMetrics?: Record<string, unknown>;
    },
    user?: AuthUser | null,
  ): void {
    const emoji = metrics.executionTime > 5000 ? '🐌' : metrics.executionTime > 1000 ? '⚠️' : '✅';
    const grade = this.getPerformanceGrade(metrics.executionTime);
    const actor = user?.email ?? 'anonymous';

    this.emit('info', `${emoji} ${operation} on "${model}" completed in ${metrics.executionTime}ms by ${actor}`, {
      operation,
      model,
      user: user ?? null,
      metrics: {
        executionTimeMs: metrics.executionTime,
        grade,
        isSlow: metrics.executionTime > 1000,
        isCritical: metrics.executionTime > 5000,
        queryCount: metrics.queryCount,
        cacheHits: metrics.cacheHits,
        cacheMisses: metrics.cacheMisses,
        cacheHitRate:
          metrics.cacheHits != null && metrics.cacheMisses != null
            ? `${((metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) * 100).toFixed(1)}%`
            : undefined,
        ...metrics.additionalMetrics,
      },
    });
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private static extractRequestMeta(request: Request): RequestMeta {
    return {
      method: request.method,
      url: request.url,
      cfRay: request.headers.get('cf-ray'),
      ip: request.headers.get('cf-connecting-ip'),
      userAgent: request.headers.get('user-agent'),
    };
  }

  private static getPerformanceGrade(ms: number): string {
    if (ms < 100) return 'A';
    if (ms < 500) return 'B';
    if (ms < 1000) return 'C';
    if (ms < 5000) return 'D';
    return 'F';
  }
}

import type { XiorRequestConfig } from 'xior';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import xior from 'xior';
import dedupePlugin from 'xior/plugins/dedupe';
import errorCachePlugin from 'xior/plugins/error-cache';
import throttlePlugin from 'xior/plugins/throttle';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '~/lib/constants';

// Extend XiorRequestConfig to support the `_retry` flag
declare module 'xior' {
  interface XiorRequestConfig {
    _retry?: boolean;
  }
}

// Track whether a token refresh is already in-flight to prevent parallel calls
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

/** Flush queued requests once a refresh attempt resolves or rejects */
function flushQueue(token: string | null, err: unknown = null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token);
    else reject(err);
  });
  pendingQueue = [];
}

/** Redirect to login and clear auth cookies */
function forceLogout() {
  Cookies.remove(ACCESS_TOKEN_COOKIE);
  Cookies.remove(REFRESH_TOKEN_COOKIE);
  window.location.href = '/login';
}

export const http = xior.create();

// ─── Request interceptor ──────────────────────────────────────────────────────
// Dynamically attach the latest access token from the cookie on every request
http.interceptors.request.use(
  (config) => {
    const token = Cookies.get(ACCESS_TOKEN_COOKIE);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response interceptor ─────────────────────────────────────────────────────
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status: number | undefined = error.response?.status;
    const originalRequest: XiorRequestConfig | undefined = error.config;

    // Skip refresh/logout flow for auth endpoints (e.g. login with wrong credentials returns 401)
    const AUTH_ENDPOINTS = ['/api/auth/login', '/api/auth/refresh'];
    const requestUrl = originalRequest?.url ?? '';
    const isAuthEndpoint = AUTH_ENDPOINTS.some((ep) => requestUrl.includes(ep));

    // Handle 401 — attempt silent token refresh (only once per request)
    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      // Note: refreshToken is HttpOnly — the browser sends it automatically as a cookie.
      // We do NOT read it via js-cookie; we just hit the refresh endpoint and the server
      // reads the httpOnly cookie from the request headers.

      // If a refresh is already running, queue this request until it resolves
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(http.request(originalRequest));
            },
            reject,
          });
        });
      }

      // Mark this request so we don't retry it again on the next 401
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call /api/auth/refresh — browser automatically includes the HttpOnly refreshToken cookie.
        // No need to manually attach it; the server reads it from Cookie header.
        const refreshClient = xior.create();
        const res = await refreshClient.post<{ success: boolean; data: { token: string } }>('/api/auth/refresh', {});

        const newToken = res.data.data.token;

        // Persist the new access token so subsequent requests use it
        Cookies.set(ACCESS_TOKEN_COOKIE, newToken, { sameSite: 'lax', expires: 1 });

        flushQueue(newToken);

        // Retry the original request with the fresh token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return http.request(originalRequest);
      } catch (refreshError) {
        flushQueue(null, refreshError);

        // Refresh token also expired / invalid → force logout
        toast.error('Your session has expired. Please log in again.');
        forceLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Show toast for non-401 client errors only
    if (status && status !== 401 && status < 500) {
      const message = error.response?.data?.message || 'There was a problem with the request';
      toast.error(message);
    }

    return Promise.reject(error);
  },
);

http.plugins.use(errorCachePlugin());
http.plugins.use(dedupePlugin());
http.plugins.use(throttlePlugin());

/** Extract the error message from an xior API error response */
export function getApiError(err: unknown, fallback = 'Something went wrong'): string {
  return (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? fallback;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const ACCESS_TOKEN_COOKIE = 'token';
export const REFRESH_TOKEN_COOKIE = 'refreshToken';

// ─── RBAC ─────────────────────────────────────────────────────────────────────

export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', '*'] as const;
export type HttpMethod = (typeof HTTP_METHODS)[number];

// ─── Pagination ───────────────────────────────────────────────────────────────

export const MEDIA_PAGE_SIZE = 40;
export const USERS_PAGE_SIZE = 20;

// ─── Users / Roles ────────────────────────────────────────────────────────────
//
// 🔧 PROJECT CONFIG: add / remove roles here — everything else derives from this.
//   • USER_ROLES[0] is used as the "default role" for new signups in user.ts model.
//   • ROLE_STYLES must have a matching key for each role (or the badge falls back to DEFAULT_ROLE_STYLE).

export const USER_ROLES = ['user', 'admin'] as const;

/** Union type derived from USER_ROLES — e.g. 'user' | 'admin' */
export type UserRole = (typeof USER_ROLES)[number];

export const DEFAULT_USER_ROLE: UserRole = USER_ROLES[0]; // 'user'

export const ROLE_STYLES: Record<UserRole, string> = {
  admin: 'bg-[rgba(99,102,241,0.12)] text-[#6366f1] border-[rgba(99,102,241,0.25)]',
  user: 'bg-[rgba(148,163,184,0.12)] text-[#64748b] border-[rgba(148,163,184,0.25)]',
};

export const DEFAULT_ROLE_STYLE = 'bg-muted text-muted-foreground border-border';

// ─── Media ────────────────────────────────────────────────────────────────────

export const ACCEPTED_MIME = 'image/*,video/*,audio/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip';

export const FILTER_LABELS: Record<string, string> = {
  all: 'All',
  image: 'Images',
  video: 'Videos',
  audio: 'Audio',
  document: 'Documents',
};

export const CATEGORY_STYLES: Record<string, string> = {
  all: '',
  image: 'bg-[rgba(16,185,129,0.12)] text-[#059669] border-[rgba(16,185,129,0.25)]',
  video: 'bg-[rgba(14,165,233,0.12)] text-[#0284c7] border-[rgba(14,165,233,0.25)]',
  audio: 'bg-[rgba(245,158,11,0.12)] text-[#d97706] border-[rgba(245,158,11,0.25)]',
  document: 'bg-[rgba(148,163,184,0.12)] text-[#64748b] border-[rgba(148,163,184,0.25)]',
};

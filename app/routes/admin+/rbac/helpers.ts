import type { Permission, Role } from './types';

// HTTP method → Tailwind color classes (background + text)
export const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-[rgba(16,185,129,0.12)] text-[#059669]',
  POST: 'bg-[rgba(99,102,241,0.12)] text-[#6366f1]',
  PATCH: 'bg-[rgba(245,158,11,0.12)] text-[#d97706]',
  PUT: 'bg-[rgba(245,158,11,0.12)] text-[#d97706]',
  DELETE: 'bg-[rgba(239,68,68,0.12)] text-[#dc2626]',
  '*': 'bg-[rgba(139,92,246,0.12)] text-[#8b5cf6]',
};

/**
 * Returns the "base path" of a resource — everything before the first :param segment.
 *   /api/users/:id                     → /api/users
 *   /api/admin/roles/:slug/permissions → /api/admin/roles
 *   /api/media                         → /api/media
 */
export function getBasePath(resource: string): string {
  const paramIdx = resource.indexOf('/:');
  return paramIdx === -1 ? resource : resource.slice(0, paramIdx);
}

/**
 * Groups permissions by base path, preserving first-occurrence order.
 */
export function groupByBasePath(permissions: Permission[]): Map<string, Permission[]> {
  const map = new Map<string, Permission[]>();
  for (const p of permissions) {
    const key = getBasePath(p.resource);
    const list = map.get(key) ?? [];
    list.push(p);
    map.set(key, list);
  }
  return map;
}

/**
 * Walks the role's parent chain and returns all permission IDs
 * that are inherited (assigned to any ancestor role).
 * Used to render inherited permissions as checked + read-only.
 */
export function getInheritedIds(roleSlug: string, roles: Role[], rolePermissions: Record<string, Permission[]>): Set<string> {
  const roleMap = new Map(roles.map((r) => [r.slug, r]));
  const ids = new Set<string>();
  let current = roleMap.get(roleSlug);
  while (current?.parentSlug) {
    const parentPerms = rolePermissions[current.parentSlug] ?? [];
    for (const p of parentPerms) ids.add(p.id);
    current = roleMap.get(current.parentSlug);
  }
  return ids;
}

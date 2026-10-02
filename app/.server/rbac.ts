import type { DrizzleDb } from './db';
import { eq } from 'drizzle-orm';
import { permissions, rolePermissions, roles } from '~/models';

// ─── Types ────────────────────────────────────────────────────────────────────
type RoleMap = Map<string, Set<string>>; // child slug → Set<parent slugs>

/**
 * Precomputed access structure for a single role slug (including all inherited roles).
 * Built once in loadPolicies() — avoids re-running expandRoles() + policy scan per request.
 *
 * - `wildcard`: true if the role (or any ancestor) has the ["*","*"] grant → always allow
 * - `exact`:    Set<"VERB::path"> for O(1) lookup (e.g. "GET::/api/users")
 * - `patterns`: [[verb, pattern], ...] only for paths that contain ":param" segments
 *
 * enforce() order: wildcard → exact (O(1)) → patterns (O(p) where p << total policies)
 */
type RoleAccess = {
  wildcard: boolean;
  exact: Set<string>; // "VERB::path"
  patterns: [string, string][]; // [action, resource-pattern]
};

// ─── In-memory cache ──────────────────────────────────────────────────────────
// All structures below are rebuilt atomically in loadPolicies().
// Cloudflare Workers isolates are single-threaded — no locks needed.

let _accessMap: Map<string, RoleAccess> | null = null; // role slug → precomputed access
let _resourceBaseSet: Set<string> | null = null; // O(1) base path lookup
let _loadedAt = 0; // epoch ms — for TTL staleness guard

/**
 * TTL for the in-memory cache across all isolates.
 *
 * Cloudflare Workers can run many isolates simultaneously; `invalidatePolicyCache()`
 * only clears the CURRENT isolate. The TTL ensures stale policies are eventually
 * evicted even in isolates that missed the explicit invalidation call.
 *
 * 5 minutes is a safe default — adjust per your admin change frequency.
 */
const POLICY_TTL_MS = 5 * 60 * 1000;

// ─── Public: cache state ──────────────────────────────────────────────────────

/** True if the cache is populated AND has not exceeded the TTL. Fast O(1) check. */
export function isPoliciesLoaded(): boolean {
  return _accessMap !== null && Date.now() - _loadedAt < POLICY_TTL_MS;
}

// ─── DB loader ────────────────────────────────────────────────────────────────

/**
 * Load all role→permission mappings from D1 and build fully-precomputed access structures.
 *
 * Runs 2 DB queries (parallel), then pure in-memory work.
 * Re-builds the entire cache on every call — call ensurePolicies() for lazy loading.
 *
 * Call this after any admin write to roles / permissions / role_permissions
 * to pick up changes in the current isolate. Other isolates expire via TTL.
 */
export async function loadPolicies(db: DrizzleDb): Promise<void> {
  // ── 1. Parallel DB fetch ──────────────────────────────────────────────────
  const [rolePermRows, roleRows] = await Promise.all([
    db
      .select({
        roleSlug: rolePermissions.roleSlug,
        resource: permissions.resource,
        action: permissions.action,
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id)),

    db.select({ slug: roles.slug, parentSlug: roles.parentSlug }).from(roles),
  ]);

  // ── 2. Build role inheritance map: child → Set<parents> ──────────────────
  const roleMap: RoleMap = new Map();
  for (const { slug, parentSlug } of roleRows) {
    if (!parentSlug) continue;
    const set = roleMap.get(slug) ?? new Set<string>();
    set.add(parentSlug);
    roleMap.set(slug, set);
  }

  // ── 3. Group raw policies by direct-owner roleSlug ────────────────────────
  // Map<roleSlug, {resource, action}[]>
  const directPolicies = new Map<string, { resource: string; action: string }[]>();
  for (const row of rolePermRows) {
    const list = directPolicies.get(row.roleSlug) ?? [];
    list.push({ resource: row.resource, action: row.action });
    directPolicies.set(row.roleSlug, list);
  }

  // ── 4. Precompute RoleAccess for every known role ─────────────────────────
  // For each role, expand inheritance once and union all applicable policies.
  const allRoleSlugs = new Set<string>(roleRows.map((r) => r.slug));
  // Also include any roleSlug that only appears in role_permissions (edge case)
  for (const [slug] of directPolicies) allRoleSlugs.add(slug);

  const accessMap = new Map<string, RoleAccess>();

  for (const slug of allRoleSlugs) {
    const inherited = expandRoles(slug, roleMap); // Set<slug>
    const access: RoleAccess = { wildcard: false, exact: new Set(), patterns: [] };

    for (const roleName of inherited) {
      const policies = directPolicies.get(roleName) ?? [];
      for (const { resource, action } of policies) {
        // Wildcard grant — short-circuit all future checks for this role
        if (resource === '*' && action === '*') {
          access.wildcard = true;
          break;
        }
        if (resource.includes(':')) {
          // Pattern path (keyMatch2) — goes into sequential patterns array
          access.patterns.push([action, resource]);
        } else {
          // Exact path — O(1) Set lookup
          access.exact.add(`${action}::${resource}`);
          if (action === '*') {
            // Wildcard action on exact path — also store a marker so any verb matches
            access.exact.add(`*::${resource}`);
          }
        }
      }
      if (access.wildcard) break; // no point collecting more
    }

    accessMap.set(slug, access);
  }

  // ── 5. Build O(1) resource base Set ──────────────────────────────────────
  // "/api/users/:id" → "/api/users", "/api/media" → "/api/media"
  const baseSet = new Set<string>();
  for (const { resource } of rolePermRows) {
    baseSet.add(resource.replace(/\/:[^/]+$/, ''));
  }

  // ── 6. Atomic swap ────────────────────────────────────────────────────────
  _accessMap = accessMap;
  _resourceBaseSet = baseSet;
  _loadedAt = Date.now();
}

/**
 * Lazy-load policies — no-op if cache is valid (populated + within TTL).
 * The TTL check handles multi-isolate staleness without external coordination.
 */
export async function ensurePolicies(db: DrizzleDb): Promise<void> {
  if (isPoliciesLoaded()) return;
  await loadPolicies(db);
}

/**
 * Immediately invalidate the cache in the current isolate.
 * Other isolates will auto-expire via TTL (POLICY_TTL_MS).
 *
 * Call this after any admin write to roles / permissions / role_permissions.
 */
export function invalidatePolicyCache(): void {
  _accessMap = null;
  _resourceBaseSet = null;
  _loadedAt = 0;
}

// ─── Role expansion (used only during loadPolicies) ───────────────────────────
// BFS — cycle-safe via visited set. Only runs at policy-load time, not per request.

function expandRoles(sub: string, roleMap: RoleMap): Set<string> {
  const all = new Set<string>([sub]);
  const queue = [sub];
  while (queue.length > 0) {
    const current = queue.shift()!;
    const parents = roleMap.get(current);
    if (!parents) continue;
    for (const parent of parents) {
      if (!all.has(parent)) {
        all.add(parent);
        queue.push(parent);
      }
    }
  }
  return all;
}

// ─── Path matching ────────────────────────────────────────────────────────────
// Only used for pattern-based paths (containing ":param").
// Exact paths short-circuit before reaching this.

const _compiledPatterns = new Map<string, RegExp>();

function keyMatch2(request: string, pattern: string): boolean {
  // pattern === '*' is handled upstream (wildcard flag) — never reaches here
  if (pattern === request) return true;

  let re = _compiledPatterns.get(pattern);
  if (!re) {
    const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
    re = new RegExp(`^${escaped.replace(/:[^/]+/g, '[^/]+')}\\/?$`);
    _compiledPatterns.set(pattern, re);
  }
  return re.test(request);
}

// ─── Core enforce ─────────────────────────────────────────────────────────────

/**
 * O(1) best-case permission check (wildcard or exact path match).
 * Falls back to O(p) only for :param pattern paths where p is small.
 *
 * Requires ensurePolicies(db) to have been awaited first.
 *
 * @throws Error if policies are not loaded (programming error, not a 403)
 */
export function enforce(sub: string, obj: string, act: string): boolean {
  if (!_accessMap) {
    throw new Error('RBAC policies not loaded. Call ensurePolicies(db) before enforce().');
  }

  const access = _accessMap.get(sub);
  if (!access) return false; // unknown role → deny

  // Fast path 1: role has wildcard grant (e.g. admin)
  if (access.wildcard) return true;

  // Fast path 2: exact path + exact verb (O(1) Set lookup)
  if (access.exact.has(`${act}::${obj}`)) return true;

  // Fast path 3: exact path + wildcard verb
  if (access.exact.has(`*::${obj}`)) return true;

  // Slow path: pattern matching — only for paths with :param placeholders
  for (const [pAct, pObj] of access.patterns) {
    if (pAct !== '*' && pAct !== act) continue;
    if (keyMatch2(obj, pObj)) return true;
  }

  return false;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Map HTTP method → uppercase action string. */
export function httpMethodToAct(method: string): string {
  return method.toUpperCase();
}

/**
 * Normalise a concrete request path to match keyMatch2 policy patterns.
 *
 * Uses a Set for O(1) base path lookup (vs. linear scan in v1).
 * Segments extraction avoids string slicing loops.
 *
 * Examples:
 *   /api/users/cm9abc   → /api/users/:id
 *   /api/media          → /api/media
 *   /api/unknown/x      → /api/unknown/x  (not in base set — unchanged)
 */
export function normaliseResource(pathname: string): string {
  // Strip query string
  const path = pathname.indexOf('?') !== -1 ? pathname.slice(0, pathname.indexOf('?')) : pathname;

  // Extract base: first 3 segments — e.g. "/api/users" from "/api/users/cm9abc"
  // Split once and check length to avoid unnecessary work
  const slashCount = (path.match(/\//g) ?? []).length;
  if (slashCount < 2) return path; // too short to be a resource path

  const secondSlash = path.indexOf('/', 1); // index of second '/'
  const thirdSlash = path.indexOf('/', secondSlash + 1); // index of third '/'

  const base = thirdSlash !== -1 ? path.slice(0, thirdSlash) : path;
  const suffix = thirdSlash !== -1 ? path.slice(thirdSlash) : '';

  if (!_resourceBaseSet?.has(base)) return path; // unknown base — unchanged

  // Suffix must be exactly one segment (e.g. "/cm9abc"), not nested ("/cm9abc/sub")
  if (suffix && suffix !== '/' && !suffix.slice(1).includes('/')) {
    return `${base}/:id`;
  }

  return base;
}

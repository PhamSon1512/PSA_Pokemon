/**
 * Auto-discovers all API routes from `app/openapi/*.openapi.ts` files
 * using Vite's import.meta.glob — same mechanism as the OpenAPI spec generator.
 *
 * Returns permission-compatible { resource, action, description } objects,
 * suitable for seeding or comparing against the DB permission table.
 *
 * Adding a new openapi file automatically includes it here — zero manual wiring.
 */

// Mirror the same glob pattern used by openapi.ts — but from app/.server/ (one level up,
// not two), so the correct relative path to app/openapi/ is '../openapi/'.
const modules = import.meta.glob<{ default?: { method: string; path: string; summary?: string }[] }>('../openapi/*.openapi.ts', {
  eager: true,
});

export type DiscoveredRoute = {
  resource: string; // keyMatch2 pattern — e.g. /api/users/:id
  action: string; // uppercase HTTP method   — e.g. GET
  description: string;
};

/**
 * Route prefixes that are intentionally public / unauthenticated.
 * These are excluded from RBAC permission generation.
 */
const EXCLUDED_PREFIXES = ['/api/auth/'];

/**
 * Convert OpenAPI brace-style path params → Casbin keyMatch2 colon-style.
 *   /api/users/{id}                    → /api/users/:id
 *   /api/roles/{slug}/permissions/{id} → /api/roles/:slug/permissions/:id
 */
function toKeyMatch2(openapiPath: string): string {
  return openapiPath.replace(/\{([^}]+)\}/g, ':$1');
}

/**
 * Returns every route from every *.openapi.ts file, excluding public auth endpoints.
 * Deduplicates by "METHOD::resource" in case multiple files define the same route.
 */
export function discoverRoutes(): DiscoveredRoute[] {
  const seen = new Set<string>();
  const routes: DiscoveredRoute[] = [];

  for (const [file, mod] of Object.entries(modules)) {
    // Guard: some openapi files only export schemas (no routes) — skip them safely
    if (!Array.isArray(mod.default)) {
      console.warn(`[discoverRoutes] ${file} has no default array export — skipped`);
      continue;
    }
    for (const route of mod.default) {
      // Skip explicitly public routes (auth, health, etc.)
      if (EXCLUDED_PREFIXES.some((prefix) => route.path.startsWith(prefix))) continue;

      const resource = toKeyMatch2(route.path);
      const action = route.method.toUpperCase();
      const key = `${action}::${resource}`;

      if (seen.has(key)) continue; // deduplicate
      seen.add(key);

      routes.push({
        resource,
        action,
        description: route.summary ?? `${action} ${resource}`,
      });
    }
  }

  return routes;
}

/**
 * Returns routes that are in the openapi definitions but NOT yet in the DB.
 * Used to display unsynced routes in the admin RBAC UI.
 */
export function getMissingRoutes(
  discovered: DiscoveredRoute[],
  existing: { resource: string; action: string }[],
): DiscoveredRoute[] {
  const existingSet = new Set(existing.map((p) => `${p.action}::${p.resource}`));
  return discovered.filter((r) => !existingSet.has(`${r.action}::${r.resource}`));
}

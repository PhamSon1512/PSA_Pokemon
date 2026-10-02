import type { Route } from './+types/_index';
import type { Permission } from './types';
import { getDb } from '~/.server/db';
import { discoverRoutes, getMissingRoutes } from '~/.server/discover-routes';
import { requireAuthSession } from '~/.server/guard';
import { getRolePermissions, listPermissions, listRoles } from '~/.server/services/rbac.service';

export async function loader({ request, context }: Route.LoaderArgs) {
  await requireAuthSession(request, context);
  const db = getDb(context);

  const [roles, permissions] = await Promise.all([listRoles(db), listPermissions(db)]);

  // Discover routes from openapi definitions → compare with DB
  const discovered = discoverRoutes();
  const missing = getMissingRoutes(discovered, permissions);

  // Fetch role→permission assignments for all roles in parallel
  const rolePermsEntries = await Promise.all(roles.map(async (r) => [r.slug, await getRolePermissions(db, r.slug)] as const));
  const rolePermissions = Object.fromEntries(rolePermsEntries) as Record<string, Permission[]>;

  return { roles, permissions, rolePermissions, discovered, missing };
}

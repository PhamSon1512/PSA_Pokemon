import type { Route } from './+types/_index';
import { data } from 'react-router';
import { z } from 'zod';
import { getDb } from '~/.server/db';
import { requireAdmin, requireAuthSession } from '~/.server/guard';
import { listRoles } from '~/.server/services/rbac.service';
import { listUsers } from '~/.server/services/user.service';
import { parseQuery } from '~/.server/validators';
import { USERS_PAGE_SIZE } from '~/lib/constants';

export async function loader({ request, context }: Route.LoaderArgs) {
  const { user: actor } = await requireAuthSession(request, context);
  requireAdmin(actor);

  const db = getDb(context);

  const { page = 1 } = parseQuery(request.url, z.object({ page: z.coerce.number().int().min(1).optional().default(1) }));

  const [{ data: users, total }, roles] = await Promise.all([
    listUsers(db, { limit: USERS_PAGE_SIZE, offset: (page - 1) * USERS_PAGE_SIZE }),
    listRoles(db),
  ]);

  return data({ users, roles, total, page, totalPages: Math.ceil(total / USERS_PAGE_SIZE) });
}

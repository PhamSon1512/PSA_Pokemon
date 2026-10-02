import type { Route } from './+types/_index';
import { data } from 'react-router';
import { z } from 'zod';
import { getDb } from '~/.server/db';
import { requireAdmin, requireAuthSession } from '~/.server/guard';
import { listMedia } from '~/.server/services/media.service';
import { parseQuery } from '~/.server/validators';
import { MEDIA_PAGE_SIZE } from '~/lib/constants';

export async function loader({ request, context }: Route.LoaderArgs) {
  const { env } = context.cloudflare;
  const { user } = await requireAuthSession(request, context);
  requireAdmin(user);

  const { page = 1 } = parseQuery(request.url, z.object({ page: z.coerce.number().int().min(1).optional().default(1) }));

  const db = getDb(context);
  const { data: items, total } = await listMedia(db, env.R2_PUBLIC_URL, {
    limit: MEDIA_PAGE_SIZE,
    offset: (page - 1) * MEDIA_PAGE_SIZE,
  });

  return data({ items, total, page, totalPages: Math.ceil(total / MEDIA_PAGE_SIZE), user });
}

import type { Route } from './+types/_index';
import { data } from 'react-router';
import { getDb } from '~/.server/db';
import { requireAdmin, requireAuthSession } from '~/.server/guard';
import { getSiteSettings } from '~/.server/services/settings.service';

export async function loader({ request, context }: Route.LoaderArgs) {
  const { user: actor } = await requireAuthSession(request, context);
  requireAdmin(actor);

  const db = getDb(context);
  const siteSettings = await getSiteSettings(db);

  return data({ siteSettings });
}

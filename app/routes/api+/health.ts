import type { Route } from './+types/health';
import { ok } from '~/.server/response';

// GET /api/health — health check endpoint
export async function loader({ context }: Route.LoaderArgs) {
  const env = context.cloudflare.env;
  return ok({
    status: 'ok',
    environment: env.ENVIRONMENT ?? 'unknown',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
}

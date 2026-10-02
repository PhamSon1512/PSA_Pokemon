import { createRoute, z } from '@hono/zod-openapi';
import { defaultResponses, jsonContent } from '~/lib/openapi';

// ─── Response schemas ─────────────────────────────────────────────────────────

/** Typed site settings object (mirrors SiteSettings in settings.service.ts) */
export const SiteSettingsSchema = z.object({
  // General
  siteName: z.string().openapi({ example: 'My CMS Site' }),
  siteDescription: z.string().openapi({ example: 'A powerful CMS built with React Router & Cloudflare' }),
  siteUrl: z.string().openapi({ example: 'https://example.com' }),
  adminEmail: z.string().email().openapi({ example: 'admin@example.com' }),
  // Media
  mediaOrganizeByDate: z.boolean().openapi({ example: true }),
});

// ─── Request schemas ──────────────────────────────────────────────────────────

export const UpdateSettingsBodySchema = SiteSettingsSchema.partial();

// ─── Routes ───────────────────────────────────────────────────────────────────

export const getSettingsRoute = createRoute({
  method: 'get',
  path: '/api/settings',
  tags: ['Settings'],
  summary: 'Get current site settings (merged with defaults)',
  responses: {
    200: jsonContent(SiteSettingsSchema, 'Site settings object'),
    ...defaultResponses,
  },
});

export const updateSettingsRoute = createRoute({
  method: 'patch',
  path: '/api/settings',
  tags: ['Settings'],
  summary: 'Update one or more site settings',
  description: 'Performs a bulk upsert — only provided keys are updated. Omitted keys retain their current values.',
  request: {
    body: jsonContent(UpdateSettingsBodySchema, 'Settings fields to update'),
  },
  responses: {
    200: jsonContent(SiteSettingsSchema, 'Updated site settings'),
    ...defaultResponses,
  },
});

// Auto-discovered by openapi.ts via import.meta.glob
const routes = [getSettingsRoute, updateSettingsRoute];

export default routes;

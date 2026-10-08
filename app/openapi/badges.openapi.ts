import { createRoute, z } from '@hono/zod-openapi';

const BadgeSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()).nullable(),
});

export const adminListBadgesRoute = createRoute({
  method: 'get',
  path: '/admin/badges',
  tags: ['Admin Badges'],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.array(BadgeSchema),
        },
      },
      description: 'List of badges',
    },
  },
});

export const adminCreateBadgeRoute = createRoute({
  method: 'post',
  path: '/admin/badges',
  tags: ['Admin Badges'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            name: z.string().min(1),
            color: z.string().optional().nullable(),
            status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: BadgeSchema,
        },
      },
      description: 'Badge created',
    },
  },
});

export const adminUpdateBadgeRoute = createRoute({
  method: 'patch',
  path: '/admin/badges/{id}',
  tags: ['Admin Badges'],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            name: z.string().optional(),
            color: z.string().optional().nullable(),
            status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: BadgeSchema,
        },
      },
      description: 'Badge updated',
    },
  },
});

export const adminDeleteBadgeRoute = createRoute({
  method: 'delete',
  path: '/admin/badges/{id}',
  tags: ['Admin Badges'],
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({ success: z.boolean() }),
        },
      },
      description: 'Badge deleted',
    },
  },
});

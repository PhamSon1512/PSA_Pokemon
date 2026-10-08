import { createRoute, z } from '@hono/zod-openapi';

const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()).nullable(),
});

export const adminListCategoriesRoute = createRoute({
  method: 'get',
  path: '/admin/categories',
  tags: ['Admin Categories'],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.array(CategorySchema),
        },
      },
      description: 'List of categories',
    },
  },
});

export const adminCreateCategoryRoute = createRoute({
  method: 'post',
  path: '/admin/categories',
  tags: ['Admin Categories'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            name: z.string().min(1),
            slug: z.string().min(1),
            description: z.string().optional().nullable(),
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
          schema: CategorySchema,
        },
      },
      description: 'Category created',
    },
  },
});

export const adminUpdateCategoryRoute = createRoute({
  method: 'patch',
  path: '/admin/categories/{id}',
  tags: ['Admin Categories'],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            name: z.string().optional(),
            slug: z.string().optional(),
            description: z.string().optional().nullable(),
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
          schema: CategorySchema,
        },
      },
      description: 'Category updated',
    },
  },
});

export const adminDeleteCategoryRoute = createRoute({
  method: 'delete',
  path: '/admin/categories/{id}',
  tags: ['Admin Categories'],
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
      description: 'Category deleted',
    },
  },
});

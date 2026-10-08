import { createRoute, z } from '@hono/zod-openapi';

export const PostSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().nullable(),
  content: z.string().nullable(),
  coverImage: z.string().nullable(),
  category: z.enum(['NEWS', 'GUIDE', 'REVIEW', 'MARKET_ANALYSIS']).nullable(),
  tags: z.array(z.string()).nullable(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  publishedAt: z.string().or(z.date()).nullable(),
  authorId: z.string().nullable(),
  seoTitle: z.string().nullable(),
  seoDescription: z.string().nullable(),
  viewCount: z.number().nullable(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()).nullable(),
});

export const PostCreateInput = PostSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true,
  authorId: true,
});

export const PostUpdateInput = PostCreateInput.partial();

export const getPublicPostsRoute = createRoute({
  method: 'get',
  path: '/public/posts',
  responses: {
    200: {
      content: { 'application/json': { schema: z.array(PostSchema) } },
      description: 'List of published posts',
    },
  },
});

export const getPublicPostBySlugRoute = createRoute({
  method: 'get',
  path: '/public/posts/{slug}',
  request: {
    params: z.object({ slug: z.string() }),
  },
  responses: {
    200: {
      content: { 'application/json': { schema: PostSchema } },
      description: 'Post details',
    },
    404: {
      content: { 'application/json': { schema: z.object({ error: z.string() }) } },
      description: 'Not found',
    },
  },
});

export const adminListPostsRoute = createRoute({
  method: 'get',
  path: '/admin/posts',
  responses: {
    200: {
      content: { 'application/json': { schema: z.array(PostSchema) } },
      description: 'List of all posts for admin',
    },
  },
  security: [{ BearerAuth: [] }],
});

export const adminCreatePostRoute = createRoute({
  method: 'post',
  path: '/admin/posts',
  request: {
    body: {
      content: { 'application/json': { schema: PostCreateInput } },
    },
  },
  responses: {
    201: {
      content: { 'application/json': { schema: PostSchema } },
      description: 'Created post',
    },
  },
  security: [{ BearerAuth: [] }],
});

export const adminUpdatePostRoute = createRoute({
  method: 'put',
  path: '/admin/posts/{id}',
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: { 'application/json': { schema: PostUpdateInput } },
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: PostSchema } },
      description: 'Updated post',
    },
  },
  security: [{ BearerAuth: [] }],
});

export const adminDeletePostRoute = createRoute({
  method: 'delete',
  path: '/admin/posts/{id}',
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      content: { 'application/json': { schema: z.object({ success: z.boolean() }) } },
      description: 'Deleted post',
    },
  },
  security: [{ BearerAuth: [] }],
});

import { createRoute, z } from '@hono/zod-openapi';
import { createInsertSchema, createSelectSchema } from 'drizzle-orm/zod';
import { USER_ROLES } from '~/lib/constants';
import { defaultResponses, IdParamSchema, jsonContent, PaginationQuerySchema } from '~/lib/openapi';
import { users } from '~/models';

// Override nullable text fields drizzle-zod may infer as `unknown`
const UserInsertSchema = createInsertSchema(users, {
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8),
  name: z.string().min(2).max(100),
  phone: z.string().min(10).max(11),
  provinceId: z.string().nullable().optional(),
  districtId: z.string().nullable().optional(),
  wardId: z.string().nullable().optional(),
  detailedAddress: z.string().nullable().optional(),
  addressType: z.string().nullable().optional(),
});

const UserSelectSchema = createSelectSchema(users, {
  name: z.string().min(2).max(100),
  phone: z.string().min(10).max(11),
  // Derived from USER_ROLES in constants.ts — update roles there, this auto-updates
  role: z.enum(USER_ROLES),
});

// Public-safe user shape (strip sensitive fields)
export const UserPublicSchema = UserSelectSchema.omit({
  password: true,
  refreshToken: true,
});

// ─── With relations ────────────────────────────────────────────────────────────

export const TokenResponseSchema = z.object({
  // Field name matches what auth.service.login() returns
  token: z.string(),
  refreshToken: z.string().optional(),
  user: UserPublicSchema,
});

// Named exports — single source of truth for Swagger doc + runtime validation
export const LoginBodySchema = UserInsertSchema.pick({ email: true, password: true });

export const RegisterBodySchema = UserInsertSchema.pick({
  email: true,
  password: true,
  name: true,
  phone: true,
  provinceId: true,
  districtId: true,
  wardId: true,
  detailedAddress: true,
  addressType: true,
});

export const RefreshBodySchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const UpdateUserBodySchema = UserSelectSchema.pick({
  name: true,
  phone: true,
  provinceId: true,
  districtId: true,
  wardId: true,
  detailedAddress: true,
  addressType: true,
  role: true,
}).partial();

// ── Auth routes ────────────────────────────────────────────────────────────────

export const authLoginRoute = createRoute({
  method: 'post',
  path: '/auth/login',
  tags: ['Auth'],
  summary: 'Login with email and password',
  security: [],
  request: {
    body: jsonContent(LoginBodySchema, 'Login credentials'),
  },
  responses: {
    200: jsonContent(TokenResponseSchema, 'Access token + refresh token'),
    ...defaultResponses,
  },
});

export const authRegisterRoute = createRoute({
  method: 'post',
  path: '/auth/register',
  tags: ['Auth'],
  summary: 'Register a new user',
  security: [],
  request: {
    body: jsonContent(RegisterBodySchema, 'Registration payload'),
  },
  responses: {
    201: jsonContent(UserPublicSchema, 'Created user'),
    ...defaultResponses,
  },
});

export const authRefreshRoute = createRoute({
  method: 'post',
  path: '/auth/refresh',
  tags: ['Auth'],
  summary: 'Issue a new access token using refresh token',
  security: [],
  request: {
    body: jsonContent(RefreshBodySchema, 'Refresh token payload'),
  },
  responses: {
    200: jsonContent(TokenResponseSchema, 'New access token'),
    ...defaultResponses,
  },
});

export const authMeRoute = createRoute({
  method: 'get',
  path: '/auth/me',
  tags: ['Auth'],
  summary: 'Get current authenticated user profile',
  responses: {
    200: jsonContent(UserPublicSchema, 'Current user'),
    ...defaultResponses,
  },
});

// ── Users routes ───────────────────────────────────────────────────────────────

export const listUsersRoute = createRoute({
  method: 'get',
  path: '/users',
  tags: ['Users'],
  summary: 'List all users — admin only',
  request: { query: PaginationQuerySchema },
  responses: {
    200: jsonContent(
      z.object({
        data: z.array(UserPublicSchema),
        total: z.number(),
        page: z.number(),
        limit: z.number(),
        totalPages: z.number(),
      }),
      'Paginated user list',
    ),
    ...defaultResponses,
  },
});

export const getUserRoute = createRoute({
  method: 'get',
  path: '/users/{id}',
  tags: ['Users'],
  summary: 'Get user by ID — self or admin',
  request: { params: IdParamSchema },
  responses: {
    200: jsonContent(UserPublicSchema, 'User object'),
    ...defaultResponses,
  },
});

export const updateUserRoute = createRoute({
  method: 'patch',
  path: '/users/{id}',
  tags: ['Users'],
  summary: 'Update user — self or admin',
  request: {
    params: IdParamSchema,
    body: jsonContent(UpdateUserBodySchema, 'Fields to update'),
  },
  responses: {
    200: jsonContent(UserPublicSchema, 'Updated user'),
    ...defaultResponses,
  },
});

export const deleteUserRoute = createRoute({
  method: 'delete',
  path: '/users/{id}',
  tags: ['Users'],
  summary: 'Soft-delete user — admin only',
  request: { params: IdParamSchema },
  responses: {
    204: { description: 'Deleted' },
    ...defaultResponses,
  },
});

// Auto-discovered by openapi.ts via import.meta.glob
const routes = [
  authLoginRoute,
  authRegisterRoute,
  authRefreshRoute,
  authMeRoute,
  listUsersRoute,
  getUserRoute,
  updateUserRoute,
  deleteUserRoute,
];

export default routes;

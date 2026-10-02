import { createRoute, z } from '@hono/zod-openapi';
import { createSelectSchema } from 'drizzle-orm/zod';
import { HTTP_METHODS } from '~/lib/constants';
import { defaultResponses, jsonContent } from '~/lib/openapi';
import { permissions, roles } from '~/models';

// ─── Drizzle-derived base schemas ─────────────────────────────────────────────

const RoleSelectSchema = createSelectSchema(roles);
const PermissionSelectSchema = createSelectSchema(permissions);

// ─── Request / Response schemas ───────────────────────────────────────────────

/** Role object returned from the API */
export const RoleSchema = RoleSelectSchema;

/** Permission object returned from the API */
export const PermissionSchema = PermissionSelectSchema;

// ─── With relations ────────────────────────────────────────────────────────────

/** Role with its directly assigned permissions */
export const RoleWithPermissionsSchema = RoleSchema.extend({
  permissions: z.array(PermissionSchema),
});

/** Body: create a new role */
export const CreateRoleBodySchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9_-]+$/, 'slug must be lowercase alphanumeric, hyphens or underscores')
    .openapi({ example: 'crm_agent' }),
  name: z.string().min(1).max(128).openapi({ example: 'CRM Agent' }),
  description: z.string().max(500).optional().openapi({ example: 'Can manage CRM contacts and deals' }),
  parentSlug: z.string().optional().openapi({ example: 'subscriber', description: 'Inherit all permissions from this role' }),
});

/** Body: update an existing role */
export const UpdateRoleBodySchema = z.object({
  name: z.string().min(1).max(128).optional(),
  description: z.string().max(500).optional(),
  parentSlug: z.string().nullable().optional().openapi({ description: 'Set to null to remove inheritance' }),
});

/** Path param for role routes */
export const RoleSlugParamSchema = z.object({
  slug: z.string().openapi({ param: { name: 'slug', in: 'path' }, example: 'editor' }),
});

/** Body: create a new permission */
export const CreatePermissionBodySchema = z.object({
  resource: z.string().min(1).max(255).openapi({ example: '/api/contacts/:id', description: 'keyMatch2 path pattern' }),
  action: z.enum(HTTP_METHODS).openapi({ example: 'GET', description: 'HTTP method or * for wildcard' }),
  description: z.string().max(500).optional().openapi({ example: 'Read a single contact' }),
});

/** Path param for permission routes */
export const PermissionIdParamSchema = z.object({
  id: z.string().openapi({ param: { name: 'id', in: 'path' }, example: 'cm9abc123' }),
});

/** Body: assign a permission to a role */
export const AssignPermissionBodySchema = z.object({
  permissionId: z.string().min(1).openapi({ example: 'cm9abc123' }),
});

/**
 * Path params for role-permission revoke.
 * Uses `id` to match the React Router $id segment in
 * admin.roles.$slug.permissions.$id.ts
 */
export const RolePermissionParamSchema = RoleSlugParamSchema.extend({
  id: z.string().openapi({ param: { name: 'id', in: 'path' }, example: 'cm9abc123' }),
});

// ─── Roles routes ─────────────────────────────────────────────────────────────

export const listRolesRoute = createRoute({
  method: 'get',
  path: '/api/admin/roles',
  tags: ['RBAC — Roles'],
  summary: 'List all roles',
  description: 'Returns all roles with their slug, name, description, and parent inheritance.',
  responses: {
    200: jsonContent(z.array(RoleSchema), 'List of roles'),
    ...defaultResponses,
  },
});

export const createRoleRoute = createRoute({
  method: 'post',
  path: '/api/admin/roles',
  tags: ['RBAC — Roles'],
  summary: 'Create a new role',
  description: 'Creates a role with an optional parent for permission inheritance.',
  request: {
    body: jsonContent(CreateRoleBodySchema, 'Role to create'),
  },
  responses: {
    201: jsonContent(RoleSchema, 'Created role'),
    ...defaultResponses,
  },
});

export const updateRoleRoute = createRoute({
  method: 'patch',
  path: '/api/admin/roles/{slug}',
  tags: ['RBAC — Roles'],
  summary: 'Update a role',
  request: {
    params: RoleSlugParamSchema,
    body: jsonContent(UpdateRoleBodySchema, 'Fields to update'),
  },
  responses: {
    200: jsonContent(RoleSchema, 'Updated role'),
    ...defaultResponses,
  },
});

export const deleteRoleRoute = createRoute({
  method: 'delete',
  path: '/api/admin/roles/{slug}',
  tags: ['RBAC — Roles'],
  summary: 'Delete a role',
  description: 'Deletes a role and all its role-permission assignments (cascade).',
  request: { params: RoleSlugParamSchema },
  responses: {
    204: { description: 'Role deleted' },
    ...defaultResponses,
  },
});

// ─── Permissions routes ───────────────────────────────────────────────────────

export const listPermissionsRoute = createRoute({
  method: 'get',
  path: '/api/admin/permissions',
  tags: ['RBAC — Permissions'],
  summary: 'List all permissions',
  description: 'Returns every permission entry (resource path + HTTP method) in the system.',
  responses: {
    200: jsonContent(z.array(PermissionSchema), 'List of permissions'),
    ...defaultResponses,
  },
});

export const createPermissionRoute = createRoute({
  method: 'post',
  path: '/api/admin/permissions',
  tags: ['RBAC — Permissions'],
  summary: 'Create a new permission',
  description: 'Defines a new resource+action pair. Use keyMatch2 patterns such as `/api/contacts/:id`.',
  request: {
    body: jsonContent(CreatePermissionBodySchema, 'Permission to create'),
  },
  responses: {
    201: jsonContent(PermissionSchema, 'Created permission'),
    ...defaultResponses,
  },
});

export const deletePermissionRoute = createRoute({
  method: 'delete',
  path: '/api/admin/permissions/{id}',
  tags: ['RBAC — Permissions'],
  summary: 'Delete a permission',
  description: 'Removes the permission and revokes it from all roles (cascade).',
  request: { params: PermissionIdParamSchema },
  responses: {
    204: { description: 'Permission deleted' },
    ...defaultResponses,
  },
});

// ─── Role ↔ Permission assignment routes ─────────────────────────────────────

export const getRolePermissionsRoute = createRoute({
  method: 'get',
  path: '/api/admin/roles/{slug}/permissions',
  tags: ['RBAC — Assignments'],
  summary: 'List permissions assigned to a role',
  description: 'Does NOT include inherited permissions — only direct assignments for this role slug.',
  request: { params: RoleSlugParamSchema },
  responses: {
    200: jsonContent(z.array(PermissionSchema), 'Permissions directly assigned to this role'),
    ...defaultResponses,
  },
});

export const assignPermissionRoute = createRoute({
  method: 'post',
  path: '/api/admin/roles/{slug}/permissions',
  tags: ['RBAC — Assignments'],
  summary: 'Assign a permission to a role',
  description: 'Idempotent — assigning an already-assigned permission is a no-op.',
  request: {
    params: RoleSlugParamSchema,
    body: jsonContent(AssignPermissionBodySchema, 'Permission ID to assign'),
  },
  responses: {
    201: jsonContent(z.object({ roleSlug: z.string(), permissionId: z.string() }), 'Assignment created'),
    ...defaultResponses,
  },
});

export const revokePermissionRoute = createRoute({
  method: 'delete',
  path: '/api/admin/roles/{slug}/permissions/{id}',
  tags: ['RBAC — Assignments'],
  summary: 'Revoke a permission from a role',
  description: 'Removes the assignment. The permission object itself is NOT deleted.',
  request: { params: RolePermissionParamSchema },
  responses: {
    204: { description: 'Permission revoked from role' },
    ...defaultResponses,
  },
});

// ─── Admin utility routes ─────────────────────────────────────────────────────

export const seedRbacRoute = createRoute({
  method: 'post',
  path: '/api/admin/seed',
  tags: ['RBAC — Admin'],
  summary: 'Seed default roles and permissions',
  description: 'Runs seedRbac() to populate the database with the default role set. Safe to run multiple times.',
  responses: {
    200: jsonContent(z.object({ message: z.string() }), 'Seed result'),
    ...defaultResponses,
  },
});

export const syncPermissionsRoute = createRoute({
  method: 'post',
  path: '/api/admin/sync',
  tags: ['RBAC — Admin'],
  summary: 'Sync API routes into permissions table',
  description:
    'Auto-discovers all routes from openapi/*.openapi.ts and inserts missing ones into the permissions table. Idempotent.',
  responses: {
    200: jsonContent(
      z.object({
        synced: z.number().int().describe('Number of new permissions inserted'),
        total: z.number().int().describe('Total missing routes detected'),
        message: z.string(),
      }),
      'Sync result',
    ),
    ...defaultResponses,
  },
});

// Auto-discovered by openapi.ts via import.meta.glob
const routes = [
  listRolesRoute,
  createRoleRoute,
  updateRoleRoute,
  deleteRoleRoute,
  listPermissionsRoute,
  createPermissionRoute,
  deletePermissionRoute,
  getRolePermissionsRoute,
  assignPermissionRoute,
  revokePermissionRoute,
  seedRbacRoute,
  syncPermissionsRoute,
];

export default routes;

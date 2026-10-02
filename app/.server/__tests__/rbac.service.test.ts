import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { permissions, rolePermissions, roles } from '~/models';
import {
  assignPermission,
  createPermission,
  deletePermission,
  getRolePermissions,
  listPermissions,
  revokePermission,
} from '../services/permission.service';
import { createRole, deleteRole, listRoles, updateRole } from '../services/role.service';
import { execDDL, getDb, PERMISSIONS_DDL, ROLE_PERMISSIONS_DDL, ROLES_DDL, USERS_DDL } from './helpers';

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeAll(async () => {
  await execDDL(ROLES_DDL, PERMISSIONS_DDL, ROLE_PERMISSIONS_DDL, USERS_DDL);
});

beforeEach(async () => {
  const db = getDb();
  await db.delete(rolePermissions);
  await db.delete(permissions);
  await db.delete(roles);
});

// ─── listRoles ────────────────────────────────────────────────────────────────

describe('listRoles', () => {
  it('returns empty array when no roles exist', async () => {
    expect(await listRoles(getDb())).toEqual([]);
  });

  it('returns all created roles', async () => {
    const db = getDb();
    await createRole(db, { slug: 'admin', name: 'Admin' });
    await createRole(db, { slug: 'viewer', name: 'Viewer' });
    const result = await listRoles(db);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.slug)).toContain('admin');
    expect(result.map((r) => r.slug)).toContain('viewer');
  });
});

// ─── createRole ───────────────────────────────────────────────────────────────

describe('createRole', () => {
  it('creates a role and returns it', async () => {
    const role = await createRole(getDb(), { slug: 'editor', name: 'Editor', description: 'Can edit' });
    expect(role.slug).toBe('editor');
    expect(role.name).toBe('Editor');
    expect(role.description).toBe('Can edit');
    expect(role.parentSlug).toBeNull();
  });

  it('creates a role with a valid parentSlug', async () => {
    const db = getDb();
    await createRole(db, { slug: 'base', name: 'Base' });
    const child = await createRole(db, { slug: 'child', name: 'Child', parentSlug: 'base' });
    expect(child.parentSlug).toBe('base');
  });

  it('throws ConflictError when slug already exists', async () => {
    const db = getDb();
    await createRole(db, { slug: 'dup', name: 'Dup' });
    await expect(createRole(db, { slug: 'dup', name: 'Dup2' })).rejects.toThrow();
  });

  it('throws NotFoundError when parentSlug does not exist', async () => {
    await expect(createRole(getDb(), { slug: 'orphan', name: 'Orphan', parentSlug: 'nonexistent' })).rejects.toThrow();
  });
});

// ─── updateRole ───────────────────────────────────────────────────────────────

describe('updateRole', () => {
  it('updates name and description', async () => {
    const db = getDb();
    await createRole(db, { slug: 'toupdate', name: 'Old Name' });
    const updated = await updateRole(db, 'toupdate', { name: 'New Name', description: 'New desc' });
    expect(updated.name).toBe('New Name');
    expect(updated.description).toBe('New desc');
  });

  it('clears parentSlug when set to null', async () => {
    const db = getDb();
    await createRole(db, { slug: 'parent', name: 'Parent' });
    await createRole(db, { slug: 'child', name: 'Child', parentSlug: 'parent' });
    const updated = await updateRole(db, 'child', { parentSlug: null });
    expect(updated.parentSlug).toBeNull();
  });

  it('throws NotFoundError when role does not exist', async () => {
    await expect(updateRole(getDb(), 'ghost', { name: 'X' })).rejects.toThrow();
  });
});

// ─── deleteRole ───────────────────────────────────────────────────────────────

describe('deleteRole', () => {
  it('deletes an existing role', async () => {
    const db = getDb();
    await createRole(db, { slug: 'tobedeleted', name: 'To Delete' });
    await deleteRole(db, 'tobedeleted');
    const result = await listRoles(db);
    expect(result.find((r) => r.slug === 'tobedeleted')).toBeUndefined();
  });

  it('cascades to role_permissions on delete', async () => {
    const db = getDb();
    await createRole(db, { slug: 'roleA', name: 'Role A' });
    const perm = await createPermission(db, { resource: '/api/x', action: 'GET' });
    await assignPermission(db, 'roleA', perm.id);

    await deleteRole(db, 'roleA');

    const remaining = await db.select().from(rolePermissions);
    expect(remaining.find((rp) => rp.roleSlug === 'roleA')).toBeUndefined();
  });

  it('throws NotFoundError when role does not exist', async () => {
    await expect(deleteRole(getDb(), 'ghost')).rejects.toThrow();
  });
});

// ─── listPermissions / createPermission / deletePermission ────────────────────

describe('listPermissions', () => {
  it('returns empty array when no permissions exist', async () => {
    expect(await listPermissions(getDb())).toEqual([]);
  });

  it('returns all permissions', async () => {
    const db = getDb();
    await createPermission(db, { resource: '/api/a', action: 'GET' });
    await createPermission(db, { resource: '/api/b', action: 'POST' });
    expect(await listPermissions(db)).toHaveLength(2);
  });
});

describe('createPermission', () => {
  it('creates a permission with a generated id', async () => {
    const perm = await createPermission(getDb(), { resource: '/api/posts', action: 'GET', description: 'Read' });
    expect(perm.id).toBeTruthy();
    expect(perm.resource).toBe('/api/posts');
    expect(perm.action).toBe('GET');
  });

  it('throws ConflictError on duplicate resource+action', async () => {
    const db = getDb();
    await createPermission(db, { resource: '/api/dup', action: 'GET' });
    await expect(createPermission(db, { resource: '/api/dup', action: 'GET' })).rejects.toThrow();
  });

  it('allows same resource with different action', async () => {
    const db = getDb();
    await createPermission(db, { resource: '/api/same', action: 'GET' });
    const p2 = await createPermission(db, { resource: '/api/same', action: 'POST' });
    expect(p2.action).toBe('POST');
  });
});

describe('deletePermission', () => {
  it('deletes an existing permission', async () => {
    const db = getDb();
    const perm = await createPermission(db, { resource: '/api/del', action: 'GET' });
    await deletePermission(db, perm.id);
    expect(await listPermissions(db)).toHaveLength(0);
  });

  it('throws NotFoundError when permission does not exist', async () => {
    await expect(deletePermission(getDb(), 'nonexistent')).rejects.toThrow();
  });
});

// ─── assignPermission / revokePermission / getRolePermissions ─────────────────

describe('assignPermission', () => {
  it('assigns a permission to a role', async () => {
    const db = getDb();
    await createRole(db, { slug: 'roleX', name: 'Role X' });
    const perm = await createPermission(db, { resource: '/api/items', action: 'GET' });

    await assignPermission(db, 'roleX', perm.id);

    const rolePerms = await getRolePermissions(db, 'roleX');
    expect(rolePerms).toHaveLength(1);
    expect(rolePerms[0]?.id).toBe(perm.id);
  });

  it('is idempotent — duplicate assignment does not throw', async () => {
    const db = getDb();
    await createRole(db, { slug: 'roleY', name: 'Role Y' });
    const perm = await createPermission(db, { resource: '/api/items', action: 'POST' });

    await assignPermission(db, 'roleY', perm.id);
    await expect(assignPermission(db, 'roleY', perm.id)).resolves.not.toThrow();
    expect(await getRolePermissions(db, 'roleY')).toHaveLength(1);
  });

  it('throws NotFoundError when role does not exist', async () => {
    const db = getDb();
    const perm = await createPermission(db, { resource: '/api/x', action: 'DELETE' });
    await expect(assignPermission(db, 'ghost', perm.id)).rejects.toThrow();
  });

  it('throws NotFoundError when permission does not exist', async () => {
    const db = getDb();
    await createRole(db, { slug: 'roleZ', name: 'Role Z' });
    await expect(assignPermission(db, 'roleZ', 'fake-perm-id')).rejects.toThrow();
  });
});

describe('revokePermission', () => {
  it('removes the assignment', async () => {
    const db = getDb();
    await createRole(db, { slug: 'revoker', name: 'Revoker' });
    const perm = await createPermission(db, { resource: '/api/rev', action: 'GET' });
    await assignPermission(db, 'revoker', perm.id);

    await revokePermission(db, 'revoker', perm.id);
    expect(await getRolePermissions(db, 'revoker')).toHaveLength(0);
  });

  it('is a no-op when assignment does not exist', async () => {
    const db = getDb();
    await createRole(db, { slug: 'noop', name: 'No-op' });
    const perm = await createPermission(db, { resource: '/api/noop', action: 'DELETE' });
    await expect(revokePermission(db, 'noop', perm.id)).resolves.not.toThrow();
  });
});

describe('getRolePermissions', () => {
  it('throws NotFoundError when role does not exist', async () => {
    await expect(getRolePermissions(getDb(), 'ghost')).rejects.toThrow();
  });

  it('returns empty array for role with no permissions', async () => {
    const db = getDb();
    await createRole(db, { slug: 'empty', name: 'Empty' });
    expect(await getRolePermissions(db, 'empty')).toEqual([]);
  });

  it('returns all permissions assigned to the role', async () => {
    const db = getDb();
    await createRole(db, { slug: 'multi', name: 'Multi' });
    const p1 = await createPermission(db, { resource: '/api/a', action: 'GET' });
    const p2 = await createPermission(db, { resource: '/api/b', action: 'POST' });
    await assignPermission(db, 'multi', p1.id);
    await assignPermission(db, 'multi', p2.id);

    const result = await getRolePermissions(db, 'multi');
    expect(result).toHaveLength(2);
    const ids = result.filter(Boolean).map((p) => p!.id);
    expect(ids).toContain(p1.id);
    expect(ids).toContain(p2.id);
  });
});

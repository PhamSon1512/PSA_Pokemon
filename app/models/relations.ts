import { defineRelations } from 'drizzle-orm';
import { media } from './media';
import { permissions, rolePermissions, roles } from './rbac';
import { users } from './user';

export const schemaRelations = defineRelations({ roles, permissions, rolePermissions, users, media }, (helpers) => ({
  // roles has many rolePermissions
  // NOTE: roles.users (many) is intentionally omitted — loading all users of a role
  // is an N+1 risk. Query users by role directly when needed.
  roles: {
    rolePermissions: helpers.many.rolePermissions(),
  },

  // permissions has many rolePermissions
  permissions: {
    rolePermissions: helpers.many.rolePermissions(),
  },

  // rolePermissions belongs to one role and one permission
  rolePermissions: {
    role: helpers.one.roles({
      from: helpers.rolePermissions.roleSlug,
      to: helpers.roles.slug,
    }),
    permission: helpers.one.permissions({
      from: helpers.rolePermissions.permissionId,
      to: helpers.permissions.id,
    }),
  },

  // users belongs to one role (via role slug FK), has many media (uploaded files)
  users: {
    roleData: helpers.one.roles({
      from: helpers.users.role,
      to: helpers.roles.slug,
    }),
    // alias required: 3 FKs from media → users (uploader/updater/deleter) need disambiguation
    media: helpers.many.media({ alias: 'media_uploader' }),
  },

  // media belongs to one user (uploader) and one user (last updater/deleter)
  media: {
    uploader: helpers.one.users({
      from: helpers.media.createdBy,
      to: helpers.users.id,
      alias: 'media_uploader', // matches users.media alias
    }),
    updater: helpers.one.users({
      from: helpers.media.updatedBy,
      to: helpers.users.id,
      alias: 'media_updater',
    }),
    deleter: helpers.one.users({
      from: helpers.media.deletedBy,
      to: helpers.users.id,
      alias: 'media_deleter',
    }),
  },
}));

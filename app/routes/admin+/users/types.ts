import type { UserPublicSchema } from '~/openapi/auth-users.openapi';
import type { RoleSchema } from '~/openapi/rbac.openapi';
import type { z } from 'zod';

export type UserItem = z.infer<typeof UserPublicSchema>;
export type RoleItem = z.infer<typeof RoleSchema>;

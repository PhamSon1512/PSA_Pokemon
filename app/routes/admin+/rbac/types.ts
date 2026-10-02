import type { PermissionSchema, RoleSchema } from '~/openapi/rbac.openapi';
import type { z } from 'zod';

export type Role = z.infer<typeof RoleSchema>;
export type Permission = z.infer<typeof PermissionSchema>;

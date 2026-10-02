/**
 * Backward-compatible barrel.
 * All routes import from this file — re-export from focused sub-services.
 *
 * New code should import directly from:
 *   - ./role.service       (Role CRUD)
 *   - ./permission.service (Permission CRUD + role↔permission assignment)
 *   - ./rbac-seed.service  (seedRbac)
 */

export * from './role.service';
export * from './permission.service';
export * from './rbac-seed.service';

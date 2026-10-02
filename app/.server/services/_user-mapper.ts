import type { SafeUser } from '../types';

// ─── SafeUser mapper ──────────────────────────────────────────────────────────
// Single source of truth for mapping a DB user row to the public SafeUser shape.
// Any field added/removed here immediately surfaces everywhere it is consumed.

type UserRow = {
  id: string;
  email: string;
  name: string;
  phone: string;
  provinceId: string | null;
  districtId: string | null;
  wardId: string | null;
  detailedAddress: string | null;
  addressType: string | null;
  role: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

/**
 * Map a raw DB user row to the public SafeUser shape.
 * Strips sensitive fields (password, refreshToken, deletedAt).
 */
export function toSafeUser(row: UserRow): SafeUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    phone: row.phone,
    provinceId: row.provinceId,
    districtId: row.districtId,
    wardId: row.wardId,
    detailedAddress: row.detailedAddress,
    addressType: row.addressType,
    role: row.role,
    ...(row.createdAt !== undefined && { createdAt: row.createdAt }),
    ...(row.updatedAt !== undefined && { updatedAt: row.updatedAt }),
  };
}

/**
 * Columns to select when fetching a user — avoids repeated inline literals
 * and keeps the shape consistent with toSafeUser.
 *
 * Usage:
 *   db.select(USER_SAFE_COLS).from(users)
 */
export const USER_SAFE_COLS = {
  id: true,
  email: true,
  name: true,
  phone: true,
  provinceId: true,
  districtId: true,
  wardId: true,
  detailedAddress: true,
  addressType: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

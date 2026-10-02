import { describe, expect, it } from 'vitest';
import { toSafeUser } from '../services/_user-mapper';

// ─── toSafeUser ───────────────────────────────────────────────────────────────

const baseRow = {
  id: 'user-1',
  email: 'alice@example.com',
  firstName: 'Alice',
  lastName: 'Smith',
  fullName: 'Alice Smith',
  role: 'admin',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-06-01'),
};

describe('toSafeUser', () => {
  it('maps all safe fields correctly', () => {
    const result = toSafeUser(baseRow);
    expect(result.id).toBe('user-1');
    expect(result.email).toBe('alice@example.com');
    expect(result.firstName).toBe('Alice');
    expect(result.lastName).toBe('Smith');
    expect(result.fullName).toBe('Alice Smith');
    expect(result.role).toBe('admin');
  });

  it('includes createdAt when present', () => {
    const result = toSafeUser(baseRow);
    expect(result.createdAt).toEqual(new Date('2024-01-01'));
  });

  it('includes updatedAt when present', () => {
    const result = toSafeUser(baseRow);
    expect(result.updatedAt).toEqual(new Date('2024-06-01'));
  });

  it('omits createdAt when undefined', () => {
    const row = { ...baseRow, createdAt: undefined };
    const result = toSafeUser(row);
    expect('createdAt' in result).toBe(false);
  });

  it('omits updatedAt when undefined', () => {
    const row = { ...baseRow, updatedAt: undefined };
    const result = toSafeUser(row);
    expect('updatedAt' in result).toBe(false);
  });

  it('does not include sensitive fields (password, refreshToken, deletedAt)', () => {
    const rowWithSensitive = {
      ...baseRow,
      password: 'secret-hash',
      refreshToken: 'refresh-token',
      deletedAt: null,
    };
    const result = toSafeUser(rowWithSensitive);
    expect((result as any).password).toBeUndefined();
    expect((result as any).refreshToken).toBeUndefined();
    expect((result as any).deletedAt).toBeUndefined();
  });

  it('handles null firstName/lastName/fullName/role gracefully', () => {
    const row = {
      id: 'u-2',
      email: 'min@example.com',
      firstName: null,
      lastName: null,
      fullName: null,
      role: null,
    };
    const result = toSafeUser(row);
    expect(result.firstName).toBeNull();
    expect(result.lastName).toBeNull();
    expect(result.fullName).toBeNull();
    expect(result.role).toBeNull();
  });
});

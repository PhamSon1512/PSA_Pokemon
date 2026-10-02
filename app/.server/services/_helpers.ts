import slugify from 'slugify';
import { ConflictError } from '../errors';

// ─── Slug helpers ──────────────────────────────────────────────────────────────

/** Slugify options shared across all content types */
const SLUG_OPTS = { lower: true, strict: true, locale: 'vi', trim: true } as const;

/** Generate a slug from a name using project-wide slugify options */
export function makeSlug(name: string): string {
  return slugify(name, SLUG_OPTS);
}

/**
 * Ensure slug uniqueness in any table by trying variants (base, base-1 … base-N).
 *
 * @param checkExists  Async function: return the found row (truthy = conflict) or undefined
 * @param baseSlug     The canonical slug to start from
 * @param excludeId    Current record ID to exclude from conflict check (update flow)
 */
export async function ensureUniqueSlug(
  checkExists: (slug: string) => Promise<{ id?: string } | undefined>,
  baseSlug: string,
  excludeId?: string,
): Promise<string> {
  const MAX_ATTEMPTS = 10;
  let slug = baseSlug;
  let counter = 0;

  while (counter <= MAX_ATTEMPTS) {
    const existing = await checkExists(slug);
    if (!existing || existing.id === excludeId) return slug;
    counter++;
    slug = `${baseSlug}-${counter}`;
  }

  throw new ConflictError(`Cannot generate unique slug for "${baseSlug}" after ${MAX_ATTEMPTS} attempts`);
}

// ─── Patch builder ──────────────────────────────────────────────────────────────

/**
 * Build a partial update object from input, including `updatedAt`.
 * Only keys explicitly present in input (not undefined) are forwarded.
 *
 * @param input   Partial input object
 * @param keys    Which keys to pick from input
 *
 * @example
 *   buildPatch({ name: 'foo', slug: undefined }, ['name', 'slug'])
 *   // → { name: 'foo', updatedAt: new Date() }
 */
export function buildPatch<T extends Record<string, unknown>>(
  input: Partial<T>,
  keys: (keyof T)[],
): Partial<T> & { updatedAt: Date } {
  const patch: Record<string, unknown> = {};
  for (const key of keys) {
    if (input[key] !== undefined) patch[key as string] = input[key];
  }
  patch.updatedAt = new Date();
  return patch as Partial<T> & { updatedAt: Date };
}

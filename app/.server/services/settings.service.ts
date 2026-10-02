import type { DrizzleDb } from '../db';
import { eq } from 'drizzle-orm';
import { settings } from '~/models';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SettingItem = {
  key: string;
  value: string | null;
  group: string;
  updatedAt: Date | null;
};

export type SiteSettings = {
  // General
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  adminEmail: string;
  // Media
  mediaOrganizeByDate: boolean;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'My CMS Site',
  siteDescription: 'A powerful CMS built with React Router & Cloudflare',
  siteUrl: '',
  adminEmail: '',
  mediaOrganizeByDate: true,
};

// ─── Service functions ───────────────────────────────────────────────────────

/**
 * Get all settings as a flat key-value map
 */
export async function getAllSettings(db: DrizzleDb): Promise<Record<string, string>> {
  const rows = await db.select().from(settings);
  return rows.reduce(
    (acc, row) => {
      if (row.value !== null) acc[row.key] = row.value;
      return acc;
    },
    {} as Record<string, string>,
  );
}

/**
 * Get a single setting value
 */
export async function getSetting(db: DrizzleDb, key: string): Promise<string | null> {
  const row = await db
    .select()
    .from(settings)
    .where(eq(settings.key, key))
    .limit(1)
    .then((r) => r[0]);
  return row?.value ?? null;
}

/**
 * Set (upsert) a setting value
 */
export async function setSetting(db: DrizzleDb, key: string, value: string, group = 'general'): Promise<void> {
  await db
    .insert(settings)
    .values({ key, value, group, updatedAt: new Date() })
    .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: new Date() } });
}

/**
 * Get all settings, merged with defaults as a typed object
 */
export async function getSiteSettings(db: DrizzleDb): Promise<SiteSettings> {
  const raw = await getAllSettings(db);
  return {
    siteName: raw.siteName ?? DEFAULT_SETTINGS.siteName,
    siteDescription: raw.siteDescription ?? DEFAULT_SETTINGS.siteDescription,
    siteUrl: raw.siteUrl ?? DEFAULT_SETTINGS.siteUrl,
    adminEmail: raw.adminEmail ?? DEFAULT_SETTINGS.adminEmail,
    mediaOrganizeByDate:
      raw.mediaOrganizeByDate !== undefined ? raw.mediaOrganizeByDate === 'true' : DEFAULT_SETTINGS.mediaOrganizeByDate,
  };
}

/**
 * Bulk upsert settings
 */
export async function updateSettings(db: DrizzleDb, updates: Partial<SiteSettings>, group = 'general'): Promise<void> {
  const entries = Object.entries(updates).filter(([, v]) => v !== undefined);
  // Run all upserts in parallel — no data dependency between settings keys
  await Promise.all(entries.map(([key, value]) => setSetting(db, key, String(value), group)));
}

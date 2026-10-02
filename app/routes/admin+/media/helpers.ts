import type { FileFilterType } from './types';

/** Format bytes → human-readable (KB, MB, GB) */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/** Map MIME type → filter category */
export function getFileCategory(mimeType: string): FileFilterType {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'document';
}

/** Check if a mime type is an image we can preview */
export function isPreviewableImage(mimeType: string): boolean {
  return ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/avif'].includes(mimeType);
}

export { FILTER_LABELS, CATEGORY_STYLES, ACCEPTED_MIME } from '~/lib/constants';

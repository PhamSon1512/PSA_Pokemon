import type { MediaPublicSchema } from '~/openapi/media.openapi';
import type { z } from 'zod';

export type MediaItem = z.infer<typeof MediaPublicSchema>;

export type ViewMode = 'grid' | 'list';

export type FileFilterType = 'all' | 'image' | 'video' | 'audio' | 'document';

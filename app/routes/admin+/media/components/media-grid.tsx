import type { MediaItem } from '../types';
import type { Variants } from 'framer-motion';
import { motion } from 'framer-motion';
import { CheckCircle2, File, FileAudio, FileImage, FileVideo } from 'lucide-react';
import { cn } from '~/lib/utils';
import { isPreviewableImage } from '../helpers';

interface MediaGridProps {
  items: MediaItem[];
  selectedId: string | null;
  onSelect: (item: MediaItem) => void;
}

function FileIconFallback({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith('video/')) return <FileVideo className="size-8 text-[#0284c7]" />;
  if (mimeType.startsWith('audio/')) return <FileAudio className="size-8 text-[#d97706]" />;
  if (mimeType.startsWith('image/')) return <FileImage className="size-8 text-[#10b981]" />;
  return <File className="text-muted-foreground size-8" />;
}

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.03, type: 'spring' as const, stiffness: 260, damping: 22 },
  }),
};

export function MediaGrid({ items, selectedId, onSelect }: MediaGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <FileImage className="text-muted-foreground/20 size-10" />
        <p className="text-muted-foreground text-sm">No media files yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-2 sm:grid-cols-[repeat(auto-fill,minmax(150px,1fr))]">
      {items.map((item, i) => {
        const isSelected = item.id === selectedId;
        const canPreview = isPreviewableImage(item.mimeType);

        return (
          <motion.button
            key={item.id}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(item)}
            className={cn(
              'group relative flex aspect-square flex-col overflow-hidden rounded-lg border text-left transition-colors focus-visible:ring-2 focus-visible:ring-[#10b981] focus-visible:outline-none',
              isSelected ? 'border-[#10b981] ring-2 ring-[#10b981]/30' : 'border-border hover:border-[#10b981]/50',
            )}
          >
            {/* Thumbnail or icon */}
            <div className="bg-muted/30 relative flex-1">
              {canPreview ? (
                <img
                  src={item.url}
                  alt={item.title ?? item.fileName}
                  className="absolute inset-0 size-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <FileIconFallback mimeType={item.mimeType} />
                </div>
              )}

              {/* Selected overlay */}
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-[rgba(16,185,129,0.15)]"
                />
              )}

              {/* Selected check */}
              {isSelected && (
                <div className="absolute top-1.5 right-1.5 rounded-full bg-[#10b981]">
                  <CheckCircle2 className="size-4 text-white" />
                </div>
              )}
            </div>

            {/* File name strip */}
            <div className="border-border bg-background/95 border-t px-2 py-1.5 backdrop-blur-sm">
              <p className="text-foreground/80 truncate text-[11px] font-medium">{item.title ?? item.fileName}</p>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

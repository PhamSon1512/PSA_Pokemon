import type { MediaItem } from '../types';
import dayjs from 'dayjs';
import { AnimatePresence, motion } from 'framer-motion';
import { File, FileAudio, FileImage, FileVideo } from 'lucide-react';
import { Checkbox } from '~/components/ui/checkbox';
import { cn } from '~/lib/utils';
import { formatBytes, isPreviewableImage } from '../helpers';

interface MediaListProps {
  items: MediaItem[];
  selectedId: string | null;
  onSelect: (item: MediaItem) => void;
  checkedIds: Set<string>;
  onCheck: (id: string, checked: boolean) => void;
  onCheckAll: (checked: boolean) => void;
}

function FileIconSmall({ mimeType }: { mimeType: string }) {
  const cls = 'size-4 shrink-0';
  if (mimeType.startsWith('video/')) return <FileVideo className={cn(cls, 'text-[#0284c7]')} />;
  if (mimeType.startsWith('audio/')) return <FileAudio className={cn(cls, 'text-[#d97706]')} />;
  if (mimeType.startsWith('image/')) return <FileImage className={cn(cls, 'text-[#10b981]')} />;
  return <File className={cn(cls, 'text-muted-foreground')} />;
}

export function MediaList({ items, selectedId, onSelect, checkedIds, onCheck, onCheckAll }: MediaListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <FileImage className="text-muted-foreground/20 size-10" />
        <p className="text-muted-foreground text-sm">No media files yet</p>
      </div>
    );
  }

  const allChecked = items.length > 0 && items.every((i) => checkedIds.has(i.id));
  const someChecked = !allChecked && items.some((i) => checkedIds.has(i.id));

  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-border bg-muted/30 border-b">
            {/* Select-all checkbox */}
            <th className="w-10 px-4 py-3">
              <Checkbox
                id="check-all"
                checked={allChecked ? true : someChecked ? 'indeterminate' : false}
                onCheckedChange={(v) => onCheckAll(v === true)}
                aria-label="Select all"
              />
            </th>
            <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wide uppercase">File</th>
            <th className="text-muted-foreground hidden px-4 py-3 text-left text-xs font-medium tracking-wide uppercase md:table-cell">
              Type
            </th>
            <th className="text-muted-foreground hidden px-4 py-3 text-left text-xs font-medium tracking-wide uppercase sm:table-cell">
              Size
            </th>
            <th className="text-muted-foreground hidden px-4 py-3 text-left text-xs font-medium tracking-wide uppercase lg:table-cell">
              Uploaded
            </th>
          </tr>
        </thead>
        <tbody className="divide-border divide-y">
          <AnimatePresence initial={false}>
            {items.map((item, i) => {
              const isSelected = item.id === selectedId;
              const isChecked = checkedIds.has(item.id);
              const canPreview = isPreviewableImage(item.mimeType);

              return (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: i * 0.02 } }}
                  className={cn(
                    'transition-colors',
                    isChecked ? 'bg-[rgba(16,185,129,0.06)]' : isSelected ? 'bg-[rgba(16,185,129,0.07)]' : 'hover:bg-muted/30',
                  )}
                >
                  {/* Checkbox cell — stops row-click propagation */}
                  <td className="w-10 px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      id={`check-${item.id}`}
                      checked={isChecked}
                      onCheckedChange={(v) => onCheck(item.id, v === true)}
                      aria-label={`Select ${item.fileName}`}
                    />
                  </td>

                  {/* File name cell — click = open detail */}
                  <td className="cursor-pointer px-4 py-3" onClick={() => onSelect(item)}>
                    <div className="flex items-center gap-3">
                      <div className="border-border bg-muted/30 size-9 shrink-0 overflow-hidden rounded-md border">
                        {canPreview ? (
                          <img src={item.url} alt="" className="size-full object-cover" loading="lazy" />
                        ) : (
                          <div className="flex size-full items-center justify-center">
                            <FileIconSmall mimeType={item.mimeType} />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-foreground truncate text-xs font-medium">{item.title ?? item.fileName}</p>
                        <p className="text-muted-foreground truncate text-[11px]">{item.fileName}</p>
                      </div>
                    </div>
                  </td>

                  <td className="hidden cursor-pointer px-4 py-3 md:table-cell" onClick={() => onSelect(item)}>
                    <span className="text-muted-foreground text-xs">{item.mimeType}</span>
                  </td>
                  <td className="hidden cursor-pointer px-4 py-3 sm:table-cell" onClick={() => onSelect(item)}>
                    <span className="text-muted-foreground text-xs tabular-nums">{formatBytes(item.fileSize)}</span>
                  </td>
                  <td className="hidden cursor-pointer px-4 py-3 lg:table-cell" onClick={() => onSelect(item)}>
                    <span className="text-muted-foreground text-xs">
                      {item.createdAt ? dayjs(item.createdAt).format('DD MMM YYYY') : '—'}
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}

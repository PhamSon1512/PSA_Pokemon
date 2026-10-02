import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '~/lib/utils';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  /** e.g. "user", "file" — used for display text */
  itemLabel?: string;
}

/**
 * Standard admin pagination row.
 * Eliminates the identical prev/next nav block duplicated in users and media pages.
 */
export function Pagination({ page, totalPages, total, itemLabel = 'item' }: PaginationProps) {
  if (totalPages <= 1) return null;

  const plural = total !== 1 ? `${itemLabel}s` : itemLabel;

  return (
    <div className="text-muted-foreground flex items-center justify-between text-sm">
      <p>
        Page {page} of {totalPages} · {total} {plural}
      </p>
      <div className="flex items-center gap-2">
        <a
          href={page > 1 ? `?page=${page - 1}` : undefined}
          aria-disabled={page <= 1}
          className={cn(
            'border-border flex size-8 items-center justify-center rounded-lg border transition-colors',
            page <= 1 ? 'pointer-events-none opacity-40' : 'hover:bg-accent hover:text-foreground',
          )}
        >
          <ChevronLeft className="size-4" />
        </a>
        <a
          href={page < totalPages ? `?page=${page + 1}` : undefined}
          aria-disabled={page >= totalPages}
          className={cn(
            'border-border flex size-8 items-center justify-center rounded-lg border transition-colors',
            page >= totalPages ? 'pointer-events-none opacity-40' : 'hover:bg-accent hover:text-foreground',
          )}
        >
          <ChevronRight className="size-4" />
        </a>
      </div>
    </div>
  );
}

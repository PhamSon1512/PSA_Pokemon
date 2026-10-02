import type { Route } from './+types/_index';
import type { FileFilterType, MediaItem, ViewMode } from './types';
import { useCallback, useEffect, useState } from 'react';
import { useRevalidator } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { ImageIcon, LayoutGrid, List, Trash2, X } from 'lucide-react';
import { nanoid } from 'nanoid';
import { PageHeader } from '~/components/admin/page-header';
import { Pagination } from '~/components/admin/pagination';
import { SearchInput } from '~/components/admin/search-input';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import { DeleteBatchDialog } from './components/delete-batch-dialog';
import { DeleteMediaDialog } from './components/delete-media-dialog';
import { MediaDetailPanel } from './components/media-detail-panel';
import { MediaGrid } from './components/media-grid';
import { MediaList } from './components/media-list';
import { UploadZone } from './components/upload-zone';
import { FILTER_LABELS, getFileCategory } from './helpers';

// ─── Server exports ────────────────────────────────────────────────────────────
export { loader } from './loader.server';
export { action } from '~/routes/api+/media';

// ─── Types for upload queue ───────────────────────────────────────────────────

interface UploadingFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'uploading' | 'done' | 'error';
  error?: string;
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

export const meta = (_: Route.MetaArgs) => [
  { title: 'Media Library — Admin Portal' },
  { name: 'description', content: 'Upload and manage media files' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MediaPage({ loaderData }: Route.ComponentProps) {
  const { items, total, page, totalPages } = loaderData;
  const revalidator = useRevalidator();

  // ── UI state ──────────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<FileFilterType>('all');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<MediaItem | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadingFile[]>([]);

  // ── Client-side filter (on top of server pagination) ──────────────────────
  const filtered = items.filter((item) => {
    const matchesSearch =
      !search ||
      item.fileName.toLowerCase().includes(search.toLowerCase()) ||
      (item.title ?? '').toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || getFileCategory(item.mimeType) === typeFilter;
    return matchesSearch && matchesType;
  });

  // ── Batch selection (list view only) ─────────────────────────────────────
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [batchDeleting, setBatchDeleting] = useState(false);

  const handleCheck = useCallback((id: string, checked: boolean) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const handleCheckAll = useCallback(
    (checked: boolean) => {
      setCheckedIds(checked ? new Set(filtered.map((i) => i.id)) : new Set());
    },
    [filtered],
  );

  // ── Upload handler — XHR for real progress tracking ───────────────────────
  const handleFilesSelected = useCallback(
    (files: File[]) => {
      files.forEach((file) => {
        const id = nanoid();
        setUploadQueue((q) => [...q, { id, name: file.name, size: file.size, progress: 0, status: 'uploading' }]);

        const formData = new FormData();
        formData.append('intent', 'upload');
        formData.append('file', file);

        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (e) => {
          if (!e.lengthComputable) return;
          const pct = Math.round((e.loaded / e.total) * 95); // cap at 95% until response
          setUploadQueue((q) => q.map((f) => (f.id === id ? { ...f, progress: pct } : f)));
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setUploadQueue((q) => q.map((f) => (f.id === id ? { ...f, progress: 100, status: 'done' } : f)));
            // Refresh file list after short delay so the "done" state is visible briefly
            setTimeout(() => revalidator.revalidate(), 800);
          } else {
            setUploadQueue((q) => q.map((f) => (f.id === id ? { ...f, status: 'error', error: 'Server error' } : f)));
          }
        };

        xhr.onerror = () => {
          setUploadQueue((q) => q.map((f) => (f.id === id ? { ...f, status: 'error', error: 'Network error' } : f)));
        };

        // Post to self (action will handle it)
        xhr.open('POST', window.location.pathname);
        xhr.send(formData);
      });
    },
    [revalidator],
  );

  const handleDismissUpload = useCallback((id: string) => {
    setUploadQueue((q) => q.filter((f) => f.id !== id));
  }, []);

  // ── Close detail panel when deleted item is gone ──────────────────────────
  useEffect(() => {
    if (deletingItem === null && selectedItem && !items.find((i) => i.id === selectedItem.id)) {
      setSelectedItem(null);
    }
  }, [items]);

  const filterTypes: FileFilterType[] = ['all', 'image', 'video', 'audio', 'document'];

  // Clear selection when switching away from list view
  const handleSetViewMode = (mode: typeof viewMode) => {
    setViewMode(mode);
    if (mode !== 'list') setCheckedIds(new Set());
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <PageHeader
        title="Media Library"
        subtitle={`${total} file${total !== 1 ? 's' : ''}`}
        action={
          <Button
            size="sm"
            onClick={() => setShowUpload((v) => !v)}
            className={cn(showUpload && 'bg-[#059669] hover:bg-[#047857]')}
          >
            <ImageIcon className="size-3.5" />
            {showUpload ? 'Hide upload' : 'Upload files'}
          </Button>
        }
      />

      {/* ── Upload zone (collapsible) ─────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <UploadZone onFilesSelected={handleFilesSelected} uploadingFiles={uploadQueue} onDismiss={handleDismissUpload} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toolbar: search + type filter + view toggle ───────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <SearchInput value={search} onChange={setSearch} placeholder="Search files…" className="min-w-[180px] flex-1 sm:max-w-sm" />

        {/* Type filter pills */}
        <div className="border-border bg-muted/30 flex items-center gap-1 rounded-lg border p-0.5">
          {filterTypes.map((ft) => (
            <button
              key={ft}
              onClick={() => setTypeFilter(ft)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                typeFilter === ft ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {FILTER_LABELS[ft]}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="border-border bg-muted/30 ml-auto flex items-center rounded-lg border p-0.5">
          <button
            onClick={() => handleSetViewMode('grid')}
            className={cn(
              'rounded-md p-1.5 transition-colors',
              viewMode === 'grid' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
            aria-label="Grid view"
          >
            <LayoutGrid className="size-3.5" />
          </button>
          <button
            onClick={() => handleSetViewMode('list')}
            className={cn(
              'rounded-md p-1.5 transition-colors',
              viewMode === 'list' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
            aria-label="List view"
          >
            <List className="size-3.5" />
          </button>
        </div>
      </div>

      {/* ── Batch-delete toolbar (list view only) ─────────────────────────── */}
      {viewMode === 'list' && checkedIds.size > 0 && (
        <div className="border-border bg-card flex items-center gap-3 rounded-xl border px-4 py-2.5">
          <span className="text-muted-foreground text-sm">
            <span className="text-foreground font-semibold">{checkedIds.size}</span> file{checkedIds.size !== 1 ? 's' : ''} selected
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setCheckedIds(new Set())} className="h-7 text-xs">
              <X className="size-3" />
              Deselect all
            </Button>
            <Button
              size="sm"
              onClick={() => setBatchDeleting(true)}
              className="h-7 gap-1.5 bg-[#ef4444] text-xs text-white hover:bg-[#dc2626]"
            >
              <Trash2 className="size-3" />
              Delete {checkedIds.size} file{checkedIds.size !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      )}

      {/* ── Main content area ─────────────────────────────────────────────── */}
      <div className="min-h-0 flex-1">
        {viewMode === 'grid' ? (
          <MediaGrid
            items={filtered}
            selectedId={selectedItem?.id ?? null}
            onSelect={(item) => setSelectedItem((prev) => (prev?.id === item.id ? null : item))}
          />
        ) : (
          <MediaList
            items={filtered}
            selectedId={selectedItem?.id ?? null}
            onSelect={(item) => setSelectedItem((prev) => (prev?.id === item.id ? null : item))}
            checkedIds={checkedIds}
            onCheck={handleCheck}
            onCheckAll={handleCheckAll}
          />
        )}
      </div>

      {/* Drawer detail panel */}
      <MediaDetailPanel
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onDeleteRequest={(item) => setDeletingItem(item)}
      />

      <Pagination page={page} totalPages={totalPages} total={total} itemLabel="file" />

      {/* ── Delete single dialog ──────────────────────────────────────────── */}
      <DeleteMediaDialog item={deletingItem} onClose={() => setDeletingItem(null)} />

      {/* ── Batch delete dialog ───────────────────────────────────────────── */}
      <DeleteBatchDialog
        ids={batchDeleting ? [...checkedIds] : []}
        onClose={() => setBatchDeleting(false)}
        onDeleted={() => {
          setCheckedIds(new Set());
          setBatchDeleting(false);
        }}
      />
    </div>
  );
}

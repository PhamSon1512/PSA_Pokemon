import { useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CloudUpload, File, FileAudio, FileImage, FileVideo, X } from 'lucide-react';
import { cn } from '~/lib/utils';
import { ACCEPTED_MIME } from '../helpers';

interface UploadingFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'uploading' | 'done' | 'error';
  error?: string;
}

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  uploadingFiles: UploadingFile[];
  onDismiss: (id: string) => void;
}

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'].includes(ext)) return FileImage;
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return FileVideo;
  if (['mp3', 'wav', 'ogg', 'flac', 'aac'].includes(ext)) return FileAudio;
  return File;
}

export function UploadZone({ onFilesSelected, uploadingFiles, onDismiss }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      dragCounter.current = 0;
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length) onFilesSelected(files);
    },
    [onFilesSelected],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length) onFilesSelected(files);
      // Reset input so same file can be re-uploaded
      e.target.value = '';
    },
    [onFilesSelected],
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Drop zone */}
      <motion.div
        animate={isDragging ? { scale: 1.01 } : { scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onDragEnter={handleDragEnter}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors',
          isDragging
            ? 'border-[#10b981] bg-[rgba(16,185,129,0.06)]'
            : 'border-border bg-muted/20 hover:bg-muted/40 hover:border-[#10b981]/50',
        )}
      >
        <motion.div
          animate={isDragging ? { y: -4, scale: 1.1 } : { y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="flex size-12 items-center justify-center rounded-xl bg-[rgba(16,185,129,0.1)]"
        >
          <CloudUpload className="size-6 text-[#10b981]" />
        </motion.div>

        <div>
          <p className="text-foreground text-sm font-medium">
            {isDragging ? 'Drop files here' : 'Drag & drop files, or click to browse'}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">Images, videos, audio, PDFs, docs — up to 50 MB each</p>
        </div>

        <input ref={inputRef} type="file" multiple accept={ACCEPTED_MIME} onChange={handleInputChange} className="sr-only" />
      </motion.div>

      {/* Upload progress list */}
      <AnimatePresence initial={false}>
        {uploadingFiles.map((f) => {
          const Icon = getFileIcon(f.name);
          return (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.2 }}
              className="border-border bg-card flex items-center gap-3 rounded-lg border px-4 py-3"
            >
              <div
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-lg',
                  f.status === 'error' ? 'bg-[rgba(239,68,68,0.1)]' : 'bg-[rgba(16,185,129,0.1)]',
                )}
              >
                {f.status === 'error' ? (
                  <AlertCircle className="size-4 text-[#ef4444]" />
                ) : (
                  <Icon className="size-4 text-[#10b981]" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate text-xs font-medium">{f.name}</p>
                {f.status === 'error' ? (
                  <p className="text-[11px] text-[#ef4444]">{f.error ?? 'Upload failed'}</p>
                ) : (
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="bg-muted h-1 flex-1 overflow-hidden rounded-full">
                      <motion.div
                        className="h-full rounded-full bg-[#10b981]"
                        initial={{ width: 0 }}
                        animate={{ width: `${f.progress}%` }}
                        transition={{ ease: 'easeOut', duration: 0.3 }}
                      />
                    </div>
                    <span className="text-muted-foreground shrink-0 text-[10px] tabular-nums">
                      {f.status === 'done' ? 'Done' : `${f.progress}%`}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={() => onDismiss(f.id)}
                className="text-muted-foreground/50 hover:text-foreground shrink-0 rounded p-0.5 transition-colors"
                aria-label="Dismiss"
              >
                <X className="size-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

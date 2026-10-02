import type { MediaItem } from '../types';
import { Fragment, useEffect, useRef, useState } from 'react';
import { useForm } from '@mantine/form';
import dayjs from 'dayjs';
import { Check, Copy, ExternalLink, File, FileAudio, FileImage, FileVideo, Loader2, Save, Trash2, X } from 'lucide-react';
import { zodResolver } from 'mantine-form-zod-resolver';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '~/components/ui/drawer';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Separator } from '~/components/ui/separator';
import { Textarea } from '~/components/ui/textarea';
import { getApiError, http } from '~/lib/http';
import { cn } from '~/lib/utils';
import { formatBytes, isPreviewableImage } from '../helpers';

// ─── Zod schema for edit form ─────────────────────────────────────────────────

const EditSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(500).optional(),
});

type EditValues = z.infer<typeof EditSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface MediaDetailPanelProps {
  item: MediaItem | null;
  onClose: () => void;
  onDeleteRequest: (item: MediaItem) => void;
}

// ─── File icon helper ─────────────────────────────────────────────────────────

function FileIconLarge({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith('video/')) return <FileVideo className="size-10 text-[#0284c7]" />;
  if (mimeType.startsWith('audio/')) return <FileAudio className="size-10 text-[#d97706]" />;
  if (mimeType.startsWith('image/')) return <FileImage className="size-10 text-[#10b981]" />;
  return <File className="text-muted-foreground size-10" />;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MediaDetailPanel({ item, onClose, onDeleteRequest }: MediaDetailPanelProps) {
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Track previous item ID to reset form when selection changes
  const prevIdRef = useRef<string | null>(null);

  const form = useForm<EditValues>({
    validate: zodResolver(EditSchema),
    initialValues: { title: '', description: '' },
  });

  // Sync form values when a different item is selected
  useEffect(() => {
    if (!item) return;
    if ((item.id as string) !== prevIdRef.current) {
      prevIdRef.current = item.id as string;
      form.setValues({
        title: (item.title ?? item.fileName) as string,
        description: (item.description ?? '') as string,
      });
    }
  }, [item]);

  const handleCopy = () => {
    if (!item) return;
    navigator.clipboard.writeText(item.url as string).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('URL copied to clipboard');
    });
  };

  const handleSubmit = async (values: EditValues) => {
    if (!item) return;
    setIsSaving(true);
    try {
      await http.patch(`/api/media/${item.id as string}`, {
        title: values.title,
        description: values.description || undefined,
      });
      toast.success('Changes saved');
    } catch (err) {
      toast.error(getApiError(err, 'Save failed'));
    } finally {
      setIsSaving(false);
    }
  };

  const canPreview = item ? isPreviewableImage(item.mimeType as string) : false;

  return (
    <Drawer direction="right" open={!!item} onClose={onClose}>
      <DrawerContent className="!w-[320px] sm:!max-w-[320px]">
        {/* Header */}
        <DrawerHeader className="border-border border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-xs font-semibold tracking-wide uppercase">Attachment Details</DrawerTitle>
              {item && <DrawerDescription className="mt-0.5 truncate text-[11px]">{item.fileName as string}</DrawerDescription>}
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="size-6" aria-label="Close panel">
                <X className="size-3.5" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        {item && (
          <>
            {/* Preview */}
            <div className="border-border flex h-44 shrink-0 items-center justify-center overflow-hidden border-b bg-[repeating-conic-gradient(var(--tw-ring-color)_0_25%,transparent_0_50%)_0_0/16px_16px] [--tw-ring-color:rgba(0,0,0,0.04)] dark:[--tw-ring-color:rgba(255,255,255,0.04)]">
              {canPreview ? (
                <img
                  src={item.url as string}
                  alt={(item.title ?? item.fileName) as string}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <FileIconLarge mimeType={item.mimeType as string} />
              )}
            </div>

            {/* Scrollable content */}
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
              {/* File meta */}
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs">
                {[
                  { label: 'File name', value: item.fileName as string },
                  { label: 'File type', value: item.mimeType as string },
                  { label: 'File size', value: formatBytes(item.fileSize as number) },
                  { label: 'Uploaded', value: item.createdAt ? dayjs(item.createdAt).format('MMM D, YYYY') : '—' },
                ].map(({ label, value }) => (
                  <Fragment key={label}>
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="text-foreground truncate font-medium">{value}</dd>
                  </Fragment>
                ))}
              </dl>

              <Separator />

              {/* Edit form */}
              <form onSubmit={form.onSubmit(handleSubmit)} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="media-title" className="text-xs">
                    Title
                  </Label>
                  <Input
                    id="media-title"
                    value={(form.getInputProps('title').value as string) ?? ''}
                    onChange={form.getInputProps('title').onChange}
                    className="h-8 text-xs"
                    placeholder="File title…"
                  />
                  {form.errors.title && <p className="text-destructive text-[11px]">{form.errors.title}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="media-desc" className="text-xs">
                    Description
                  </Label>
                  <Textarea
                    id="media-desc"
                    value={(form.getInputProps('description').value as string) ?? ''}
                    onChange={form.getInputProps('description').onChange}
                    rows={3}
                    placeholder="Optional description…"
                    className="resize-none text-xs"
                  />
                </div>

                <Button type="submit" size="sm" disabled={isSaving} className="w-full gap-1.5">
                  {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                  {isSaving ? 'Saving…' : 'Save changes'}
                </Button>
              </form>

              <Separator />

              {/* URL row */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">File URL</Label>
                <div className="border-border bg-muted/30 flex items-center gap-1 overflow-hidden rounded-md border">
                  <input
                    readOnly
                    value={item.url as string}
                    className="text-muted-foreground min-w-0 flex-1 bg-transparent px-2.5 py-1.5 text-[11px] focus:outline-none"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    aria-label="Copy URL"
                    className={cn(
                      'border-border h-auto shrink-0 gap-1 rounded-none border-l px-2.5 py-1.5 text-[11px]',
                      copied ? 'text-[#10b981]' : 'text-muted-foreground',
                    )}
                  >
                    {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-auto flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-auto flex-1 gap-1.5 px-3 py-1.5 text-xs hover:border-[#10b981]/50"
                  asChild
                >
                  <a href={item.url as string} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="size-3" />
                    Open
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-auto flex-1 gap-1.5 border-[rgba(239,68,68,0.3)] px-3 py-1.5 text-xs text-[#ef4444] hover:bg-[rgba(239,68,68,0.07)] hover:text-[#ef4444]"
                  onClick={() => onDeleteRequest(item)}
                >
                  <Trash2 className="size-3" />
                  Delete
                </Button>
              </div>
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}

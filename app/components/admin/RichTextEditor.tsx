import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  RemoveFormatting,
  Strikethrough,
  Underline,
} from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Textarea } from '~/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

/* Strip HTML tags to count plain-text characters */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

/* Sticky toolbar button */
function ToolbarBtn({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 rounded-md p-0 text-gray-600 transition-colors hover:bg-amber-50 hover:text-amber-600 dark:text-gray-400 dark:hover:bg-amber-500/10 dark:hover:text-amber-400"
          onClick={onClick}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function RichTextEditor({ value, onChange, error }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'visual' | 'html'>('visual');
  const [htmlValue, setHtmlValue] = useState(value || '');
  const [charCount, setCharCount] = useState(0);

  /* Sync value externally (reset) */
  useEffect(() => {
    setHtmlValue(value || '');
    if (editorRef.current && editorRef.current.innerHTML !== (value || '')) {
      editorRef.current.innerHTML = value || '';
    }
    setCharCount(stripHtml(value || '').length);
  }, [value]);

  const exec = useCallback(
    (command: string, val?: string) => {
      document.execCommand(command, false, val);
      editorRef.current?.focus();
      if (editorRef.current) {
        const html = editorRef.current.innerHTML;
        setHtmlValue(html);
        onChange(html);
        setCharCount(stripHtml(html).length);
      }
    },
    [onChange],
  );

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setHtmlValue(html);
      onChange(html);
      setCharCount(stripHtml(html).length);
    }
  };

  /* Handle paste — allow images + formatted content */
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find((i) => i.type.startsWith('image/'));
    if (imageItem) {
      e.preventDefault();
      const file = imageItem.getAsFile();
      if (!file) return;
      // Convert pasted image to data URL and insert
      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target?.result as string;
        exec('insertHTML', `<img src="${src}" style="max-width:100%;height:auto;cursor:pointer;" />`);
      };
      reader.readAsDataURL(file);
    }
    // If no image — let browser handle default paste (preserves formatting)
  };

  /* Insert link */
  const handleInsertLink = () => {
    const url = window.prompt('Nhập URL liên kết:', 'https://');
    if (!url) return;
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      exec('createLink', url);
    } else {
      const text = window.prompt('Nhập tên hiển thị:', 'Liên kết') || url;
      exec('insertHTML', `<a href="${url}" target="_blank" rel="noopener">${text}</a>`);
    }
  };

  /* Insert image by URL */
  const handleInsertImageUrl = () => {
    const url = window.prompt('Nhập URL ảnh:', 'https://');
    if (!url) return;
    exec('insertHTML', `<img src="${url}" alt="Ảnh sản phẩm" style="max-width:100%;height:auto;cursor:pointer;" />`);
  };

  /* Upload image from disk → data URL → paste as inline img */
  const handleFileImageInsert = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      exec('insertHTML', `<img src="${src}" alt="${file.name}" style="max-width:100%;height:auto;cursor:pointer;" />`);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  /* Click on image in editor — show resize hint */
  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      const img = target as HTMLImageElement;
      // Simple resize: prompt for width
      const currentW = img.style.width || img.width.toString() || 'auto';
      const newW = window.prompt('Chiều rộng ảnh (px hoặc %, để trống = tự động):', currentW);
      if (newW !== null) {
        img.style.width = newW ? (/^\d+$/.test(newW) ? `${newW}px` : newW) : 'auto';
        img.style.height = 'auto';
        handleInput();
      }
    }
  };

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setHtmlValue(v);
    onChange(v);
    setCharCount(stripHtml(v).length);
  };

  /* Toolbar buttons config */
  const toolbarGroups = [
    [
      { label: 'In đậm (Ctrl+B)', icon: <Bold className="h-3.5 w-3.5" />, cmd: () => exec('bold') },
      { label: 'In nghiêng (Ctrl+I)', icon: <Italic className="h-3.5 w-3.5" />, cmd: () => exec('italic') },
      { label: 'Gạch chân (Ctrl+U)', icon: <Underline className="h-3.5 w-3.5" />, cmd: () => exec('underline') },
      { label: 'Gạch ngang', icon: <Strikethrough className="h-3.5 w-3.5" />, cmd: () => exec('strikeThrough') },
    ],
    [
      { label: 'Tiêu đề H1', icon: <Heading1 className="h-3.5 w-3.5" />, cmd: () => exec('formatBlock', '<h1>') },
      { label: 'Tiêu đề H2', icon: <Heading2 className="h-3.5 w-3.5" />, cmd: () => exec('formatBlock', '<h2>') },
      { label: 'Đường kẻ ngang', icon: <Minus className="h-3.5 w-3.5" />, cmd: () => exec('insertHorizontalRule') },
    ],
    [
      { label: 'Danh sách dấu chấm', icon: <List className="h-3.5 w-3.5" />, cmd: () => exec('insertUnorderedList') },
      { label: 'Danh sách số', icon: <ListOrdered className="h-3.5 w-3.5" />, cmd: () => exec('insertOrderedList') },
    ],
    [
      { label: 'Chèn liên kết', icon: <Link2 className="h-3.5 w-3.5" />, cmd: handleInsertLink },
      { label: 'Chèn ảnh từ URL', icon: <ImageIcon className="h-3.5 w-3.5" />, cmd: handleInsertImageUrl },
    ],
    [{ label: 'Xóa định dạng', icon: <RemoveFormatting className="h-3.5 w-3.5 text-red-500" />, cmd: () => exec('removeFormat') }],
  ];

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex flex-col gap-1" ref={containerRef}>
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-[#1a1f26]">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'visual' | 'html')} className="w-full">
            {/* ── Toolbar ── */}
            <div
              ref={toolbarRef}
              className="sticky top-0 z-10 flex items-center justify-between rounded-t-xl border-b border-gray-200 bg-gray-50 px-2.5 py-1.5 shadow-sm dark:border-white/10 dark:bg-[#1a1f26]"
            >
              {activeTab === 'visual' ? (
                <div className="flex flex-wrap items-center gap-0.5">
                  {toolbarGroups.map((group, gi) => (
                    <React.Fragment key={gi}>
                      {gi > 0 && <div className="mx-1 h-4 w-px bg-gray-200 dark:bg-white/20" />}
                      {group.map((btn) => (
                        <ToolbarBtn key={btn.label} label={btn.label} icon={btn.icon} onClick={btn.cmd} />
                      ))}
                    </React.Fragment>
                  ))}
                  {/* Upload image from disk */}
                  <div className="mx-1 h-4 w-px bg-gray-200 dark:bg-white/20" />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 rounded-md p-0 text-gray-600 transition-colors hover:bg-amber-50 hover:text-amber-600 dark:text-gray-400 dark:hover:bg-amber-500/10 dark:hover:text-amber-400"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <ImageIcon className="h-3.5 w-3.5" />
                        <span className="sr-only">Tải ảnh từ máy tính</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      <p>Tải ảnh từ máy tính</p>
                    </TooltipContent>
                  </Tooltip>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileImageInsert} />
                </div>
              ) : (
                <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                  <Code className="h-3.5 w-3.5 text-amber-500" />
                  Chỉnh sửa mã HTML trực tiếp
                </div>
              )}

              <TabsList className="h-7 shrink-0 bg-gray-200 dark:bg-white/10">
                <TabsTrigger value="visual" className="h-6 px-2 text-[11px]">
                  Trực quan
                </TabsTrigger>
                <TabsTrigger value="html" className="h-6 px-2 text-[11px]">
                  HTML
                </TabsTrigger>
              </TabsList>
            </div>

            {/* ── Visual editor ── */}
            <TabsContent value="visual" className="m-0 p-0">
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
                onBlur={handleInput}
                onPaste={handlePaste}
                onClick={handleEditorClick}
                className="min-h-[200px] p-4 text-sm focus:outline-none dark:text-gray-200 [&_a]:cursor-pointer [&_a]:text-blue-600 [&_a]:underline [&_h1]:mb-2 [&_h1]:text-xl [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_hr]:my-3 [&_hr]:border-gray-200 [&_img]:max-w-full [&_img]:cursor-pointer [&_img]:rounded-lg [&_img]:hover:ring-2 [&_img]:hover:ring-amber-400 [&_li]:mb-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5"
              />
              {/* Word count bar */}
              <div className="flex items-center justify-end border-t border-gray-100 px-3 py-1.5 dark:border-white/10">
                <span className="text-muted-foreground text-[11px]">{charCount} ký tự</span>
              </div>
            </TabsContent>

            {/* ── HTML editor ── */}
            <TabsContent value="html" className="m-0 p-0">
              <Textarea
                value={htmlValue}
                onChange={handleHtmlChange}
                placeholder="<p>Nhập mã HTML mô tả sản phẩm ở đây...</p>"
                className="min-h-[200px] rounded-none border-0 font-mono text-xs focus-visible:ring-0 dark:bg-[#111827] dark:text-amber-400"
                style={{ resize: 'vertical' }}
              />
              <div className="flex items-center justify-end border-t border-gray-100 px-3 py-1.5 dark:border-white/10">
                <span className="text-muted-foreground text-[11px]">{charCount} ký tự</span>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Tips */}
        <p className="text-muted-foreground text-[11px]">
          Click vào ảnh trong soạn thảo để chỉnh kích thước. Dán ảnh trực tiếp bằng Ctrl+V. Toolbar luôn cố định ở đầu ô nhập.
        </p>

        {error && <p className="text-[11px] font-medium text-red-500">{error}</p>}
      </div>
    </TooltipProvider>
  );
}

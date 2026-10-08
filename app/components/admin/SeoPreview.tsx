import React from 'react';
import { ExternalLink, Globe, Search, Sparkles } from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';

interface SeoPreviewProps {
  slug: string;
  metaTitle: string;
  onMetaTitleChange: (val: string) => void;
  metaDescription: string;
  onMetaDescriptionChange: (val: string) => void;
  keywords: string;
  onKeywordsChange: (val: string) => void;
  productName: string;
}

const TITLE_MAX = 60;
const DESC_MAX = 160;

/* keyword suggestions — static pool, filter by what user types */
const KEYWORD_SUGGESTIONS = [
  'pokemon tcg',
  'thẻ bài pokemon',
  'túi mù pokemon',
  'booster pack',
  'cardvault',
  'pokemon chính hãng',
  'scarlet violet',
  'pikachu',
  'psa grading',
  'thẩm định thẻ bài',
  'elite trainer box',
  'pokemon sealed',
  'pokemon hà nội',
  'pokemon tphcm',
  'mua thẻ bài',
  'phụ kiện pokemon',
];

function BarIndicator({ length, max, typed }: { length: number; max: number; typed: boolean }) {
  // Always show the bar — red when empty, color-coded as user types
  const pct = typed ? Math.min(100, (length / max) * 100) : 0;
  let color: string;
  if (!typed) {
    color = 'bg-red-400'; // red = nothing entered yet
  } else if (length < max * 0.5) {
    color = 'bg-amber-400'; // yellow = too short
  } else if (length <= max) {
    color = 'bg-emerald-500'; // green = optimal
  } else {
    color = 'bg-red-500'; // red = too long
  }

  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
      <div
        className={`h-full transition-all duration-300 ${color}`}
        style={{ width: typed ? `${pct}%` : '100%', opacity: typed ? 1 : 0.4 }}
      />
    </div>
  );
}

function StatusLabel({ length, max, typed }: { length: number; max: number; typed: boolean }) {
  if (!typed) return <span className="text-muted-foreground">Chưa nhập</span>;
  if (length < max * 0.5) return <span className="text-amber-600 dark:text-amber-400">Hơi ngắn</span>;
  if (length <= max) return <span className="text-emerald-600 dark:text-emerald-400">Tối ưu ✓</span>;
  return <span className="text-red-500">Quá dài — Google sẽ cắt</span>;
}

export function SeoPreview({
  slug,
  metaTitle,
  onMetaTitleChange,
  metaDescription,
  onMetaDescriptionChange,
  keywords,
  onKeywordsChange,
  productName,
}: SeoPreviewProps) {
  /* Only use fallbacks for the PREVIEW card, not for bar/status */
  const displayTitle = metaTitle || (productName ? `${productName} | CardVault VN` : 'Tên sản phẩm | CardVault VN');
  const displaySlug = slug || 'duong-dan-san-pham';
  const displayDesc =
    metaDescription ||
    `Mua ngay ${productName || 'sản phẩm'} chính hãng với giá tốt nhất tại CardVault. Giao hàng toàn quốc, cam kết thẻ bài và phụ kiện chuẩn thẩm định.`;

  /* Typed = user has actually entered something */
  const titleTyped = metaTitle.length > 0;
  const descTyped = metaDescription.length > 0;

  /* Keyword chip management — max 10 tags */
  const MAX_KEYWORDS = 10;
  const keywordList = keywords
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);

  const [kwInput, setKwInput] = React.useState('');
  const suggestions =
    kwInput.length >= 2
      ? KEYWORD_SUGGESTIONS.filter(
          (s) => s.includes(kwInput.toLowerCase()) && !keywordList.map((k) => k.toLowerCase()).includes(s),
        ).slice(0, 6)
      : [];

  const addKeyword = (kw: string) => {
    const trimmed = kw.trim();
    if (!trimmed || keywordList.length >= MAX_KEYWORDS) return;
    if (keywordList.map((k) => k.toLowerCase()).includes(trimmed.toLowerCase())) return;
    onKeywordsChange([...keywordList, trimmed].join(', '));
    setKwInput('');
  };

  const removeKeyword = (idx: number) => {
    onKeywordsChange(keywordList.filter((_, i) => i !== idx).join(', '));
  };

  const handleKwKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && kwInput.trim()) {
      e.preventDefault();
      addKeyword(kwInput);
    }
    if (e.key === 'Backspace' && !kwInput && keywordList.length > 0) {
      removeKeyword(keywordList.length - 1);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* ── Google SERP Preview ── */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50/50 dark:border-white/10 dark:bg-[#111827]">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5 dark:border-white/10">
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase">
            <Search className="h-3.5 w-3.5 text-blue-500" />
            Xem trước hiển thị trên Google (Google SERP Snippet)
          </div>
          <Badge
            variant="outline"
            className="gap-1 border-blue-200 bg-blue-50 text-[11px] text-blue-700 dark:border-blue-900 dark:bg-blue-900/30 dark:text-blue-400"
          >
            <Sparkles className="h-3 w-3" /> Live Preview
          </Badge>
        </div>

        <div className="p-4 font-sans">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-[#202124] dark:text-gray-300">
            <div className="grid h-5 w-5 place-items-center rounded-full bg-amber-500 text-[10px] font-black text-white">C</div>
            <div className="flex flex-col">
              <span className="text-[12px] leading-none font-medium text-[#202124] dark:text-gray-200">CardVault Vietnam</span>
              <span className="text-[11px] leading-tight text-[#5f6368] dark:text-gray-400">
                https://cardvault.vn › products ›{' '}
                <span className="font-semibold text-gray-700 dark:text-gray-300">{displaySlug}</span>
              </span>
            </div>
          </div>
          {/* Title */}
          <h3 className="mt-1.5 cursor-pointer text-[18px] leading-snug font-normal text-[#1a0dab] hover:underline dark:text-[#8ab4f8]">
            {displayTitle}
          </h3>
          {/* Snippet */}
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#4d5156] dark:text-gray-400">{displayDesc}</p>
        </div>
      </div>

      {/* ── Meta Title ── */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="metaTitle" className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Tiêu đề SEO (Meta Title)
          </Label>
          <span className="text-muted-foreground text-[11px]">
            {metaTitle.length}/{TITLE_MAX} · <StatusLabel length={metaTitle.length} max={TITLE_MAX} typed={titleTyped} />
          </span>
        </div>
        <Input
          id="metaTitle"
          value={metaTitle}
          onChange={(e) => onMetaTitleChange(e.target.value)}
          placeholder={displayTitle}
          maxLength={TITLE_MAX + 20}
          className="h-9 rounded-lg text-xs"
        />
        <BarIndicator length={metaTitle.length} max={TITLE_MAX} typed={titleTyped} />
      </div>

      {/* ── Meta Description ── */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="metaDescription" className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Mô tả SEO (Meta Description)
          </Label>
          <span className="text-muted-foreground text-[11px]">
            {metaDescription.length}/{DESC_MAX} · <StatusLabel length={metaDescription.length} max={DESC_MAX} typed={descTyped} />
          </span>
        </div>
        <Textarea
          id="metaDescription"
          value={metaDescription}
          onChange={(e) => onMetaDescriptionChange(e.target.value)}
          placeholder={displayDesc}
          rows={3}
          className="resize-none rounded-lg text-xs leading-relaxed"
        />
        <BarIndicator length={metaDescription.length} max={DESC_MAX} typed={descTyped} />
      </div>

      {/* ── Keyword tag-input ── */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">Từ khóa SEO (Focus Keywords)</Label>
          <span className="text-muted-foreground text-[11px]">
            {keywordList.length}/{MAX_KEYWORDS} từ khóa
          </span>
        </div>

        {/* Tag chips + input */}
        <div className="flex min-h-[38px] flex-wrap gap-1.5 rounded-lg border border-gray-200 bg-white p-2 transition-colors focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400/30 dark:border-white/10 dark:bg-white/5">
          {keywordList.map((kw, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:border-amber-600/30 dark:bg-amber-500/10 dark:text-amber-300"
            >
              {kw}
              <button
                type="button"
                onClick={() => removeKeyword(i)}
                className="ml-0.5 leading-none text-amber-500 transition-colors hover:text-red-500"
              >
                ×
              </button>
            </span>
          ))}
          {keywordList.length < MAX_KEYWORDS && (
            <input
              type="text"
              value={kwInput}
              onChange={(e) => setKwInput(e.target.value)}
              onKeyDown={handleKwKeyDown}
              placeholder={keywordList.length === 0 ? 'Nhập từ khóa rồi nhấn Enter hoặc dấu phẩy...' : 'Thêm từ khóa...'}
              className="placeholder:text-muted-foreground min-w-[140px] flex-1 bg-transparent text-xs text-gray-700 focus:outline-none dark:text-gray-300"
            />
          )}
        </div>

        {/* Auto-suggestions */}
        {suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1">
            <span className="text-muted-foreground mr-1 self-center text-[11px]">Gợi ý:</span>
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addKeyword(s)}
                className="rounded-md border border-gray-200 bg-white px-2 py-0.5 text-[11px] text-gray-600 transition-colors hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-400"
              >
                + {s}
              </button>
            ))}
          </div>
        )}

        <p className="text-muted-foreground text-[11px]">
          Nhấn{' '}
          <kbd className="rounded border border-gray-200 bg-gray-50 px-1 font-mono text-[10px] dark:border-white/10 dark:bg-white/10">
            Enter
          </kbd>{' '}
          hoặc dấu phẩy để thêm từ khóa. Tối đa {MAX_KEYWORDS} từ khóa.
        </p>
      </div>
    </div>
  );
}

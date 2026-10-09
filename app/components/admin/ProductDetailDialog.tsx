import React, { useState } from 'react';
import { Link } from 'react-router';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Globe,
  Link as LinkIcon,
  ListTree,
  Package,
  ShoppingCart,
  Tag,
  X,
} from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog';

export interface ProductDetailData {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  comparePrice?: number | null;
  image?: string | null;
  images?: string[] | null;
  category?: string | null;
  badges?: string[] | null;
  sold: number;
  stock: number;
  status: 'DRAFT' | 'ACTIVE' | 'SOLD_OUT';
  createdAt?: string | Date;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  hasVariants?: boolean;
  variants?: any[];
}

interface ProductDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductDetailData | null;
}

export function ProductDetailDialog({ open, onOpenChange, product }: ProductDetailDialogProps) {
  if (!product) return null;

  const allImages = product.images && product.images.length > 0 ? product.images : product.image ? [product.image] : [];
  const [selectedImg, setSelectedImg] = useState<string>(allImages[0] || '');

  React.useEffect(() => {
    setSelectedImg(allImages[0] || '');
  }, [product]);

  const discountPercent =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Badge className="border-0 bg-emerald-50 text-emerald-700 shadow-none dark:bg-emerald-500/10 dark:text-emerald-400">
            Đang bán công khai
          </Badge>
        );
      case 'DRAFT':
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 shadow-none dark:bg-white/10 dark:text-gray-300">
            Bản nháp
          </Badge>
        );
      case 'SOLD_OUT':
        return (
          <Badge variant="destructive" className="shadow-none">
            Hết hàng
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleNextImg = () => {
    if (allImages.length <= 1) return;
    const idx = allImages.indexOf(selectedImg);
    setSelectedImg(allImages[(idx + 1) % allImages.length]);
  };

  const handlePrevImg = () => {
    if (allImages.length <= 1) return;
    const idx = allImages.indexOf(selectedImg);
    setSelectedImg(allImages[(idx - 1 + allImages.length) % allImages.length]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[95vh] w-full max-w-[95vw] gap-0 overflow-y-auto rounded-2xl border-none p-0 shadow-2xl sm:max-w-5xl dark:bg-[#161b22]"
      >
        {/* Header - Sticky */}
        <div className="sticky top-0 z-20 flex items-center justify-between bg-white/90 p-5 shadow-sm backdrop-blur-md dark:bg-[#161b22]/90">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white">Chi tiết Sản phẩm</DialogTitle>
              <div className="text-[11px] font-medium text-gray-500">
                ID: <span className="font-mono text-gray-400">{product.id}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {getStatusBadge(product.status)}
            <DialogClose className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/40 dark:hover:text-red-400">
              <X className="h-5 w-5" />
            </DialogClose>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left: Gallery (4 cols) */}
            <div className="space-y-4 lg:col-span-4">
              <div className="group relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-50 dark:bg-[#1c2128]">
                {selectedImg ? (
                  <>
                    <img
                      src={selectedImg}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    {allImages.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevImg}
                          className="absolute top-1/2 left-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 opacity-80 shadow-md backdrop-blur-sm transition-all hover:scale-110 hover:bg-white hover:opacity-100 dark:bg-gray-800/90 dark:text-white dark:hover:bg-gray-700"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          onClick={handleNextImg}
                          className="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 opacity-80 shadow-md backdrop-blur-sm transition-all hover:scale-110 hover:bg-white hover:opacity-100 dark:bg-gray-800/90 dark:text-white dark:hover:bg-gray-700"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center text-gray-400">
                    <Package className="mb-2 h-10 w-10 opacity-20" />
                    <span className="text-xs font-medium">Chưa có ảnh</span>
                  </div>
                )}
              </div>

              {allImages.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImg(img)}
                      className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                        selectedImg === img
                          ? 'border-amber-500 shadow-md ring-2 ring-amber-500/20'
                          : 'border-transparent opacity-60 hover:opacity-100 hover:shadow-sm'
                      }`}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* SEO Info Card */}
              <div className="mt-6 rounded-2xl bg-gray-50 p-5 dark:bg-[#1c2128]">
                <div className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                  <Globe className="h-4 w-4 text-blue-500" /> Tối ưu hóa tìm kiếm (SEO)
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase">Thẻ tiêu đề (Meta Title)</div>
                    <div className="mt-1 text-xs font-medium text-gray-900 dark:text-gray-300">
                      {product.seoTitle || <span className="text-gray-400 italic">Mặc định theo tên SP</span>}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase">Từ khóa (Keywords)</div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {product.seoKeywords ? (
                        product.seoKeywords.split(',').map((kw, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:border-amber-600/30 dark:bg-amber-500/10 dark:text-amber-300"
                          >
                            {kw.trim()}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">Trống</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
                      Thẻ mô tả (Meta Description)
                    </div>
                    <div className="mt-1 line-clamp-3 text-xs text-gray-600 dark:text-gray-400">
                      {product.seoDescription || <span className="text-gray-400 italic">Trống</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Info (8 cols) */}
            <div className="flex flex-col space-y-6 lg:col-span-8">
              {/* Title & Badges */}
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-400"
                  >
                    <Tag className="mr-1.5 h-3 w-3" />
                    {product.category || 'Chưa phân loại'}
                  </Badge>
                  {product.badges?.map((b, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300">
                      {b}
                    </Badge>
                  ))}
                </div>
                <h2 className="text-2xl leading-tight font-extrabold tracking-tight text-gray-900 dark:text-white">
                  {product.name}
                </h2>
                <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
                  <LinkIcon className="h-4 w-4 shrink-0" />
                  <a
                    href={`/products/${product.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex cursor-pointer items-center gap-1.5 text-blue-600 underline underline-offset-2 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <span className="max-w-[300px] truncate font-mono text-xs sm:max-w-none">/{product.slug}</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  </a>
                </div>
              </div>

              {/* Price Box */}
              <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 p-6 dark:from-red-950/20 dark:to-orange-950/20">
                <div>
                  <div className="text-xs font-bold tracking-wider text-red-600/70 uppercase dark:text-red-400/70">Giá bán lẻ</div>
                  <div className="mt-1 flex items-baseline gap-3">
                    <span className="text-3xl font-black text-red-600 dark:text-red-500">
                      {product.price.toLocaleString('vi-VN')}₫
                    </span>
                    {product.comparePrice && product.comparePrice > product.price && (
                      <span className="text-sm font-medium text-gray-400 line-through decoration-gray-300 dark:decoration-gray-600">
                        {product.comparePrice.toLocaleString('vi-VN')}₫
                      </span>
                    )}
                  </div>
                </div>
                {discountPercent > 0 && (
                  <div className="flex h-14 w-14 flex-col items-center justify-center rounded-full bg-red-600 text-white shadow-lg shadow-red-500/20">
                    <span className="text-sm leading-none font-bold">-{discountPercent}%</span>
                  </div>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-4 rounded-2xl bg-gray-50 p-5 dark:bg-[#1c2128]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                    <Package className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold tracking-wider text-gray-500 uppercase">Tồn kho</div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {product.stock} <span className="text-sm font-medium text-gray-500">sp</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl bg-gray-50 p-5 dark:bg-[#1c2128]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <ShoppingCart className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold tracking-wider text-gray-500 uppercase">Đã bán</div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {product.sold} <span className="text-sm font-medium text-gray-500">đơn</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Variants Section */}
              {product.hasVariants && product.variants && product.variants.length > 0 && (
                <div className="rounded-2xl bg-gray-50 p-5 dark:bg-[#1c2128]">
                  <div className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                    <ListTree className="h-4 w-4 text-amber-500" /> Danh sách biến thể ({product.variants.length})
                  </div>
                  <div className="max-h-[200px] space-y-2 overflow-y-auto">
                    {product.variants.map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm dark:bg-[#22272e]"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => v.image && setSelectedImg(v.image)}
                            className="h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-gray-100 bg-gray-50 transition-all hover:ring-2 hover:ring-amber-500 dark:border-white/10 dark:bg-[#161b22]"
                            title="Click để xem ảnh"
                          >
                            {v.image ? (
                              <img src={v.image} alt={v.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[8px] font-bold text-gray-300">
                                NO IMG
                              </div>
                            )}
                          </button>
                          <div>
                            <div className="text-xs font-semibold text-gray-900 dark:text-white">{v.name}</div>
                            <div className="font-mono text-[10px] text-gray-500">{v.sku || 'N/A'}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-red-600 dark:text-red-500">
                            {(v.price || 0).toLocaleString('vi-VN')}₫
                          </div>
                          <div className="text-[10px] font-medium text-gray-500">
                            Kho: <span className="font-semibold text-gray-900 dark:text-white">{v.stock}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {product.description && (
                <div className="flex-1 rounded-2xl bg-gray-50 p-6 dark:bg-[#1c2128]">
                  <h3 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">Mô tả sản phẩm</h3>
                  <div
                    className="prose prose-sm dark:prose-invert max-h-[160px] overflow-y-auto text-gray-600 dark:text-gray-300"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

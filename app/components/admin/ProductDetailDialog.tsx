import React, { useState } from 'react';
import { Badge } from '~/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog';

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
    if (allImages.length > 0) {
      setSelectedImg(allImages[0]);
    } else {
      setSelectedImg('');
    }
  }, [product]);

  const discountPercent =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="border-0 bg-emerald-500 text-xs font-semibold text-white">Đang bán công khai</Badge>;
      case 'DRAFT':
        return (
          <Badge variant="secondary" className="bg-gray-200 text-xs font-semibold text-gray-800 dark:bg-white/20 dark:text-white">
            Bản nháp
          </Badge>
        );
      case 'SOLD_OUT':
        return (
          <Badge variant="destructive" className="text-xs font-semibold">
            Hết hàng
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-2xl p-6 dark:border-white/10 dark:bg-[#161b22]">
        <DialogHeader className="border-b pb-4 dark:border-white/10">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold dark:text-white">Chi tiết sản phẩm</DialogTitle>
            {getStatusBadge(product.status)}
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 pt-2 md:grid-cols-2">
          {/* Gallery */}
          <div className="space-y-3">
            <div className="aspect-square overflow-hidden rounded-xl border bg-gray-50 dark:border-white/10 dark:bg-white/5">
              {selectedImg ? (
                <img src={selectedImg} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <div className="text-muted-foreground flex h-full w-full items-center justify-center text-xs font-medium">
                  Chưa có ảnh
                </div>
              )}
            </div>

            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImg(img)}
                    className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                      selectedImg === img
                        ? 'border-amber-500 ring-1 ring-amber-500/20'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div>
              <div className="text-xs font-semibold text-amber-600 dark:text-amber-400">{product.category || 'Chưa phân loại'}</div>
              <h2 className="mt-1 text-lg font-bold text-gray-900 dark:text-white">{product.name}</h2>
              <div className="text-muted-foreground mt-1 font-mono text-xs">Slug: /products/{product.slug}</div>
            </div>

            {product.badges && product.badges.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.badges.map((b, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="bg-amber-50 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                  >
                    {b}
                  </Badge>
                ))}
              </div>
            )}

            <div className="rounded-xl border bg-gray-50/50 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="text-muted-foreground text-xs font-medium">Giá bán</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-bold text-red-600 dark:text-red-500">{product.price.toLocaleString('vi-VN')}₫</span>
                {product.comparePrice && product.comparePrice > product.price && (
                  <>
                    <span className="text-xs text-gray-400 line-through">{product.comparePrice.toLocaleString('vi-VN')}₫</span>
                    <Badge variant="destructive" className="text-[10px]">
                      -{discountPercent}%
                    </Badge>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border p-3 dark:border-white/10">
                <div className="text-muted-foreground">Tồn kho hiện tại</div>
                <div className="mt-1 text-base font-bold text-gray-900 dark:text-white">{product.stock} sản phẩm</div>
              </div>

              <div className="rounded-lg border p-3 dark:border-white/10">
                <div className="text-muted-foreground">Đã bán ra</div>
                <div className="mt-1 text-base font-bold text-gray-900 dark:text-white">{product.sold} đơn</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 border-t pt-4 dark:border-white/10">
          <h3 className="mb-2 text-xs font-bold text-gray-900 dark:text-white">Mô tả sản phẩm</h3>
          <div className="max-h-[200px] min-h-[100px] overflow-y-auto rounded-xl border bg-gray-50/50 p-4 text-xs dark:border-white/10 dark:bg-white/5 dark:text-gray-200">
            {product.description ? (
              <div
                dangerouslySetInnerHTML={{ __html: product.description }}
                className="prose prose-xs dark:prose-invert max-w-none"
              />
            ) : (
              <p className="text-muted-foreground italic">Chưa có mô tả chi tiết.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

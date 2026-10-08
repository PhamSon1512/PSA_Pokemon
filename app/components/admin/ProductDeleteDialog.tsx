import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog';
import { Button } from '~/components/ui/button';

export interface DeleteProductTarget {
  id: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
}

interface ProductDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: DeleteProductTarget | null;
  onConfirm: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export function ProductDeleteDialog({ open, onOpenChange, product, onConfirm, isLoading = false }: ProductDeleteDialogProps) {
  if (!product) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md rounded-2xl border-red-200 p-6 dark:border-red-900/40">
        <AlertDialogHeader>
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <AlertDialogTitle className="text-center text-xl font-extrabold text-gray-900 dark:text-white">
            Cảnh báo Xóa Mềm Sản phẩm
          </AlertDialogTitle>

          <AlertDialogDescription className="text-muted-foreground mt-2 text-center text-sm">
            Bạn có chắc chắn muốn ẩn và đưa sản phẩm này vào danh sách lưu trữ không?
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Product Preview Card */}
        <div className="my-4 flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-white/10 dark:bg-white/5">
          {product.image ? (
            <img src={product.image} alt={product.name} className="h-12 w-12 rounded-lg border object-cover" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200 font-bold text-gray-500 dark:bg-white/10">
              IMG
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-sm font-bold text-gray-900 dark:text-white">{product.name}</h4>
            <div className="text-muted-foreground mt-0.5 flex items-center gap-3 text-xs">
              <span className="font-semibold text-red-600">{product.price.toLocaleString('vi-VN')}₫</span>
              <span>• Tồn kho: {product.stock}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
          💡 <strong>Lưu ý về Xóa Mềm:</strong> Sản phẩm sẽ lập tức bị ẩn khỏi trang bán hàng công khai. Dữ liệu đơn hàng lịch sử
          liên quan đến sản phẩm này vẫn được giữ nguyên toàn vẹn trong hệ thống.
        </div>

        <AlertDialogFooter className="mt-6 flex gap-2 sm:justify-end">
          <AlertDialogCancel disabled={isLoading} className="rounded-xl border-gray-200 font-bold">
            Hủy bỏ
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={isLoading}
            onClick={() => onConfirm(product.id)}
            className="gap-2 rounded-xl bg-red-600 font-bold hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4" />
            {isLoading ? 'Đang xử lý...' : 'Xác nhận xóa mềm'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

import type { Route } from './+types/_index';
import type { DeleteProductTarget } from '~/components/admin/ProductDeleteDialog';
import type { ProductDetailData } from '~/components/admin/ProductDetailDialog';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { ChevronLeft, ChevronRight, Edit, Eye, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import xior from 'xior';
import { getDb } from '~/.server/db';
import { requireAuthSession } from '~/.server/guard';
import { listAdminProducts } from '~/.server/services/product.service';
import { ProductDeleteDialog } from '~/components/admin/ProductDeleteDialog';
import { ProductDetailDialog } from '~/components/admin/ProductDetailDialog';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';

/* ─────────────────────── Loader ─────────────────────── */
export async function loader({ request, context }: Route.LoaderArgs) {
  await requireAuthSession(request, context);
  const db = getDb(context);
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const pageSize = Math.min(100, Math.max(5, parseInt(url.searchParams.get('pageSize') || '20', 10)));
  const search = url.searchParams.get('search') || '';
  const category = url.searchParams.get('category') || 'all';
  const status = url.searchParams.get('status') || 'all';
  const sortBy = url.searchParams.get('sortBy') || 'newest';

  const result = await listAdminProducts(db, { page, pageSize, search, category, status, sortBy });
  return { ...result, search, category, status, sortBy };
}

/* ─────────────────────── Helpers ─────────────────────── */
function getStatusBadge(status: string) {
  switch (status) {
    case 'ACTIVE':
      return (
        <Badge className="border-0 bg-emerald-50 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
          Đang bán
        </Badge>
      );
    case 'DRAFT':
      return (
        <Badge variant="secondary" className="bg-gray-100 text-xs font-semibold text-gray-700 dark:bg-white/10 dark:text-gray-300">
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
}

/* ─────────────────────── Page ─────────────────────── */
export default function AdminProductsList({ loaderData }: Route.ComponentProps) {
  const { products, total, page, pageSize, totalPages, search, category, status, sortBy } = loaderData as any;

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Local search state with debounce
  const [localSearch, setLocalSearch] = useState(search);

  // Debounce search navigation
  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (localSearch) {
        params.set('search', localSearch);
      } else {
        params.delete('search');
      }
      params.set('page', '1');
      navigate(`?${params.toString()}`, { replace: true });
    }, 350);
    return () => clearTimeout(t);
  }, [localSearch]);

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      if (value && value !== 'all') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.set('page', '1');
      navigate(`?${params.toString()}`);
    },
    [searchParams, navigate],
  );

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(p));
    navigate(`?${params.toString()}`);
  };

  // Modal states
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState<ProductDetailData | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<DeleteProductTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenDetail = (product: any) => {
    setSelectedProductDetail(product);
    setDetailOpen(true);
  };

  const handleOpenDelete = (product: any) => {
    setDeletingProduct({
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      image: product.images?.[0] || product.image,
    });
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const client = xior.create({ baseURL: '/api' });
      await client.delete(`/admin/products/${id}`);
      toast.success('Đã ẩn (xóa mềm) sản phẩm thành công!');
      setDeleteOpen(false);
      navigate(0); // revalidate
    } catch {
      toast.error('Có lỗi xảy ra khi xóa sản phẩm');
    } finally {
      setIsDeleting(false);
    }
  };

  const pageStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const pageEnd = Math.min(page * pageSize, total);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6 pb-12">
        {/* Top Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-white">Quản lý Sản phẩm</h1>
              <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400">
                CardVault CMS
              </span>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">Danh sách sản phẩm, thiết lập giá bán & tối ưu hóa tìm kiếm SEO.</p>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(0)}
                  className="h-9 w-9 cursor-pointer rounded-lg border border-gray-200 bg-white text-gray-700 transition-colors hover:border-amber-500 hover:bg-amber-50 hover:text-amber-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-amber-500/10 dark:hover:text-amber-400"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Làm mới dữ liệu</p>
              </TooltipContent>
            </Tooltip>

            <Button
              asChild
              className="h-9 cursor-pointer gap-2 rounded-lg bg-amber-500 px-4 text-xs font-semibold text-white shadow-xs hover:bg-amber-600"
            >
              <Link to="/admin/products/new">
                <Plus className="h-4 w-4" /> Thêm sản phẩm mới
              </Link>
            </Button>
          </div>
        </div>

        {/* Table & Controls */}
        <Card className="overflow-hidden rounded-xl border-0 shadow-sm dark:bg-[#161b22]">
          {/* Filters row */}
          <div className="bg-gray-50/50 p-4 dark:bg-white/5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Search */}
              <div className="group relative w-full max-w-sm sm:w-64 sm:flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transition-colors group-focus-within:text-amber-500 group-hover:text-amber-500" />
                <Input
                  placeholder="Tìm theo tên, slug, danh mục..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="h-9 rounded-lg pl-9 text-xs"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Category filter */}
                <Select value={category} onValueChange={(v) => updateParam('category', v)}>
                  <SelectTrigger className="h-9 w-[190px] rounded-lg text-xs hover:border-amber-500 focus:ring-amber-500">
                    <SelectValue placeholder="Tất cả danh mục" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="all" className="cursor-pointer text-xs">
                      Tất cả danh mục
                    </SelectItem>
                    <SelectItem value="Mystery Bag" className="cursor-pointer text-xs">
                      Túi Mù (Mystery Bag)
                    </SelectItem>
                    <SelectItem value="Pokemon TCG" className="cursor-pointer text-xs">
                      Pokemon TCG
                    </SelectItem>
                    <SelectItem value="One Piece TCG" className="cursor-pointer text-xs">
                      One Piece TCG
                    </SelectItem>
                    <SelectItem value="Yu-Gi-Oh!" className="cursor-pointer text-xs">
                      Yu-Gi-Oh!
                    </SelectItem>
                    <SelectItem value="Phụ kiện bảo quản" className="cursor-pointer text-xs">
                      Phụ kiện bảo quản
                    </SelectItem>
                    <SelectItem value="Thẻ nguyên bản" className="cursor-pointer text-xs">
                      Thẻ nguyên bản
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Status filter */}
                <Select value={status} onValueChange={(v) => updateParam('status', v)}>
                  <SelectTrigger className="h-9 w-[165px] rounded-lg text-xs hover:border-amber-500 focus:ring-amber-500">
                    <SelectValue placeholder="Tất cả trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="cursor-pointer text-xs">
                      Tất cả trạng thái
                    </SelectItem>
                    <SelectItem value="ACTIVE" className="cursor-pointer text-xs">
                      Đang bán
                    </SelectItem>
                    <SelectItem value="DRAFT" className="cursor-pointer text-xs">
                      Bản nháp
                    </SelectItem>
                    <SelectItem value="SOLD_OUT" className="cursor-pointer text-xs">
                      Hết hàng
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select value={sortBy} onValueChange={(v) => updateParam('sortBy', v)}>
                  <SelectTrigger className="h-9 w-[165px] rounded-lg text-xs hover:border-amber-500 focus:ring-amber-500">
                    <SelectValue placeholder="Sắp xếp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest" className="cursor-pointer text-xs">
                      Mới nhất
                    </SelectItem>
                    <SelectItem value="price-asc" className="cursor-pointer text-xs">
                      Giá tăng dần
                    </SelectItem>
                    <SelectItem value="price-desc" className="cursor-pointer text-xs">
                      Giá giảm dần
                    </SelectItem>
                    <SelectItem value="stock-desc" className="cursor-pointer text-xs">
                      Tồn kho nhiều nhất
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-muted-foreground border-y border-gray-200/80 bg-gray-50/80 text-[11px] font-semibold uppercase dark:border-white/10 dark:bg-white/5">
                  <tr>
                    <th className="w-12 px-4 py-3 text-center">STT</th>
                    <th className="px-4 py-3">Sản phẩm</th>
                    <th className="px-4 py-3">Danh mục & Nhãn</th>
                    <th className="px-4 py-3">Giá bán (VNĐ)</th>
                    <th className="px-4 py-3">Tồn kho / Đã bán</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white dark:divide-white/5 dark:bg-transparent">
                  {products.map((product: any, index: number) => {
                    const coverImage = product.images?.[0] || product.image;
                    const discountPercent =
                      product.comparePrice && product.comparePrice > product.price
                        ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
                        : 0;

                    return (
                      <tr key={product.id} className="transition-colors hover:bg-gray-50/80 dark:hover:bg-white/5">
                        <td className="text-muted-foreground px-4 py-3 text-center font-mono font-medium">{pageStart + index}</td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              onClick={() => handleOpenDetail(product)}
                              className="h-12 w-12 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-white/10 dark:bg-white/5"
                            >
                              {coverImage ? (
                                <img src={coverImage} alt={product.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-[10px] font-medium text-gray-400">
                                  NO IMG
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <h3
                                onClick={() => handleOpenDetail(product)}
                                className="line-clamp-2 cursor-pointer font-semibold text-gray-900 hover:text-amber-600 dark:text-white"
                                title={product.name}
                              >
                                {product.name}
                              </h3>
                              <div className="text-muted-foreground mt-0.5 font-mono text-[11px]">/{product.slug}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <div className="font-semibold text-gray-700 dark:text-gray-300">
                              {product.category || 'Chưa phân loại'}
                            </div>
                            {product.badges && product.badges.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {product.badges.slice(0, 2).map((b: string, i: number) => (
                                  <span
                                    key={i}
                                    className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                                  >
                                    {b}
                                  </span>
                                ))}
                                {product.badges.length > 2 && (
                                  <span className="text-muted-foreground text-[10px]">+{product.badges.length - 2}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-bold text-red-600 dark:text-red-500">{product.price.toLocaleString('vi-VN')}₫</div>
                          {product.comparePrice && product.comparePrice > product.price && (
                            <div className="flex items-center gap-1 text-[11px]">
                              <span className="text-gray-400 line-through">{product.comparePrice.toLocaleString('vi-VN')}₫</span>
                              <span className="font-semibold text-red-500">-{discountPercent}%</span>
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900 dark:text-white">Tồn: {product.stock}</div>
                          <div className="text-muted-foreground text-[11px]">Đã bán: {product.sold}</div>
                        </td>

                        <td className="px-4 py-3">{getStatusBadge(product.status)}</td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-lg hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30"
                                  onClick={() => handleOpenDetail(product)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p>Xem chi tiết</p>
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  asChild
                                  className="h-8 w-8 rounded-lg hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/30"
                                >
                                  <Link to={`/admin/products/${product.id}/edit`}>
                                    <Edit className="h-4 w-4" />
                                  </Link>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p>Chỉnh sửa sản phẩm</p>
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"
                                  onClick={() => handleOpenDelete(product)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p>Xóa mềm sản phẩm</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {products.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-muted-foreground py-16 text-center">
                        Không tìm thấy sản phẩm phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Pagination Footer ── */}
            <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row dark:border-white/10">
              {/* Info */}
              <p className="text-muted-foreground text-xs">
                {total === 0 ? (
                  'Không có sản phẩm nào'
                ) : (
                  <>
                    Hiển thị{' '}
                    <span className="font-semibold text-gray-700 dark:text-white">
                      {pageStart}–{pageEnd}
                    </span>{' '}
                    trong tổng số <span className="font-semibold text-gray-700 dark:text-white">{total}</span> sản phẩm
                  </>
                )}
              </p>

              {/* Navigation */}
              <div className="flex items-center gap-2">
                {/* Page size */}
                <Select value={String(pageSize)} onValueChange={(v) => updateParam('pageSize', v)}>
                  <SelectTrigger className="h-8 w-[100px] rounded-lg text-[11px] hover:border-amber-500 focus:ring-amber-500 dark:border-white/10 dark:bg-white/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10" className="cursor-pointer text-xs">
                      10 / trang
                    </SelectItem>
                    <SelectItem value="20" className="cursor-pointer text-xs">
                      20 / trang
                    </SelectItem>
                    <SelectItem value="50" className="cursor-pointer text-xs">
                      50 / trang
                    </SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg border border-gray-200 dark:border-white/10"
                    disabled={page <= 1 || total === 0}
                    onClick={() => goToPage(page - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {/* Page numbers — show at least page 1 */}
                  {Array.from({ length: Math.max(1, Math.min(5, totalPages)) }, (_, i) => {
                    let p: number;
                    if (totalPages <= 5) {
                      p = i + 1;
                    } else if (page <= 3) {
                      p = i + 1;
                    } else if (page >= totalPages - 2) {
                      p = totalPages - 4 + i;
                    } else {
                      p = page - 2 + i;
                    }
                    return (
                      <Button
                        key={p}
                        variant={p === page ? 'default' : 'ghost'}
                        size="icon"
                        className={`h-8 w-8 rounded-lg text-xs ${
                          p === page ? 'bg-amber-500 text-white hover:bg-amber-600' : 'border border-gray-200 dark:border-white/10'
                        }`}
                        disabled={total === 0}
                        onClick={() => goToPage(p)}
                      >
                        {p}
                      </Button>
                    );
                  })}

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg border border-gray-200 dark:border-white/10"
                    disabled={page >= totalPages || total === 0}
                    onClick={() => goToPage(page + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <ProductDetailDialog open={detailOpen} onOpenChange={setDetailOpen} product={selectedProductDetail} />
        <ProductDeleteDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          product={deletingProduct}
          onConfirm={handleConfirmDelete}
          isLoading={isDeleting}
        />
      </div>
    </TooltipProvider>
  );
}

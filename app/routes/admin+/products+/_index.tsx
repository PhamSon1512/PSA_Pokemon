import type { Route } from './+types/_index';
import type { DeleteProductTarget } from '~/components/admin/ProductDeleteDialog';
import type { ProductDetailData } from '~/components/admin/ProductDetailDialog';
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Edit, Eye, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import xior from 'xior';
import { getDb } from '~/.server/db';
import { requireAuthSession } from '~/.server/guard';
import { listAdminProducts } from '~/.server/services/product.service';
import { ProductDeleteDialog } from '~/components/admin/ProductDeleteDialog';
import { ProductDetailDialog } from '~/components/admin/ProductDetailDialog';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';

export async function loader({ request, context }: Route.LoaderArgs) {
  await requireAuthSession(request, context);
  const db = getDb(context);
  const products = await listAdminProducts(db);
  return { products };
}

// Helper to remove Vietnamese diacritics for search
function normalizeText(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .trim();
}

export default function AdminProductsList({ loaderData }: Route.ComponentProps) {
  const { products: initialProducts } = loaderData;

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Modal / Dialog States
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState<ProductDetailData | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<DeleteProductTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRefresh = () => {
    window.location.reload();
  };

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
      window.location.reload();
    } catch (e) {
      toast.error('Có lỗi xảy ra khi xóa sản phẩm');
    } finally {
      setIsDeleting(false);
    }
  };

  // KPI Stats
  const kpiStats = useMemo(() => {
    const total = initialProducts.length;
    const active = initialProducts.filter((p) => p.status === 'ACTIVE').length;
    const lowStock = initialProducts.filter((p) => p.stock <= 5).length;
    const totalInventoryValue = initialProducts.reduce((sum, p) => sum + p.price * p.stock, 0);

    return { total, active, lowStock, totalInventoryValue };
  }, [initialProducts]);

  // Real-time accent-insensitive Vietnamese search & filtering
  const filteredProducts = useMemo(() => {
    const q = normalizeText(searchQuery);

    return initialProducts
      .filter((p) => {
        if (q) {
          const matchName = normalizeText(p.name).includes(q);
          const matchSlug = normalizeText(p.slug).includes(q);
          const matchCategory = normalizeText(p.category || '').includes(q);
          const matchBadges = p.badges?.some((b) => normalizeText(b).includes(q));
          if (!matchName && !matchSlug && !matchCategory && !matchBadges) return false;
        }

        if (selectedCategory !== 'all' && p.category !== selectedCategory) {
          return false;
        }

        if (selectedStatus !== 'all' && p.status !== selectedStatus) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'stock-desc') return b.stock - a.stock;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [initialProducts, searchQuery, selectedCategory, selectedStatus, sortBy]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Badge className="border-0 bg-emerald-50 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
            Đang bán
          </Badge>
        );
      case 'DRAFT':
        return (
          <Badge
            variant="secondary"
            className="bg-gray-100 text-xs font-semibold text-gray-700 dark:bg-white/10 dark:text-gray-300"
          >
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
                  onClick={handleRefresh}
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

        {/* Clean KPI Overview */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-xl border-0 shadow-sm dark:bg-[#161b22]">
            <CardContent className="p-4">
              <div className="text-muted-foreground text-xs font-medium">Tổng sản phẩm</div>
              <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{kpiStats.total}</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 shadow-sm dark:bg-[#161b22]">
            <CardContent className="p-4">
              <div className="text-muted-foreground text-xs font-medium">Đang bán công khai</div>
              <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{kpiStats.active}</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 shadow-sm dark:bg-[#161b22]">
            <CardContent className="p-4">
              <div className="text-muted-foreground text-xs font-medium">Cảnh báo tồn kho thấp</div>
              <div className="mt-1 text-2xl font-bold text-red-600 dark:text-red-500">{kpiStats.lowStock}</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 shadow-sm dark:bg-[#161b22]">
            <CardContent className="p-4">
              <div className="text-muted-foreground text-xs font-medium">Giá trị kho ước tính</div>
              <div className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                {kpiStats.totalInventoryValue.toLocaleString('vi-VN')}₫
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table & Controls */}
        <Card className="overflow-hidden rounded-xl border-0 shadow-sm dark:bg-[#161b22]">
          <div className="bg-gray-50/50 p-4 dark:bg-white/5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Auto Search Input */}
              <div className="group relative w-full max-w-sm sm:w-64 sm:flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transition-colors group-focus-within:text-amber-500 group-hover:text-amber-500" />
                <Input
                  placeholder="Tìm theo tên, slug, nhãn..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 rounded-lg pl-9 text-xs transition-colors hover:border-amber-500 focus-visible:border-amber-500 focus-visible:ring-amber-500/20"
                />
              </div>

              {/* Enhanced Dropdowns sitting on same row */}
              <div className="flex items-center gap-2 overflow-x-auto">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="h-9 w-[170px] rounded-lg text-xs hover:border-amber-500 focus:ring-amber-500">
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

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-9 w-[175px] rounded-lg text-xs hover:border-amber-500 focus:ring-amber-500">
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
                  {filteredProducts.map((product, index) => {
                    const coverImage = product.images?.[0] || product.image;
                    const discountPercent =
                      product.comparePrice && product.comparePrice > product.price
                        ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
                        : 0;

                    return (
                      <tr key={product.id} className="transition-colors hover:bg-gray-50/80 dark:hover:bg-white/5">
                        {/* Column 0: STT */}
                        <td className="text-muted-foreground px-4 py-3 text-center font-mono font-medium">{index + 1}</td>

                        {/* Column 1: Image & Name */}
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

                        {/* Column 2: Category & Badges */}
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <div className="font-semibold text-gray-700 dark:text-gray-300">
                              {product.category || 'Chưa phân loại'}
                            </div>
                            {product.badges && product.badges.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {product.badges.slice(0, 2).map((b, i) => (
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

                        {/* Column 3: Price */}
                        <td className="px-4 py-3">
                          <div className="font-bold text-red-600 dark:text-red-500">{product.price.toLocaleString('vi-VN')}₫</div>
                          {product.comparePrice && product.comparePrice > product.price && (
                            <div className="flex items-center gap-1 text-[11px]">
                              <span className="text-gray-400 line-through">{product.comparePrice.toLocaleString('vi-VN')}₫</span>
                              <span className="font-semibold text-red-500">-{discountPercent}%</span>
                            </div>
                          )}
                        </td>

                        {/* Column 4: Stock & Sales */}
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900 dark:text-white">Tồn: {product.stock}</div>
                          <div className="text-muted-foreground text-[11px]">Đã bán: {product.sold}</div>
                        </td>

                        {/* Column 5: Status */}
                        <td className="px-4 py-3">{getStatusBadge(product.status)}</td>

                        {/* Column 6: Actions with Tooltips */}
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

                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-muted-foreground py-12 text-center">
                        Không tìm thấy sản phẩm phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Product Detail Dialog */}
        <ProductDetailDialog open={detailOpen} onOpenChange={setDetailOpen} product={selectedProductDetail} />

        {/* Soft Delete Warning Modal */}
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

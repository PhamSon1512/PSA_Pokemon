import type { Route } from './+types/_index';
import { useMemo, useState } from 'react';
import { useRevalidator } from 'react-router';
import { useForm } from '@mantine/form';
import { ChevronLeft, ChevronRight, Edit, FolderOpen, Hash, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import xior from 'xior';
import { getDb } from '~/.server/db';
import { requireAuthSession } from '~/.server/guard';
import { listCategoriesWithCount } from '~/.server/services/category.service';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Textarea } from '~/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';

/* ─────────────────────── Slug helper ─────────────────────── */
function generateSlug(text: string, maxLen = 80): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, maxLen)
    .replace(/-$/, '');
}

/* ─────────────────────── Loader ─────────────────────── */
export async function loader({ request, context }: Route.LoaderArgs) {
  await requireAuthSession(request, context);
  const db = getDb(context);
  const categories = await listCategoriesWithCount(db);
  return { categories };
}

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date | null;
  productCount: number;
};

interface CategoryFormValues {
  name: string;
  slug: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
}

/* ─────────────────────── Page ─────────────────────── */
const PAGE_SIZE = 10;

export default function AdminCategoriesPage({ loaderData }: Route.ComponentProps) {
  const { categories } = loaderData as { categories: CategoryRow[] };
  const { revalidate } = useRevalidator();

  /* ── Pagination ── */
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(categories.length / PAGE_SIZE);

  const pagedCategories = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return categories.slice(start, start + PAGE_SIZE);
  }, [categories, currentPage]);

  /* ── Create dialog ── */
  const [createOpen, setCreateOpen] = useState(false);
  const createForm = useForm<CategoryFormValues>({
    initialValues: { name: '', slug: '', description: '', status: 'ACTIVE' },
    validate: {
      name: (v) => (!v.trim() ? 'Tên danh mục không được để trống' : null),
      slug: (v) =>
        !v.trim()
          ? 'Đường dẫn không được để trống'
          : !/^[a-z0-9-]+$/.test(v)
            ? 'Slug chỉ gồm chữ thường, số và dấu gạch ngang'
            : null,
    },
  });

  /* ── Edit dialog ── */
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CategoryRow | null>(null);
  const editForm = useForm<CategoryFormValues>({
    initialValues: { name: '', slug: '', description: '', status: 'ACTIVE' },
    validate: {
      name: (v) => (!v.trim() ? 'Tên danh mục không được để trống' : null),
      slug: (v) =>
        !v.trim()
          ? 'Đường dẫn không được để trống'
          : !/^[a-z0-9-]+$/.test(v)
            ? 'Slug chỉ gồm chữ thường, số và dấu gạch ngang'
            : null,
    },
  });

  /* ── Delete dialog ── */
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CategoryRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ── Handlers ── */
  const handleCreate = createForm.onSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      const client = xior.create({ baseURL: '/api' });
      await client.post('/admin/categories', values);
      toast.success('Đã thêm danh mục thành công!');
      setCreateOpen(false);
      createForm.reset();
      revalidate();
    } catch {
      toast.error('Có lỗi xảy ra khi thêm danh mục');
    } finally {
      setIsSubmitting(false);
    }
  });

  const openEdit = (cat: CategoryRow) => {
    setEditTarget(cat);
    editForm.setValues({ name: cat.name, slug: cat.slug, description: cat.description ?? '', status: cat.status });
    setEditOpen(true);
  };

  const handleEdit = editForm.onSubmit(async (values) => {
    if (!editTarget) return;
    setIsSubmitting(true);
    try {
      const client = xior.create({ baseURL: '/api' });
      await client.put(`/admin/categories/${editTarget.id}`, values);
      toast.success('Đã cập nhật danh mục!');
      setEditOpen(false);
      revalidate();
    } catch {
      toast.error('Có lỗi xảy ra khi cập nhật danh mục');
    } finally {
      setIsSubmitting(false);
    }
  });

  const openDelete = (cat: CategoryRow) => {
    setDeleteTarget(cat);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const client = xior.create({ baseURL: '/api' });
      await client.delete(`/admin/categories/${deleteTarget.id}`);
      toast.success('Đã xóa danh mục!');
      setDeleteOpen(false);
      revalidate();
    } catch {
      toast.error('Lỗi khi xóa danh mục');
    } finally {
      setIsDeleting(false);
    }
  };

  /* ── Render ── */
  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-white">Quản lý Danh mục</h1>
              <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400">
                {categories.length} danh mục
              </span>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">Thiết lập và quản lý các danh mục sản phẩm.</p>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => revalidate()}
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
              onClick={() => {
                createForm.reset();
                setCreateOpen(true);
              }}
              className="h-9 cursor-pointer gap-2 rounded-lg bg-amber-500 px-4 text-xs font-semibold text-white shadow-xs hover:bg-amber-600"
            >
              <Plus className="h-4 w-4" /> Thêm danh mục
            </Button>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="rounded-xl border-0 shadow-sm dark:bg-[#161b22]">
            <CardContent className="p-4">
              <div className="text-muted-foreground text-xs font-medium">Tổng danh mục</div>
              <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{categories.length}</div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-0 shadow-sm dark:bg-[#161b22]">
            <CardContent className="p-4">
              <div className="text-muted-foreground text-xs font-medium">Có sản phẩm</div>
              <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {categories.filter((c) => c.productCount > 0).length}
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-0 shadow-sm dark:bg-[#161b22]">
            <CardContent className="p-4">
              <div className="text-muted-foreground text-xs font-medium">Chưa có sản phẩm</div>
              <div className="mt-1 text-2xl font-bold text-gray-400">{categories.filter((c) => c.productCount === 0).length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card className="overflow-hidden rounded-xl border-0 shadow-sm dark:bg-[#161b22]">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-muted-foreground border-y border-gray-200/80 bg-gray-50/80 text-[11px] font-semibold uppercase dark:border-white/10 dark:bg-white/5">
                  <tr>
                    <th className="w-12 px-4 py-3 text-center">STT</th>
                    <th className="px-4 py-3">Tên danh mục</th>
                    <th className="px-4 py-3">Đường dẫn (Slug)</th>
                    <th className="px-4 py-3 text-center">Trạng thái</th>
                    <th className="px-4 py-3">Mô tả</th>
                    <th className="px-4 py-3 text-center">Sản phẩm</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white dark:divide-white/5 dark:bg-transparent">
                  {pagedCategories.map((cat, index) => (
                    <tr key={cat.id} className="transition-colors hover:bg-gray-50/80 dark:hover:bg-white/5">
                      <td className="text-muted-foreground px-4 py-3 text-center font-mono font-medium">
                        {(currentPage - 1) * PAGE_SIZE + index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-500/10">
                            <FolderOpen className="h-4 w-4 text-amber-500" />
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white">{cat.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 font-mono text-[11px] text-gray-600 dark:bg-white/10 dark:text-gray-400">
                          <Hash className="h-2.5 w-2.5" />
                          {cat.slug}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {cat.status === 'ACTIVE' ? (
                          <Badge className="border-0 bg-emerald-50 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                            Hoạt động
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-gray-100 text-[11px] font-semibold text-gray-700 dark:bg-white/10 dark:text-gray-300"
                          >
                            Ẩn
                          </Badge>
                        )}
                      </td>
                      <td className="text-muted-foreground max-w-[200px] truncate px-4 py-3 text-[11px]">
                        {cat.description || <span className="italic opacity-50">Chưa có mô tả</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          className={`text-[11px] font-semibold ${
                            cat.productCount > 0
                              ? 'border-0 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                              : 'border border-gray-200 bg-gray-50 text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-400'
                          }`}
                        >
                          {cat.productCount}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/30"
                                onClick={() => openEdit(cat)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p>Chỉnh sửa danh mục</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"
                                onClick={() => openDelete(cat)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p>Xóa danh mục</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {categories.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-muted-foreground py-16 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <FolderOpen className="h-8 w-8 opacity-30" />
                          <p>Chưa có danh mục nào. Hãy thêm danh mục đầu tiên!</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Pagination Footer ── */}
            <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row dark:border-white/10">
              <p className="text-muted-foreground text-xs">
                {categories.length === 0 ? (
                  'Chưa có danh mục nào'
                ) : (
                  <>
                    Hiển thị{' '}
                    <span className="font-semibold text-gray-700 dark:text-white">
                      {Math.min((currentPage - 1) * PAGE_SIZE + 1, categories.length)}–
                      {Math.min(currentPage * PAGE_SIZE, categories.length)}
                    </span>{' '}
                    trong tổng số <span className="font-semibold text-gray-700 dark:text-white">{categories.length}</span> danh mục
                  </>
                )}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg border border-gray-200 dark:border-white/10"
                  disabled={currentPage <= 1 || categories.length === 0}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.max(1, Math.min(5, totalPages)) }, (_, i) => {
                  const p =
                    totalPages <= 5
                      ? i + 1
                      : currentPage <= 3
                        ? i + 1
                        : currentPage >= totalPages - 2
                          ? totalPages - 4 + i
                          : currentPage - 2 + i;
                  return (
                    <Button
                      key={p}
                      size="icon"
                      disabled={categories.length === 0}
                      className={`h-8 w-8 rounded-lg text-xs ${
                        p === currentPage
                          ? 'bg-amber-500 text-white hover:bg-amber-600'
                          : 'border border-gray-200 bg-white text-gray-700 hover:border-amber-500 hover:bg-amber-50 dark:border-white/10 dark:bg-transparent dark:text-gray-300'
                      }`}
                      onClick={() => setCurrentPage(p)}
                    >
                      {p}
                    </Button>
                  );
                })}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg border border-gray-200 dark:border-white/10"
                  disabled={currentPage >= totalPages || categories.length === 0}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Create Dialog ── */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-amber-500" />
                Thêm danh mục mới
              </DialogTitle>
              <DialogDescription>Tạo danh mục để phân loại sản phẩm trong cửa hàng.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Tên danh mục <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Ví dụ: Pokemon TCG, Phụ kiện bảo quản..."
                  {...createForm.getInputProps('name')}
                  onChange={(e) => {
                    createForm.setFieldValue('name', e.target.value);
                    createForm.setFieldValue('slug', generateSlug(e.target.value));
                  }}
                />
                {createForm.errors.name && <p className="text-[11px] font-medium text-red-500">{createForm.errors.name}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Đường dẫn (Slug) <span className="text-red-500">*</span>
                </Label>
                <Input placeholder="pokemon-tcg" {...createForm.getInputProps('slug')} className="font-mono text-xs" />
                {createForm.errors.slug && <p className="text-[11px] font-medium text-red-500">{createForm.errors.slug}</p>}
                <p className="text-muted-foreground text-[11px]">Tự động sinh từ tên. Chỉ gồm chữ thường, số và dấu -</p>
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">Trạng thái</Label>
                <Select
                  value={createForm.values.status}
                  onValueChange={(v) => createForm.setFieldValue('status', v as 'ACTIVE' | 'INACTIVE')}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE" className="text-xs">
                      Hiển thị (Hoạt động)
                    </SelectItem>
                    <SelectItem value="INACTIVE" className="text-xs">
                      Ẩn (Không hoạt động)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">Mô tả (Tùy chọn)</Label>
                <Textarea
                  placeholder="Mô tả ngắn về danh mục này..."
                  rows={3}
                  {...createForm.getInputProps('description')}
                  className="resize-none text-xs"
                />
              </div>

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-amber-500 text-white hover:bg-amber-600">
                  {isSubmitting ? 'Đang lưu...' : 'Tạo danh mục'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ── Edit Dialog ── */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-4 w-4 text-amber-500" />
                Chỉnh sửa danh mục
              </DialogTitle>
              <DialogDescription>Cập nhật thông tin cho danh mục "{editTarget?.name}".</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4 pt-2">
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Tên danh mục <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Tên danh mục..."
                  {...editForm.getInputProps('name')}
                  onChange={(e) => {
                    editForm.setFieldValue('name', e.target.value);
                    editForm.setFieldValue('slug', generateSlug(e.target.value));
                  }}
                />
                {editForm.errors.name && <p className="text-[11px] font-medium text-red-500">{editForm.errors.name}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Đường dẫn (Slug) <span className="text-red-500">*</span>
                </Label>
                <Input placeholder="slug-danh-muc" {...editForm.getInputProps('slug')} className="font-mono text-xs" />
                {editForm.errors.slug && <p className="text-[11px] font-medium text-red-500">{editForm.errors.slug}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">Trạng thái</Label>
                <Select
                  value={editForm.values.status}
                  onValueChange={(v) => editForm.setFieldValue('status', v as 'ACTIVE' | 'INACTIVE')}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE" className="text-xs">
                      Hiển thị (Hoạt động)
                    </SelectItem>
                    <SelectItem value="INACTIVE" className="text-xs">
                      Ẩn (Không hoạt động)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">Mô tả (Tùy chọn)</Label>
                <Textarea
                  placeholder="Mô tả ngắn về danh mục..."
                  rows={3}
                  {...editForm.getInputProps('description')}
                  className="resize-none text-xs"
                />
              </div>

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-amber-500 text-white hover:bg-amber-600">
                  {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ── Delete Confirm Dialog ── */}
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-4 w-4" />
                Xóa danh mục
              </DialogTitle>
              <DialogDescription className="pt-1">
                Bạn có chắc muốn xóa danh mục{' '}
                <span className="font-semibold text-gray-900 dark:text-white">"{deleteTarget?.name}"</span>?
                {deleteTarget && deleteTarget.productCount > 0 && (
                  <span className="mt-2 block rounded-lg border border-amber-200 bg-amber-50 p-2 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400">
                    ⚠️ Danh mục này đang có <strong>{deleteTarget.productCount} sản phẩm</strong>. Sản phẩm sẽ không bị xóa nhưng sẽ
                    mất phân loại danh mục.
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                Hủy
              </Button>
              <Button variant="destructive" disabled={isDeleting} onClick={handleDelete} className="gap-2">
                {isDeleting ? (
                  'Đang xóa...'
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" /> Xóa danh mục
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

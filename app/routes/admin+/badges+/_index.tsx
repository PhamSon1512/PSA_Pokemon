import type { Route } from './+types/_index';
import { useMemo, useState } from 'react';
import { useRevalidator } from 'react-router';
import { useForm } from '@mantine/form';
import { ChevronLeft, ChevronRight, Edit, Plus, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import xior from 'xior';
import { getDb } from '~/.server/db';
import { requireAuthSession } from '~/.server/guard';
import { listBadges } from '~/.server/services/badge.service';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';

/* ─────────────────────── Color Presets ─────────────────────── */
const COLOR_PRESETS = [
  { label: 'Đỏ', value: '#ef4444' },
  { label: 'Cam', value: '#f97316' },
  { label: 'Vàng', value: '#f59e0b' },
  { label: 'Vàng nhạt', value: '#eab308' },
  { label: 'Xanh lá', value: '#22c55e' },
  { label: 'Ngọc', value: '#10b981' },
  { label: 'Xanh dương', value: '#3b82f6' },
  { label: 'Tím dương', value: '#6366f1' },
  { label: 'Tím', value: '#a855f7' },
  { label: 'Hồng', value: '#ec4899' },
  { label: 'Hồng nhạt', value: '#f43f5e' },
  { label: 'Xám', value: '#6b7280' },
];

/* ─────────────────────── Loader ─────────────────────── */
export async function loader({ request, context }: Route.LoaderArgs) {
  await requireAuthSession(request, context);
  const db = getDb(context);
  const badges = await listBadges(db);
  return { badges };
}

type BadgeRow = {
  id: string;
  name: string;
  color: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date | null;
};

interface BadgeFormValues {
  name: string;
  color: string;
  status: 'ACTIVE' | 'INACTIVE';
}

/* ─────────────────────── Badge Preview ─────────────────────── */
function BadgePreview({ name, color }: { name: string; color: string }) {
  const displayName = name || 'Nhãn mẫu';
  const bg = color || '#f59e0b';

  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white shadow"
      style={{ backgroundColor: bg }}
    >
      {displayName}
    </span>
  );
}

/* ─────────────────────── Color Picker ─────────────────────── */
function ColorPicker({ value, onChange }: { value: string; onChange: (color: string) => void }) {
  return (
    <div className="space-y-2">
      {/* Preset swatches */}
      <div className="flex flex-wrap gap-2">
        {COLOR_PRESETS.map((preset) => (
          <Tooltip key={preset.value}>
            <TooltipTrigger asChild>
              <button
                type="button"
                className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${
                  value === preset.value ? 'scale-110 border-gray-900 dark:border-white' : 'border-transparent'
                }`}
                style={{ backgroundColor: preset.value }}
                onClick={() => onChange(preset.value)}
              />
            </TooltipTrigger>
            <TooltipContent side="top" className="text-[11px]">
              {preset.label}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
      {/* Custom hex input */}
      <div className="flex items-center gap-2">
        <div
          className="h-6 w-6 shrink-0 rounded-full border border-gray-200 dark:border-white/10"
          style={{ backgroundColor: value || '#f59e0b' }}
        />
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="#f59e0b" className="h-8 font-mono text-xs" />
      </div>
    </div>
  );
}

/* ─────────────────────── Page ─────────────────────── */
const PAGE_SIZE = 10;

export default function AdminBadgesPage({ loaderData }: Route.ComponentProps) {
  const { badges } = loaderData as { badges: BadgeRow[] };
  const { revalidate } = useRevalidator();

  /* ── Pagination ── */
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(badges.length / PAGE_SIZE);

  const pagedBadges = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return badges.slice(start, start + PAGE_SIZE);
  }, [badges, currentPage]);

  /* ── Create ── */
  const [createOpen, setCreateOpen] = useState(false);
  const createForm = useForm<BadgeFormValues>({
    initialValues: { name: '', color: '#f59e0b', status: 'ACTIVE' },
    validate: {
      name: (v) => (!v.trim() ? 'Tên nhãn không được để trống' : null),
    },
  });

  /* ── Edit ── */
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<BadgeRow | null>(null);
  const editForm = useForm<BadgeFormValues>({
    initialValues: { name: '', color: '#f59e0b', status: 'ACTIVE' },
    validate: {
      name: (v) => (!v.trim() ? 'Tên nhãn không được để trống' : null),
    },
  });

  /* ── Delete ── */
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BadgeRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ── Handlers ── */
  const handleCreate = createForm.onSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      const client = xior.create({ baseURL: '/api' });
      await client.post('/admin/badges', values);
      toast.success('Đã thêm nhãn thành công!');
      setCreateOpen(false);
      createForm.reset();
      revalidate();
    } catch {
      toast.error('Có lỗi xảy ra khi thêm nhãn');
    } finally {
      setIsSubmitting(false);
    }
  });

  const openEdit = (badge: BadgeRow) => {
    setEditTarget(badge);
    editForm.setValues({ name: badge.name, color: badge.color || '#f59e0b', status: badge.status });
    setEditOpen(true);
  };

  const handleEdit = editForm.onSubmit(async (values) => {
    if (!editTarget) return;
    setIsSubmitting(true);
    try {
      const client = xior.create({ baseURL: '/api' });
      await client.put(`/admin/badges/${editTarget.id}`, values);
      toast.success('Đã cập nhật nhãn!');
      setEditOpen(false);
      revalidate();
    } catch {
      toast.error('Có lỗi xảy ra khi cập nhật nhãn');
    } finally {
      setIsSubmitting(false);
    }
  });

  const openDelete = (badge: BadgeRow) => {
    setDeleteTarget(badge);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const client = xior.create({ baseURL: '/api' });
      await client.delete(`/admin/badges/${deleteTarget.id}`);
      toast.success('Đã xóa nhãn!');
      setDeleteOpen(false);
      revalidate();
    } catch {
      toast.error('Lỗi khi xóa nhãn');
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
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-white">Quản lý Nhãn nổi bật</h1>
              <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400">
                {badges.length} nhãn
              </span>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">Thiết lập nhãn hiển thị trên sản phẩm (HOT, NEW, SALE...).</p>
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
                createForm.setFieldValue('color', '#f59e0b');
                setCreateOpen(true);
              }}
              className="h-9 cursor-pointer gap-2 rounded-lg bg-amber-500 px-4 text-xs font-semibold text-white shadow-xs hover:bg-amber-600"
            >
              <Plus className="h-4 w-4" /> Thêm nhãn mới
            </Button>
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-2">
          <Card className="rounded-xl border-0 shadow-sm dark:bg-[#161b22]">
            <CardContent className="p-4">
              <div className="text-muted-foreground text-xs font-medium">Tổng nhãn</div>
              <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{badges.length}</div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-0 shadow-sm dark:bg-[#161b22]">
            <CardContent className="p-4">
              <div className="text-muted-foreground text-xs font-medium">Nhãn có màu</div>
              <div className="mt-1 text-2xl font-bold text-amber-500">{badges.filter((b) => b.color).length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Badges preview row */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
              <BadgePreview key={badge.id} name={badge.name} color={badge.color || '#f59e0b'} />
            ))}
          </div>
        )}

        {/* Table */}
        <Card className="overflow-hidden rounded-xl border-0 shadow-sm dark:bg-[#161b22]">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-muted-foreground border-y border-gray-200/80 bg-gray-50/80 text-[11px] font-semibold uppercase dark:border-white/10 dark:bg-white/5">
                  <tr>
                    <th className="w-12 px-4 py-3 text-center">STT</th>
                    <th className="px-4 py-3">Preview</th>
                    <th className="px-4 py-3">Tên nhãn</th>
                    <th className="px-4 py-3">Màu sắc</th>
                    <th className="px-4 py-3 text-center">Trạng thái</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white dark:divide-white/5 dark:bg-transparent">
                  {pagedBadges.map((badge, index) => (
                    <tr key={badge.id} className="transition-colors hover:bg-gray-50/80 dark:hover:bg-white/5">
                      <td className="text-muted-foreground px-4 py-3 text-center font-mono font-medium">
                        {(currentPage - 1) * PAGE_SIZE + index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <BadgePreview name={badge.name} color={badge.color || '#f59e0b'} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                            style={{ backgroundColor: `${badge.color || '#f59e0b'}20` }}
                          >
                            <ShieldCheck className="h-4 w-4" style={{ color: badge.color || '#f59e0b' }} />
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white">{badge.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-4 w-4 rounded-full border border-gray-200 dark:border-white/10"
                            style={{ backgroundColor: badge.color || '#f59e0b' }}
                          />
                          <span className="font-mono text-[11px] text-gray-500 dark:text-gray-400">{badge.color || '#f59e0b'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {badge.status === 'ACTIVE' ? (
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
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/30"
                                onClick={() => openEdit(badge)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p>Chỉnh sửa nhãn</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"
                                onClick={() => openDelete(badge)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p>Xóa nhãn</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {badges.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-muted-foreground py-16 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <ShieldCheck className="h-8 w-8 opacity-30" />
                          <p>Chưa có nhãn nào. Hãy tạo nhãn đầu tiên!</p>
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
                {badges.length === 0 ? (
                  'Chưa có nhãn nào'
                ) : (
                  <>
                    Hiển thị{' '}
                    <span className="font-semibold text-gray-700 dark:text-white">
                      {Math.min((currentPage - 1) * PAGE_SIZE + 1, badges.length)}–
                      {Math.min(currentPage * PAGE_SIZE, badges.length)}
                    </span>{' '}
                    trong tổng số <span className="font-semibold text-gray-700 dark:text-white">{badges.length}</span> nhãn
                  </>
                )}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg border border-gray-200 dark:border-white/10"
                  disabled={currentPage <= 1 || badges.length === 0}
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
                      disabled={badges.length === 0}
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
                  disabled={currentPage >= totalPages || badges.length === 0}
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
                Thêm nhãn mới
              </DialogTitle>
              <DialogDescription>Tạo nhãn để gắn lên sản phẩm nổi bật trong cửa hàng.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Tên nhãn <span className="text-red-500">*</span>
                </Label>
                <Input placeholder="Ví dụ: HOT, NEW, SALE, LIMITED..." {...createForm.getInputProps('name')} />
                {createForm.errors.name && <p className="text-[11px] font-medium text-red-500">{createForm.errors.name}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">Màu sắc</Label>
                <ColorPicker value={createForm.values.color} onChange={(c) => createForm.setFieldValue('color', c)} />
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

              {/* Live Preview */}
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">Xem trước</Label>
                <div className="flex min-h-[40px] items-center rounded-lg border border-gray-200 px-3 dark:border-white/10">
                  <BadgePreview name={createForm.values.name} color={createForm.values.color} />
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-amber-500 text-white hover:bg-amber-600">
                  {isSubmitting ? 'Đang lưu...' : 'Tạo nhãn'}
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
                Chỉnh sửa nhãn
              </DialogTitle>
              <DialogDescription>Cập nhật thông tin cho nhãn "{editTarget?.name}".</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4 pt-2">
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Tên nhãn <span className="text-red-500">*</span>
                </Label>
                <Input placeholder="Tên nhãn..." {...editForm.getInputProps('name')} />
                {editForm.errors.name && <p className="text-[11px] font-medium text-red-500">{editForm.errors.name}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">Màu sắc</Label>
                <ColorPicker value={editForm.values.color} onChange={(c) => editForm.setFieldValue('color', c)} />
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

              {/* Live Preview */}
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">Xem trước</Label>
                <div className="flex min-h-[40px] items-center rounded-lg border border-gray-200 px-3 dark:border-white/10">
                  <BadgePreview name={editForm.values.name} color={editForm.values.color} />
                </div>
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
                Xóa nhãn
              </DialogTitle>
              <DialogDescription className="pt-1">
                Bạn có chắc muốn xóa nhãn <BadgePreview name={deleteTarget?.name || ''} color={deleteTarget?.color || '#f59e0b'} />?
                Hành động này không thể hoàn tác.
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
                    <Trash2 className="h-3.5 w-3.5" /> Xóa nhãn
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

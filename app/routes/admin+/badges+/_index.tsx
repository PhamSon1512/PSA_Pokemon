import type { Route } from './+types/_index';
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import xior from 'xior';
import { getDb } from '~/.server/db';
import { requireAuthSession } from '~/.server/guard';
import { listBadges } from '~/.server/services/badge.service';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';

export async function loader({ request, context }: Route.LoaderArgs) {
  await requireAuthSession(request, context);
  const db = getDb(context);
  const badges = await listBadges(db);
  return { badges };
}

export default function AdminBadgesList({ loaderData }: Route.ComponentProps) {
  const { badges } = loaderData;
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const client = xior.create({ baseURL: '/api' });
      await client.post('/admin/badges', { name, color });
      toast.success('Đã thêm nhãn thành công!');
      setIsOpen(false);
      window.location.reload();
    } catch (e) {
      toast.error('Có lỗi xảy ra khi thêm nhãn');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa nhãn này?')) return;
    try {
      const client = xior.create({ baseURL: '/api' });
      await client.delete(`/admin/badges/${id}`);
      toast.success('Đã xóa nhãn!');
      window.location.reload();
    } catch (e) {
      toast.error('Lỗi khi xóa nhãn');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-white">
            Quản lý Nhãn Nổi Bật (Badges)
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Thiết lập các nhãn hiển thị cho sản phẩm.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="h-9 gap-2 rounded-lg bg-amber-500 px-4 text-xs font-semibold text-white hover:bg-amber-600">
              <Plus className="h-4 w-4" /> Thêm nhãn mới
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm nhãn mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Tên nhãn</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ví dụ: HOT, NEW, SALE..." required />
              </div>
              <div className="space-y-2">
                <Label>Màu sắc (Tùy chọn)</Label>
                <Input value={color} onChange={(e) => setColor(e.target.value)} placeholder="Ví dụ: #ef4444 hoặc red" />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting} className="bg-amber-500 text-white hover:bg-amber-600">
                  Lưu thay đổi
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-xl border border-gray-200 shadow-none dark:border-white/10 dark:bg-[#161b22]">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/80 dark:bg-white/5">
              <TableRow>
                <TableHead className="w-16 text-center">STT</TableHead>
                <TableHead>Tên nhãn</TableHead>
                <TableHead>Màu sắc</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {badges.map((badge, index) => (
                <TableRow key={badge.id}>
                  <TableCell className="text-muted-foreground text-center font-mono">{index + 1}</TableCell>
                  <TableCell className="font-semibold">{badge.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {badge.color && (
                        <div className="h-4 w-4 rounded-full border border-gray-200" style={{ backgroundColor: badge.color }} />
                      )}
                      <span className="text-muted-foreground font-mono text-xs">{badge.color || 'Mặc định'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:bg-red-50"
                      onClick={() => handleDelete(badge.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {badges.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground h-24 text-center">
                    Chưa có nhãn nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

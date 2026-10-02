import type { Route } from './+types/_index';
import { Link, useNavigate } from 'react-router';
import { Edit, Package, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { xior } from 'xior';
import { getDb } from '~/.server/db';
import { requireAuthSession } from '~/.server/guard';
import { listAdminCards } from '~/.server/services/card.service';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { store } from '~/lib/store';

export async function loader({ request, context }: Route.LoaderArgs) {
  await requireAuthSession(request, context);
  const db = getDb(context);
  const cards = await listAdminCards(db);
  return { cards };
}

export default function AdminProductsList({ loaderData }: Route.ComponentProps) {
  const { cards } = loaderData;
  const navigate = useNavigate();

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thẻ này?')) return;
    try {
      const client = xior.create({ baseURL: '/api' });
      await client.delete(`/admin/cards/${id}`, {
        headers: { Authorization: `Bearer ${store.token}` },
      });
      toast.success('Xóa thẻ thành công');
      window.location.reload();
    } catch (e) {
      toast.error('Lỗi khi xóa thẻ');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      case 'PENDING':
        return 'bg-amber-100 text-amber-800';
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Hoạt động';
      case 'INACTIVE':
        return 'Không hoạt động';
      case 'PENDING':
        return 'Chờ duyệt';
      case 'APPROVED':
        return 'Đã duyệt';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Sản phẩm / Thẻ</h1>
          <p className="text-muted-foreground text-sm">Danh sách các thẻ PSA đã chứng nhận trên hệ thống.</p>
        </div>
        <Button asChild className="bg-brand hover:bg-brand-dark">
          <Link to="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" /> Thêm thẻ mới
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="border-b bg-gray-50/50 pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Package className="h-5 w-5 text-gray-500" />
            Tất cả sản phẩm ({cards.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-muted-foreground border-b bg-white text-xs font-semibold uppercase">
                <tr>
                  <th className="px-6 py-4">Mã thẻ (Cert)</th>
                  <th className="px-6 py-4">Hình ảnh</th>
                  <th className="px-6 py-4">Thông tin thẻ</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-line divide-y bg-white">
                {cards.map((card) => (
                  <tr key={card.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-bold text-gray-900">#{card.certNumber}</td>
                    <td className="px-6 py-4">
                      {card.frontImage ? (
                        <div className="h-16 w-12 overflow-hidden rounded border bg-gray-100 shadow-sm">
                          <img src={card.frontImage} alt="Card" className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="flex h-16 w-12 items-center justify-center rounded border bg-gray-50 text-xs text-gray-400">
                          No Img
                        </div>
                      )}
                    </td>
                    <td className="max-w-[300px] px-6 py-4">
                      <div className="truncate font-semibold text-gray-900" title={card.cardName}>
                        {card.cardName}
                      </div>
                      <div className="text-muted-foreground mt-1 text-xs">
                        {card.itemGrade} • {card.category}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(card.status)}`}
                      >
                        {getStatusLabel(card.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/admin/products/${card.id}/edit`)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleDelete(card.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {cards.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500">
                      Chưa có sản phẩm nào trong hệ thống.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

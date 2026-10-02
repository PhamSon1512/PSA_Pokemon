import { useNavigate } from 'react-router';
import { Search } from 'lucide-react';
import { useSnapshot } from 'valtio';
import { Input } from '~/components/ui/input';
import { store } from '~/lib/store';

export default function AdminGradingListPage() {
  const snap = useSnapshot(store);
  const navigate = useNavigate();

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý hồ sơ thẩm định</h1>
          <p className="text-muted-foreground mt-1 text-sm">Danh sách các yêu cầu gửi thẻ từ khách hàng</p>
        </div>
        <div className="relative w-[300px]">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input className="h-10 rounded-xl bg-white pl-9" placeholder="Tìm theo mã HS, tên khách..." />
        </div>
      </div>

      <div className="border-line overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-muted-foreground border-line border-b bg-gray-50 font-semibold">
              <tr>
                <th className="px-6 py-4">Mã hồ sơ</th>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Sản phẩm</th>
                <th className="px-6 py-4">Ngày tạo</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-line divide-y">
              {snap.gradingRequests.map((req) => (
                <tr key={req.id} className="transition hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold">{req.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold">{req.customerName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold">{req.cardName}</div>
                    <div className="text-muted-foreground text-xs">{req.set}</div>
                  </td>
                  <td className="text-muted-foreground px-6 py-4">{req.createdAt}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                        req.status === 'Đã cấp chứng nhận'
                          ? 'border-green-200 bg-green-50 text-green-700'
                          : req.status === 'Đang thẩm định'
                            ? 'border-blue-200 bg-blue-50 text-blue-700'
                            : 'border-amber-200 bg-amber-50 text-amber-700'
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => navigate(`/admin/grading/${req.id}`)} className="text-brand font-bold hover:underline">
                      Xử lý
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {snap.gradingRequests.length === 0 && <div className="text-muted-foreground py-20 text-center">Chưa có hồ sơ nào.</div>}
        </div>
      </div>
    </div>
  );
}

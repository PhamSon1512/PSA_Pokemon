import { useNavigate, useParams } from 'react-router';
import { ChevronLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useSnapshot } from 'valtio';
import { Button } from '~/components/ui/button';
import { store, updateGradingStatus } from '~/lib/store';

export default function AdminGradingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const snap = useSnapshot(store);

  const req = snap.gradingRequests.find((r) => r.id === id);

  if (!req) {
    return (
      <div>
        <h2>Không tìm thấy hồ sơ</h2>
        <Button onClick={() => navigate('/admin/grading')}>Quay lại</Button>
      </div>
    );
  }

  const handleStatusChange = (newStatus: string) => {
    updateGradingStatus(req.id, newStatus);
    toast.success('Đã cập nhật trạng thái hồ sơ');
  };

  return (
    <div className="mx-auto max-w-[1000px]">
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/grading')}
          className="border-line flex h-10 w-10 items-center justify-center rounded-xl border bg-white transition hover:bg-gray-50"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Xử lý hồ sơ: {req.id}</h1>
          <p className="text-muted-foreground mt-1 text-sm">Sản phẩm: {req.cardName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_350px]">
        <div className="space-y-6">
          <div className="border-line rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="border-line mb-4 border-b pb-2 text-lg font-bold">Thông tin sản phẩm</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div>
                <span className="text-muted-foreground mb-1 block">Tên thẻ</span>
                <b className="text-base">{req.cardName}</b>
              </div>
              <div>
                <span className="text-muted-foreground mb-1 block">Series / Set</span>
                <b className="text-base">{req.set}</b>
              </div>
              <div>
                <span className="text-muted-foreground mb-1 block">Khách hàng</span>
                <b>{req.customerName}</b>
              </div>
              <div>
                <span className="text-muted-foreground mb-1 block">Ngày tạo hồ sơ</span>
                <b>{req.createdAt}</b>
              </div>
            </div>
          </div>

          <div className="border-line rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="border-line mb-4 border-b pb-2 text-lg font-bold">Chấm điểm (Subgrades)</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <label className="text-muted-foreground mb-2 block text-sm">Centering</label>
                <input
                  type="number"
                  className="border-line focus:border-brand h-10 w-full rounded-lg border px-3 outline-none"
                  min="1"
                  max="10"
                  step="0.5"
                />
              </div>
              <div>
                <label className="text-muted-foreground mb-2 block text-sm">Corners</label>
                <input
                  type="number"
                  className="border-line focus:border-brand h-10 w-full rounded-lg border px-3 outline-none"
                  min="1"
                  max="10"
                  step="0.5"
                />
              </div>
              <div>
                <label className="text-muted-foreground mb-2 block text-sm">Edges</label>
                <input
                  type="number"
                  className="border-line focus:border-brand h-10 w-full rounded-lg border px-3 outline-none"
                  min="1"
                  max="10"
                  step="0.5"
                />
              </div>
              <div>
                <label className="text-muted-foreground mb-2 block text-sm">Surface</label>
                <input
                  type="number"
                  className="border-line focus:border-brand h-10 w-full rounded-lg border px-3 outline-none"
                  min="1"
                  max="10"
                  step="0.5"
                />
              </div>
            </div>

            <div className="border-line mt-6 flex items-center justify-between rounded-xl border bg-gray-50 p-4">
              <div>
                <div className="font-bold">Tổng điểm tự động</div>
                <div className="text-muted-foreground text-xs">Sẽ được tính dựa trên điểm thành phần</div>
              </div>
              <div className="text-brand text-3xl font-black">--</div>
            </div>

            <div className="mt-4 text-right">
              <Button className="bg-brand hover:bg-brand-dark rounded-xl text-white">
                <Save className="mr-2 h-4 w-4" /> Lưu kết quả
              </Button>
            </div>
          </div>
        </div>

        <div>
          <div className="border-line sticky top-24 rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="border-line mb-4 border-b pb-2 text-lg font-bold">Cập nhật trạng thái</h3>

            <div className="space-y-2">
              {['Yêu cầu đã được tiếp nhận', 'Chờ khách gửi thẻ', 'Đã nhận thẻ', 'Đang thẩm định', 'Đã cấp chứng nhận'].map(
                (status) => (
                  <label
                    key={status}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                      req.status === status ? 'border-brand bg-brand-soft font-bold' : 'border-line hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      checked={req.status === status}
                      onChange={() => handleStatusChange(status)}
                      className="accent-brand"
                    />
                    <span>{status}</span>
                  </label>
                ),
              )}
            </div>

            {req.status === 'Đã cấp chứng nhận' && (
              <div className="mt-6">
                <Button className="w-full rounded-xl bg-green-600 text-white shadow-md hover:bg-green-700">
                  Tạo mã chứng nhận (Generate)
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

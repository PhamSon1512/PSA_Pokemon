import { useNavigate } from 'react-router';
import { CreditCard, Package, Search } from 'lucide-react';
import { useSnapshot } from 'valtio';
import { store } from '~/lib/store';

export default function AccountIndexPage() {
  const snap = useSnapshot(store);
  const navigate = useNavigate();

  const myGradingCount = snap.gradingRequests.filter((r) => r.customerName === snap.user?.name).length;

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Tổng quan tài khoản</h2>

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div
          className="bg-brand-soft cursor-pointer rounded-2xl border border-amber-200 p-6 transition-shadow hover:shadow-md"
          onClick={() => navigate('/account/cards')}
        >
          <div className="text-brand-dark mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
            <Package className="h-6 w-6" />
          </div>
          <div className="text-brand-dark mb-1 text-3xl font-black">0</div>
          <div className="text-brand-dark/80 text-sm font-bold">Thẻ trong bộ sưu tập</div>
        </div>

        <div
          className="cursor-pointer rounded-2xl border border-[#bae6fd] bg-[#f0f9ff] p-6 transition-shadow hover:shadow-md"
          onClick={() => navigate('/account/grading')}
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#0284c7] shadow-sm">
            <Search className="h-6 w-6" />
          </div>
          <div className="mb-1 text-3xl font-black text-[#0284c7]">{myGradingCount}</div>
          <div className="text-sm font-bold text-[#0284c7]/80">Hồ sơ thẩm định</div>
        </div>

        <div
          className="cursor-pointer rounded-2xl border border-[#f5d0fe] bg-[#fdf4ff] p-6 transition-shadow hover:shadow-md"
          onClick={() => navigate('/account/products')}
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#c026d3] shadow-sm">
            <CreditCard className="h-6 w-6" />
          </div>
          <div className="mb-1 text-3xl font-black text-[#c026d3]">0</div>
          <div className="text-sm font-bold text-[#c026d3]/80">Sản phẩm đang bán</div>
        </div>
      </div>

      <h3 className="border-line mb-4 border-b pb-2 text-lg font-bold">Hoạt động gần đây</h3>
      {myGradingCount === 0 ? (
        <div className="text-muted-foreground border-line rounded-xl border border-dashed py-10 text-center">
          Chưa có hoạt động nào.
        </div>
      ) : (
        <div className="space-y-4">
          {snap.gradingRequests
            .filter((r) => r.customerName === snap.user?.name)
            .map((req) => (
              <div
                key={req.id}
                className="border-line flex cursor-pointer items-center justify-between rounded-xl border p-4 transition hover:bg-gray-50"
                onClick={() => navigate('/account/grading')}
              >
                <div>
                  <div className="font-bold">{req.cardName}</div>
                  <div className="text-muted-foreground mt-1 text-xs">
                    Mã hồ sơ: {req.id} • Ngày tạo: {req.createdAt}
                  </div>
                </div>
                <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                  {req.status}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

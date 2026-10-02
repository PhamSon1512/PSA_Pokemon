import { useNavigate } from 'react-router';
import { Search } from 'lucide-react';
import { useSnapshot } from 'valtio';
import { Button } from '~/components/ui/button';
import { store } from '~/lib/store';

export default function AccountGradingPage() {
  const snap = useSnapshot(store);
  const navigate = useNavigate();

  const myGrading = snap.gradingRequests.filter((r) => r.customerName === snap.user?.name);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Hồ sơ thẩm định</h2>
        <Button onClick={() => navigate('/grading')} className="bg-brand hover:bg-brand-dark rounded-xl font-bold text-white">
          + Gửi thẻ mới
        </Button>
      </div>

      {myGrading.length === 0 ? (
        <div className="border-line rounded-3xl border border-dashed bg-gray-50 py-20 text-center">
          <div className="text-muted-foreground mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
            <Search className="h-8 w-8" />
          </div>
          <h3 className="mb-2 font-bold">Chưa có hồ sơ nào</h3>
          <p className="text-muted-foreground mx-auto mb-6 max-w-sm text-sm">
            Gửi thẻ của bạn cho CardVault để bắt đầu quy trình thẩm định và cấp chứng nhận.
          </p>
          <Button onClick={() => navigate('/grading')} variant="outline" className="rounded-xl font-bold">
            Gửi yêu cầu ngay
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {myGrading.map((req) => (
            <div
              key={req.id}
              className="border-line flex flex-col justify-between gap-6 rounded-2xl border p-6 shadow-sm md:flex-row"
            >
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <span className="text-lg font-black">{req.cardName}</span>
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                    {req.status}
                  </span>
                </div>
                <div className="text-muted-foreground mb-4 text-sm">
                  Series: {req.set} • Mã hồ sơ: {req.id} • Ngày gửi: {req.createdAt}
                </div>

                {/* Status Timeline */}
                <div className="flex gap-2">
                  {['Yêu cầu đã được tiếp nhận', 'Chờ khách gửi thẻ', 'Đang thẩm định', 'Đã cấp chứng nhận'].map((step, idx) => {
                    // Simple mock logic for timeline
                    const statusIndex = [
                      'Yêu cầu đã được tiếp nhận',
                      'Chờ khách gửi thẻ',
                      'Đang thẩm định',
                      'Đã cấp chứng nhận',
                    ].indexOf(req.status);
                    const isActive = idx <= statusIndex;
                    return (
                      <div key={idx} className="max-w-[120px] flex-1">
                        <div className={`mb-1 h-1.5 w-full rounded-full ${isActive ? 'bg-brand' : 'bg-gray-200'}`}></div>
                        <div
                          className={`text-[10px] leading-tight font-semibold ${isActive ? 'text-text-main' : 'text-muted-foreground'}`}
                        >
                          {step}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

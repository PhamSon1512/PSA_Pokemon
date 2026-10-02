import { Link, useParams } from 'react-router';
import { CheckCircle2, ChevronLeft } from 'lucide-react';
import { Button } from '~/components/ui/button';

export default function CertificateDetailPage() {
  const { certificateId } = useParams();

  // Mock data simulation based on certificateId
  const isCharizard = certificateId?.toUpperCase().includes('CHAR') || certificateId === '#991208';

  const cardData = {
    certificateId: certificateId || '#123456',
    name: isCharizard ? 'Charizard' : 'Pikachu',
    set: 'Base Set',
    number: isCharizard ? '#006' : '#025',
    language: 'Japanese',
    year: '1999',
    grade: isCharizard ? '10' : '9.5',
    gradingDate: '02/10/2026',
    status: 'Đã xác thực',
    breakdown: {
      centering: isCharizard ? '10' : '9.5',
      corners: '10',
      edges: '9',
      surface: isCharizard ? '10' : '9.5',
    },
  };

  return (
    <div className="bg-bg-color min-h-[calc(100vh-200px)] py-10">
      <div className="container max-w-[1000px]">
        <Button variant="link" asChild className="text-muted-foreground hover:text-text-main mb-6 px-0">
          <Link to="/verify">
            <ChevronLeft className="mr-1 h-4 w-4" /> Quay lại tra cứu
          </Link>
        </Button>

        <div className="border-line overflow-hidden rounded-3xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#ffebc6] bg-[#fffaf2] px-6 py-4">
            <div className="text-success inline-flex items-center gap-2 text-sm font-black">
              <CheckCircle2 className="h-5 w-5" /> CARDVAULT VERIFIED{' '}
              <span className="ml-2 font-semibold text-[#6e7580]">• Hồ sơ chính thức</span>
            </div>
            <div className="text-muted-foreground text-sm font-bold">Mã hồ sơ: {cardData.certificateId}</div>
          </div>

          <div className="grid grid-cols-1 gap-0 md:grid-cols-[340px_1fr]">
            {/* Left side: Images */}
            <div className="border-line flex flex-col items-center justify-center gap-6 border-r bg-[#f9fafb] p-8">
              <div className="relative flex h-[280px] w-[200px] flex-col rounded-xl border-[6px] border-[#f6c86b] bg-gradient-to-br from-[#fbfbff] via-[#f2f3f7] to-[#e7e9ee] p-2.5 shadow-xl">
                <div className="text-center text-[12px] font-black text-[#30343c]">
                  {cardData.set.toUpperCase()} • {cardData.number}
                </div>
                <div className="mx-auto mt-6 h-[80px] w-[80px] rounded-full bg-gradient-to-br from-white via-amber-300 to-amber-600 shadow-inner"></div>
                <div className="mt-auto mb-4 text-center text-[14px] font-black">{cardData.name.toUpperCase()}</div>
                <div className="absolute right-2 bottom-2 left-2 flex justify-between text-[10px] text-[#4c535d]">
                  <span>{cardData.language.substring(0, 2).toUpperCase()}</span>
                  <span>{cardData.year}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="border-brand/50 ring-brand h-[112px] w-[80px] cursor-pointer rounded-lg border-2 bg-white p-1 shadow-sm ring-2 ring-offset-2">
                  {/* Front thumbnail */}
                  <div className="border-line h-full w-full rounded border bg-gradient-to-br from-[#fbfbff] to-[#e7e9ee]"></div>
                </div>
                <div className="border-line h-[112px] w-[80px] cursor-pointer rounded-lg border-2 bg-white p-1 opacity-70 shadow-sm transition-opacity hover:opacity-100">
                  {/* Back thumbnail */}
                  <div className="flex h-full w-full items-center justify-center rounded border border-[#374151] bg-[#111827]">
                    <span className="text-[10px] font-bold text-white/50">BACK</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Info */}
            <div className="p-8">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h1 className="mb-2 text-3xl font-bold">{cardData.name}</h1>
                  <p className="text-muted-foreground text-lg">
                    {cardData.set} {cardData.number}
                  </p>
                </div>
                <div className="flex min-w-[100px] flex-col items-center rounded-2xl bg-[#171c23] p-4 text-white">
                  <span className="text-[10px] font-bold tracking-widest text-[#aeb5be]">GRADE</span>
                  <span className="my-1 text-[42px] leading-none font-black text-[#ffd178]">{cardData.grade}</span>
                </div>
              </div>

              <div className="mb-8 grid grid-cols-2 gap-4">
                <div className="border-line rounded-xl border bg-gray-50/50 p-3">
                  <span className="text-muted-foreground mb-1 block text-xs">Năm phát hành</span>
                  <b className="text-[15px]">{cardData.year}</b>
                </div>
                <div className="border-line rounded-xl border bg-gray-50/50 p-3">
                  <span className="text-muted-foreground mb-1 block text-xs">Ngôn ngữ</span>
                  <b className="text-[15px]">{cardData.language}</b>
                </div>
                <div className="border-line rounded-xl border bg-gray-50/50 p-3">
                  <span className="text-muted-foreground mb-1 block text-xs">Ngày hoàn tất thẩm định</span>
                  <b className="text-[15px]">{cardData.gradingDate}</b>
                </div>
                <div className="border-line rounded-xl border bg-gray-50/50 p-3">
                  <span className="text-muted-foreground mb-1 block text-xs">Trạng thái hồ sơ</span>
                  <b className="text-success text-[15px]">{cardData.status}</b>
                </div>
              </div>

              <h3 className="border-line mb-4 border-b pb-2 text-lg font-bold">Đánh giá chi tiết (Subgrades)</h3>
              <div className="grid grid-cols-4 gap-3">
                <div className="border-line flex flex-col items-center rounded-xl border bg-white p-3">
                  <span className="text-muted-foreground mb-1 text-xs">Centering</span>
                  <b className="text-lg">{cardData.breakdown.centering}</b>
                </div>
                <div className="border-line flex flex-col items-center rounded-xl border bg-white p-3">
                  <span className="text-muted-foreground mb-1 text-xs">Corners</span>
                  <b className="text-lg">{cardData.breakdown.corners}</b>
                </div>
                <div className="border-line flex flex-col items-center rounded-xl border bg-white p-3">
                  <span className="text-muted-foreground mb-1 text-xs">Edges</span>
                  <b className="text-lg">{cardData.breakdown.edges}</b>
                </div>
                <div className="border-line flex flex-col items-center rounded-xl border bg-white p-3">
                  <span className="text-muted-foreground mb-1 text-xs">Surface</span>
                  <b className="text-lg">{cardData.breakdown.surface}</b>
                </div>
              </div>

              <div className="border-line mt-8 border-t pt-6">
                <h3 className="mb-4 text-lg font-bold">Tiến trình hồ sơ</h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="bg-brand h-3 w-3 rounded-full"></div>
                      <div className="bg-brand/30 my-1 h-full w-0.5"></div>
                    </div>
                    <div className="pb-4">
                      <div className="text-sm font-bold">Phát hành chứng nhận</div>
                      <div className="text-muted-foreground text-xs">02/10/2026</div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="bg-brand h-3 w-3 rounded-full"></div>
                      <div className="bg-brand/30 my-1 h-full w-0.5"></div>
                    </div>
                    <div className="pb-4">
                      <div className="text-sm font-bold">Hoàn thiện hình ảnh</div>
                      <div className="text-muted-foreground text-xs">01/10/2026</div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="bg-brand h-3 w-3 rounded-full"></div>
                      <div className="bg-brand/30 my-1 h-full w-0.5"></div>
                    </div>
                    <div className="pb-4">
                      <div className="text-sm font-bold">Hoàn tất thẩm định</div>
                      <div className="text-muted-foreground text-xs">28/09/2026</div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="bg-brand h-3 w-3 rounded-full"></div>
                    </div>
                    <div>
                      <div className="text-sm font-bold">Hồ sơ được tiếp nhận</div>
                      <div className="text-muted-foreground text-xs">25/09/2026</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

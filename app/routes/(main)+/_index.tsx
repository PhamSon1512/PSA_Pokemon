import { useState } from 'react';
import { useNavigate } from 'react-router';
import { CheckCircle2, ChevronRight, FileBadge, QrCode, Search, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '~/components/ui/button';
import { addToCart, MOCK_PRODUCTS } from '~/lib/store';

export default function IndexPage() {
  const navigate = useNavigate();
  const [searchCode, setSearchCode] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = searchCode.trim() || '#123456';
    setSearchQuery(code);
    setShowResult(true);
    // Scroll to result slightly
    setTimeout(() => {
      document.getElementById('resultBox')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleChipClick = (code: string) => {
    setSearchCode(code);
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSearch(fakeEvent);
  };

  const handleAddToCart = (product: any) => {
    addToCart(product);
    toast.success('Sản phẩm đã được thêm vào giỏ hàng');
  };

  return (
    <>
      <section className="relative min-h-[355px] overflow-hidden bg-gradient-to-br from-[#5a2a08] via-[#a84f09] to-[#8e3e06] px-0 pt-9 pb-10">
        {/* Decorative backgrounds */}
        <div className="pointer-events-none absolute top-[38px] -left-[70px] h-[210px] w-[280px] skew-x-[-14deg] bg-gradient-to-br from-transparent from-[38%] via-[rgba(255,196,92,0.22)] via-[44%] to-transparent to-[45%] opacity-55"></div>
        <div className="pointer-events-none absolute -right-[60px] -bottom-[15px] h-[250px] w-[360px] rotate-180 skew-x-[12deg] bg-gradient-to-br from-transparent from-[42%] via-[rgba(255,238,207,0.18)] via-[49%] to-transparent to-[50%] opacity-55"></div>

        <div className="relative z-10 container flex flex-col items-center text-center">
          <span className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-extrabold tracking-[0.3px] text-[#fff2d9]">
            ✦ AUTHENTICATE • GRADE • DISCOVER • TRADE
          </span>
          <h1 className="my-1.5 max-w-[920px] text-[31px] leading-[1.15] font-bold tracking-tight text-white md:text-[36px] lg:text-[42px]">
            CardVault — <span className="text-[#ffd28a]">Xác thực giá trị. Nâng tầm bộ sưu tập.</span>
          </h1>
          <p className="mt-2 mb-6 max-w-[760px] text-sm leading-[1.65] text-[#ffe8c6] md:text-base">
            Khám phá hồ sơ thẻ, kiểm tra chứng nhận và đưa ra quyết định sở hữu với đầy đủ thông tin.
          </p>

          <form
            onSubmit={handleSearch}
            className="flex w-full max-w-[860px] flex-col items-stretch overflow-hidden rounded-3xl border-[6px] border-white/20 bg-white shadow-[0_18px_38px_rgba(64,24,0,0.28)] md:flex-row"
          >
            <div className="flex min-h-[60px] flex-1 items-center gap-2.5 border-b border-[#eaedf0] bg-white px-4 md:border-r md:border-b-0">
              <Search className="text-muted-foreground h-5 w-5" />
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Nhập mã chứng nhận, ví dụ #123456"
                className="w-full border-0 bg-transparent text-[15px] outline-none placeholder:text-[#a6adb7]"
              />
            </div>
            <div className="hidden min-h-[60px] w-[200px] items-center gap-2 border-r border-[#eaedf0] px-4 text-sm text-[#59606c] md:flex">
              <QrCode className="h-4 w-4" />
              <span>Mã chứng nhận</span>
            </div>
            <button
              type="submit"
              className="bg-brand hover:bg-brand-dark cursor-pointer px-8 py-4 text-sm font-[850] text-white transition-colors md:w-[140px] md:py-0"
            >
              Tra cứu
            </button>
          </form>

          <div className="mt-3.5 flex max-w-[860px] flex-wrap justify-center gap-2">
            {['#123456', 'CV-2026-00125', 'Pikachu', 'Charizard', 'Base Set'].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleChipClick(chip)}
                className="cursor-pointer rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] text-[#fff7ea] transition-colors hover:border-amber-200/50 hover:bg-white/20"
              >
                {chip}
              </button>
            ))}
          </div>

          {showResult && (
            <div
              id="resultBox"
              className="animate-in fade-in slide-in-from-bottom-4 mt-5 w-full max-w-[860px] overflow-hidden rounded-2xl border border-[#ffd38a] bg-white text-left shadow-[0_10px_25px_rgba(242,138,0,0.1)]"
            >
              <div className="flex items-center justify-between border-b border-[#ffebc6] bg-[#fffaf2] px-4 py-3">
                <div className="text-success inline-flex items-center gap-1.5 text-xs font-black">
                  <CheckCircle2 className="h-4 w-4" /> XÁC THỰC THÀNH CÔNG{' '}
                  <span className="ml-1 font-semibold text-[#6e7580]">• Hồ sơ đang hoạt động</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-brand hover:text-brand-dark h-7 text-xs font-bold"
                  onClick={() => navigate(`/verify/${searchQuery}`)}
                >
                  Xem chi tiết →
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-[150px_1fr_140px]">
                <div className="grid h-[155px] place-items-center rounded-xl bg-gradient-to-br from-[#ffdea4] to-[#f8a51d]">
                  {/* Mock Card UI */}
                  <div className="relative flex h-[133px] w-[95px] -rotate-3 flex-col overflow-hidden rounded-xl border-4 border-[#f6c86b] bg-gradient-to-br from-[#fbfbff] via-[#f2f3f7] to-[#e7e9ee] p-1.5 shadow-lg">
                    <div className="text-center text-[8px] font-black text-[#30343c]">BASE SET • #025</div>
                    <div className="mx-auto mt-2 h-[45px] w-[45px] rounded-full bg-gradient-to-br from-white via-amber-300 to-amber-600 shadow-inner"></div>
                    <div className="mt-auto mb-3 text-center text-[9px] font-black">PIKACHU</div>
                    <div className="absolute right-1.5 bottom-1.5 left-1.5 flex justify-between text-[8px] text-[#4c535d]">
                      <span>JP</span>
                      <span>1999</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-bold">
                    {searchQuery.toUpperCase().includes('CHAR') ? 'Charizard — Base Set #006' : 'Pikachu — Base Set #025'}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg border border-[#f0f1f3] p-2.5">
                      <span className="mb-1 block text-[10px] text-[#8b9199]">Mã chứng nhận</span>
                      <b className="text-sm">{searchQuery}</b>
                    </div>
                    <div className="rounded-lg border border-[#f0f1f3] p-2.5">
                      <span className="mb-1 block text-[10px] text-[#8b9199]">Trạng thái</span>
                      <b className="text-success text-sm">Đã xác thực</b>
                    </div>
                    <div className="rounded-lg border border-[#f0f1f3] p-2.5">
                      <span className="mb-1 block text-[10px] text-[#8b9199]">Ngôn ngữ</span>
                      <b className="text-sm">Japanese</b>
                    </div>
                    <div className="rounded-lg border border-[#f0f1f3] p-2.5">
                      <span className="mb-1 block text-[10px] text-[#8b9199]">Ngày đánh giá</span>
                      <b className="text-sm">02/10/2026</b>
                    </div>
                  </div>
                </div>
                <div className="flex h-full flex-col items-center justify-center rounded-xl bg-[#171c23] p-3 text-white">
                  <small className="text-[10px] text-[#aeb5be]">GRADE</small>
                  <strong className="my-1.5 text-[38px] leading-none text-[#ffd178]">9.5</strong>
                  <span className="text-[11px] text-[#d9dee3]">CardVault Grade • 9.5</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Market Section */}
      <section className="bg-bg-color py-14" id="shop">
        <div className="container">
          <div className="mb-6 flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
            <div>
              <h2 className="m-0 text-2xl font-bold tracking-tight">Khám phá thị trường</h2>
              <p className="text-muted-foreground mt-1.5 text-sm">
                Những lựa chọn dành cho người sưu tầm, từ thẻ nguyên bản đến các sản phẩm đã được xác thực.
              </p>
            </div>
            <Button variant="link" className="text-brand-dark px-0 font-extrabold" onClick={() => navigate('/products')}>
              Xem tất cả →
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_1fr]">
            <aside className="border-line hidden h-fit rounded-2xl border bg-white p-2.5 shadow-sm lg:block">
              <div className="p-2.5 text-sm font-[850]">Danh mục</div>
              {['Pokemon', 'One Piece', 'Yu-Gi-Oh!', 'Sports Cards', 'Thẻ đã xác thực', 'Thẻ nguyên bản', 'Phụ kiện bảo quản'].map(
                (cat, idx) => (
                  <div
                    key={idx}
                    className={`flex cursor-pointer items-center justify-between rounded-xl p-2.5 text-sm transition-colors ${idx === 0 ? 'bg-brand-soft text-brand-dark font-[750]' : 'hover:bg-brand-soft hover:text-brand-dark text-[#5a616c]'}`}
                  >
                    {cat} <ChevronRight className="h-4 w-4 opacity-50" />
                  </div>
                ),
              )}
            </aside>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {MOCK_PRODUCTS.map((product) => (
                <article
                  key={product.id}
                  className="border-line flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <div className="relative grid h-[205px] place-items-center overflow-hidden bg-gradient-to-br from-[#fff0ce] to-[#fff8ec]">
                    {product.grade && (
                      <div className="absolute top-3 right-3 z-10 rounded-lg border border-[#ffd178]/40 bg-[#111827] px-2 py-1 text-[11px] font-black text-[#ffd178]">
                        GRADE {product.grade}
                      </div>
                    )}
                    {/* Placeholder artwork */}
                    <div className="flex h-[165px] w-[120px] rotate-[-3deg] flex-col overflow-hidden rounded-xl border-[4px] border-amber-300 bg-white p-1.5 shadow-xl">
                      <div className="h-1/2 rounded-t-lg bg-amber-100"></div>
                      <div className="p-2 text-center text-[10px] font-bold">{product.name}</div>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="mb-1.5 line-clamp-2 text-sm font-bold">{product.name}</h3>
                    <div className="text-muted-foreground mt-auto flex flex-wrap gap-2 text-xs">
                      {product.status === 'Đã xác thực' && <span className="text-success font-semibold">✓ Đã xác thực</span>}
                      {product.certificateId && <span>• {product.certificateId}</span>}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-lg font-black">{product.price.toLocaleString('vi-VN')}₫</div>
                      <Button
                        size="sm"
                        className="bg-brand-soft text-brand-dark h-8 rounded-lg font-bold hover:bg-amber-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                      >
                        Thêm giỏ
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-white py-14" id="trust">
        <div className="container">
          <div className="mb-6 flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
            <div>
              <h2 className="m-0 text-2xl font-bold tracking-tight">Xác thực trước khi sở hữu</h2>
              <p className="text-muted-foreground mt-1.5 text-sm">
                Một hồ sơ rõ ràng giúp giá trị sưu tầm được nhìn nhận minh bạch — từ lúc xác thực đến khi chuyển giao.
              </p>
            </div>
            <Button variant="link" className="text-brand-dark px-0 font-extrabold" onClick={() => navigate('/verify')}>
              Khám phá cách hoạt động →
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <FileBadge />,
                title: 'Hồ sơ xác thực',
                desc: 'Mã chứng nhận liên kết trực tiếp với hồ sơ thẻ, giúp việc tra cứu và đối chiếu trở nên rõ ràng.',
              },
              {
                icon: <QrCode />,
                title: 'Hình ảnh đối chiếu',
                desc: 'Hình ảnh mặt trước và mặt sau hỗ trợ người sưu tầm kiểm tra thông tin thẻ trước khi sở hữu.',
              },
              {
                icon: <CheckCircle2 />,
                title: 'Quy trình thẩm định',
                desc: 'Thông tin được ghi nhận theo quy trình nhất quán, từ tiếp nhận đến hoàn thiện hồ sơ.',
              },
              {
                icon: <ShieldCheck />,
                title: 'Tra cứu thuận tiện',
                desc: 'Kiểm tra thông tin chứng nhận nhanh chóng ngay trên nền tảng CardVault.',
              },
            ].map((trust, idx) => (
              <div key={idx} className="border-line rounded-2xl border bg-white p-5 shadow-sm">
                <div className="bg-brand-soft text-brand-dark mb-3 grid h-11 w-11 place-items-center rounded-xl">{trust.icon}</div>
                <h3 className="mb-1.5 text-sm font-bold">{trust.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{trust.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Section */}
      <section className="bg-white py-14" id="about">
        <div className="container grid grid-cols-1 items-center gap-9 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="bg-brand-soft text-brand-dark mb-4 inline-block rounded-full border border-[#ffe2b0] px-3 py-1 text-[11px] font-extrabold tracking-wider">
              VỀ CARDVAULT
            </span>
            <h2 className="mb-4 text-[28px] leading-[1.2] font-bold md:text-[32px]">Một nền tảng cho toàn bộ hành trình sưu tầm</h2>
            <p className="text-muted-foreground text-sm leading-[1.7] md:text-base">
              CardVault xây dựng một hệ sinh thái liền mạch cho người sưu tầm: <b>xác thực</b>, <b>thẩm định</b>,{' '}
              <b>quản lý bộ sưu tập</b> và <b>khám phá giao dịch</b> trong cùng một trải nghiệm minh bạch và đáng tin cậy.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                'Quản lý bộ sưu tập tập trung',
                'Theo dõi hồ sơ & lịch sử',
                'Chứng nhận điện tử & QR',
                'Khám phá & giao dịch an toàn',
              ].map((item, idx) => (
                <div key={idx} className="border-line flex items-center rounded-xl border bg-white p-3 text-xs font-[750]">
                  <span className="bg-brand-soft text-brand-dark mr-2 grid h-5 w-5 place-items-center rounded-full text-[10px]">
                    ✓
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="relative min-h-[310px] overflow-hidden rounded-3xl bg-gradient-to-br from-[#171c23] to-[#272d35] p-6 shadow-lg">
            <div className="pointer-events-none absolute -top-[80px] -right-[100px] h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle,rgba(255,177,59,0.22),transparent_70%)]"></div>

            <div className="absolute top-[28px] left-[20%] h-[260px] w-[205px] rotate-[7deg] rounded-2xl border border-white/20 bg-white/10 p-3 shadow-2xl backdrop-blur-sm">
              <div className="relative flex h-full flex-col rounded-xl bg-gradient-to-br from-[#fcfcfb] to-[#ebedf1] p-2.5">
                <div className="absolute top-2.5 right-2.5 rounded-lg bg-[#111827] px-2 py-1 text-xs font-black text-[#ffcc76]">
                  9.5
                </div>
                <div className="mx-auto mt-5 mb-2 h-[110px] w-[92px] rounded-lg bg-gradient-to-br from-[#ffd78b] to-[#ef8d00] shadow-[inset_0_0_0_3px_#ffefa9]"></div>
                <div className="mt-auto mb-1 text-center text-[9px] font-black">
                  CARDVAULT VERIFIED
                  <br />
                  CERTIFICATE #123456
                </div>
              </div>
            </div>

            <div className="absolute bottom-6 left-6 z-10 max-w-[185px] text-xs text-[#d8dce1]">
              <b className="mb-1 block text-[15px] text-white">Hồ sơ thẻ rõ ràng</b>
              Điểm đánh giá, hình ảnh đối chiếu và thông tin chứng nhận được trình bày nhất quán.
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-y border-[#ffe0af] bg-gradient-to-br from-[#fff1d6] to-[#fffaf2] py-12">
        <div className="container flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="m-0 text-[26px] font-bold md:text-[29px]">Xây dựng bộ sưu tập với sự tự tin</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Đăng ký tài khoản để quản lý thẻ, gửi yêu cầu thẩm định và khám phá những giá trị mới cho bộ sưu tập của bạn.
            </p>
          </div>
          <Button
            size="lg"
            className="bg-brand hover:bg-brand-dark rounded-xl px-8 font-[800] text-white"
            onClick={() => navigate('/grading')}
          >
            Gửi thẻ để thẩm định
          </Button>
        </div>
      </section>
    </>
  );
}

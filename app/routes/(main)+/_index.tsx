import type { Route } from './+types/_index';
import { useEffect, useRef, useState } from 'react';
import { useFetcher, useNavigate } from 'react-router';
import Autoplay from 'embla-carousel-autoplay';
import { CheckCircle2, ChevronRight, FileBadge, QrCode, Search, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { getDb } from '~/.server/db';
import { searchCards } from '~/.server/services/card.service';
import { Button } from '~/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '~/components/ui/carousel';
import { addToCart, MOCK_PRODUCTS } from '~/lib/store';

export async function loader({ context }: Route.LoaderArgs) {
  const db = getDb(context);
  const showcaseCards = await searchCards(db, '');
  return { showcaseCards };
}

export default function IndexPage({ loaderData }: Route.ComponentProps) {
  const { showcaseCards } = loaderData;
  const navigate = useNavigate();
  const [searchCode, setSearchCode] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetcher = useFetcher();

  useEffect(() => {
    if (searchCode.trim().length >= 2) {
      fetcher.load(`/api/public/cards/search?q=${searchCode.trim()}`);
    }
  }, [searchCode]);

  const searchResults = fetcher.data || [];

  const handleSearch = (e?: React.FormEvent, cert?: string) => {
    if (e) e.preventDefault();
    const code = cert || searchCode.trim();
    if (code) {
      navigate(`/verify/${code}`);
    }
  };

  const handleChipClick = (code: string) => {
    setSearchCode(code);
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
          <h1 className="my-1.5 flex w-full flex-col items-center justify-center gap-1 text-[26px] leading-[1.15] font-bold tracking-tight text-white md:flex-row md:gap-2 md:text-[32px] lg:text-[40px]">
            <span>CardVault —</span> <span className="text-[#ffd28a]">Xác thực giá trị. Nâng tầm bộ sưu tập.</span>
          </h1>
          <p className="mt-2 mb-6 max-w-[760px] text-sm leading-[1.65] text-[#ffe8c6] md:text-base">
            Khám phá hồ sơ thẻ, kiểm tra chứng nhận và đưa ra quyết định sở hữu với đầy đủ thông tin.
          </p>

          <div className="relative w-full max-w-[860px]">
            <form
              onSubmit={handleSearch}
              className="flex w-full flex-col items-center gap-2 overflow-hidden rounded-3xl border-[6px] border-white/20 bg-white/40 p-1.5 shadow-[0_18px_38px_rgba(64,24,0,0.28)] backdrop-blur-md md:flex-row"
            >
              <div className="flex min-h-[60px] w-full flex-1 items-center gap-2.5 rounded-2xl bg-white px-4 shadow-inner">
                <Search className="text-muted-foreground h-5 w-5" />
                <input
                  type="text"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  placeholder="Nhập mã chứng nhận (#...) hoặc tên thẻ"
                  className="w-full border-0 bg-transparent text-[15px] outline-none placeholder:text-[#a6adb7]"
                />
              </div>
              <button
                type="submit"
                className="bg-brand hover:bg-brand-dark w-full cursor-pointer rounded-2xl px-8 py-4 text-sm font-[850] text-white shadow-lg transition-transform active:scale-95 md:h-[60px] md:w-auto md:min-w-[160px] md:py-0"
              >
                Tra cứu
              </button>
            </form>

            {/* Autocomplete Dropdown */}
            {searchCode.trim().length >= 2 && searchResults.length > 0 && (
              <div className="absolute top-[80px] z-50 w-full overflow-hidden rounded-2xl border border-gray-100 bg-white text-left shadow-2xl dark:border-white/10 dark:bg-[#1a1f26]">
                {searchResults.map((card: any) => (
                  <div
                    key={card.id}
                    onClick={() => handleSearch(undefined, card.certNumber)}
                    className="flex cursor-pointer items-center gap-4 border-b border-gray-50 p-4 hover:bg-gray-50 dark:border-white/5 dark:hover:bg-white/5"
                  >
                    <div className="h-12 w-8 flex-shrink-0 overflow-hidden rounded bg-gray-100 dark:bg-black/50">
                      {card.frontImage && <img src={card.frontImage} className="h-full w-full object-cover" />}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">#{card.certNumber}</div>
                      <div className="line-clamp-1 text-xs text-gray-500 dark:text-gray-400">{card.cardName}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 flex w-full max-w-[860px] flex-wrap items-center justify-center gap-2 md:justify-start">
            <span className="text-sm font-semibold text-[#ffe8c6]">Gợi ý:</span>
            {showcaseCards.slice(0, 3).map((card: any, idx: number) => {
              const displayLabel = idx % 2 === 0 ? `#${card.certNumber}` : card.subject || `#${card.certNumber}`;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleChipClick(card.certNumber)}
                  className="cursor-pointer rounded-lg border border-white/40 bg-white/10 px-3 py-1.5 text-[12px] font-bold text-white shadow-[0_4px_0_rgba(255,255,255,0.15)] transition-transform hover:bg-white/20 active:translate-y-1 active:shadow-none"
                >
                  {displayLabel}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Market Section */}
      <section className="bg-bg-color py-14 dark:bg-[#0b0e12]" id="shop">
        <div className="container">
          <div className="mb-6 flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
            <div>
              <h2 className="m-0 text-2xl font-bold tracking-tight dark:text-white">Khám phá thị trường</h2>
              <p className="text-muted-foreground mt-1.5 text-sm dark:text-gray-400">
                Những lựa chọn dành cho người sưu tầm, từ thẻ nguyên bản đến các sản phẩm đã được xác thực.
              </p>
            </div>
            <Button variant="link" className="text-brand-dark px-0 font-extrabold" onClick={() => navigate('/products')}>
              Xem tất cả →
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_1fr]">
            <aside className="border-line hidden h-fit rounded-2xl border bg-white p-2.5 shadow-sm lg:block dark:border-white/10 dark:bg-[#171c22]">
              <div className="p-2.5 text-sm font-[850] dark:text-white">Danh mục</div>
              {['Pokemon', 'One Piece', 'Yu-Gi-Oh!', 'Sports Cards', 'Thẻ đã xác thực', 'Thẻ nguyên bản', 'Phụ kiện bảo quản'].map(
                (cat, idx) => (
                  <div
                    key={idx}
                    className={`flex cursor-pointer items-center justify-between rounded-xl p-2.5 text-sm transition-colors ${idx === 0 ? 'bg-brand-soft text-brand-dark dark:bg-brand-dark/20 dark:text-brand-light font-[750]' : 'hover:bg-brand-soft hover:text-brand-dark text-[#5a616c] dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'}`}
                  >
                    {cat} <ChevronRight className="h-4 w-4 opacity-50" />
                  </div>
                ),
              )}
            </aside>

            <Carousel
              plugins={[Autoplay({ delay: 3000 })]}
              opts={{
                align: 'start',
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {showcaseCards.map((card: any) => (
                  <CarouselItem key={card.id} className="pl-4 sm:basis-1/2 lg:basis-1/3">
                    <article
                      className="border-line flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-white/10 dark:bg-[#1f242b]"
                      onClick={() => navigate(`/verify/${card.certNumber}`)}
                    >
                      <div className="relative grid h-[240px] place-items-center overflow-hidden bg-gradient-to-br from-[#fff0ce] to-[#fff8ec]">
                        {card.itemGrade && (
                          <div className="absolute top-3 right-3 z-10 rounded-lg border border-[#ffd178]/40 bg-[#111827] px-2 py-1 text-[11px] font-black text-[#ffd178]">
                            {card.itemGrade}
                          </div>
                        )}
                        <div className="flex h-full w-full flex-col overflow-hidden p-4">
                          {card.frontImage ? (
                            <img src={card.frontImage} className="h-full w-full object-contain" alt={card.cardName} />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center rounded-xl bg-amber-100 text-xs font-bold text-amber-800">
                              No Image
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col p-4">
                        <h3 className="mb-1.5 line-clamp-2 text-sm font-bold dark:text-white">{card.cardName}</h3>
                        <div className="text-muted-foreground mt-auto flex flex-wrap gap-2 text-xs">
                          {card.status === 'ACTIVE' && <span className="text-success font-semibold">✓ Đã xác thực</span>}
                          {card.certNumber && <span className="dark:text-gray-400">• {card.certNumber}</span>}
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-brand-dark text-lg font-black">{card.psaEstimate || 'N/A'}</div>
                          <Button
                            size="sm"
                            className="bg-brand-soft text-brand-dark dark:bg-brand-dark/20 dark:text-brand-light dark:hover:bg-brand-dark/40 h-8 rounded-lg font-bold hover:bg-amber-100"
                          >
                            Xem chi tiết
                          </Button>
                        </div>
                      </div>
                    </article>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="hidden sm:block">
                <CarouselPrevious className="-left-4" />
                <CarouselNext className="-right-4" />
              </div>
            </Carousel>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-white py-14 dark:bg-[#0f1217]" id="trust">
        <div className="container">
          <div className="mb-6 flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
            <div>
              <h2 className="m-0 text-2xl font-bold tracking-tight dark:text-white">Xác thực trước khi sở hữu</h2>
              <p className="text-muted-foreground mt-1.5 text-sm dark:text-gray-400">
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
              <div
                key={idx}
                className="border-line rounded-2xl border bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#171c22]"
              >
                <div className="bg-brand-soft text-brand-dark dark:bg-brand-dark/20 dark:text-brand-light mb-3 grid h-11 w-11 place-items-center rounded-xl">
                  {trust.icon}
                </div>
                <h3 className="mb-1.5 text-sm font-bold dark:text-white">{trust.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed dark:text-gray-400">{trust.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Section */}
      <section className="bg-white py-14 dark:bg-[#0b0e12]" id="about">
        <div className="container grid grid-cols-1 items-center gap-9 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="bg-brand-soft text-brand-dark dark:bg-brand-dark/20 dark:text-brand-light dark:border-brand-dark/30 mb-4 inline-block rounded-full border border-[#ffe2b0] px-3 py-1 text-[11px] font-extrabold tracking-wider">
              VỀ CARDVAULT
            </span>
            <h2 className="mb-4 text-[28px] leading-[1.2] font-bold md:text-[32px] dark:text-white">
              Một nền tảng cho toàn bộ hành trình sưu tầm
            </h2>
            <p className="text-muted-foreground text-sm leading-[1.7] md:text-base dark:text-gray-400">
              CardVault xây dựng một hệ sinh thái liền mạch cho người sưu tầm: <b className="dark:text-gray-200">xác thực</b>,{' '}
              <b className="dark:text-gray-200">thẩm định</b>, <b className="dark:text-gray-200">quản lý bộ sưu tập</b> và{' '}
              <b className="dark:text-gray-200">khám phá giao dịch</b> trong cùng một trải nghiệm minh bạch và đáng tin cậy.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                'Quản lý bộ sưu tập tập trung',
                'Theo dõi hồ sơ & lịch sử',
                'Chứng nhận điện tử & QR',
                'Khám phá & giao dịch an toàn',
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="border-line flex items-center rounded-xl border bg-white p-3 text-xs font-[750] dark:border-white/10 dark:bg-[#1f242b] dark:text-white"
                >
                  <span className="bg-brand-soft text-brand-dark dark:bg-brand-dark/20 dark:text-brand-light mr-2 grid h-5 w-5 place-items-center rounded-full text-[10px]">
                    ✓
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="relative min-h-[310px] overflow-hidden rounded-3xl bg-gradient-to-br from-[#171c23] to-[#272d35] p-6 shadow-lg">
            <div className="pointer-events-none absolute -top-[80px] -right-[100px] h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle,rgba(255,177,59,0.22),transparent_70%)]"></div>

            <div className="absolute top-[28px] left-[70%] z-0 h-[260px] w-[205px] rotate-[15deg] rounded-2xl border border-white/20 bg-white/10 p-3 shadow-2xl backdrop-blur-sm md:left-[60%]">
              <div className="relative flex h-full flex-col rounded-xl bg-gradient-to-br from-[#fcfcfb] to-[#ebedf1] p-2.5">
                <div className="absolute top-2.5 right-2.5 rounded-lg bg-[#111827] px-2 py-1 text-xs font-black text-[#ffcc76]">
                  9.5
                </div>
                <div className="mx-auto mt-5 mb-2 h-[110px] w-[92px] rounded-lg bg-gradient-to-br from-[#ffd78b] to-[#ef8d00] shadow-[inset_0_0_0_3px_#ffefa9]"></div>
                <div className="mt-auto mb-1 text-center text-[9px] font-black text-gray-900">
                  CARDVAULT VERIFIED
                  <br />
                  CERTIFICATE #123456
                </div>
              </div>
            </div>

            <div className="absolute bottom-6 left-6 z-10 max-w-[250px] p-4 text-xs text-[#d8dce1]">
              <b className="mb-1 block text-[15px] text-white">Hồ sơ thẻ rõ ràng</b>
              Điểm đánh giá, hình ảnh đối chiếu và thông tin chứng nhận được trình bày nhất quán.
            </div>
          </div>
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="relative overflow-hidden border-t border-[#fce4c4] bg-gradient-to-br from-[#fff4e0] via-[#ffffff] to-[#fffaf0] py-20 dark:border-[#3a220d] dark:from-[#1b1f24] dark:via-[#2c1808] dark:to-[#120a03]">
        {/* Glowing Orbs for Light Mode */}
        <div className="bg-brand/10 dark:bg-brand/20 absolute top-0 left-1/4 h-[300px] w-[300px] -translate-y-1/2 rounded-full blur-[100px]"></div>
        <div className="absolute right-1/4 bottom-0 h-[400px] w-[400px] translate-y-1/2 rounded-full bg-amber-400/20 blur-[120px] dark:bg-amber-600/10"></div>

        <div className="relative z-10 container flex flex-col items-center justify-center text-center">
          <span className="border-brand/20 dark:border-brand/30 bg-brand/5 dark:bg-brand/10 text-brand-dark dark:text-brand-light mb-4 inline-block rounded-full border px-4 py-1.5 text-xs font-extrabold tracking-widest">
            BẮT ĐẦU NGAY HÔM NAY
          </span>
          <h2 className="m-0 max-w-2xl text-[32px] leading-tight font-black text-gray-900 md:text-[44px] dark:text-white">
            Xây dựng bộ sưu tập với sự{' '}
            <span className="from-brand-dark to-brand bg-gradient-to-r bg-clip-text text-transparent dark:from-[#ffd28a] dark:to-[#ff9f1f]">
              tự tin tuyệt đối
            </span>
          </h2>
          <p className="mt-4 mb-8 max-w-2xl text-base text-gray-600 md:text-lg dark:text-[#aeb5be]">
            Đăng ký tài khoản để quản lý thẻ, gửi yêu cầu thẩm định và khám phá những giá trị mới cho bộ sưu tập của bạn với quy
            trình minh bạch nhất.
          </p>
          <div className="flex w-full flex-col justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="group from-brand relative overflow-hidden rounded-2xl border-0 bg-gradient-to-br to-[#ff9f1f] px-10 py-7 font-black text-white shadow-[0_10px_40px_rgba(242,138,0,0.25)] transition-all hover:scale-105 hover:shadow-[0_15px_60px_rgba(242,138,0,0.4)] dark:shadow-[0_0_40px_rgba(242,138,0,0.3)] dark:hover:shadow-[0_0_60px_rgba(242,138,0,0.5)]"
              onClick={() => navigate('/grading')}
            >
              <div className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 ease-out group-hover:translate-y-0"></div>
              <span className="relative z-10 text-lg">Gửi thẻ thẩm định ngay</span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-2xl border-gray-200 bg-white px-10 py-7 font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50 dark:border-white/20 dark:bg-white/5 dark:text-white dark:backdrop-blur-sm dark:hover:bg-white/10 dark:hover:text-white"
              onClick={() => navigate('/register')}
            >
              Tạo tài khoản miễn phí
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

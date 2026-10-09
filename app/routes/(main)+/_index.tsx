import type { Route } from './+types/_index';
import { useEffect, useRef, useState } from 'react';
import { useFetcher, useNavigate } from 'react-router';
import Autoplay from 'embla-carousel-autoplay';
import { CheckCircle2, ChevronRight, FileBadge, QrCode, Search, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { getDb } from '~/.server/db';
import { searchCards } from '~/.server/services/card.service';
import { getPublicProducts } from '~/.server/services/product.service';
import { FakePurchaseTicker } from '~/components/store/FakePurchaseTicker';
import { Button } from '~/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '~/components/ui/carousel';
import { addToCart, store } from '~/lib/store';

export async function loader({ context }: Route.LoaderArgs) {
  const db = getDb(context);
  const showcaseCards = await searchCards(db, '');
  const products = await getPublicProducts(db);
  return { showcaseCards, products };
}

export default function IndexPage({ loaderData }: Route.ComponentProps) {
  const { showcaseCards, products } = loaderData;
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
    if (!store.user) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      navigate('/login');
      return;
    }
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
          <div className="mb-6 flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
            <div className="shrink-0">
              <h2 className="m-0 text-2xl font-bold tracking-tight dark:text-white">Cửa hàng CardVault</h2>
              <p className="text-muted-foreground mt-1.5 text-sm dark:text-gray-400">Sản phẩm nổi bật dành cho người sưu tầm.</p>
            </div>
            <div className="flex w-full flex-1 justify-center md:w-auto">
              <FakePurchaseTicker products={products} />
            </div>
            <Button variant="link" className="text-brand-dark shrink-0 px-0 font-extrabold" onClick={() => navigate('/products')}>
              Xem tất cả →
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_1fr]">
            <aside className="border-line hidden h-fit rounded-2xl border bg-white p-2.5 shadow-sm lg:block dark:border-white/10 dark:bg-[#171c22]">
              <div className="p-2.5 text-sm font-[850] dark:text-white">Danh mục</div>
              {['Túi mù (Mystery Bag)', 'Pokemon', 'One Piece', 'Yu-Gi-Oh!', 'Phụ kiện'].map((cat, idx) => (
                <div
                  key={idx}
                  className={`flex cursor-pointer items-center justify-between rounded-xl p-2.5 text-sm transition-colors ${idx === 0 ? 'bg-brand-soft text-brand-dark dark:bg-brand-dark/20 dark:text-brand-light font-[750]' : 'hover:bg-brand-soft hover:text-brand-dark text-[#5a616c] dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'}`}
                >
                  {cat} <ChevronRight className="h-4 w-4 opacity-50" />
                </div>
              ))}
            </aside>

            <div className="flex w-full min-w-0 flex-col">
              <Carousel
                plugins={[Autoplay({ delay: 3000, stopOnMouseEnter: true })]}
                opts={{
                  align: 'start',
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {products.map((product: any) => {
                    const mainImage = product.images?.[0] || product.image;
                    const discount =
                      product.comparePrice && product.comparePrice > product.price
                        ? Math.round((1 - product.price / product.comparePrice) * 100)
                        : null;

                    return (
                      <CarouselItem key={product.id} className="pl-4 sm:basis-1/2 lg:basis-1/3">
                        <article
                          className="border-line flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-white/10 dark:bg-[#1f242b]"
                          onClick={() => navigate(`/products/${product.id}`)}
                        >
                          <div className="relative grid h-[220px] shrink-0 place-items-center overflow-hidden bg-gray-100 dark:bg-gray-800">
                            {discount && (
                              <div className="absolute top-0 right-0 z-10 flex flex-col items-center justify-center bg-[#ffe97a] px-2 py-1 text-center font-bold text-[#ee4d2d] shadow-sm">
                                <span className="text-[10px] leading-none uppercase">Giảm</span>
                                <span className="text-xs leading-none">{discount}%</span>
                              </div>
                            )}
                            {mainImage ? (
                              <img src={mainImage} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="text-xs text-gray-400">No Image</div>
                            )}
                          </div>
                          <div className="flex flex-1 flex-col p-3">
                            <h3 className="mb-1.5 line-clamp-2 text-[13px] leading-tight font-medium dark:text-white">
                              {product.name}
                            </h3>

                            <div className="mb-2 flex flex-wrap gap-1">
                              {product.badges?.map((badge: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="border-brand text-brand inline-block rounded-sm border px-1 text-[9px] font-medium"
                                >
                                  {badge}
                                </span>
                              ))}
                            </div>

                            <div className="mt-auto flex flex-col gap-2.5 pt-2">
                              <div className="flex items-end justify-between">
                                <div className="flex flex-col gap-0.5">
                                  {product.comparePrice && (
                                    <div className="text-[11px] text-gray-400 line-through decoration-gray-300">
                                      ₫{product.comparePrice.toLocaleString('vi-VN')}
                                    </div>
                                  )}
                                  <div className="text-[15px] leading-none font-bold text-[#ee4d2d]">
                                    ₫{product.price.toLocaleString('vi-VN')}
                                  </div>
                                </div>
                                <div className="mb-[2px] text-[10px] leading-none text-gray-500">
                                  Đã bán {product.sold > 1000 ? `${(product.sold / 1000).toFixed(1)}k` : product.sold}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToCart(product);
                                }}
                                className="text-brand flex w-full items-center justify-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 shadow-sm transition-all hover:bg-amber-100 active:scale-95 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <circle cx="8" cy="21" r="1" />
                                  <circle cx="19" cy="21" r="1" />
                                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                                </svg>
                                <span className="text-xs font-bold">Thêm vào giỏ</span>
                              </button>
                            </div>
                          </div>
                        </article>
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>
                <div className="hidden sm:block">
                  <CarouselPrevious className="-left-4" />
                  <CarouselNext className="-right-4" />
                </div>
              </Carousel>
            </div>
          </div>
        </div>
      </section>

      {/* Graded Cards Section */}
      <section className="bg-white py-14 dark:bg-[#0b0e12]" id="graded-cards">
        <div className="container">
          <div className="mb-6 flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
            <div>
              <h2 className="m-0 text-2xl font-bold tracking-tight dark:text-white">Thẻ đã kiểm định</h2>
              <p className="text-muted-foreground mt-1.5 text-sm dark:text-gray-400">
                Bộ sưu tập thẻ đã qua quy trình thẩm định chuyên nghiệp của CardVault.
              </p>
            </div>
            <Button variant="link" className="text-brand-dark px-0 font-extrabold" onClick={() => navigate('/graded-cards')}>
              Xem tất cả →
            </Button>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {['Tất cả', 'Pokemon', 'Yu-Gi-Oh!', 'One Piece', 'Sports Cards'].map((cat, idx) => (
              <button
                key={cat}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${idx === 0 ? 'bg-brand text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <Carousel
            plugins={[Autoplay({ delay: 3500, stopOnMouseEnter: true })]}
            opts={{ align: 'start', loop: true }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {showcaseCards.map((card: any) => (
                <CarouselItem key={card.id} className="pl-4 sm:basis-1/2 lg:basis-1/4">
                  <article
                    className="border-line flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-white/10 dark:bg-[#1f242b]"
                    onClick={() => navigate(`/verify/${card.certNumber}`)}
                  >
                    <div className="relative grid h-[240px] place-items-center overflow-hidden bg-gradient-to-br from-[#171c23] to-[#272d35]">
                      {card.itemGrade && (
                        <div className="absolute top-3 right-3 z-10 rounded-lg border border-[#ffd178]/40 bg-[#111827] px-2 py-1 text-[11px] font-black text-[#ffd178]">
                          {card.itemGrade}
                        </div>
                      )}
                      <div className="flex h-full w-full flex-col overflow-hidden p-4">
                        {card.frontImage ? (
                          <img src={card.frontImage} className="h-full w-full object-contain" alt={card.cardName} />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center rounded-xl bg-gray-800 text-xs font-bold text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="mb-1.5 line-clamp-2 text-sm font-bold dark:text-white">{card.cardName}</h3>
                      <div className="text-muted-foreground mt-auto flex flex-wrap gap-2 text-xs">
                        {card.certNumber && <span className="dark:text-gray-400">Cert: #{card.certNumber}</span>}
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-white/10">
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Ước tính:</div>
                        <div className="text-brand-dark text-base font-black">{card.psaEstimate || 'N/A'}</div>
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
                className="group border-line hover:border-brand/30 rounded-2xl border bg-white p-5 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg dark:border-white/10 dark:bg-[#171c22]"
              >
                <div className="from-brand-soft text-brand-dark dark:from-brand-dark/30 dark:to-brand-dark/10 dark:text-brand-light mb-4 grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br to-amber-100 transition-transform group-hover:scale-110">
                  {trust.icon}
                </div>
                <h3 className="mb-1.5 text-sm font-bold dark:text-white">{trust.title}</h3>
                <p className="text-muted-foreground mb-3 text-xs leading-relaxed dark:text-gray-400">{trust.desc}</p>
                {idx === 0 && <div className="text-brand text-xs font-semibold">2,000+ thẻ đã xác thực</div>}
                {idx === 2 && <div className="text-brand text-xs font-semibold">500+ người sưu tầm tin dùng</div>}
              </div>
            ))}
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

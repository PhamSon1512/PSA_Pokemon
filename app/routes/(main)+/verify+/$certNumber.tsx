import type { Route } from './+types/$certNumber';
import { Link } from 'react-router';
import Autoplay from 'embla-carousel-autoplay';
import { Search } from 'lucide-react';
import { getDb } from '~/.server/db';
import { getCardByCertNumber, searchCards } from '~/.server/services/card.service';
import { Button } from '~/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '~/components/ui/carousel';

export async function loader({ request, context, params }: Route.LoaderArgs) {
  const db = getDb(context);
  const card = await getCardByCertNumber(db, params.certNumber);

  if (!card) {
    throw new Response('Not Found', { status: 404 });
  }

  // Fetch some similar cards (just taking first 10 active cards for now)
  const similarCards = await searchCards(db, '');

  return { card, similarCards };
}

export default function CardVerificationPage({ loaderData }: Route.ComponentProps) {
  const { card, similarCards } = loaderData;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0e12]">
      {/* Breadcrumb & Mini Search Bar */}
      <div className="border-b border-[#e5e7eb] bg-[#f0f1f3] px-4 py-2 md:px-8 dark:border-white/10 dark:bg-[#171c22]">
        <div className="container mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex-1 overflow-hidden text-xs font-medium text-ellipsis whitespace-nowrap text-gray-500 dark:text-gray-400">
            <Link to="/" className="hover:text-brand-dark dark:hover:text-brand-light transition-colors">
              Tìm kiếm
            </Link>
            <span className="mx-2">&gt;</span>
            <span className="capitalize">{card.category?.toLowerCase() || 'Danh mục'}</span>
            <span className="mx-2">&gt;</span>
            <span className="capitalize">{card.brandTitle?.toLowerCase()}</span>
            <span className="mx-2">&gt;</span>
            <span className="capitalize">
              {card.subject?.toLowerCase()} #{card.cardNumber}
            </span>
            <span className="mx-2">&gt;</span>
            <span className="font-bold text-gray-900 dark:text-white">Cert #{card.certNumber}</span>
          </div>
          <div className="relative w-full flex-shrink-0 md:w-64">
            <Search className="absolute top-2 left-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder={card.certNumber}
              className="focus:border-brand w-full rounded-sm border border-gray-300 bg-white py-1.5 pr-3 pl-8 text-xs outline-none dark:border-white/20 dark:bg-[#0f1217] dark:text-white"
            />
          </div>
        </div>
      </div>

      <main className="container mx-auto max-w-6xl px-4 py-8 md:px-8">
        {/* Top Section */}
        <div className="mb-8 text-center">
          <p className="mb-3 text-sm font-semibold text-gray-600 dark:text-gray-400">
            Theo cơ sở dữ liệu CardVault, mã chứng nhận được xác định như sau:
          </p>
          <div className="border-brand-dark dark:border-brand-dark/50 mb-6 inline-block border-2 bg-white px-8 py-3 shadow-sm dark:bg-[#1f242b]">
            <span className="text-brand-dark dark:text-brand-light text-4xl font-black tracking-tight md:text-5xl">
              #{card.certNumber}
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 uppercase md:text-4xl dark:text-white">
            <span className="mb-2 block">{card.brandTitle}</span>
            <span className="text-gray-700 dark:text-gray-400">
              #{card.cardNumber} {card.subject} {card.varietyPedigree}
            </span>
          </h1>
        </div>

        {/* Images Gallery */}
        <div className="mb-12 flex flex-col justify-center gap-6 md:flex-row">
          {card.frontImage && (
            <div className="group relative mx-auto flex w-full max-w-sm justify-center md:mx-0 md:w-1/2">
              <img
                src={card.frontImage}
                alt={`Front of ${card.cardName}`}
                className="max-h-[600px] w-auto object-contain drop-shadow-2xl"
              />
            </div>
          )}
          {card.backImage && (
            <div className="group relative mx-auto flex w-full max-w-sm justify-center md:mx-0 md:w-1/2">
              <img
                src={card.backImage}
                alt={`Back of ${card.cardName}`}
                className="max-h-[600px] w-auto object-contain drop-shadow-2xl"
              />
            </div>
          )}
        </div>

        {/* 4 Summary Blocks */}
        <div className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { title: 'ITEM GRADE', value: card.itemGrade || 'N/A' },
            { title: 'ĐỊNH GIÁ DỰ KIẾN', value: card.psaEstimate || 'N/A' },
            { title: 'PSA POPULATION', value: card.psaPopulation?.toLocaleString() || 'N/A', isLink: true },
            { title: 'PSA POP HIGHER', value: card.psaPopHigher?.toLocaleString() || 'N/A' },
          ].map((block, idx) => (
            <div
              key={idx}
              className="flex h-[120px] flex-col items-center justify-center rounded-lg border border-[#e5e7eb] bg-[#f8f9fa] p-5 text-center dark:border-white/10 dark:bg-[#171c22]"
            >
              <span className="mb-2 text-xs font-bold text-gray-500 dark:text-gray-400">{block.title}</span>
              <span
                className={`text-xl font-black ${block.isLink ? 'cursor-pointer text-[#0052cc] hover:underline dark:text-[#3e8bff]' : 'text-gray-900 dark:text-white'}`}
              >
                {block.value}
              </span>
            </div>
          ))}
        </div>

        {/* Item Information List */}
        <div className="mx-auto mb-16 max-w-4xl">
          <h2 className="mb-4 border-b pb-2 text-xl font-bold dark:border-white/10 dark:text-white">
            Thông tin thẻ (Item Information)
          </h2>
          <div className="divide-y divide-gray-100 dark:divide-white/10">
            {[
              { label: 'Mã chứng nhận', value: card.certNumber },
              { label: 'Item Grade', value: card.itemGrade },
              { label: 'Loại nhãn', value: card.labelType },
              { label: 'Mã vạch mặt sau', value: card.reverseCertBarcode },
              { label: 'Năm phát hành', value: card.year },
              { label: 'Thương hiệu/Tiêu đề', value: card.brandTitle },
              { label: 'Chủ đề', value: card.subject },
              { label: 'Số thẻ', value: card.cardNumber },
              { label: 'Danh mục', value: card.category },
              { label: 'Variety/Pedigree', value: card.varietyPedigree },
            ].map((item, idx) => (
              <div key={idx} className="flex py-3 text-sm">
                <div className="w-1/3 font-semibold text-gray-500 dark:text-gray-400">{item.label}</div>
                <div className="w-2/3 font-bold text-gray-900 dark:text-white">{item.value || '-'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Similar Items Carousel */}
        {similarCards && similarCards.length > 0 && (
          <div className="mb-12 border-t pt-12 dark:border-white/10">
            <h2 className="mb-6 text-center text-2xl font-bold dark:text-white">Sản phẩm tương tự</h2>
            <Carousel
              plugins={[Autoplay({ delay: 4000 })]}
              opts={{
                align: 'start',
                loop: true,
              }}
              className="mx-auto w-full max-w-5xl"
            >
              <CarouselContent className="-ml-4">
                {similarCards.map((scard: any) => (
                  <CarouselItem key={scard.id} className="pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <Link to={`/verify/${scard.certNumber}`} className="group block">
                      <div className="overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow group-hover:shadow-md dark:border-white/10 dark:bg-[#1f242b]">
                        <div className="flex h-[220px] items-center justify-center bg-gray-50 p-4 dark:bg-[#0f1217]">
                          {scard.frontImage ? (
                            <img src={scard.frontImage} className="max-h-full max-w-full object-contain" alt={scard.cardName} />
                          ) : (
                            <div className="text-xs text-gray-400">No Image</div>
                          )}
                        </div>
                        <div className="border-t p-3 dark:border-white/10">
                          <div className="mb-1 text-xs font-bold text-gray-500 dark:text-gray-400">#{scard.certNumber}</div>
                          <h4 className="group-hover:text-brand-dark dark:group-hover:text-brand-light mb-2 line-clamp-2 text-sm font-bold text-gray-900 transition-colors dark:text-white">
                            {scard.cardName}
                          </h4>
                          <div className="text-brand-dark dark:text-brand-light text-xs font-semibold">{scard.itemGrade}</div>
                        </div>
                      </div>
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="hidden md:block">
                <CarouselPrevious className="-left-12" />
                <CarouselNext className="-right-12" />
              </div>
            </Carousel>
          </div>
        )}
      </main>
    </div>
  );
}

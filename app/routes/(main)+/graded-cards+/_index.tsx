import type { Route } from './+types/_index';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronRight, Filter, Search } from 'lucide-react';
import { getDb } from '~/.server/db';
import { searchCards } from '~/.server/services/card.service';
import { Button } from '~/components/ui/button';

export async function loader({ context, request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') || '';
  const db = getDb(context);
  const cards = await searchCards(db, q);
  // Filtering for active only should be done in service or here.
  // For now, we assume the cards returned are what we show.
  return { cards: cards.filter((c) => c.status === 'ACTIVE'), q };
}

export default function GradedCardsPage({ loaderData }: Route.ComponentProps) {
  const { cards, q } = loaderData;
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState(q);

  const filteredCards = filter === 'All' ? cards : cards.filter((c) => c.category === filter);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`?q=${encodeURIComponent(search)}`);
  };

  return (
    <div className="bg-bg-color min-h-screen py-10 dark:bg-[#0b0e12]">
      <div className="container">
        <div className="border-line mb-8 flex flex-col gap-4 border-b pb-4 md:flex-row md:items-end md:justify-between dark:border-white/10">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Thẻ đã kiểm định</h1>
            <p className="text-muted-foreground mt-1 dark:text-gray-400">Khám phá thư viện thẻ đã được xác thực</p>
          </div>
          <form onSubmit={handleSearch} className="flex w-full gap-2 md:w-auto">
            <div className="flex h-10 flex-1 items-center gap-2 rounded-xl border bg-white px-3 shadow-sm dark:border-white/10 dark:bg-[#171c22]">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm tên hoặc mã..."
                className="w-full bg-transparent text-sm outline-none dark:text-white"
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              className="border-line rounded-xl bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              Tìm kiếm
            </Button>
          </form>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
          <aside>
            <div className="border-line mb-6 rounded-2xl border bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#171c22]">
              <div className="mb-3 text-sm font-bold dark:text-white">Danh mục</div>
              <div className="flex flex-col gap-2">
                {['All', 'Pokemon', 'One Piece', 'Yu-Gi-Oh!', 'Sports Cards'].map((status) => (
                  <label key={status} className="flex cursor-pointer items-center gap-2 text-sm dark:text-gray-300">
                    <input
                      type="radio"
                      name="status"
                      checked={filter === status}
                      onChange={() => setFilter(status)}
                      className="accent-brand"
                    />
                    {status === 'All' ? 'Tất cả' : status}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          <div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCards.map((card) => (
                <article
                  key={card.id}
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
              ))}
            </div>

            {filteredCards.length === 0 && (
              <div className="text-muted-foreground border-line rounded-2xl border border-dashed bg-white py-20 text-center dark:border-white/10 dark:bg-white/5 dark:text-gray-400">
                Không tìm thấy thẻ nào.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

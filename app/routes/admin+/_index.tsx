import type { Route } from './+types/_index';
import { useNavigate } from 'react-router';
import { sql } from 'drizzle-orm';
import { FileText, Package, Search, ShieldCheck, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import { useSnapshot } from 'valtio';
import { getDb } from '~/.server/db';
import { requireAuthSession } from '~/.server/guard';
import { store } from '~/lib/store';
import { cards, orders, posts, products } from '~/models';

export async function loader({ request, context }: Route.LoaderArgs) {
  await requireAuthSession(request, context);
  const db = getDb(context);

  const [cardsCount] = await db.select({ count: sql`count(*)`.mapWith(Number) }).from(cards);
  const [productsCount] = await db.select({ count: sql`count(*)`.mapWith(Number) }).from(products);
  const [ordersCount] = await db.select({ count: sql`count(*)`.mapWith(Number) }).from(orders);
  const [postsCount] = await db.select({ count: sql`count(*)`.mapWith(Number) }).from(posts);

  return {
    stats: {
      cards: cardsCount?.count || 0,
      products: productsCount?.count || 0,
      orders: ordersCount?.count || 0,
      posts: postsCount?.count || 0,
    },
  };
}

export default function AdminIndexPage({ loaderData }: Route.ComponentProps) {
  const { stats } = loaderData;
  const snap = useSnapshot(store);
  const navigate = useNavigate();

  const pendingRequests = snap.gradingRequests.filter((r) => r.status !== 'Đã cấp chứng nhận').length;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold dark:text-white">Tổng quan hệ thống</h1>

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border-line rounded-2xl border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1a1f26]">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Search className="h-5 w-5" />
            </div>
            <span className="text-success flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-bold dark:bg-green-900/30">
              <TrendingUp className="mr-1 h-3 w-3" /> +12%
            </span>
          </div>
          <div className="mb-1 text-3xl font-black dark:text-white">{pendingRequests}</div>
          <div className="text-muted-foreground text-sm font-semibold dark:text-gray-400">Yêu cầu cần xử lý</div>
        </div>

        <div className="border-line rounded-2xl border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1a1f26]">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mb-1 text-3xl font-black dark:text-white">{stats.cards}</div>
          <div className="text-muted-foreground text-sm font-semibold dark:text-gray-400">Chứng nhận đã cấp</div>
        </div>

        <div className="border-line rounded-2xl border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1a1f26]">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="text-success flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-bold dark:bg-green-900/30">
              <TrendingUp className="mr-1 h-3 w-3" /> +5%
            </span>
          </div>
          <div className="mb-1 text-3xl font-black dark:text-white">{stats.orders}</div>
          <div className="text-muted-foreground text-sm font-semibold dark:text-gray-400">Đơn hàng mới</div>
        </div>

        <div className="border-line rounded-2xl border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1a1f26]">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="mb-1 text-3xl font-black dark:text-white">{stats.posts}</div>
          <div className="text-muted-foreground text-sm font-semibold dark:text-gray-400">Bài viết Blog</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="border-line overflow-hidden rounded-2xl border bg-white shadow-sm lg:col-span-2 dark:border-white/10 dark:bg-[#1a1f26]">
          <div className="border-line flex items-center justify-between border-b p-6 dark:border-white/10">
            <h2 className="text-lg font-bold dark:text-white">Yêu cầu thẩm định mới nhất</h2>
            <button className="text-brand text-sm font-bold hover:underline" onClick={() => navigate('/admin/grading')}>
              Xem tất cả
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-muted-foreground bg-gray-50 font-semibold dark:bg-white/5 dark:text-gray-300">
                <tr>
                  <th className="px-6 py-4">Mã HS</th>
                  <th className="px-6 py-4">Khách hàng</th>
                  <th className="px-6 py-4">Sản phẩm</th>
                  <th className="px-6 py-4">Ngày tạo</th>
                  <th className="px-6 py-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-line divide-y dark:divide-white/10">
                {snap.gradingRequests.slice(0, 5).map((req) => (
                  <tr
                    key={req.id}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5"
                    onClick={() => navigate(`/admin/grading/${req.id}`)}
                  >
                    <td className="px-6 py-4 font-bold dark:text-white">{req.id}</td>
                    <td className="px-6 py-4 dark:text-gray-300">{req.customerName}</td>
                    <td className="px-6 py-4 dark:text-gray-300">{req.cardName}</td>
                    <td className="text-muted-foreground px-6 py-4 dark:text-gray-400">{req.createdAt}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700 dark:border-amber-900 dark:bg-amber-900/30 dark:text-amber-400">
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border-line rounded-2xl border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1a1f26]">
          <h2 className="mb-4 text-lg font-bold dark:text-white">Cần chú ý</h2>
          <div className="space-y-4">
            <div className="flex gap-3 rounded-xl border border-red-100 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-900/10">
              <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-red-500"></div>
              <div>
                <div className="text-sm font-bold text-red-900 dark:text-red-400">3 hồ sơ quá hạn xử lý</div>
                <div className="mt-1 text-xs text-red-700 dark:text-red-300">
                  Các hồ sơ nhận từ tuần trước chưa hoàn tất thẩm định.
                </div>
              </div>
            </div>
            <div className="flex gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/10">
              <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-amber-500"></div>
              <div>
                <div className="text-sm font-bold text-amber-900 dark:text-amber-400">Xác nhận thanh toán</div>
                <div className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                  Có 2 đơn hàng cần duyệt thanh toán chuyển khoản.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

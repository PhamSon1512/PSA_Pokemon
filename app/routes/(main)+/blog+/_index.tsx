import type { Route } from './+types/_index';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Search } from 'lucide-react';
import { getDb } from '~/.server/db';
import { getPublicPosts } from '~/.server/services/post.service';
import { Button } from '~/components/ui/button';

export async function loader({ context, request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') || '';
  const db = getDb(context);
  let posts = await getPublicPosts(db);
  if (q) {
    posts = posts.filter(
      (p) => p.title.toLowerCase().includes(q.toLowerCase()) || (p.excerpt && p.excerpt.toLowerCase().includes(q.toLowerCase())),
    );
  }
  return { posts, q };
}

export default function BlogIndexPage({ loaderData }: Route.ComponentProps) {
  const { posts, q } = loaderData;
  const navigate = useNavigate();
  const [search, setSearch] = useState(q);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`?q=${encodeURIComponent(search)}`);
  };

  return (
    <div className="bg-bg-color min-h-screen py-10 dark:bg-[#0b0e12]">
      <div className="container">
        <div className="border-line mb-8 flex flex-col gap-4 border-b pb-4 md:flex-row md:items-end md:justify-between dark:border-white/10">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Bài viết</h1>
            <p className="text-muted-foreground mt-1 dark:text-gray-400">
              Khám phá tin tức, hướng dẫn và phân tích thị trường thẻ.
            </p>
          </div>
          <form onSubmit={handleSearch} className="flex w-full gap-2 md:w-auto">
            <div className="flex h-10 flex-1 items-center gap-2 rounded-xl border bg-white px-3 shadow-sm dark:border-white/10 dark:bg-[#171c22]">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm bài viết..."
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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="group border-line flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-[#171c22]"
            >
              <div className="relative h-[200px] overflow-hidden bg-gray-100 dark:bg-gray-800">
                {post.coverImage ? (
                  <img
                    src={post.coverImage}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    alt={post.title}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-400">No Image</div>
                )}
                {post.category && (
                  <div className="bg-brand absolute top-3 left-3 rounded-lg px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                    {post.category}
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="group-hover:text-brand mb-2 line-clamp-2 text-lg font-bold transition-colors dark:text-white">
                  {post.title}
                </h3>
                <p className="mb-4 line-clamp-3 text-sm text-gray-600 dark:text-gray-400">{post.excerpt}</p>
                <div className="mt-auto flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                  <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''}</span>
                  <span>{post.viewCount || 0} lượt xem</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-muted-foreground border-line rounded-2xl border border-dashed bg-white py-20 text-center dark:border-white/10 dark:bg-white/5 dark:text-gray-400">
            Không có bài viết nào phù hợp.
          </div>
        )}
      </div>
    </div>
  );
}

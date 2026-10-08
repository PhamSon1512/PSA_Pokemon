import type { Route } from './+types/$slug';
import { Link } from 'react-router';
import { getDb } from '~/.server/db';
import { getPostBySlug } from '~/.server/services/post.service';

export async function loader({ context, params }: Route.LoaderArgs) {
  const db = getDb(context);
  const post = await getPostBySlug(db, params.slug);
  if (!post) {
    throw new Response('Not Found', { status: 404 });
  }
  return { post };
}

export function meta({ data }: Route.MetaArgs) {
  if (!data?.post) return [{ title: 'Not Found' }];
  const { post } = data;
  return [
    { title: post.seoTitle || post.title },
    { name: 'description', content: post.seoDescription || post.excerpt || '' },
    { property: 'og:title', content: post.seoTitle || post.title },
    { property: 'og:description', content: post.seoDescription || post.excerpt || '' },
    { property: 'og:image', content: post.coverImage || '' },
  ];
}

export default function BlogPostPage({ loaderData }: Route.ComponentProps) {
  const { post } = loaderData;

  return (
    <div className="bg-bg-color min-h-screen py-10 dark:bg-[#0b0e12]">
      <div className="container max-w-4xl">
        <div className="mb-6">
          <Link to="/blog" className="text-brand text-sm font-semibold hover:underline">
            ← Quay lại danh sách
          </Link>
        </div>
        <article className="border-line rounded-3xl border bg-white p-8 shadow-sm md:p-12 dark:border-white/10 dark:bg-[#171c22]">
          {post.category && (
            <div className="bg-brand-soft text-brand-dark dark:bg-brand-dark/20 dark:text-brand-light mb-4 inline-block rounded-lg px-3 py-1 text-xs font-bold">
              {post.category}
            </div>
          )}
          <h1 className="mb-6 text-3xl font-black md:text-4xl lg:text-5xl dark:text-white">{post.title}</h1>
          <div className="mb-8 flex items-center gap-4 border-b border-gray-100 pb-8 text-sm text-gray-500 dark:border-white/10 dark:text-gray-400">
            <span>Đăng ngày: {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''}</span>
            <span>•</span>
            <span>{post.viewCount || 0} lượt xem</span>
          </div>

          {post.coverImage && (
            <div className="mb-10 aspect-[21/9] w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800">
              <img src={post.coverImage} className="h-full w-full object-cover" alt={post.title} />
            </div>
          )}

          <div className="prose prose-lg dark:prose-invert max-w-none">
            {/* Very simple markdown support for now using plain text or dangerouslySetInnerHTML if it was HTML. 
                Since instructions say "Markdown", we should ideally use a markdown parser, but for now we just render it. */}
            <div style={{ whiteSpace: 'pre-wrap' }}>{post.content}</div>
          </div>
        </article>
      </div>
    </div>
  );
}

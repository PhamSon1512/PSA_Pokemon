import type { Route } from './+types/_index';
import { Link, useNavigate } from 'react-router';
import { Edit, FileText, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import xior from 'xior';
import { getDb } from '~/.server/db';
import { requireAuthSession } from '~/.server/guard';
import { listAdminPosts } from '~/.server/services/post.service';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

export async function loader({ request, context }: Route.LoaderArgs) {
  await requireAuthSession(request, context);
  const db = getDb(context);
  const posts = await listAdminPosts(db);
  return { posts };
}

export default function AdminBlogList({ loaderData }: Route.ComponentProps) {
  const { posts } = loaderData;
  const navigate = useNavigate();

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
    try {
      const client = xior.create({ baseURL: '/api' });
      await client.delete(`/admin/posts/${id}`);
      toast.success('Xóa bài viết thành công');
      window.location.reload();
    } catch (e) {
      toast.error('Lỗi khi xóa bài viết');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'ARCHIVED':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'Đã xuất bản';
      case 'DRAFT':
        return 'Bản nháp';
      case 'ARCHIVED':
        return 'Lưu trữ';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Bài viết</h1>
          <p className="text-muted-foreground text-sm">Danh sách các bài viết trên blog.</p>
        </div>
        <Button asChild className="bg-brand hover:bg-brand-dark">
          <Link to="/admin/blog/new">
            <Plus className="mr-2 h-4 w-4" /> Thêm bài viết mới
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="border-b bg-gray-50/50 pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <FileText className="h-5 w-5 text-gray-500" />
            Tất cả bài viết ({posts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-muted-foreground border-b bg-white text-xs font-semibold uppercase">
                <tr>
                  <th className="px-6 py-4">Hình ảnh</th>
                  <th className="px-6 py-4">Tiêu đề</th>
                  <th className="px-6 py-4">Danh mục</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4">Lượt xem</th>
                  <th className="px-6 py-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-line divide-y bg-white">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      {post.coverImage ? (
                        <div className="h-12 w-20 overflow-hidden rounded border bg-gray-100 shadow-sm">
                          <img src={post.coverImage} alt="Cover" className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="flex h-12 w-20 items-center justify-center rounded border bg-gray-50 text-xs text-gray-400">
                          No Img
                        </div>
                      )}
                    </td>
                    <td className="max-w-[300px] px-6 py-4">
                      <div className="truncate font-semibold text-gray-900" title={post.title}>
                        {post.title}
                      </div>
                      <div className="text-muted-foreground mt-1 truncate text-xs" title={post.slug}>
                        /{post.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{post.category || '-'}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(post.status)}`}
                      >
                        {getStatusLabel(post.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{post.viewCount || 0}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/admin/blog/${post.id}/edit`)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleDelete(post.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {posts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500">
                      Chưa có bài viết nào trong hệ thống.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

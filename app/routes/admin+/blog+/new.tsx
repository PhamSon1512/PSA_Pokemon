import type { Route } from './+types/new';
import { useNavigate } from 'react-router';
import { useForm } from '@mantine/form';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import xior from 'xior';
import { requireAuthSession } from '~/.server/guard';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

export async function loader({ request, context }: Route.LoaderArgs) {
  await requireAuthSession(request, context);
  return {};
}

export default function AdminNewBlogPost() {
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      coverImage: '',
      category: '',
      status: 'DRAFT',
      seoTitle: '',
      seoDescription: '',
    },
    validate: {
      title: (v) => (!v ? 'Vui lòng nhập tiêu đề' : null),
      slug: (v) => (!v ? 'Vui lòng nhập slug' : null),
    },
  });

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      const client = xior.create({ baseURL: '/api' });
      await client.post('/admin/posts', values);
      toast.success('Tạo bài viết thành công');
      navigate('/admin/blog');
    } catch (error) {
      toast.error('Lỗi khi tạo bài viết');
    }
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/admin/blog')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Thêm bài viết mới</h1>
          <p className="text-muted-foreground text-sm">Tạo bài viết mới cho blog.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin bài viết</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input id="title" placeholder="Nhập tiêu đề" {...form.getInputProps('title')} />
              {form.errors.title && <p className="text-xs text-red-500">{form.errors.title}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="slug">Đường dẫn (slug) *</Label>
              <Input id="slug" placeholder="vd: danh-gia-the-pokemon" {...form.getInputProps('slug')} />
              {form.errors.slug && <p className="text-xs text-red-500">{form.errors.slug}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="excerpt">Mô tả ngắn</Label>
              <Input id="excerpt" placeholder="Đoạn mô tả ngắn gọn" {...form.getInputProps('excerpt')} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="coverImage">Ảnh bìa (URL)</Label>
              <Input id="coverImage" placeholder="https://..." {...form.getInputProps('coverImage')} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Danh mục</Label>
              <Input id="category" placeholder="vd: Tin tức, Hướng dẫn..." {...form.getInputProps('category')} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content">Nội dung (Markdown)</Label>
              <textarea
                id="content"
                rows={12}
                className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                placeholder="Nhập nội dung bài viết..."
                {...form.getInputProps('content')}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Trạng thái</Label>
              <select
                id="status"
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 focus-visible:outline-none dark:border-slate-800 dark:bg-slate-950 dark:focus-visible:ring-slate-300"
                {...form.getInputProps('status')}
              >
                <option value="DRAFT">Bản nháp</option>
                <option value="PUBLISHED">Xuất bản</option>
                <option value="ARCHIVED">Lưu trữ</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cấu hình SEO</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="seoTitle">SEO Title</Label>
              <Input id="seoTitle" placeholder="Tiêu đề SEO" {...form.getInputProps('seoTitle')} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="seoDescription">SEO Description</Label>
              <Input id="seoDescription" placeholder="Mô tả SEO" {...form.getInputProps('seoDescription')} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/blog')}>
            Hủy
          </Button>
          <Button type="submit" className="bg-brand hover:bg-brand-dark">
            <Save className="mr-2 h-4 w-4" /> Lưu bài viết
          </Button>
        </div>
      </form>
    </div>
  );
}

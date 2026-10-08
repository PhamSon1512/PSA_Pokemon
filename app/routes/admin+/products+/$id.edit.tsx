import type { Route } from './+types/$id.edit';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useForm } from '@mantine/form';
import { ArrowLeft, Check, Save, Tag } from 'lucide-react';
import { toast } from 'sonner';
import xior from 'xior';
import { getDb } from '~/.server/db';
import { requireAuthSession } from '~/.server/guard';
import { listBadges } from '~/.server/services/badge.service';
import { listCategories } from '~/.server/services/category.service';
import { getProductById } from '~/.server/services/product.service';
import { ImageUploader } from '~/components/admin/ImageUploader';
import { RichTextEditor } from '~/components/admin/RichTextEditor';
import { SeoPreview } from '~/components/admin/SeoPreview';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { CurrencyInput } from '~/components/ui/currency-input';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { NumberStepper } from '~/components/ui/number-stepper';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';
import { generateSlug } from './new';

export async function loader({ request, params, context }: Route.LoaderArgs) {
  await requireAuthSession(request, context);
  const db = getDb(context);
  const product = await getProductById(db, params.id);
  if (!product) throw new Response('Sản phẩm không tồn tại', { status: 404 });
  const [categories, badges] = await Promise.all([listCategories(db), listBadges(db)]);
  return { product, categories, badges };
}

export interface EditProductFormValues {
  name: string;
  slug: string;
  description: string;
  price: number | undefined;
  comparePrice: number | undefined;
  stock: number;
  category: string;
  status: 'ACTIVE' | 'DRAFT' | 'SOLD_OUT';
  badges: string[];
  images: string[];
  metaTitle: string;
  metaDescription: string;
  keywords: string;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/[0.05] dark:bg-[#161b22] dark:ring-white/10">
      <div className="rounded-t-xl border-b border-gray-100 px-4 py-3 dark:border-white/10">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-white">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: React.ReactNode;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </Label>
      {children}
      {hint && !error && <p className="text-muted-foreground text-[11px]">{hint}</p>}
      {error && <p className="text-[11px] font-medium text-red-500">{error}</p>}
    </div>
  );
}

export default function EditProductPage({ loaderData }: Route.ComponentProps) {
  const { product, categories, badges } = loaderData;
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const initialImages = product.images && product.images.length > 0 ? product.images : product.image ? [product.image] : [];

  const form = useForm<EditProductFormValues>({
    mode: 'uncontrolled',
    initialValues: {
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      price: product.price,
      comparePrice: product.comparePrice || undefined,
      stock: product.stock,
      category: product.category || (categories.length > 0 ? categories[0].name : ''),
      status: (product.status as any) || 'ACTIVE',
      badges: product.badges || [],
      images: initialImages,
      metaTitle: `${product.name} | CardVault VN`,
      metaDescription: product.description ? product.description.replace(/<[^>]*>?/gm, '').slice(0, 150) : '',
      keywords: product.category ? `${product.name}, ${product.category}, cardvault` : product.name,
    },
    validate: {
      name: (v) => (!v.trim() ? 'Tên sản phẩm không được để trống' : v.trim().length < 3 ? 'Tên sản phẩm tối thiểu 3 ký tự' : null),
      slug: (v) => (!v.trim() ? 'Slug không được để trống' : null),
      price: (v) => (!v || v <= 0 ? 'Giá bán phải lớn hơn 0' : null),
      stock: (v) => (!v || v <= 0 ? 'Số lượng tồn kho phải lớn hơn 0' : null),
      images: (v) => (v.length === 0 ? 'Vui lòng tải lên ít nhất 1 hình ảnh' : null),
    },
  });

  const toggleBadge = (name: string) => {
    const cur = form.values.badges;
    form.setFieldValue('badges', cur.includes(name) ? cur.filter((b) => b !== name) : [...cur, name]);
  };

  const handleSubmit = form.onSubmit(async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        name: values.name.trim(),
        slug: values.slug.trim(),
        description: values.description,
        price: Number(values.price),
        comparePrice: values.comparePrice ? Number(values.comparePrice) : null,
        stock: Number(values.stock),
        category: values.category,
        type: 'NORMAL',
        status: values.status,
        badges: values.badges,
        image: values.images[0] || null,
        images: values.images,
      };
      await xior.create({ baseURL: '/api' }).put(`/admin/products/${product.id}`, payload);
      toast.success('Cập nhật sản phẩm thành công!');
      navigate('/admin/products');
    } catch (err: any) {
      toast.error(
        err?.response?.data?.error?.message || err?.response?.data?.error || err?.message || 'Có lỗi xảy ra khi cập nhật sản phẩm',
      );
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <TooltipProvider delayDuration={150}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 pb-20">
        {/* ── Action bar ── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  asChild
                  className="h-8 w-8 shrink-0 rounded-lg border border-gray-200 bg-white text-gray-500 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-600 dark:border-white/10 dark:bg-white/5"
                >
                  <Link to="/admin/products">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Quay lại danh sách</p>
              </TooltipContent>
            </Tooltip>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Chỉnh sửa sản phẩm</h1>
                <Badge
                  variant="outline"
                  className="border-gray-200 bg-gray-50 font-mono text-[11px] text-gray-500 dark:border-white/10 dark:bg-white/5"
                >
                  {product.id.slice(0, 8)}
                </Badge>
              </div>
              <p className="text-muted-foreground text-xs">Cập nhật thông tin, bảng giá, danh mục và cấu hình SEO.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/admin/products')}
              disabled={submitting}
              className="h-8 rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-600 hover:border-amber-400 hover:bg-amber-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="h-8 gap-1.5 rounded-lg bg-amber-500 px-4 text-xs font-semibold text-white hover:bg-amber-600"
            >
              <Save className="h-3.5 w-3.5" />
              {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* LEFT */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <Panel title="Thông tin chung">
              <div className="flex flex-col gap-4">
                <Field label="Tên sản phẩm" required error={form.errors.name as string}>
                  <Input
                    id="name"
                    value={form.values.name}
                    onChange={(e) => form.setFieldValue('name', e.target.value)}
                    placeholder="Nhập tên sản phẩm..."
                    className="h-9 rounded-lg text-sm"
                  />
                </Field>

                <Field
                  label="Đường dẫn URL (Slug)"
                  required
                  error={form.errors.slug as string}
                  hint="Tối đa 80 ký tự — nên ngắn gọn, súc tích, chứa từ khóa chính."
                >
                  <div className="flex overflow-hidden rounded-lg border border-gray-200 bg-white transition-colors focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400/30 dark:border-white/10 dark:bg-white/5">
                    <span className="text-muted-foreground flex shrink-0 items-center border-r border-gray-200 bg-gray-50 px-2.5 text-[11px] dark:border-white/10 dark:bg-white/10">
                      /products/
                    </span>
                    <Input
                      id="slug"
                      value={form.values.slug}
                      onChange={(e) => form.setFieldValue('slug', generateSlug(e.target.value))}
                      maxLength={80}
                      className="h-9 rounded-none border-0 font-mono text-xs shadow-none focus-visible:ring-0"
                    />
                    <span className="text-muted-foreground flex shrink-0 items-center px-2.5 text-[11px]">
                      {form.values.slug.length}/80
                    </span>
                  </div>
                </Field>

                <Field label="Danh mục sản phẩm" required error={form.errors.category as string}>
                  <Select value={form.values.category} onValueChange={(v) => form.setFieldValue('category', v)}>
                    <SelectTrigger className="h-9 rounded-lg text-xs">
                      <SelectValue placeholder="Chọn danh mục..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.name} className="text-xs">
                          {c.name}
                        </SelectItem>
                      ))}
                      {categories.length === 0 && (
                        <SelectItem value="__empty__" disabled className="text-muted-foreground text-xs">
                          Chưa có danh mục nào
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </Field>

                <div className="flex flex-col gap-1.5">
                  <Label className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                    <Tag className="h-3.5 w-3.5" />
                    Nhãn nổi bật
                    <span className="text-muted-foreground ml-1 text-[11px] font-normal">(chọn nhiều)</span>
                  </Label>
                  {badges.length === 0 ? (
                    <p className="text-muted-foreground rounded-lg border border-dashed border-gray-200 py-3 text-center text-xs dark:border-white/10">
                      Chưa có nhãn nào
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {badges.map((b) => {
                        const selected = form.values.badges.includes(b.name);
                        return (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => toggleBadge(b.name)}
                            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-all ${
                              selected
                                ? 'border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-amber-300 hover:bg-amber-50/50 dark:border-white/10 dark:bg-white/5 dark:text-gray-400'
                            }`}
                          >
                            <span
                              className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
                                selected
                                  ? 'border-amber-500 bg-amber-500 text-white'
                                  : 'border-gray-300 bg-white dark:border-white/30 dark:bg-white/10'
                              }`}
                            >
                              {selected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                            </span>
                            {b.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <Field label="Mô tả sản phẩm">
                  <RichTextEditor value={form.values.description} onChange={(v) => form.setFieldValue('description', v)} />
                </Field>
              </div>
            </Panel>

            <Panel title="Hình ảnh sản phẩm">
              <ImageUploader
                images={form.values.images}
                onChange={(imgs) => form.setFieldValue('images', imgs)}
                error={form.errors.images as string}
              />
            </Panel>

            <Panel title="Giá bán & Tồn kho">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Giá bán" required error={form.errors.price as string}>
                  <CurrencyInput
                    value={form.values.price}
                    onChange={(v) => form.setFieldValue('price', v)}
                    className="font-semibold text-red-600 dark:text-red-400"
                    placeholder="0"
                  />
                </Field>
                <Field label="Giá gốc (trước giảm)" hint="Để trống nếu không có KM">
                  <CurrencyInput
                    value={form.values.comparePrice}
                    onChange={(v) => form.setFieldValue('comparePrice', v)}
                    placeholder="0"
                  />
                </Field>
                <Field label="Số lượng tồn kho" required error={form.errors.stock as string}>
                  <NumberStepper value={form.values.stock} onChange={(v) => form.setFieldValue('stock', v)} />
                </Field>
              </div>
            </Panel>

            <Panel title="Tối ưu hóa tìm kiếm (SEO)">
              <SeoPreview
                slug={form.values.slug}
                productName={form.values.name}
                metaTitle={form.values.metaTitle}
                onMetaTitleChange={(v) => form.setFieldValue('metaTitle', v)}
                metaDescription={form.values.metaDescription}
                onMetaDescriptionChange={(v) => form.setFieldValue('metaDescription', v)}
                keywords={form.values.keywords}
                onKeywordsChange={(v) => form.setFieldValue('keywords', v)}
              />
            </Panel>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-4">
            <Panel title="Trạng thái xuất bản">
              <div className="flex flex-col gap-3">
                <Select
                  value={form.values.status}
                  onValueChange={(v) => form.setFieldValue('status', v as EditProductFormValues['status'])}
                >
                  <SelectTrigger className="h-9 w-full rounded-lg text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE" className="text-xs">
                      Đang bán công khai
                    </SelectItem>
                    <SelectItem value="DRAFT" className="text-xs">
                      Bản nháp (Ẩn với khách)
                    </SelectItem>
                    <SelectItem value="SOLD_OUT" className="text-xs">
                      Hết hàng
                    </SelectItem>
                  </SelectContent>
                </Select>
                {form.values.status === 'DRAFT' && (
                  <p className="rounded-lg bg-amber-50 px-3 py-2 text-[11px] text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                    Bản nháp — sản phẩm ẩn với khách hàng cho đến khi chuyển sang Đang bán.
                  </p>
                )}
                {form.values.status === 'SOLD_OUT' && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-[11px] text-red-700 dark:bg-red-500/10 dark:text-red-400">
                    Hết hàng — khách xem được nhưng không thể đặt mua.
                  </p>
                )}
              </div>
            </Panel>

            <Panel title="Kiểm tra trước khi lưu">
              <ul className="flex flex-col gap-2">
                {[
                  { label: 'Đã nhập tên sản phẩm', ok: form.values.name.trim().length >= 3 },
                  { label: 'Slug đã được tạo', ok: form.values.slug.length > 0 },
                  { label: 'Đã chọn danh mục sản phẩm', ok: !!form.values.category && form.values.category !== '__empty__' },
                  { label: 'Đã tải lên ít nhất 1 ảnh', ok: form.values.images.length > 0 },
                  { label: 'Đã nhập giá bán hợp lệ (> 0 VNĐ)', ok: !!form.values.price && form.values.price > 0 },
                  { label: 'Số lượng tồn kho hợp lệ (> 0)', ok: typeof form.values.stock === 'number' && form.values.stock > 0 },
                  { label: 'Đã thiết lập Tiêu đề SEO', ok: form.values.metaTitle.trim().length > 0 },
                  { label: 'Đã có Mô tả SEO', ok: form.values.metaDescription.trim().length > 0 },
                ].map((item) => (
                  <li
                    key={item.label}
                    className={`flex items-center gap-2 text-xs ${item.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`}
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                        item.ok
                          ? 'border-emerald-400 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-500/20'
                          : 'border-gray-200 dark:border-white/10'
                      }`}
                    >
                      {item.ok && <Check className="h-2.5 w-2.5 stroke-[3] text-emerald-600 dark:text-emerald-400" />}
                    </span>
                    {item.label}
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </div>
      </form>
    </TooltipProvider>
  );
}

import React, { useEffect, useState } from 'react';
import { useForm } from '@mantine/form';
import { FileText, Globe, Image as ImageIcon, Package, Plus, Save, Sparkles, Tag } from 'lucide-react';
import { toast } from 'sonner';
import xior from 'xior';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '~/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { ImageUploader } from './ImageUploader';
import { RichTextEditor } from './RichTextEditor';
import { SeoPreview } from './SeoPreview';

export interface ProductFormInitialValues {
  id?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice: number | undefined;
  stock: number;
  category: string;
  type: 'NORMAL' | 'MYSTERY_BAG';
  status: 'ACTIVE' | 'DRAFT' | 'SOLD_OUT';
  badges: string[];
  images: string[];
  metaTitle: string;
  metaDescription: string;
  keywords: string;
}

interface ProductFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: Partial<ProductFormInitialValues> | null;
  onSuccess: () => void;
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const CATEGORY_OPTIONS = [
  { value: 'Mystery Bag', label: 'Túi Mù (Mystery Bag)' },
  { value: 'Pokemon TCG', label: 'Pokemon TCG' },
  { value: 'One Piece TCG', label: 'One Piece TCG' },
  { value: 'Yu-Gi-Oh!', label: 'Yu-Gi-Oh!' },
  { value: 'Phụ kiện bảo quản', label: 'Phụ kiện bảo quản' },
  { value: 'Thẻ nguyên bản', label: 'Thẻ nguyên bản' },
];

const AVAILABLE_BADGES = ['Bán chạy', 'Hit Rate Cao', 'Trợ giá', 'Mới', 'Hàng giới hạn', 'Chính hãng', 'Freeship Extra'];

export function ProductFormSheet({ open, onOpenChange, initialValues, onSuccess }: ProductFormSheetProps) {
  const isEditing = Boolean(initialValues?.id);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const form = useForm<ProductFormInitialValues>({
    initialValues: {
      id: initialValues?.id || undefined,
      name: initialValues?.name || '',
      slug: initialValues?.slug || '',
      description: initialValues?.description || '',
      price: initialValues?.price || 0,
      comparePrice: initialValues?.comparePrice || undefined,
      stock: initialValues?.stock ?? 10,
      category: initialValues?.category || 'Pokemon TCG',
      type: initialValues?.type || 'NORMAL',
      status: initialValues?.status || 'ACTIVE',
      badges: initialValues?.badges || ['Chính hãng'],
      images: initialValues?.images || (initialValues?.image ? [initialValues.image] : []),
      metaTitle: initialValues?.metaTitle || '',
      metaDescription: initialValues?.metaDescription || '',
      keywords: initialValues?.keywords || '',
    },
    validate: {
      name: (v) => (!v.trim() ? 'Tên sản phẩm không được để trống' : v.length < 3 ? 'Tên sản phẩm tối thiểu 3 ký tự' : null),
      slug: (v) => (!v.trim() ? 'Slug đường dẫn không được để trống' : null),
      price: (v) => (v <= 0 ? 'Giá bán phải lớn hơn 0' : null),
      stock: (v) => (v < 0 ? 'Số lượng tồn kho không được nhỏ hơn 0' : null),
      category: (v) => (!v ? 'Vui lòng chọn danh mục sản phẩm' : null),
      images: (v) => (v.length === 0 ? 'Vui lòng tải lên ít nhất 1 hình ảnh sản phẩm' : null),
    },
  });

  // Re-initialize form whenever initialValues change or sheet opens
  useEffect(() => {
    if (open) {
      form.setValues({
        id: initialValues?.id || undefined,
        name: initialValues?.name || '',
        slug: initialValues?.slug || '',
        description: initialValues?.description || '',
        price: initialValues?.price || 0,
        comparePrice: initialValues?.comparePrice || undefined,
        stock: initialValues?.stock ?? 10,
        category: initialValues?.category || 'Pokemon TCG',
        type: initialValues?.type || 'NORMAL',
        status: initialValues?.status || 'ACTIVE',
        badges: initialValues?.badges || ['Chính hãng'],
        images: initialValues?.images || (initialValues?.image ? [initialValues.image] : []),
        metaTitle: initialValues?.metaTitle || '',
        metaDescription: initialValues?.metaDescription || '',
        keywords: initialValues?.keywords || '',
      });
      setActiveTab('basic');
    }
  }, [open, initialValues]);

  // Handle automatic slug generation when name changes (only if slug wasn't manually customized yet)
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    form.setFieldValue('name', newName);
    if (!isEditing || !form.values.slug) {
      form.setFieldValue('slug', generateSlug(newName));
    }
  };

  const handleBadgeToggle = (badgeName: string) => {
    const current = form.values.badges;
    if (current.includes(badgeName)) {
      form.setFieldValue(
        'badges',
        current.filter((b) => b !== badgeName),
      );
    } else {
      form.setFieldValue('badges', [...current, badgeName]);
    }
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
        type: values.type,
        status: values.status,
        badges: values.badges,
        image: values.images[0] || null,
        images: values.images,
      };

      const client = xior.create({ baseURL: '/api' });

      if (isEditing && values.id) {
        await client.put(`/admin/products/${values.id}`, payload);
        toast.success('Cập nhật sản phẩm thành công!');
      } else {
        await client.post('/admin/products', payload);
        toast.success('Tạo sản phẩm mới thành công!');
      }

      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.error?.message || err?.response?.data?.error || err?.message || 'Có lỗi xảy ra khi lưu sản phẩm';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-3xl overflow-y-auto p-0 dark:border-white/10 dark:bg-[#111827]">
        <form onSubmit={handleSubmit} className="flex h-full flex-col">
          {/* Header */}
          <SheetHeader className="border-b bg-gray-50/80 p-6 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-500/10 text-amber-500">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <SheetTitle className="text-xl font-bold dark:text-white">
                  {isEditing ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
                </SheetTitle>
                <SheetDescription className="text-xs">
                  {isEditing
                    ? 'Chỉnh sửa thông tin chi tiết, hình ảnh và chuẩn hóa SEO sản phẩm.'
                    : 'Nhập thông tin sản phẩm, tải ảnh kéo thả và cấu hình chuẩn SEO.'}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Form Tabs Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-6 grid w-full grid-cols-4 bg-gray-100 dark:bg-white/5">
                <TabsTrigger value="basic" className="gap-1.5 text-xs font-bold">
                  <Package className="h-3.5 w-3.5" /> Thông tin chính
                </TabsTrigger>
                <TabsTrigger value="media" className="gap-1.5 text-xs font-bold">
                  <ImageIcon className="h-3.5 w-3.5" /> Ảnh kéo thả ({form.values.images.length})
                </TabsTrigger>
                <TabsTrigger value="desc" className="gap-1.5 text-xs font-bold">
                  <FileText className="h-3.5 w-3.5" /> Mô tả
                </TabsTrigger>
                <TabsTrigger value="seo" className="gap-1.5 text-xs font-bold">
                  <Globe className="h-3.5 w-3.5" /> Chuẩn SEO
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: BASIC INFO & PRICING */}
              <TabsContent value="basic" className="space-y-5">
                {/* Product Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-semibold">
                    Tên sản phẩm <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={form.values.name}
                    onChange={handleNameChange}
                    placeholder="Ví dụ: Túi Mù (Mystery Bag) Pokemon TCG - Tỉ lệ Hit Siêu Cao"
                    className="h-11 rounded-xl text-sm"
                  />
                  {form.errors.name && <p className="text-destructive text-[0.75rem] font-medium">{form.errors.name}</p>}
                </div>

                {/* Slug */}
                <div className="space-y-1.5">
                  <Label htmlFor="slug" className="text-sm font-semibold">
                    Slug đường dẫn (URL) <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex rounded-xl border focus-within:ring-1 focus-within:ring-amber-500">
                    <span className="text-muted-foreground flex items-center rounded-l-xl bg-gray-100 px-3 text-xs font-medium dark:bg-white/10">
                      https://cardvault.vn/products/
                    </span>
                    <Input
                      id="slug"
                      {...form.getInputProps('slug')}
                      placeholder="tui-mu-pokemon-tcg"
                      className="h-10 rounded-l-none border-0 focus-visible:ring-0"
                    />
                  </div>
                  {form.errors.slug && <p className="text-destructive text-[0.75rem] font-medium">{form.errors.slug}</p>}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Category */}
                  <div className="space-y-1.5">
                    <Label htmlFor="category" className="text-sm font-semibold">
                      Danh mục sản phẩm <span className="text-red-500">*</span>
                    </Label>
                    <Select value={form.values.category} onValueChange={(val) => form.setFieldValue('category', val)}>
                      <SelectTrigger id="category" className="h-11 rounded-xl">
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Type */}
                  <div className="space-y-1.5">
                    <Label htmlFor="type" className="text-sm font-semibold">
                      Loại sản phẩm
                    </Label>
                    <Select
                      value={form.values.type}
                      onValueChange={(val) => form.setFieldValue('type', val as 'NORMAL' | 'MYSTERY_BAG')}
                    >
                      <SelectTrigger id="type" className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NORMAL">Thẻ bài / Phụ kiện chuẩn</SelectItem>
                        <SelectItem value="MYSTERY_BAG">Túi mù (Mystery Bag)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {/* Price */}
                  <div className="space-y-1.5">
                    <Label htmlFor="price" className="text-sm font-semibold">
                      Giá bán chính thức (VNĐ) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      min={0}
                      value={form.values.price}
                      onChange={(e) => form.setFieldValue('price', Number(e.target.value))}
                      placeholder="249000"
                      className="h-11 rounded-xl font-bold text-red-600"
                    />
                    {form.errors.price && <p className="text-destructive text-[0.75rem] font-medium">{form.errors.price}</p>}
                  </div>

                  {/* Compare Price */}
                  <div className="space-y-1.5">
                    <Label htmlFor="comparePrice" className="text-sm font-semibold">
                      Giá niêm yết cũ (Gốc)
                    </Label>
                    <Input
                      id="comparePrice"
                      type="number"
                      min={0}
                      value={form.values.comparePrice || ''}
                      onChange={(e) => form.setFieldValue('comparePrice', e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="350000"
                      className="h-11 rounded-xl"
                    />
                  </div>

                  {/* Stock */}
                  <div className="space-y-1.5">
                    <Label htmlFor="stock" className="text-sm font-semibold">
                      Số lượng tồn kho <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="stock"
                      type="number"
                      min={0}
                      value={form.values.stock}
                      onChange={(e) => form.setFieldValue('stock', Number(e.target.value))}
                      className="h-11 rounded-xl font-bold"
                    />
                    {form.errors.stock && <p className="text-destructive text-[0.75rem] font-medium">{form.errors.stock}</p>}
                  </div>
                </div>

                {/* Status Selection */}
                <div className="space-y-1.5">
                  <Label htmlFor="status" className="text-sm font-semibold">
                    Trạng thái mở bán
                  </Label>
                  <Select value={form.values.status} onValueChange={(val) => form.setFieldValue('status', val as any)}>
                    <SelectTrigger id="status" className="h-11 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">🟢 Đang bán công khai (ACTIVE)</SelectItem>
                      <SelectItem value="DRAFT">🟡 Bản nháp (DRAFT)</SelectItem>
                      <SelectItem value="SOLD_OUT">🔴 Hết hàng (SOLD_OUT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Badges Chips */}
                <div className="space-y-2 pt-2">
                  <Label className="flex items-center gap-1.5 text-sm font-semibold">
                    <Sparkles className="h-4 w-4 text-amber-500" /> Nhãn hiển thị nổi bật (Badges)
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_BADGES.map((b) => {
                      const isSelected = form.values.badges.includes(b);
                      return (
                        <button
                          key={b}
                          type="button"
                          onClick={() => handleBadgeToggle(b)}
                          className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                            isSelected
                              ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-gray-300'
                          }`}
                        >
                          <Checkbox checked={isSelected} className="pointer-events-none h-3.5 w-3.5 rounded" />
                          {b}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>

              {/* TAB 2: DRAG AND DROP IMAGE UPLOADER */}
              <TabsContent value="media">
                <ImageUploader
                  images={form.values.images}
                  onChange={(newImgs) => form.setFieldValue('images', newImgs)}
                  error={form.errors.images as string}
                />
              </TabsContent>

              {/* TAB 3: RICH TEXT DESCRIPTION */}
              <TabsContent value="desc" className="space-y-2">
                <Label className="text-sm font-semibold">
                  Mô tả chi tiết sản phẩm (Hỗ trợ in đậm, in nghiêng, tiêu đề, danh sách)
                </Label>
                <RichTextEditor value={form.values.description} onChange={(val) => form.setFieldValue('description', val)} />
              </TabsContent>

              {/* TAB 4: SEO SUITE */}
              <TabsContent value="seo">
                <SeoPreview
                  slug={form.values.slug}
                  productName={form.values.name}
                  metaTitle={form.values.metaTitle}
                  onMetaTitleChange={(val) => form.setFieldValue('metaTitle', val)}
                  metaDescription={form.values.metaDescription}
                  onMetaDescriptionChange={(val) => form.setFieldValue('metaDescription', val)}
                  keywords={form.values.keywords}
                  onKeywordsChange={(val) => form.setFieldValue('keywords', val)}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer Actions */}
          <div className="border-t bg-gray-50/80 p-4 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
                className="rounded-xl font-semibold"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="gap-2 rounded-xl bg-amber-500 font-bold text-white shadow-md hover:bg-amber-600"
              >
                <Save className="h-4 w-4" />
                {submitting ? 'Đang lưu sản phẩm...' : isEditing ? 'Lưu thay đổi' : 'Tạo mới sản phẩm'}
              </Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

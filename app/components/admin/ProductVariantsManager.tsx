import React, { useRef, useState } from 'react';
import { Image as ImageIcon, Plus, Trash2, UploadCloud, X } from 'lucide-react';
import { toast } from 'sonner';
import xior from 'xior';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog';
import { Button } from '~/components/ui/button';
import { CurrencyInput } from '~/components/ui/currency-input';
import { Dialog, DialogContent } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { NumberStepper } from '~/components/ui/number-stepper';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { Switch } from '~/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';

interface Variant {
  name: string;
  sku: string;
  price: number | undefined;
  comparePrice?: number | undefined;
  stock: number;
  image: string;
  condition: string;
  language: string;
  finish: string;
  key: string;
}

interface ProductVariantsManagerProps {
  productName?: string;
  hasVariants: boolean;
  onHasVariantsChange: (checked: boolean) => void;
  variants: Variant[];
  onVariantsChange: (variants: Variant[]) => void;
  getVariantError?: (index: number, field: keyof Variant) => React.ReactNode;
}

// Danh sách các từ khóa rác/chung chung thường gặp trong TMĐT thẻ bài
const STOP_WORDS = new Set([
  'THE',
  'BAI',
  'CHINH',
  'HANG',
  'TAI',
  'POKE',
  'PIECE',
  'HA',
  'NOI',
  'HCM',
  'HO',
  'CHI',
  'MINH',
  'GIA',
  'RE',
  'CAO',
  'CAP',
  'TOT',
  'NHAT',
  'DEP',
  'MOI',
  'CU',
  '99',
  'LIKE',
  'NEW',
  'FULL',
  'BOX',
  'REAL',
  'AUTH',
  'AUTHENTIC',
  'VN',
  'VIET',
  'NAM',
  'GIAO',
  'NGAY',
  'HOA',
  'TOC',
  'SHOP',
  'STORE',
  'ONLINE',
  'OFFLINE',
  'CHUYEN',
  'CUNG',
  'CAP',
  'SỈ',
  'LE',
  'BAN',
]);

export function ProductVariantsManager({
  productName = '',
  hasVariants,
  onHasVariantsChange,
  variants,
  onVariantsChange,
  getVariantError,
}: ProductVariantsManagerProps) {
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggingIndex !== index) {
      setDraggingIndex(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingIndex(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingIndex(null);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleImageUpload(index, files[0]);
    }
  };

  const addVariant = () => {
    onVariantsChange([
      ...variants,
      {
        key: Math.random().toString(36).substring(2, 9),
        name: '',
        sku: '',
        price: undefined,
        comparePrice: undefined,
        stock: 0,
        image: '',
        condition: '',
        language: '',
        finish: '',
      },
    ]);
  };

  const removeVariant = (index: number) => {
    const newVariants = [...variants];
    newVariants.splice(index, 1);
    onVariantsChange(newVariants);
    setDeletingIndex(null);
  };

  // Smart SKU Generator: Lọc keyword rác, chỉ giữ lại keyword quan trọng
  const generateSmartSKU = (baseName: string, variantName: string) => {
    const cleanStr = (str: string) =>
      str
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'D')
        .replace(/[^A-Z0-9\s]/g, ' ')
        .trim();

    // Kết hợp tên sản phẩm gốc (nếu có) và tên biến thể
    const combined = `${cleanStr(baseName)} ${cleanStr(variantName)}`;

    // Tách từ và lọc bỏ stop words
    const words = combined.split(/\s+/).filter((word) => word.length > 0 && !STOP_WORDS.has(word));

    // Nếu lọc xong mà mất hết từ (trường hợp hiếm), thì fallback dùng ký tự đầu tiên của chuỗi gốc
    if (words.length === 0) {
      return cleanStr(variantName).split(/\s+/).join('-').slice(0, 15);
    }

    // Ghép các keyword lại bằng dấu gạch ngang
    return words.join('-').slice(0, 30).replace(/-$/, '');
  };

  const updateVariant = (index: number, field: keyof Variant, value: any) => {
    const newVariants = [...variants];

    if (field === 'name') {
      const oldName = newVariants[index].name;
      const oldSKU = newVariants[index].sku;
      newVariants[index] = { ...newVariants[index], name: value };

      // So sánh SKU cũ với SKU được gen tự động từ tên CŨ.
      // Nếu khớp (nghĩa là user chưa từng sửa tay SKU này) hoặc SKU đang trống, thì gen SKU MỚI.
      const oldGeneratedSKU = generateSmartSKU(productName, oldName);
      if (!oldSKU || oldSKU === oldGeneratedSKU) {
        newVariants[index].sku = generateSmartSKU(productName, value);
      }
    } else {
      newVariants[index] = { ...newVariants[index], [field]: value };
    }

    onVariantsChange(newVariants);
  };

  const handleImageUpload = async (index: number, file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh hợp lệ');
      return;
    }
    const toastId = toast.loading('Đang tải ảnh biến thể...');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await xior.post('/api/media', formData);
      const data = res.data;
      const url = data?.url || data?.data?.url;
      if (url) {
        updateVariant(index, 'image', url);
        toast.success('Đã tải lên ảnh biến thể', { id: toastId });
      } else {
        throw new Error('Upload failed');
      }
    } catch (e) {
      toast.error('Lỗi khi tải ảnh lên', { id: toastId });
    }
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#161b22]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Biến thể sản phẩm</h3>
          <p className="mt-1 text-xs text-gray-500">Cấu hình các phiên bản (Condition, Ngôn ngữ, Finish...) cho thẻ bài.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Switch checked={hasVariants} onCheckedChange={onHasVariantsChange} id="has-variants" />
          <Label htmlFor="has-variants" className="cursor-pointer text-sm font-medium">
            Có nhiều biến thể
          </Label>
        </div>
      </div>

      {hasVariants && (
        <div className="animate-in fade-in slide-in-from-top-2 mt-4 duration-300">
          {variants.length > 0 ? (
            <div className="overflow-x-auto overflow-y-hidden rounded-lg border border-gray-200 bg-white pb-4 shadow-sm dark:border-gray-800 dark:bg-[#161b22]">
              <table className="w-full min-w-[1150px] table-fixed text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-800/50">
                    <th
                      style={{ width: '60px' }}
                      className="h-10 px-2 text-center align-middle font-medium whitespace-nowrap text-gray-500 dark:text-gray-400"
                    >
                      Ảnh
                    </th>
                    <th
                      style={{ width: '120px' }}
                      className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-gray-500 dark:text-gray-400"
                    >
                      SKU
                    </th>
                    <th
                      style={{ width: '300px' }}
                      className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-gray-500 dark:text-gray-400"
                    >
                      Phân loại / Tên <span className="text-red-500">*</span>
                    </th>
                    <th
                      style={{ width: '150px' }}
                      className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-gray-500 dark:text-gray-400"
                    >
                      Thuộc tính
                    </th>
                    <th
                      style={{ width: '150px' }}
                      className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-gray-500 dark:text-gray-400"
                    >
                      Giá bán <span className="text-red-500">*</span>
                    </th>
                    <th
                      style={{ width: '150px' }}
                      className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-gray-500 dark:text-gray-400"
                    >
                      Giá gốc
                    </th>
                    <th
                      style={{ width: '120px' }}
                      className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-gray-500 dark:text-gray-400"
                    >
                      Tồn kho <span className="text-red-500">*</span>
                    </th>
                    <th style={{ width: '50px' }} className="h-10 px-2 text-center align-middle font-medium whitespace-nowrap"></th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v, i) => (
                    <tr key={v.key} className="group transition-colors hover:bg-gray-50/30 dark:hover:bg-gray-800/30">
                      {/* Ảnh */}
                      <td className="p-2 align-top">
                        <div
                          className={`relative mx-auto flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border border-dashed transition-colors dark:bg-gray-800 ${draggingIndex === i ? 'border-amber-500 bg-amber-50 dark:border-amber-500 dark:bg-amber-500/10' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700'}`}
                          onDragOver={(e) => handleDragOver(e, i)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, i)}
                        >
                          {v.image ? (
                            <div className="group/image relative h-full w-full">
                              <img
                                src={v.image}
                                alt="variant"
                                className="h-full w-full cursor-pointer object-cover transition-opacity hover:opacity-80"
                                onClick={() => setPreviewImage(v.image)}
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateVariant(i, 'image', '');
                                }}
                                className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center bg-black/50 text-white opacity-0 transition-all group-hover/image:opacity-100 hover:bg-red-500"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <Label className="flex h-full w-full cursor-pointer items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-gray-400 transition-colors group-hover:text-amber-500" />
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) handleImageUpload(i, e.target.files[0]);
                                  e.target.value = '';
                                }}
                              />
                            </Label>
                          )}
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="p-2 align-top">
                        <Input
                          placeholder="SKU"
                          value={v.sku}
                          readOnly
                          className="h-9 w-full cursor-not-allowed bg-gray-50/50 text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-gray-800/50"
                        />
                      </td>

                      {/* Tên */}
                      <td className="p-2 align-top">
                        <Input
                          placeholder="Vd: Charizard Holo"
                          value={v.name}
                          onChange={(e) => updateVariant(i, 'name', e.target.value)}
                          className={`h-9 w-full ${getVariantError?.(i, 'name') ? 'border-red-500' : ''}`}
                        />
                        {getVariantError?.(i, 'name') && (
                          <span className="mt-1 block text-[10px] text-red-500">{getVariantError(i, 'name')}</span>
                        )}
                      </td>

                      {/* Thuộc tính */}
                      <td className="p-2 align-top">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-9 w-full justify-between bg-transparent px-3 text-xs font-normal text-gray-500 shadow-xs transition-all hover:border-amber-500 hover:bg-amber-500/5 focus-visible:border-amber-500 focus-visible:ring-[3px] focus-visible:ring-amber-500/20 dark:hover:bg-amber-500/10"
                            >
                              {v.condition || v.language || v.finish ? 'Đã thiết lập' : '+ Thêm'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-64 p-3" align="start">
                            <div className="space-y-3">
                              <h4 className="text-sm font-medium">Thuộc tính (Tùy chọn)</h4>
                              <div className="space-y-1">
                                <Label className="text-xs text-gray-500">Tình trạng (Condition)</Label>
                                <Input
                                  placeholder="Vd: PSA 10, NM, LP..."
                                  className="h-8 text-xs"
                                  value={v.condition}
                                  onChange={(e) => updateVariant(i, 'condition', e.target.value)}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs text-gray-500">Ngôn ngữ</Label>
                                <Input
                                  placeholder="Vd: English, Japanese..."
                                  className="h-8 text-xs"
                                  value={v.language}
                                  onChange={(e) => updateVariant(i, 'language', e.target.value)}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs text-gray-500">Chất liệu (Finish)</Label>
                                <Input
                                  placeholder="Vd: Holo, Reverse Holo..."
                                  className="h-8 text-xs"
                                  value={v.finish}
                                  onChange={(e) => updateVariant(i, 'finish', e.target.value)}
                                />
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </td>

                      {/* Giá bán */}
                      <td className="p-2 align-top">
                        <CurrencyInput
                          value={v.price}
                          onChange={(val) => updateVariant(i, 'price', val)}
                          placeholder="Giá bán"
                          className={`h-9 w-full ${getVariantError?.(i, 'price') ? 'border-red-500' : ''}`}
                        />
                        {getVariantError?.(i, 'price') && (
                          <span className="mt-1 block text-[10px] text-red-500">{getVariantError(i, 'price')}</span>
                        )}
                      </td>

                      {/* Giá gốc */}
                      <td className="p-2 align-top">
                        <CurrencyInput
                          value={v.comparePrice}
                          onChange={(val) => updateVariant(i, 'comparePrice', val)}
                          placeholder="Giá gốc"
                          className="h-9 w-full bg-gray-50/50 text-gray-500 focus-visible:bg-white dark:bg-gray-800/50 dark:focus-visible:bg-gray-900"
                        />
                      </td>

                      {/* Tồn kho */}
                      <td className="p-2 align-top">
                        <NumberStepper
                          value={v.stock}
                          onChange={(val) => updateVariant(i, 'stock', val)}
                          min={0}
                          className="h-9 w-full"
                        />
                      </td>

                      {/* Nút xóa */}
                      <td className="p-2 text-center align-top">
                        <AlertDialog
                          open={deletingIndex === i}
                          onOpenChange={(open) => {
                            if (!open) setDeletingIndex(null);
                          }}
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                                onClick={() => setDeletingIndex(i)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="text-xs">
                              <p>Xóa biến thể</p>
                            </TooltipContent>
                          </Tooltip>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xóa biến thể?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Hành động này sẽ xóa biến thể khỏi danh sách hiện tại. Bạn không thể hoàn tác nếu đã lưu sản phẩm.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => removeVariant(i)}
                                className="bg-red-500 text-white hover:bg-red-600"
                              >
                                Xác nhận xóa
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-gray-300 py-8 text-center dark:border-gray-800">
              <p className="mb-3 text-sm text-gray-500">Chưa có biến thể nào được cấu hình</p>
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addVariant}
            className="mt-3 border-dashed border-gray-300 text-amber-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 dark:border-gray-700 dark:text-amber-500 dark:hover:border-amber-500/50 dark:hover:bg-amber-500/10"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Thêm biến thể mới
          </Button>
        </div>
      )}

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-3xl border-none bg-transparent p-0 shadow-none" showCloseButton={false}>
          {previewImage && (
            <div className="relative flex items-center justify-center">
              <img src={previewImage} alt="Preview" className="max-h-[85vh] w-auto rounded-md object-contain shadow-2xl" />
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="absolute -top-4 -right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

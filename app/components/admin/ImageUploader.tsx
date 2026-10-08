import React, { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ImagePlus, Star, Trash2, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  error?: string;
}

export function ImageUploader({ images, onChange, maxImages = 5, error }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validImages = fileArray.filter((file) => file.type.startsWith('image/'));

    if (validImages.length === 0) {
      toast.error('Vui lòng chỉ chọn các định dạng ảnh (PNG, JPG, WEBP, GIF).');
      return;
    }

    if (images.length + validImages.length > maxImages) {
      toast.warning(`Chỉ được tải lên tối đa ${maxImages} hình ảnh sản phẩm.`);
    }

    const availableSlots = maxImages - images.length;
    const filesToUpload = validImages.slice(0, availableSlots);

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of filesToUpload) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`Ảnh ${file.name} vượt quá dung lượng 5MB cho phép.`);
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);

        // Upload directly via HTTP client to backend endpoint (media service -> R2)
        const response = await fetch('/api/media', {
          method: 'POST',
          body: formData,
          // If we need auth token, we could use `http.post` from `~/lib/http`
          // but fetch works fine if the cookie auth is mapped properly, or we can just import http
        });

        if (!response.ok) {
          toast.error(`Không thể tải lên ảnh ${file.name}`);
          continue;
        }

        const result = await response.json();
        // The API returns the Media object which includes the public 'url'
        if (result.url) {
          uploadedUrls.push(result.url);
        } else if (result.data && result.data.url) {
          uploadedUrls.push(result.data.url);
        }
      }

      if (uploadedUrls.length > 0) {
        onChange([...images, ...uploadedUrls]);
        toast.success(`Đã tải lên ${uploadedUrls.length} ảnh thành công`);
      }
    } catch (err) {
      console.error('Lỗi khi tải ảnh:', err);
      toast.error('Có lỗi xảy ra trong quá trình tải ảnh lên hệ thống.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    const [selected] = newImages.splice(index, 1);
    newImages.unshift(selected);
    onChange(newImages);
    toast.success('Đã chọn làm ảnh bìa chính');
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    const newImages = [...images];
    const temp = newImages[index];
    newImages[index] = newImages[newIndex];
    newImages[newIndex] = temp;
    onChange(newImages);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end">
        <span className="text-muted-foreground text-xs">
          {images.length}/{maxImages} ảnh · Ảnh đầu tiên là ảnh bìa
        </span>
      </div>

      {/* Drag & Drop Box */}
      {images.length < maxImages && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-line flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition-all ${
            isDragging
              ? 'scale-[1.01] border-amber-500 bg-amber-500/10'
              : 'bg-gray-50/50 hover:bg-gray-100/80 dark:bg-white/5 dark:hover:bg-white/10'
          }`}
        >
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
          <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/10 text-amber-500">
            <UploadCloud className="h-6 w-6" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold dark:text-white">
              Kéo & thả tập tin ảnh vào đây, hoặc <span className="text-amber-500 underline">duyệt từ máy tính</span>
            </p>
            <p className="text-muted-foreground mt-1 text-xs">Hỗ trợ PNG, JPG, WEBP, GIF (Tối đa 5MB / ảnh)</p>
          </div>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {images.map((src, index) => (
            <div
              key={index}
              className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-black/5 dark:border-white/10 dark:bg-white/5"
            >
              <img
                src={src}
                alt={`Product thumbnail ${index + 1}`}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />

              {/* Cover Badge */}
              {index === 0 ? (
                <Badge className="absolute top-2 left-2 border-0 bg-amber-500 text-[10px] font-bold text-white shadow">
                  <Star className="mr-1 h-3 w-3 fill-white" /> Ảnh bìa
                </Badge>
              ) : (
                <Badge variant="secondary" className="absolute top-2 left-2 bg-black/60 text-[10px] text-white backdrop-blur">
                  #{index + 1}
                </Badge>
              )}

              {/* Controls Hover Overlay */}
              <div className="absolute inset-0 flex flex-col justify-between bg-black/60 p-2 opacity-0 backdrop-blur-xs transition-opacity group-hover:opacity-100">
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-7 w-7 rounded-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(index);
                    }}
                    title="Xóa ảnh"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="space-y-1">
                  {index !== 0 && (
                    <Button
                      type="button"
                      size="sm"
                      className="h-7 w-full bg-amber-500 text-[11px] font-bold text-white hover:bg-amber-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetCover(index);
                      }}
                    >
                      Đặt ảnh bìa
                    </Button>
                  )}

                  <div className="flex justify-between gap-1">
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      disabled={index === 0}
                      className="h-7 w-1/2 rounded-lg bg-white/20 text-white hover:bg-white/30 disabled:opacity-30"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMove(index, 'left');
                      }}
                      title="Chuyển sang trái"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      disabled={index === images.length - 1}
                      className="h-7 w-1/2 rounded-lg bg-white/20 text-white hover:bg-white/30 disabled:opacity-30"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMove(index, 'right');
                      }}
                      title="Chuyển sang phải"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-destructive text-[0.75rem] font-medium">{error}</p>}
    </div>
  );
}

import type { Route } from './+types/$id';
import { useNavigate } from 'react-router';
import { CheckCircle2, ChevronLeft, ShieldCheck, ShoppingCart, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { getDb } from '~/.server/db';
import { getProductById } from '~/.server/services/product.service';
import { Button } from '~/components/ui/button';
import { addToCart, store } from '~/lib/store';

export async function loader({ context, params }: Route.LoaderArgs) {
  const db = getDb(context);
  const product = await getProductById(db, params.id);
  if (!product) {
    throw new Response('Không tìm thấy sản phẩm', { status: 404 });
  }
  return { product };
}

export default function ProductDetailPage({ loaderData }: Route.ComponentProps) {
  const { product } = loaderData;
  const navigate = useNavigate();

  const mainImage = product.images?.[0] || product.image;

  return (
    <div className="bg-bg-color min-h-screen py-10 dark:bg-[#0b0e12]">
      <div className="container max-w-[1000px]">
        <Button
          variant="link"
          onClick={() => navigate('/#shop')}
          className="text-muted-foreground hover:text-text-main mb-6 px-0 dark:text-gray-400 dark:hover:text-white"
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> Quay lại thị trường
        </Button>

        <div className="border-line grid grid-cols-1 overflow-hidden rounded-3xl border bg-white shadow-sm md:grid-cols-2 dark:border-white/10 dark:bg-[#171c22]">
          {/* Left: Image */}
          <div className="border-line flex items-center justify-center border-b bg-[#f9fafb] p-8 md:border-r md:border-b-0 dark:border-white/10 dark:bg-[#1c2128]">
            <div className="relative flex aspect-square w-full max-w-[360px] items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-[#161b22]">
              {mainImage ? (
                <img src={mainImage} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <div className="text-sm text-gray-400">Chưa có hình ảnh</div>
              )}
            </div>
          </div>

          {/* Right: Info */}
          <div className="flex flex-col p-8">
            <div className="mb-6">
              {product.status === 'ACTIVE' && (
                <div className="mb-3 inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" /> ĐANG BÁN CÔNG KHAI
                </div>
              )}
              <h1 className="mb-2 text-3xl font-bold dark:text-white">{product.name}</h1>
              <div className="text-muted-foreground flex items-center gap-2 text-sm dark:text-gray-400">
                <span>{product.category || 'Chưa phân loại'}</span>
                <span>•</span>
                <span>Kho: {product.stock}</span>
                <span>•</span>
                <span>Đã bán: {product.sold}</span>
              </div>
            </div>

            <div className="text-text-main mb-2 flex items-baseline gap-3 text-[32px] font-black dark:text-white">
              {product.price.toLocaleString('vi-VN')} ₫
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-lg font-medium text-gray-400 line-through decoration-gray-300 dark:decoration-gray-600">
                  {product.comparePrice.toLocaleString('vi-VN')} ₫
                </span>
              )}
            </div>

            {product.description && (
              <div
                className="prose prose-sm dark:prose-invert mb-6 line-clamp-4 text-gray-600 dark:text-gray-300"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            )}

            <div className="mb-8 grid grid-cols-2 gap-3">
              <div className="border-line flex items-center gap-3 rounded-xl border p-3 dark:border-white/10 dark:bg-white/5">
                <ShieldCheck className="text-brand h-6 w-6" />
                <div>
                  <div className="text-muted-foreground text-xs dark:text-gray-400">Bảo đảm</div>
                  <div className="text-sm font-bold dark:text-white">Chính hãng 100%</div>
                </div>
              </div>
              <div className="border-line flex items-center gap-3 rounded-xl border p-3 dark:border-white/10 dark:bg-white/5">
                <Truck className="text-brand h-6 w-6" />
                <div>
                  <div className="text-muted-foreground text-xs dark:text-gray-400">Giao hàng</div>
                  <div className="text-sm font-bold dark:text-white">Đóng gói an toàn</div>
                </div>
              </div>
            </div>

            <div className="mt-auto space-y-3">
              <Button
                size="lg"
                disabled={product.stock <= 0}
                className="bg-brand hover:bg-brand-dark flex h-14 w-full items-center justify-center gap-2 rounded-xl text-lg font-bold text-white shadow-lg transition-all hover:scale-[1.02]"
                onClick={() => {
                  if (!store.user) {
                    toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
                    navigate('/login');
                    return;
                  }
                  addToCart(product);
                  toast.success('Đã thêm vào giỏ hàng');
                }}
              >
                <ShoppingCart className="h-5 w-5" />
                {product.stock > 0 ? 'Thêm vào giỏ hàng' : 'Tạm hết hàng'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

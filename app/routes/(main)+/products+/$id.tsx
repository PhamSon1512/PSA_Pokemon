import { useNavigate, useParams } from 'react-router';
import { CheckCircle2, ChevronLeft, ShieldCheck, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '~/components/ui/button';
import { addToCart, MOCK_PRODUCTS } from '~/lib/store';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const product = MOCK_PRODUCTS.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold">Không tìm thấy sản phẩm</h2>
        <Button onClick={() => navigate('/products')}>Quay lại thị trường</Button>
      </div>
    );
  }

  return (
    <div className="bg-bg-color min-h-screen py-10">
      <div className="container max-w-[1000px]">
        <Button
          variant="link"
          onClick={() => navigate('/products')}
          className="text-muted-foreground hover:text-text-main mb-6 px-0"
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> Quay lại thị trường
        </Button>

        <div className="border-line grid grid-cols-1 overflow-hidden rounded-3xl border bg-white shadow-sm md:grid-cols-2">
          {/* Left: Image */}
          <div className="border-line flex items-center justify-center border-r bg-[#f9fafb] p-8">
            <div className="relative flex aspect-[3/4] w-full max-w-[300px] items-center justify-center overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-[#fff0ce] to-[#fff8ec]">
              {product.grade && (
                <div className="absolute top-4 right-4 z-10 rounded-lg border border-[#ffd178]/40 bg-[#111827] px-3 py-1.5 text-sm font-black text-[#ffd178] shadow-lg">
                  GRADE {product.grade}
                </div>
              )}
              <div className="flex h-[250px] w-[180px] rotate-[-2deg] flex-col overflow-hidden rounded-xl border-[6px] border-amber-300 bg-white p-2 shadow-2xl">
                <div className="h-1/2 rounded-t-lg bg-amber-100"></div>
                <div className="mt-auto p-3 text-center text-xs font-bold">{product.name}</div>
              </div>
            </div>
          </div>

          {/* Right: Info */}
          <div className="flex flex-col p-8">
            <div className="mb-6">
              {product.status === 'Đã xác thực' && (
                <div className="text-success mb-3 inline-flex items-center gap-1.5 rounded-md border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-black">
                  <CheckCircle2 className="h-4 w-4" /> ĐÃ XÁC THỰC BỞI CARDVAULT
                </div>
              )}
              <h1 className="mb-2 text-3xl font-bold">{product.name}</h1>
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <span>{product.category}</span>
                {product.certificateId && (
                  <>
                    <span>•</span>
                    <Button
                      variant="link"
                      className="text-brand hover:text-brand-dark h-auto p-0 font-bold"
                      onClick={() => navigate(`/verify/${product.certificateId}`)}
                    >
                      Hồ sơ {product.certificateId}
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="text-text-main mb-6 text-[32px] font-black">{product.price.toLocaleString('vi-VN')} ₫</div>

            <div className="mb-8 grid grid-cols-2 gap-3">
              <div className="border-line flex items-center gap-3 rounded-xl border p-3">
                <ShieldCheck className="text-brand h-6 w-6" />
                <div>
                  <div className="text-muted-foreground text-xs">Bảo đảm</div>
                  <div className="text-sm font-bold">Chính hãng 100%</div>
                </div>
              </div>
              <div className="border-line flex items-center gap-3 rounded-xl border p-3">
                <Truck className="text-brand h-6 w-6" />
                <div>
                  <div className="text-muted-foreground text-xs">Giao hàng</div>
                  <div className="text-sm font-bold">Đóng gói an toàn</div>
                </div>
              </div>
            </div>

            <div className="mt-auto space-y-3">
              <Button
                size="lg"
                className="bg-brand hover:bg-brand-dark h-14 w-full rounded-xl text-lg font-bold text-white"
                onClick={() => {
                  addToCart(product);
                  toast.success('Đã thêm vào giỏ hàng');
                }}
              >
                Thêm vào giỏ hàng
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

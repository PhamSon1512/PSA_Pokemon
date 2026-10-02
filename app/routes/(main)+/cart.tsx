import { Link, useNavigate } from 'react-router';
import { ArrowRight, ShoppingBag, Trash2 } from 'lucide-react';
import { useSnapshot } from 'valtio';
import { Button } from '~/components/ui/button';
import { removeFromCart, store, updateCartQuantity } from '~/lib/store';

export default function CartPage() {
  const snap = useSnapshot(store);
  const navigate = useNavigate();

  const totalAmount = snap.cart.reduce((total, item) => total + item.product.price * item.quantity, 0);

  if (snap.cart.length === 0) {
    return (
      <div className="bg-bg-color flex min-h-[calc(100vh-200px)] flex-col items-center justify-center p-4">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-gray-400">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h2 className="mb-2 text-2xl font-bold">Giỏ hàng trống</h2>
        <p className="text-muted-foreground mb-8">Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
        <Button size="lg" className="rounded-xl font-bold" onClick={() => navigate('/products')}>
          Khám phá thị trường
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-bg-color min-h-[calc(100vh-200px)] py-10">
      <div className="container max-w-[1000px]">
        <h1 className="mb-8 text-3xl font-bold">Giỏ hàng của bạn</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            {snap.cart.map((item) => (
              <div key={item.product.id} className="border-line flex items-center gap-4 rounded-2xl border bg-white p-4 shadow-sm">
                <div className="flex h-24 w-20 items-center justify-center overflow-hidden rounded-lg border border-amber-200 bg-gradient-to-br from-[#fff0ce] to-[#fff8ec]">
                  <div className="flex h-16 w-12 flex-col overflow-hidden rounded border border-amber-300 bg-white p-1 shadow-sm">
                    <div className="h-1/2 rounded-t-sm bg-amber-100"></div>
                    <div className="mt-1 line-clamp-1 text-center text-[6px] font-bold">{item.product.name}</div>
                  </div>
                </div>

                <div className="flex-1">
                  <Link to={`/products/${item.product.id}`} className="hover:text-brand text-lg font-bold transition-colors">
                    {item.product.name}
                  </Link>
                  <div className="text-muted-foreground mt-1 mb-2 text-sm">{item.product.category}</div>
                  <div className="text-brand font-black">{item.product.price.toLocaleString('vi-VN')} ₫</div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700"
                    onClick={() => removeFromCart(item.product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="border-line flex h-8 items-center overflow-hidden rounded-lg border">
                    <button
                      className="bg-gray-50 px-2 transition hover:bg-gray-100"
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span className="min-w-[30px] px-3 text-center text-sm font-bold">{item.quantity}</span>
                    <button
                      className="bg-gray-50 px-2 transition hover:bg-gray-100"
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-line h-fit rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="border-line mb-4 border-b pb-2 text-lg font-bold">Tổng quan đơn hàng</h3>
            <div className="mb-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tạm tính:</span>
                <span className="font-bold">{totalAmount.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Phí vận chuyển:</span>
                <span className="text-success font-bold">Miễn phí</span>
              </div>
              <div className="border-line mt-3 flex items-center justify-between border-t pt-3">
                <span className="font-bold">Tổng thanh toán:</span>
                <span className="text-brand text-xl font-black">{totalAmount.toLocaleString('vi-VN')} ₫</span>
              </div>
            </div>

            <Button
              size="lg"
              className="bg-brand hover:bg-brand-dark w-full rounded-xl font-bold text-white"
              onClick={() => navigate('/checkout')}
            >
              Tiến hành thanh toán <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

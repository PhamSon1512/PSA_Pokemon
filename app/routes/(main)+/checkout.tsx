import { useState } from 'react';
import { useNavigate } from 'react-router';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSnapshot } from 'valtio';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { clearCart, store } from '~/lib/store';

export default function CheckoutPage() {
  const snap = useSnapshot(store);
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);

  const totalAmount = snap.cart.reduce((total, item) => total + item.product.price * item.quantity, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (snap.cart.length === 0) return;

    setIsSuccess(true);
    clearCart();
    toast.success('Đặt hàng thành công!');
  };

  if (isSuccess) {
    return (
      <div className="bg-bg-color flex min-h-[calc(100vh-200px)] items-center justify-center p-4">
        <div className="border-line w-full max-w-[500px] rounded-3xl border bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="mb-3 text-3xl font-bold">Đặt hàng thành công!</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Cảm ơn bạn đã mua sắm tại CardVault. Đơn hàng của bạn đang được xử lý và sẽ sớm được giao đến.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => navigate('/products')} className="rounded-xl font-bold">
              Tiếp tục mua sắm
            </Button>
            <Button
              onClick={() => navigate('/account/orders')}
              className="bg-brand hover:bg-brand-dark rounded-xl font-bold text-white"
            >
              Xem đơn hàng
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (snap.cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="bg-bg-color min-h-[calc(100vh-200px)] py-10">
      <div className="container max-w-[1000px]">
        <h1 className="mb-8 text-3xl font-bold">Thanh toán</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="border-line rounded-3xl border bg-white p-6 shadow-sm">
              <h3 className="border-line mb-4 border-b pb-2 text-lg font-bold">Thông tin giao hàng</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Họ và tên</Label>
                    <Input id="name" required defaultValue={snap.user?.name} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input id="phone" required className="h-11 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Địa chỉ chi tiết</Label>
                  <Input id="address" required className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="note">Ghi chú (Tùy chọn)</Label>
                  <textarea
                    id="note"
                    className="border-input min-h-[80px] w-full rounded-xl border bg-transparent px-3 py-2 text-sm shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="border-line rounded-3xl border bg-white p-6 shadow-sm">
              <h3 className="border-line mb-4 border-b pb-2 text-lg font-bold">Phương thức thanh toán</h3>
              <div className="space-y-3">
                <label className="border-line flex cursor-pointer items-center gap-3 rounded-xl border bg-gray-50/50 p-4 hover:bg-gray-50">
                  <input type="radio" name="payment" defaultChecked className="accent-brand" />
                  <span className="font-semibold">Thanh toán khi nhận hàng (COD)</span>
                </label>
                <label className="border-line flex cursor-pointer items-center gap-3 rounded-xl border p-4 opacity-50 hover:bg-gray-50">
                  <input type="radio" name="payment" disabled />
                  <span className="font-semibold">Chuyển khoản ngân hàng (Đang bảo trì)</span>
                </label>
              </div>
            </div>
          </form>

          <div>
            <div className="border-line sticky top-[100px] rounded-3xl border bg-white p-6 shadow-sm">
              <h3 className="border-line mb-4 border-b pb-2 text-lg font-bold">Đơn hàng của bạn</h3>

              <div className="mb-6 max-h-[300px] space-y-3 overflow-y-auto pr-2">
                {snap.cart.map((item) => (
                  <div key={item.product.id} className="flex justify-between gap-4 text-sm">
                    <div className="flex gap-2">
                      <div className="h-16 w-12 flex-shrink-0 overflow-hidden rounded border border-amber-200 bg-gradient-to-br from-[#fff0ce] to-[#fff8ec]" />
                      <div>
                        <div className="line-clamp-1 font-bold">{item.product.name}</div>
                        <div className="text-muted-foreground mt-1 text-xs">SL: {item.quantity}</div>
                      </div>
                    </div>
                    <div className="font-bold whitespace-nowrap">
                      {(item.product.price * item.quantity).toLocaleString('vi-VN')} ₫
                    </div>
                  </div>
                ))}
              </div>

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
                type="submit"
                form="checkout-form"
                size="lg"
                className="bg-brand hover:bg-brand-dark w-full rounded-xl font-bold text-white"
              >
                Xác nhận đặt hàng
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

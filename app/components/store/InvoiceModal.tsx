import { useEffect, useState } from 'react';
import { useForm } from '@mantine/form';
import { CheckCircle2, Loader2, Mail, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import xior from 'xior';
import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

export function InvoiceModal({
  open,
  onOpenChange,
  cartItems,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  cartItems: any[];
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'FORM' | 'SUCCESS'>('FORM');

  const form = useForm({
    initialValues: {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      address: '',
      note: '',
      paymentMethod: 'COD',
    },
    validate: {
      customerName: (v) => (!v ? 'Vui lòng nhập họ tên' : null),
      customerEmail: (v) => (!v ? 'Vui lòng nhập email' : null),
      customerPhone: (v) => (!v ? 'Vui lòng nhập số điện thoại' : null),
      address: (v) => (!v ? 'Vui lòng nhập địa chỉ nhận hàng' : null),
    },
  });

  // Reset state when opened
  useEffect(() => {
    if (open) {
      setStep('FORM');
      form.reset();
    }
  }, [open]);

  const handleSubmit = form.onSubmit(async (values) => {
    if (cartItems.length === 0) return toast.error('Giỏ hàng trống!');
    setLoading(true);
    try {
      const client = xior.create({ baseURL: '/api' });
      const orderPayload = {
        ...values,
        items: cartItems.map((item) => ({
          productId: item.id,
          productName: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        shipping: 30000,
        discount: 0,
      };

      await client.post('/public/orders', orderPayload);

      // Assume success, change step to success
      setStep('SUCCESS');
      onSuccess();
    } catch (e) {
      toast.error('Lỗi khi tạo đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  });

  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0) + 30000;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {step === 'FORM' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Receipt className="text-brand h-5 w-5" />
                Thông tin đặt hàng
              </DialogTitle>
              <DialogDescription>Điền thông tin để hoàn tất việc mua hàng.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="customerName">Họ tên *</Label>
                <Input id="customerName" placeholder="Nguyễn Văn A" {...form.getInputProps('customerName')} />
                {form.errors.customerName && <p className="text-[0.75rem] text-red-500">{form.errors.customerName}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="customerPhone">Số điện thoại *</Label>
                  <Input id="customerPhone" placeholder="090..." {...form.getInputProps('customerPhone')} />
                  {form.errors.customerPhone && <p className="text-[0.75rem] text-red-500">{form.errors.customerPhone}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="customerEmail">Email (nhận hóa đơn) *</Label>
                  <Input id="customerEmail" type="email" placeholder="email@example.com" {...form.getInputProps('customerEmail')} />
                  {form.errors.customerEmail && <p className="text-[0.75rem] text-red-500">{form.errors.customerEmail}</p>}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">Địa chỉ giao hàng *</Label>
                <Input id="address" placeholder="123 Đường ABC, Phường..." {...form.getInputProps('address')} />
                {form.errors.address && <p className="text-[0.75rem] text-red-500">{form.errors.address}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="note">Ghi chú (Tùy chọn)</Label>
                <Input id="note" placeholder="Ghi chú giao hàng..." {...form.getInputProps('note')} />
              </div>

              <div className="border-line mt-4 rounded-xl border bg-gray-50 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center justify-between font-bold">
                  <span>Tổng thanh toán:</span>
                  <span className="text-brand-dark dark:text-brand-light text-lg">{totalAmount.toLocaleString('vi-VN')}₫</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">(Đã bao gồm 30,000₫ phí vận chuyển)</p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                  Hủy
                </Button>
                <Button type="submit" disabled={loading} className="bg-brand hover:bg-brand-dark">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Xác nhận đặt hàng
                </Button>
              </div>
            </form>
          </>
        )}

        {step === 'SUCCESS' && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 rounded-full bg-green-100 p-3 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h2 className="mb-2 text-2xl font-bold dark:text-white">Đặt hàng thành công!</h2>
            <p className="mb-6 text-gray-500 dark:text-gray-400">
              Cảm ơn bạn đã mua sắm tại CardVault. <br /> Hóa đơn đã được gửi đến email của bạn.
            </p>
            <div className="mb-6 flex items-center justify-center gap-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-700 dark:bg-white/5 dark:text-gray-300">
              <Mail className="h-4 w-4" />
              <span>Vui lòng kiểm tra hộp thư đến (hoặc Spam).</span>
            </div>
            <Button onClick={() => onOpenChange(false)} className="bg-brand hover:bg-brand-dark w-full">
              Đóng và tiếp tục mua sắm
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

import { useNavigate } from 'react-router';
import { ShoppingBag } from 'lucide-react';
import { Button } from '~/components/ui/button';

export default function AccountOrdersPage() {
  const navigate = useNavigate();

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Đơn hàng của tôi</h2>
      <div className="border-line rounded-3xl border border-dashed bg-gray-50 py-20 text-center">
        <div className="text-muted-foreground mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h3 className="mb-2 font-bold">Chưa có đơn hàng nào</h3>
        <p className="text-muted-foreground mx-auto mb-6 max-w-sm text-sm">Bạn chưa thực hiện giao dịch mua nào trên nền tảng.</p>
        <Button onClick={() => navigate('/products')} variant="outline" className="rounded-xl font-bold">
          Mua sắm ngay
        </Button>
      </div>
    </div>
  );
}

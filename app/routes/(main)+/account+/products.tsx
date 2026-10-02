import { CreditCard } from 'lucide-react';
import { Button } from '~/components/ui/button';

export default function AccountProductsPage() {
  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Sản phẩm đang bán</h2>
      <div className="border-line rounded-3xl border border-dashed bg-gray-50 py-20 text-center">
        <div className="text-muted-foreground mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
          <CreditCard className="h-8 w-8" />
        </div>
        <h3 className="mb-2 font-bold">Chưa có sản phẩm niêm yết</h3>
        <p className="text-muted-foreground mx-auto mb-6 max-w-sm text-sm">
          Bạn có thể đăng bán các thẻ đã được xác thực từ bộ sưu tập của mình.
        </p>
        <Button variant="outline" className="rounded-xl font-bold">
          Đăng bán sản phẩm
        </Button>
      </div>
    </div>
  );
}

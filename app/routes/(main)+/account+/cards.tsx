import { useNavigate } from 'react-router';
import { Package } from 'lucide-react';
import { Button } from '~/components/ui/button';

export default function AccountCardsPage() {
  const navigate = useNavigate();

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Bộ sưu tập thẻ</h2>
      <div className="border-line rounded-3xl border border-dashed bg-gray-50 py-20 text-center">
        <div className="text-muted-foreground mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
          <Package className="h-8 w-8" />
        </div>
        <h3 className="mb-2 font-bold">Bộ sưu tập trống</h3>
        <p className="text-muted-foreground mx-auto mb-6 max-w-sm text-sm">
          Bạn chưa có thẻ nào trong bộ sưu tập. Hãy khám phá thị trường hoặc gửi thẻ để thẩm định.
        </p>
        <Button onClick={() => navigate('/products')} variant="outline" className="mr-2 rounded-xl font-bold">
          Khám phá thị trường
        </Button>
      </div>
    </div>
  );
}

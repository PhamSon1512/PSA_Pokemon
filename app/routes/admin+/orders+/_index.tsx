import { Users } from 'lucide-react';

export default function AdminOrdersPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="text-muted-foreground mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
        <Users className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-bold">Quản lý đơn hàng</h2>
      <p className="text-muted-foreground mt-2">Tính năng đang được phát triển.</p>
    </div>
  );
}

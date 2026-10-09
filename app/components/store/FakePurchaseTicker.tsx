import { useEffect, useState } from 'react';
import { MOCK_PRODUCTS } from '~/lib/store';

const FIRST_NAMES = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng'];
const LAST_NAMES = ['Anh', 'Huy', 'Minh', 'Trang', 'Hoa', 'Tú', 'Khánh', 'Long', 'Duy', 'Thảo', 'Linh'];

function getRandomName() {
  const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${first} *** ${last}`;
}

type Purchase = {
  id: string;
  name: string;
  product: string;
  timeStr: string;
  avatarSeed: string;
  quantity: number;
};

export function FakePurchaseTicker({ products = [] }: { products?: any[] }) {
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const sourceProducts = products.length > 0 ? products : MOCK_PRODUCTS;

    const addPurchase = () => {
      const product = sourceProducts[Math.floor(Math.random() * sourceProducts.length)];

      const times = ['Vừa xong', '1 phút trước', '2 phút trước'];

      const newPurchase = {
        id: Math.random().toString(36).substring(7),
        name: getRandomName(),
        product: product.name,
        timeStr: times[Math.floor(Math.random() * times.length)],
        avatarSeed: Math.random().toString(36).substring(7),
        quantity: Math.floor(Math.random() * 3) + 1, // 1 to 3
      };

      setPurchases((prev) => {
        const newArr = [newPurchase, ...prev];
        return newArr.slice(0, 3);
      });

      // Frequency between 1.5 to 4 seconds for faster display
      const nextDelay = Math.floor(Math.random() * 2500) + 1500;
      timeoutId = setTimeout(addPurchase, nextDelay);
    };

    // First load
    addPurchase();

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="relative h-[56px] w-full max-w-[340px]">
      {purchases.map((purchase, index) => {
        let styleClass = '';
        if (index === 0) styleClass = 'opacity-100 scale-100 z-30 translate-y-0 shadow-sm';
        else if (index === 1) styleClass = 'opacity-60 scale-95 z-20 -translate-y-2.5';
        else if (index === 2) styleClass = 'opacity-30 scale-90 z-10 -translate-y-5';

        return (
          <div
            key={purchase.id}
            className={`absolute top-0 right-0 left-0 flex items-center gap-2.5 rounded-full border border-gray-100 bg-white/95 p-1.5 pr-3 backdrop-blur-md transition-all duration-700 ease-out dark:border-white/10 dark:bg-[#1f242b]/95 ${styleClass} animate-in slide-in-from-bottom-2 fade-in`}
          >
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-white bg-[#f8f9fa] shadow-sm dark:border-gray-800 dark:bg-gray-800">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${purchase.avatarSeed}&backgroundColor=e5e7eb`}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-xs font-semibold dark:text-white">
                <span className="text-brand dark:text-brand-light">{purchase.name}</span>{' '}
                <span className="text-muted-foreground text-[11px] font-normal">vừa mua</span>
              </p>
              <p className="truncate text-[11px] font-medium text-gray-900 dark:text-gray-200">
                <span className="font-bold text-amber-500">{purchase.quantity}x</span> {purchase.product}
              </p>
            </div>
            <div className="text-muted-foreground shrink-0 text-[9px] font-medium">{purchase.timeStr}</div>
          </div>
        );
      })}
    </div>
  );
}

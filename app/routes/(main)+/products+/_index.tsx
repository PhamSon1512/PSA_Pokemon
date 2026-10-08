import type { Route } from './+types/_index';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronRight, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { getDb } from '~/.server/db';
import { getPublicProducts } from '~/.server/services/product.service';
import { FakePurchaseTicker } from '~/components/store/FakePurchaseTicker';
import { Button } from '~/components/ui/button';
import { addToCart } from '~/lib/store';

export async function loader({ context }: Route.LoaderArgs) {
  const db = getDb(context);
  const products = await getPublicProducts(db);
  return { products };
}

export default function ProductsPage({ loaderData }: Route.ComponentProps) {
  const { products } = loaderData;
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');

  const filteredProducts = filter === 'All' ? products : products.filter((p) => p.category === filter);

  const handleAddToCart = (product: any) => {
    addToCart(product);
    toast.success('Đã thêm vào giỏ hàng');
  };

  return (
    <div className="bg-bg-color min-h-screen py-10">
      <div className="container">
        <div className="border-line mb-8 flex flex-col items-start justify-between gap-4 border-b pb-4 md:flex-row md:items-end">
          <div className="shrink-0">
            <h1 className="text-3xl font-bold">Cửa hàng</h1>
            <p className="text-muted-foreground mt-1">Các sản phẩm sưu tầm được niêm yết</p>
          </div>
          <div className="flex w-full flex-1 justify-center md:w-auto">
            <FakePurchaseTicker />
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" className="border-line rounded-xl bg-white">
              <Filter className="mr-2 h-4 w-4" />
              Lọc
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
          <aside>
            <div className="border-line mb-6 rounded-2xl border bg-white p-4 shadow-sm">
              <div className="mb-3 text-sm font-bold">Danh mục</div>
              <div className="flex flex-col gap-2">
                {['All', 'Mystery Bag', 'Pokemon', 'One Piece', 'Yu-Gi-Oh!', 'Phụ kiện bảo quản', 'Khác'].map((cat) => (
                  <label key={cat} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="category"
                      checked={filter === cat}
                      onChange={() => setFilter(cat)}
                      className="accent-brand"
                    />
                    {cat === 'All' ? 'Tất cả' : cat}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          <div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => {
                // Determine images
                const mainImage = product.images?.[0] || product.image;

                // Calculate discount if missing
                const discount =
                  product.comparePrice && product.comparePrice > product.price
                    ? Math.round((1 - product.price / product.comparePrice) * 100)
                    : null;

                return (
                  <article
                    key={product.id}
                    className="border-line flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-white/10 dark:bg-[#1f242b]"
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    <div className="relative grid h-[220px] shrink-0 place-items-center overflow-hidden bg-gray-100 dark:bg-gray-800">
                      {discount && (
                        <div className="absolute top-0 right-0 z-10 flex flex-col items-center justify-center bg-[#ffe97a] px-2 py-1 text-center font-bold text-[#ee4d2d] shadow-sm">
                          <span className="text-[10px] leading-none uppercase">Giảm</span>
                          <span className="text-xs leading-none">{discount}%</span>
                        </div>
                      )}
                      {mainImage ? (
                        <img src={mainImage} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="text-xs text-gray-400">No Image</div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-3">
                      <h3 className="mb-1.5 line-clamp-2 text-[13px] leading-tight font-medium dark:text-white">{product.name}</h3>

                      <div className="mb-2 flex flex-wrap gap-1">
                        {product.badges?.map((badge: string, idx: number) => (
                          <span
                            key={idx}
                            className="border-brand text-brand inline-block rounded-sm border px-1 text-[9px] font-medium"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>

                      <div className="mt-auto flex items-end justify-between pt-2">
                        <div>
                          {product.comparePrice && (
                            <div className="text-[11px] text-gray-400 line-through">
                              ₫{product.comparePrice.toLocaleString('vi-VN')}
                            </div>
                          )}
                          <div className="text-base font-medium text-[#ee4d2d]">₫{product.price.toLocaleString('vi-VN')}</div>
                        </div>
                        <div className="text-[10px] text-gray-500">
                          Đã bán {product.sold > 1000 ? `${(product.sold / 1000).toFixed(1)}k` : product.sold}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-muted-foreground border-line rounded-2xl border border-dashed bg-white py-20 text-center">
                Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

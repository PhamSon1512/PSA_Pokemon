import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronRight, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '~/components/ui/button';
import { addToCart, MOCK_PRODUCTS } from '~/lib/store';

export default function ProductsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');

  const filteredProducts = filter === 'All' ? MOCK_PRODUCTS : MOCK_PRODUCTS.filter((p) => p.status === filter);

  const handleAddToCart = (product: any) => {
    addToCart(product);
    toast.success('Đã thêm vào giỏ hàng');
  };

  return (
    <div className="bg-bg-color min-h-screen py-10">
      <div className="container">
        <div className="border-line mb-8 flex items-end justify-between border-b pb-4">
          <div>
            <h1 className="text-3xl font-bold">Thị trường</h1>
            <p className="text-muted-foreground mt-1">Các sản phẩm sưu tầm được niêm yết</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-line rounded-xl bg-white">
              <Filter className="mr-2 h-4 w-4" />
              Lọc
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
          <aside>
            <div className="border-line mb-6 rounded-2xl border bg-white p-4 shadow-sm">
              <div className="mb-3 text-sm font-bold">Tình trạng</div>
              <div className="flex flex-col gap-2">
                {['All', 'Đã xác thực', 'Nguyên bản'].map((status) => (
                  <label key={status} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="status"
                      checked={filter === status}
                      onChange={() => setFilter(status)}
                      className="accent-brand"
                    />
                    {status === 'All' ? 'Tất cả' : status}
                  </label>
                ))}
              </div>
            </div>

            <div className="border-line rounded-2xl border bg-white p-4 shadow-sm">
              <div className="mb-3 text-sm font-bold">Danh mục</div>
              <div className="flex flex-col gap-1">
                {['Pokemon', 'One Piece', 'Yu-Gi-Oh!', 'Phụ kiện bảo quản'].map((cat) => (
                  <div key={cat} className="hover:text-brand-dark flex cursor-pointer justify-between py-2 text-sm text-[#5a616c]">
                    {cat} <ChevronRight className="h-4 w-4 opacity-50" />
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <article
                  key={product.id}
                  className="border-line flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <div className="relative grid h-[205px] place-items-center overflow-hidden bg-gradient-to-br from-[#fff0ce] to-[#fff8ec]">
                    {product.grade && (
                      <div className="absolute top-3 right-3 z-10 rounded-lg border border-[#ffd178]/40 bg-[#111827] px-2 py-1 text-[11px] font-black text-[#ffd178]">
                        GRADE {product.grade}
                      </div>
                    )}
                    <div className="flex h-[165px] w-[120px] rotate-[-3deg] flex-col overflow-hidden rounded-xl border-[4px] border-amber-300 bg-white p-1.5 shadow-xl">
                      <div className="h-1/2 rounded-t-lg bg-amber-100"></div>
                      <div className="p-2 text-center text-[10px] font-bold">{product.name}</div>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="mb-1.5 line-clamp-2 text-sm font-bold">{product.name}</h3>
                    <div className="text-muted-foreground mt-auto flex flex-wrap gap-2 text-xs">
                      {product.status === 'Đã xác thực' && <span className="text-success font-semibold">✓ Đã xác thực</span>}
                      {product.certificateId && <span>• {product.certificateId}</span>}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-lg font-black">{product.price.toLocaleString('vi-VN')}₫</div>
                      <Button
                        size="sm"
                        className="bg-brand-soft text-brand-dark h-8 rounded-lg font-bold hover:bg-amber-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                      >
                        Thêm giỏ
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
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

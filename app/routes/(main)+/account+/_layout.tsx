import { Navigate, NavLink, Outlet } from 'react-router';
import { CreditCard, Package, Search, ShoppingBag, User } from 'lucide-react';
import { useSnapshot } from 'valtio';
import { store } from '~/lib/store';

export default function AccountLayout() {
  const snap = useSnapshot(store);

  if (!snap.user) {
    return <Navigate to="/login" />;
  }

  const menu = [
    { to: '/account', label: 'Tổng quan', icon: <User className="h-4 w-4" />, end: true },
    { to: '/account/cards', label: 'Bộ sưu tập (Thẻ)', icon: <Package className="h-4 w-4" />, end: false },
    { to: '/account/grading', label: 'Hồ sơ thẩm định', icon: <Search className="h-4 w-4" />, end: false },
    { to: '/account/products', label: 'Sản phẩm đang bán', icon: <CreditCard className="h-4 w-4" />, end: false },
    { to: '/account/orders', label: 'Đơn hàng mua', icon: <ShoppingBag className="h-4 w-4" />, end: false },
  ];

  return (
    <div className="bg-bg-color min-h-[calc(100vh-200px)] py-10">
      <div className="container max-w-[1200px]">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
          <aside>
            <div className="border-line mb-6 flex items-center gap-4 rounded-3xl border bg-white p-6 shadow-sm">
              <div className="from-brand flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br to-[#f9b24a] text-xl font-black text-white shadow-inner">
                {snap.user.avatar || 'CV'}
              </div>
              <div>
                <div className="font-bold">{snap.user.name}</div>
                <div className="text-muted-foreground text-xs">{snap.user.role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng'}</div>
              </div>
            </div>

            <nav className="border-line flex flex-col gap-1 rounded-3xl border bg-white p-3 shadow-sm">
              {menu.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-[650] transition-colors ${
                      isActive ? 'text-brand-dark bg-brand-soft' : 'hover:text-brand-dark hover:bg-brand-soft text-[#565d68]'
                    }`
                  }
                >
                  {item.icon} {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>

          <div className="border-line min-h-[500px] rounded-3xl border bg-white p-8 shadow-sm">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

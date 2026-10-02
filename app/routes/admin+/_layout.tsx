import { Navigate, NavLink, Outlet, useNavigate } from 'react-router';
import { Bell, LayoutDashboard, LogOut, Package, Search, ShieldCheck, Users } from 'lucide-react';
import { useSnapshot } from 'valtio';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { logout, store } from '~/lib/store';

export default function AdminLayout() {
  const snap = useSnapshot(store);
  const navigate = useNavigate();

  if (!snap.user || snap.user.role !== 'ADMIN') {
    return <Navigate to="/login" />;
  }

  const menu = [
    { to: '/admin', label: 'Tổng quan', icon: <LayoutDashboard className="h-4 w-4" />, end: true },
    { to: '/admin/grading', label: 'Hồ sơ thẩm định', icon: <Search className="h-4 w-4" />, end: false },
    { to: '/admin/products', label: 'Sản phẩm', icon: <Package className="h-4 w-4" />, end: false },
    { to: '/admin/certificates', label: 'Chứng nhận', icon: <ShieldCheck className="h-4 w-4" />, end: false },
    { to: '/admin/orders', label: 'Đơn hàng', icon: <Users className="h-4 w-4" />, end: false },
  ];

  return (
    <div className="flex min-h-screen bg-[#f3f4f6]">
      {/* Sidebar */}
      <aside className="sticky top-0 flex hidden h-screen w-[260px] flex-col bg-[#111827] text-white md:flex">
        <div className="flex h-[76px] items-center border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="from-brand grid h-[32px] w-[32px] skew-x-[-5deg] place-items-center rounded-lg bg-gradient-to-br to-[#f9b24a] font-black text-white">
              <span className="skew-x-[5deg]">◈</span>
            </div>
            <div>
              <div className="text-sm leading-tight font-black tracking-[0.7px]">CARDVAULT</div>
              <span className="mt-[1px] block text-[8px] font-bold tracking-[0.4px] text-amber-500">ADMIN PORTAL</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {menu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors ${
                  isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {item.icon} {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-4 flex items-center gap-3 px-2">
            <Avatar className="h-9 w-9">
              <AvatarImage src={snap.user.avatar} />
              <AvatarFallback className="bg-amber-500 text-xs font-bold text-white">AD</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-bold text-white">{snap.user.name}</div>
              <div className="text-xs text-gray-400">Quản trị viên</div>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-red-400 transition-colors hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4" /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-line sticky top-0 z-10 flex h-[76px] items-center justify-between border-b bg-white px-6 shadow-sm">
          <div className="hidden text-lg font-bold md:block">Dashboard</div>
          <div className="ml-auto flex items-center gap-4">
            <button className="border-line text-muted-foreground relative flex h-10 w-10 items-center justify-center rounded-full border transition hover:bg-gray-50">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

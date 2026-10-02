import { Link, NavLink, useNavigate } from 'react-router';
import { Bell, CreditCard, LayoutDashboard, LogOut, Package, Search, ShoppingCart, User } from 'lucide-react';
import { toast } from 'sonner';
import { useSnapshot } from 'valtio';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { ModeToggle } from '~/components/ui/mode-toggle';
import { logout, store } from '~/lib/store';

export function Header() {
  const snap = useSnapshot(store);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Đã đăng xuất thành công');
    navigate('/');
  };

  const unreadNotifications = snap.notifications.filter((n) => !n.read).length;
  const cartItemCount = snap.cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <>
      <div className="hidden h-[34px] items-center bg-[#171a1f] text-xs text-[#cbd0d7] md:flex">
        <div className="container flex justify-between gap-5 opacity-90">
          <span>CardVault • Xác thực & giao dịch giá trị sưu tầm</span>
          <span>Minh bạch thông tin • Vững tin sở hữu</span>
        </div>
      </div>
      <header className="sticky top-0 z-50 h-[76px] border-b border-[#eef0f3] bg-white/95 backdrop-blur-md dark:border-white/10 dark:bg-[#0f1217]/95">
        <div className="container flex h-full items-center gap-7">
          <Link to="/" className="flex min-w-[205px] items-center gap-3">
            <div className="from-brand grid h-[38px] w-[38px] skew-x-[-5deg] place-items-center rounded-xl bg-gradient-to-br to-[#f9b24a] font-black text-white shadow-[0_8px_18px_rgba(242,138,0,0.22)]">
              <span className="skew-x-[5deg] text-lg">◈</span>
            </div>
            <div>
              <div className="text-text-main text-lg leading-tight font-black tracking-[0.7px] dark:text-white">CARDVAULT</div>
              <span className="mt-[1px] block text-[10px] font-bold tracking-[0.4px] text-[#8b9199] dark:text-gray-400">
                COLLECTIBLE AUTHENTICATION
              </span>
            </div>
          </Link>

          <nav className="hidden flex-1 items-center gap-1.5 lg:flex">
            {[
              { to: '/', label: 'Trang chủ' },
              { to: '/products', label: 'Thị trường' },
              { to: '/grading', label: 'Thẩm định thẻ' },
              { to: '/verify', label: 'Xác thực chứng nhận' },
              { to: '/about', label: 'Về CardVault' },
              { to: '/account/cards', label: 'Bộ sưu tập', auth: true },
            ].map((link) => {
              if (link.auth && (!snap.user || snap.user.role !== 'CUSTOMER')) return null;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `rounded-xl px-3 py-2.5 text-sm font-[650] transition-colors ${
                      isActive
                        ? 'text-brand-dark bg-brand-soft dark:bg-brand-dark/20 dark:text-brand-light'
                        : 'hover:text-brand-dark hover:bg-brand-soft text-[#565d68] dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <ModeToggle />
            {snap.user ? (
              <>
                {(snap.user.role as string)?.toLowerCase() === 'admin' ? (
                  <Button variant="outline" size="sm" asChild className="border-line hidden h-10 rounded-xl sm:flex">
                    <Link to="/admin">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Bảng điều khiển
                    </Link>
                  </Button>
                ) : (
                  <>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-line relative h-10 w-10 rounded-xl dark:border-white/10 dark:hover:bg-white/5"
                        >
                          <Bell className="h-4 w-4 text-[#3f4651] dark:text-gray-300" />
                          {unreadNotifications > 0 && (
                            <span className="absolute top-2 right-2 h-2 w-2 rounded-full border-2 border-white bg-red-500 dark:border-[#0f1217]"></span>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-80 rounded-2xl p-2 dark:border-white/10 dark:bg-[#1a1f26]">
                        <div className="border-line mb-2 border-b p-2 text-sm font-bold dark:border-white/10 dark:text-white">
                          Thông báo
                        </div>
                        {snap.notifications.length === 0 ? (
                          <div className="text-muted-foreground p-4 text-center text-xs">Không có thông báo mới</div>
                        ) : (
                          snap.notifications.map((n) => (
                            <div
                              key={n.id}
                              className="cursor-pointer rounded-lg border-b border-[#f0f1f3] p-2 text-sm last:border-0 hover:bg-gray-50 dark:border-white/5 dark:text-gray-200 dark:hover:bg-white/5"
                            >
                              <span className="block font-semibold">{n.message}</span>
                              <span className="text-muted-foreground mt-1 text-xs">{n.time}</span>
                            </div>
                          ))
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => navigate('/cart')}
                      className="border-line relative h-10 w-10 rounded-xl dark:border-white/10 dark:hover:bg-white/5"
                    >
                      <ShoppingCart className="h-4 w-4 text-[#3f4651] dark:text-gray-300" />
                      {cartItemCount > 0 && (
                        <Badge className="bg-brand absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] text-white">
                          {cartItemCount}
                        </Badge>
                      )}
                    </Button>
                  </>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="cursor-pointer">
                      <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                        <AvatarImage src={snap.user.avatar?.startsWith('http') ? snap.user.avatar : undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-slate-700 to-amber-500 text-xs font-bold text-white">
                          {snap.user.avatar || 'CV'}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 dark:border-white/10 dark:bg-[#1a1f26]">
                    <div className="dark:bg-brand/10 mb-2 rounded-xl bg-[#fff8ee] p-3">
                      <div className="text-sm font-bold dark:text-white">{snap.user.name}</div>
                      <div className="text-muted-foreground text-xs dark:text-gray-400">
                        {snap.user.role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng thân thiết'}
                      </div>
                    </div>
                    {snap.user.role === 'ADMIN' ? (
                      <>
                        <DropdownMenuItem onClick={() => navigate('/admin')} className="dark:text-gray-200 dark:focus:bg-white/5">
                          Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigate('/admin/grading')}
                          className="dark:text-gray-200 dark:focus:bg-white/5"
                        >
                          Hồ sơ thẩm định
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigate('/admin/products')}
                          className="dark:text-gray-200 dark:focus:bg-white/5"
                        >
                          Sản phẩm
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigate('/admin/orders')}
                          className="dark:text-gray-200 dark:focus:bg-white/5"
                        >
                          Đơn hàng
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem onClick={() => navigate('/account')} className="dark:text-gray-200 dark:focus:bg-white/5">
                          <User className="mr-2 h-4 w-4" /> Tài khoản
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigate('/account/cards')}
                          className="dark:text-gray-200 dark:focus:bg-white/5"
                        >
                          <Package className="mr-2 h-4 w-4" /> Bộ sưu tập
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigate('/account/products')}
                          className="dark:text-gray-200 dark:focus:bg-white/5"
                        >
                          <CreditCard className="mr-2 h-4 w-4" /> Sản phẩm của tôi
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigate('/account/grading')}
                          className="dark:text-gray-200 dark:focus:bg-white/5"
                        >
                          <Search className="mr-2 h-4 w-4" /> Hồ sơ thẩm định
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator className="dark:bg-white/10" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-500 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-500/10"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/login')}
                  className="hidden h-10 rounded-xl font-[650] hover:bg-gray-100 sm:flex dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white"
                >
                  Đăng nhập
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                  className="from-brand h-10 rounded-xl border-0 bg-gradient-to-br to-[#ff9f1f] font-[800] text-white shadow-[0_8px_18px_rgba(242,138,0,0.22)] hover:opacity-90"
                >
                  Đăng ký
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

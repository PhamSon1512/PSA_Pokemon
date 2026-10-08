import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useSnapshot } from 'valtio';
import xior from 'xior';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { login, logout, restoreFromStorage, store } from '~/lib/store';

export default function LoginPage() {
  const navigate = useNavigate();
  const snap = useSnapshot(store);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Handle redirects and stale state safely after render
  useEffect(() => {
    restoreFromStorage();
    if (snap.user) {
      const hasToken = typeof document !== 'undefined' && document.cookie.includes('token=');
      if (hasToken) {
        const role = (snap.user.role as string)?.toLowerCase();
        if (role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } else {
        // Clear local state and localStorage if token is missing
        logout();
      }
    }
  }, [snap.user, navigate]);

  // If already logged in AND cookie exists, don't render the form while redirecting
  if (snap.user && typeof document !== 'undefined' && document.cookie.includes('token=')) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    try {
      const res = await xior.post('/api/auth/login', { email, password });

      toast.success('Đăng nhập thành công');

      const user = res.data?.user || res.data;

      const isUserAdmin = (user.role as string)?.toLowerCase() === 'admin';

      // Update global state & localStorage synchronously
      login({
        id: user.id,
        name: user.name,
        email: user.email,
        role: isUserAdmin ? 'ADMIN' : 'CUSTOMER',
        avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}&backgroundColor=e5e7eb`,
      });

      const target = isUserAdmin ? '/admin' : '/';
      navigate(target, { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message || err?.response?.data?.message || 'Email/Số điện thoại hoặc mật khẩu không chính xác.';
      toast.error(msg);
    }
  };

  return (
    <div className="bg-bg-color flex min-h-screen items-center justify-center p-4">
      <div className="border-line w-full max-w-[420px] rounded-3xl border bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <div className="from-brand mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br to-[#f9b24a] text-xl font-black text-white shadow-lg">
            ◈
          </div>
          <h1 className="text-2xl font-bold">Đăng nhập</h1>
          <p className="text-muted-foreground mt-1 text-sm">Truy cập vào nền tảng CardVault</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email / Số điện thoại</Label>
            <Input
              id="email"
              type="text"
              placeholder="customer@cardvault.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mật khẩu</Label>
              <Link to="#" className="text-brand text-xs font-semibold hover:underline">
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-xl pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button type="submit" className="bg-brand hover:bg-brand-dark h-11 w-full rounded-xl font-bold text-white shadow-md">
            Đăng nhập
          </Button>
        </form>

        <div className="text-muted-foreground mt-6 text-center text-sm">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-brand font-bold hover:underline">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}

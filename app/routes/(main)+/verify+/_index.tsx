import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, ShieldCheck } from 'lucide-react';
import { Button } from '~/components/ui/button';

export default function VerifyIndexPage() {
  const navigate = useNavigate();
  const [searchCode, setSearchCode] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const code = searchCode.trim();
    if (!code) return;
    navigate(`/verify/${code}`);
  };

  return (
    <div className="bg-bg-color flex min-h-[calc(100vh-200px)] flex-col items-center justify-center px-4 py-20">
      <div className="bg-brand-soft text-brand-dark mb-6 grid h-16 w-16 place-items-center rounded-2xl">
        <ShieldCheck className="h-8 w-8" />
      </div>
      <h1 className="mb-3 text-center text-3xl font-bold">Xác thực chứng nhận</h1>
      <p className="text-muted-foreground mb-10 max-w-md text-center">
        Kiểm tra thông tin hồ sơ thẻ bằng mã chứng nhận CardVault để đảm bảo tính minh bạch và giá trị thực của sản phẩm.
      </p>

      <form onSubmit={handleSearch} className="flex w-full max-w-[600px] flex-col gap-3 sm:flex-row">
        <div className="border-line focus-within:border-brand focus-within:ring-brand flex h-14 flex-1 items-center rounded-xl border bg-white px-4 shadow-sm transition-all focus-within:ring-1">
          <Search className="text-muted-foreground mr-3 h-5 w-5" />
          <input
            type="text"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            placeholder="Nhập mã chứng nhận..."
            className="h-full w-full border-none bg-transparent text-[15px] outline-none"
          />
        </div>
        <Button type="submit" className="bg-brand hover:bg-brand-dark h-14 rounded-xl px-8 text-[15px] font-bold text-white">
          Xác thực
        </Button>
      </form>
    </div>
  );
}

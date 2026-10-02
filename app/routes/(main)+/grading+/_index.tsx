import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Camera, FileCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useSnapshot } from 'valtio';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { addGradingRequest, store } from '~/lib/store';

export default function GradingRequestPage() {
  const navigate = useNavigate();
  const snap = useSnapshot(store);
  const user = snap.user;

  const [formData, setFormData] = useState({
    cardName: '',
    set: '',
    cardNumber: '',
    language: 'Tiếng Nhật',
    year: '',
    rarity: '',
    notes: '',
    customerName: user?.name || '',
    phone: '',
    email: user?.email || '',
    province: '',
    district: '',
    ward: '',
    address: '',
  });

  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Vui lòng đăng nhập để gửi yêu cầu thẩm định');
      navigate('/login');
      return;
    }

    if (!formData.cardName || !formData.set || !formData.customerName || !formData.province) {
      toast.error('Vui lòng nhập đầy đủ các trường bắt buộc (*)');
      return;
    }

    addGradingRequest({
      customerName: formData.customerName,
      cardName: formData.cardName,
      set: formData.set,
    });

    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="bg-bg-color flex min-h-[calc(100vh-200px)] items-center justify-center p-4 py-10">
        <div className="border-line max-w-[500px] rounded-3xl border bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
            <FileCheck className="h-8 w-8" />
          </div>
          <h2 className="mb-2 text-2xl font-bold">Yêu cầu đã được tiếp nhận</h2>
          <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
            CardVault đã ghi nhận thông tin của bạn. Bạn có thể theo dõi tiến trình xử lý trong mục Hồ sơ thẩm định.
          </p>
          <Button
            onClick={() => navigate('/account/grading')}
            className="bg-brand hover:bg-brand-dark h-11 w-full rounded-xl font-bold text-white"
          >
            Xem hồ sơ thẩm định
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-color min-h-screen py-10">
      <div className="container max-w-[800px]">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Gửi yêu cầu thẩm định</h1>
          <p className="text-muted-foreground mt-2">
            Cung cấp thông tin chi tiết về thẻ của bạn để CardVault khởi tạo hồ sơ chứng nhận.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card Info */}
          <div className="border-line space-y-4 rounded-3xl border bg-white p-6 shadow-sm">
            <h3 className="border-line border-b pb-2 text-lg font-bold">Thông tin thẻ</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cardName">
                  Tên thẻ <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cardName"
                  value={formData.cardName}
                  onChange={handleChange}
                  className="h-11 rounded-xl"
                  placeholder="VD: Pikachu"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="set">
                  Series / Set <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="set"
                  value={formData.set}
                  onChange={handleChange}
                  className="h-11 rounded-xl"
                  placeholder="VD: Base Set"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Mã thẻ (Card Number)</Label>
                <Input
                  id="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  className="h-11 rounded-xl"
                  placeholder="VD: 025/165"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Ngôn ngữ</Label>
                <select
                  id="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="border-input focus-visible:ring-ring h-11 w-full rounded-xl border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none"
                >
                  <option>Tiếng Nhật</option>
                  <option>Tiếng Anh</option>
                  <option>Tiếng Hàn</option>
                  <option>Khác</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Năm phát hành</Label>
                <Input id="year" value={formData.year} onChange={handleChange} className="h-11 rounded-xl" placeholder="VD: 1999" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rarity">Độ hiếm</Label>
                <Input
                  id="rarity"
                  value={formData.rarity}
                  onChange={handleChange}
                  className="h-11 rounded-xl"
                  placeholder="VD: Promo, UR, SR..."
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Ghi chú thêm</Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={handleChange}
                className="border-input placeholder:text-muted-foreground focus-visible:ring-ring min-h-[80px] w-full rounded-xl border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
                placeholder="Các thông tin lưu ý đặc biệt về thẻ..."
              ></textarea>
            </div>
          </div>

          {/* Images */}
          <div className="border-line space-y-4 rounded-3xl border bg-white p-6 shadow-sm">
            <h3 className="border-line border-b pb-2 text-lg font-bold">Hình ảnh hiện trạng</h3>
            <p className="text-muted-foreground text-xs">
              Tải lên hình ảnh rõ nét để CardVault có thể sơ bộ đánh giá trước khi tiếp nhận.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="border-line text-muted-foreground flex h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition hover:bg-gray-50">
                <Camera className="mb-2 h-8 w-8 opacity-50" />
                <span className="text-sm font-medium">Tải lên mặt trước</span>
              </div>
              <div className="border-line text-muted-foreground flex h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition hover:bg-gray-50">
                <Camera className="mb-2 h-8 w-8 opacity-50" />
                <span className="text-sm font-medium">Tải lên mặt sau</span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="border-line space-y-4 rounded-3xl border bg-white p-6 shadow-sm">
            <h3 className="border-line border-b pb-2 text-lg font-bold">Thông tin khách hàng</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customerName">
                  Họ tên <span className="text-red-500">*</span>
                </Label>
                <Input id="customerName" value={formData.customerName} onChange={handleChange} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Số điện thoại <span className="text-red-500">*</span>
                </Label>
                <Input id="phone" value={formData.phone} onChange={handleChange} className="h-11 rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={handleChange} className="h-11 rounded-xl" />
            </div>

            <h3 className="pt-2 text-sm font-bold">Địa chỉ giao nhận thẻ</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="province">
                  Tỉnh/Thành phố <span className="text-red-500">*</span>
                </Label>
                <Input id="province" value={formData.province} onChange={handleChange} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">
                  Quận/Huyện <span className="text-red-500">*</span>
                </Label>
                <Input id="district" value={formData.district} onChange={handleChange} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ward">
                  Phường/Xã <span className="text-red-500">*</span>
                </Label>
                <Input id="ward" value={formData.ward} onChange={handleChange} className="h-11 rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">
                Địa chỉ chi tiết <span className="text-red-500">*</span>
              </Label>
              <Input id="address" value={formData.address} onChange={handleChange} className="h-11 rounded-xl" />
            </div>
          </div>

          <Button
            type="submit"
            className="bg-brand hover:bg-brand-dark h-14 w-full rounded-xl text-lg font-bold text-white shadow-md"
          >
            Gửi yêu cầu thẩm định
          </Button>
        </form>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useForm } from '@mantine/form';
import { CheckCircle2, Eye, EyeOff, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import xior from 'xior';
import { Button } from '~/components/ui/button';
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from '~/components/ui/combobox';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // API states
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const [selectedProvinceId, setSelectedProvinceId] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [selectedWardId, setSelectedWardId] = useState('');

  const [provinceSearch, setProvinceSearch] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');
  const [wardSearch, setWardSearch] = useState('');

  // Fetch provinces on mount
  useEffect(() => {
    fetch('https://esgoo.net/api-tinhthanh/1/0.htm')
      .then((res) => res.json())
      .then((data) => {
        if (data.error === 0) setProvinces(data.data);
      })
      .catch((err) => console.error('Lỗi khi lấy danh sách Tỉnh/Thành phố:', err));
  }, []);

  // Fetch districts when province changes
  useEffect(() => {
    if (selectedProvinceId) {
      fetch(`https://esgoo.net/api-tinhthanh/2/${selectedProvinceId}.htm`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error === 0) setDistricts(data.data);
        })
        .catch((err) => console.error('Lỗi khi lấy danh sách Quận/Huyện:', err));
    } else {
      setDistricts([]);
    }
  }, [selectedProvinceId]);

  // Fetch wards when district changes
  useEffect(() => {
    if (selectedDistrictId) {
      fetch(`https://esgoo.net/api-tinhthanh/3/${selectedDistrictId}.htm`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error === 0) setWards(data.data);
        })
        .catch((err) => console.error('Lỗi khi lấy danh sách Phường/Xã:', err));
    } else {
      setWards([]);
    }
  }, [selectedDistrictId]);

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      addressType: 'new', // 'new' | 'old'
      province: '',
      district: '',
      ward: '',
      address: '',
    },
    validate: {
      name: (value) => {
        if (value.trim().length < 2) return 'Họ và tên phải có ít nhất 2 ký tự';
        if (/\d/.test(value)) return 'Họ và tên không được chứa số';
        return null;
      },
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : 'Email không hợp lệ'),
      phone: (value) => {
        if (!value) return 'Vui lòng nhập số điện thoại';
        if (!/^\d+$/.test(value)) return 'Số điện thoại chỉ được chứa số';
        if (value.length < 10 || value.length > 11) return 'Số điện thoại không hợp lệ';
        return null;
      },
      password: (value) => {
        if (value.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự';
        if (!/[a-z]/.test(value)) return 'Mật khẩu phải chứa ít nhất 1 chữ thường';
        if (!/[A-Z]/.test(value)) return 'Mật khẩu phải chứa ít nhất 1 chữ hoa';
        return null;
      },
      confirmPassword: (value, values) => (value !== values.password ? 'Mật khẩu xác nhận không khớp' : null),
      province: (value) => (value.trim().length === 0 ? 'Vui lòng chọn Tỉnh/Thành phố' : null),
      district: (value) => (value.trim().length === 0 ? 'Vui lòng chọn Quận/Huyện' : null),
      ward: (value) => (value.trim().length === 0 ? 'Vui lòng chọn Phường/Xã' : null),
      address: (value) => (value.trim().length === 0 ? 'Vui lòng nhập địa chỉ chi tiết' : null),
    },
  });

  // Normalize Vietnamese diacritics for accent-insensitive search
  // e.g. "noi" or "nôi" both match "Hà Nội"
  const normalizeVN = (str: string) =>
    str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase();

  const activeProvinceSearch =
    provinceSearch === provinces.find((p) => p.id === selectedProvinceId)?.full_name ? '' : normalizeVN(provinceSearch);
  const activeDistrictSearch =
    districtSearch === districts.find((d) => d.id === selectedDistrictId)?.full_name ? '' : normalizeVN(districtSearch);
  const activeWardSearch = wardSearch === wards.find((w) => w.id === selectedWardId)?.full_name ? '' : normalizeVN(wardSearch);

  const filteredProvinces = provinces.filter((p) => normalizeVN(p.full_name).includes(activeProvinceSearch));
  const filteredDistricts = districts.filter((d) => normalizeVN(d.full_name).includes(activeDistrictSearch));
  const filteredWards = wards.filter((w) => normalizeVN(w.full_name).includes(activeWardSearch));

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      await xior.post('/api/auth/register', {
        email: values.email,
        password: values.password,
        name: values.name,
        phone: values.phone,
        provinceId: values.province,
        districtId: values.district,
        wardId: values.ward,
        detailedAddress: values.address,
        addressType: values.addressType,
      });
      toast.success('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || 'Có lỗi xảy ra, vui lòng thử lại.';
      toast.error(msg);
    }
  });

  // Ngăn chặn extension (trình quản lý mật khẩu) hoặc autofill tự động lock scroll của trang
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'style' || mutation.attributeName === 'data-scroll-locked') {
          if (document.body.style.overflow === 'hidden' || document.body.hasAttribute('data-scroll-locked')) {
            document.body.style.overflow = '';
            document.body.style.pointerEvents = '';
            document.body.removeAttribute('data-scroll-locked');
          }
        }
      });
    });

    observer.observe(document.body, { attributes: true });

    // Cleanup if there are residual locks
    document.body.style.overflow = '';
    document.body.style.pointerEvents = '';
    document.body.removeAttribute('data-scroll-locked');

    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-bg-color flex min-h-screen items-center justify-center p-4 py-10">
      <div className="border-line w-full max-w-[800px] rounded-3xl border bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <div className="from-brand mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br to-[#f9b24a] text-xl font-black text-white shadow-lg">
            ◈
          </div>
          <h1 className="text-2xl font-bold">Đăng ký tài khoản</h1>
          <p className="text-muted-foreground mt-1 text-sm">Bắt đầu hành trình sưu tầm cùng CardVault</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="border-line border-b pb-2 text-lg font-bold">Thông tin cơ bản</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Họ và tên <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  autoComplete="name"
                  {...form.getInputProps('name')}
                  onChange={(e) => form.setFieldValue('name', e.target.value.replace(/[0-9]/g, ''))}
                  className="h-11 rounded-xl"
                />
                {form.errors.name && <p className="text-destructive text-[0.75rem]">{form.errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Số điện thoại <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  maxLength={11}
                  {...form.getInputProps('phone')}
                  onChange={(e) => form.setFieldValue('phone', e.target.value.replace(/\D/g, ''))}
                  className="h-11 rounded-xl"
                />
                {form.errors.phone && <p className="text-destructive text-[0.75rem]">{form.errors.phone}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input id="email" type="email" autoComplete="email" {...form.getInputProps('email')} className="h-11 rounded-xl" />
              {form.errors.email && <p className="text-destructive text-[0.75rem]">{form.errors.email}</p>}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">
                  Mật khẩu <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    {...form.getInputProps('password')}
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
                {form.errors.password && <p className="text-destructive text-[0.75rem]">{form.errors.password}</p>}

                <div className="mt-2 space-y-1.5">
                  <div
                    className={`flex items-center gap-1.5 text-[0.75rem] ${form.values.password.length >= 8 ? 'text-green-600' : 'text-red-500'}`}
                  >
                    {form.values.password.length >= 8 ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    Ít nhất 8 ký tự
                  </div>
                  <div
                    className={`flex items-center gap-1.5 text-[0.75rem] ${/[a-z]/.test(form.values.password) ? 'text-green-600' : 'text-red-500'}`}
                  >
                    {/[a-z]/.test(form.values.password) ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    Có ít nhất 1 chữ thường
                  </div>
                  <div
                    className={`flex items-center gap-1.5 text-[0.75rem] ${/[A-Z]/.test(form.values.password) ? 'text-green-600' : 'text-red-500'}`}
                  >
                    {/[A-Z]/.test(form.values.password) ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    Có ít nhất 1 chữ hoa
                  </div>
                  <div
                    className={`flex items-center gap-1.5 text-[0.75rem] ${form.values.password && form.values.password === form.values.confirmPassword ? 'text-green-600' : 'text-red-500'}`}
                  >
                    {form.values.password && form.values.password === form.values.confirmPassword ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <XCircle size={14} />
                    )}
                    Xác nhận mật khẩu trùng khớp
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    {...form.getInputProps('confirmPassword')}
                    className="h-11 rounded-xl pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {form.errors.confirmPassword && <p className="text-destructive text-[0.75rem]">{form.errors.confirmPassword}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="border-line border-b pb-2 text-lg font-bold">Địa chỉ hiện tại</h3>
            <p className="text-muted-foreground text-xs">
              Vui lòng chọn hệ thống hành chính phù hợp để đảm bảo vận chuyển chính xác.
            </p>

            <Tabs
              value={form.values.addressType}
              onValueChange={(val) => {
                form.setFieldValue('addressType', val);
                // Xoá trắng dữ liệu khi đổi tab để tránh sai lệch
                form.setFieldValue('province', '');
                form.setFieldValue('district', '');
                form.setFieldValue('ward', '');
                form.setFieldValue('address', '');
                setSelectedProvinceId('');
                setSelectedDistrictId('');
                setSelectedWardId('');
                setProvinceSearch('');
                setDistrictSearch('');
                setWardSearch('');
              }}
              className="w-full"
            >
              <TabsList className="bg-muted/50 mb-4 grid h-11 w-full grid-cols-2 rounded-xl p-1">
                <TabsTrigger
                  value="new"
                  className="data-[state=active]:bg-brand h-9 rounded-lg font-medium transition-all data-[state=active]:text-white data-[state=active]:shadow-md"
                >
                  Địa chỉ sau sáp nhập
                </TabsTrigger>
                <TabsTrigger
                  value="old"
                  className="data-[state=active]:bg-brand h-9 rounded-lg font-medium transition-all data-[state=active]:text-white data-[state=active]:shadow-md"
                >
                  Địa chỉ trước sáp nhập
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {form.values.addressType === 'new' ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>
                    Tỉnh/Thành phố <span className="text-red-500">*</span>
                  </Label>
                  <Combobox
                    value={selectedProvinceId}
                    onValueChange={(val) => {
                      const newId = val ? String(val) : '';
                      setSelectedProvinceId(newId);
                      const item = provinces.find((p) => p.id === newId);
                      form.setFieldValue('province', item ? item.full_name : '');
                      setProvinceSearch(item ? item.full_name : '');

                      // Reset chi nhánh con
                      setSelectedDistrictId('');
                      form.setFieldValue('district', '');
                      setDistrictSearch('');
                      setSelectedWardId('');
                      form.setFieldValue('ward', '');
                      setWardSearch('');
                    }}
                  >
                    <ComboboxInput
                      placeholder="Chọn Tỉnh/Thành"
                      className="h-11 rounded-xl bg-white"
                      data-invalid={!!form.errors.province}
                      value={provinceSearch}
                      onChange={(e) => setProvinceSearch(e.target.value)}
                    />
                    <ComboboxContent>
                      {filteredProvinces.length === 0 && (
                        <div className="text-muted-foreground py-2 text-center text-sm">Không tìm thấy Tỉnh/Thành</div>
                      )}
                      <ComboboxList>
                        {filteredProvinces.map((p) => (
                          <ComboboxItem key={p.id} value={p.id}>
                            {p.full_name}
                          </ComboboxItem>
                        ))}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                  {form.errors.province && <p className="text-destructive text-[0.75rem]">{form.errors.province}</p>}
                </div>
                <div className="space-y-2">
                  <Label>
                    Quận/Huyện <span className="text-red-500">*</span>
                  </Label>
                  <Combobox
                    value={selectedDistrictId}
                    onValueChange={(val) => {
                      const newId = val ? String(val) : '';
                      setSelectedDistrictId(newId);
                      const item = districts.find((d) => d.id === newId);
                      form.setFieldValue('district', item ? item.full_name : '');
                      setDistrictSearch(item ? item.full_name : '');

                      // Reset phường/xã
                      setSelectedWardId('');
                      form.setFieldValue('ward', '');
                      setWardSearch('');
                    }}
                  >
                    <ComboboxInput
                      placeholder="Chọn Quận/Huyện"
                      className="h-11 rounded-xl bg-white"
                      data-invalid={!!form.errors.district}
                      disabled={!selectedProvinceId || districts.length === 0}
                      value={districtSearch}
                      onChange={(e) => setDistrictSearch(e.target.value)}
                    />
                    <ComboboxContent>
                      {filteredDistricts.length === 0 && selectedProvinceId && (
                        <div className="text-muted-foreground py-2 text-center text-sm">Không tìm thấy Quận/Huyện</div>
                      )}
                      <ComboboxList>
                        {filteredDistricts.map((d) => (
                          <ComboboxItem key={d.id} value={d.id}>
                            {d.full_name}
                          </ComboboxItem>
                        ))}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                  {form.errors.district && <p className="text-destructive text-[0.75rem]">{form.errors.district}</p>}
                </div>
                <div className="space-y-2">
                  <Label>
                    Phường/Xã <span className="text-red-500">*</span>
                  </Label>
                  <Combobox
                    value={selectedWardId}
                    onValueChange={(val) => {
                      const newId = val ? String(val) : '';
                      setSelectedWardId(newId);
                      const item = wards.find((w) => w.id === newId);
                      form.setFieldValue('ward', item ? item.full_name : '');
                      setWardSearch(item ? item.full_name : '');
                    }}
                  >
                    <ComboboxInput
                      placeholder="Chọn Phường/Xã"
                      className="h-11 rounded-xl bg-white"
                      data-invalid={!!form.errors.ward}
                      disabled={!selectedDistrictId || wards.length === 0}
                      value={wardSearch}
                      onChange={(e) => setWardSearch(e.target.value)}
                    />
                    <ComboboxContent>
                      {filteredWards.length === 0 && selectedDistrictId && (
                        <div className="text-muted-foreground py-2 text-center text-sm">Không tìm thấy Phường/Xã</div>
                      )}
                      <ComboboxList>
                        {filteredWards.map((w) => (
                          <ComboboxItem key={w.id} value={w.id}>
                            {w.full_name}
                          </ComboboxItem>
                        ))}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                  {form.errors.ward && <p className="text-destructive text-[0.75rem]">{form.errors.ward}</p>}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="province">
                    Tỉnh/Thành phố <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="province"
                    {...form.getInputProps('province')}
                    placeholder="Nhập Tỉnh/Thành phố..."
                    className="h-11 rounded-xl"
                  />
                  {form.errors.province && <p className="text-destructive text-[0.75rem]">{form.errors.province}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">
                    Quận/Huyện <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="district"
                    {...form.getInputProps('district')}
                    placeholder="Nhập Quận/Huyện..."
                    className="h-11 rounded-xl"
                  />
                  {form.errors.district && <p className="text-destructive text-[0.75rem]">{form.errors.district}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ward">
                    Phường/Xã <span className="text-red-500">*</span>
                  </Label>
                  <Input id="ward" {...form.getInputProps('ward')} placeholder="Nhập Phường/Xã..." className="h-11 rounded-xl" />
                  {form.errors.ward && <p className="text-destructive text-[0.75rem]">{form.errors.ward}</p>}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="address">
                Địa chỉ chi tiết <span className="text-red-500">*</span>
              </Label>
              <Input
                id="address"
                {...form.getInputProps('address')}
                className="h-11 rounded-xl"
                placeholder="Số nhà, tên đường..."
              />
              {form.errors.address && <p className="text-destructive text-[0.75rem]">{form.errors.address}</p>}
            </div>
          </div>

          <Button type="submit" className="bg-brand hover:bg-brand-dark h-11 w-full rounded-xl font-bold text-white shadow-md">
            Đăng ký
          </Button>
        </form>

        <div className="text-muted-foreground mt-6 text-center text-sm">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-brand font-bold hover:underline">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}

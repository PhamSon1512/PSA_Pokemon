import type { Route } from './+types/new';
import { useNavigate } from 'react-router';
import { useForm } from '@mantine/form';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import xior from 'xior';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { store } from '~/lib/store';

export default function CreateCardPage() {
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      certNumber: '',
      cardName: '',
      frontImage: '',
      backImage: '',
      itemGrade: '',
      labelType: '',
      reverseCertBarcode: '',
      year: '',
      brandTitle: '',
      subject: '',
      cardNumber: '',
      category: '',
      varietyPedigree: '',
      psaEstimate: '',
      psaPopulation: 0,
      psaPopHigher: 0,
      status: 'PENDING',
    },
    validate: {
      certNumber: (value) => (!value ? 'Vui lòng nhập mã thẻ' : null),
      cardName: (value) => (!value ? 'Vui lòng nhập tên thẻ' : null),
    },
  });

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      const client = xior.create({ baseURL: '/api' });
      await client.post('/admin/cards', values);
      toast.success('Thêm sản phẩm thành công');
      navigate('/admin/products');
    } catch (e: any) {
      toast.error('Có lỗi xảy ra: ' + (e?.response?.data?.error || e.message));
    }
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/admin/products')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Thêm Thẻ Mới</h1>
            <p className="text-muted-foreground text-sm">Nhập thông tin chi tiết cho chứng nhận thẻ.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Cột 1 */}
          <div className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Thông tin cơ bản</h2>

            <div className="space-y-2">
              <Label htmlFor="certNumber">Mã chứng nhận (Cert Number) *</Label>
              <Input id="certNumber" placeholder="Ví dụ: 135618180" {...form.getInputProps('certNumber')} />
              {form.errors.certNumber && <p className="text-destructive text-xs">{form.errors.certNumber}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardName">Tên thẻ (Đầy đủ) *</Label>
              <Input id="cardName" placeholder="Ví dụ: 2023 POKEMON JAPANESE SV2A..." {...form.getInputProps('cardName')} />
              {form.errors.cardName && <p className="text-destructive text-xs">{form.errors.cardName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="frontImage">URL Ảnh mặt trước (Front Image)</Label>
              <Input id="frontImage" placeholder="https://..." {...form.getInputProps('frontImage')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="backImage">URL Ảnh mặt sau (Back Image)</Label>
              <Input id="backImage" placeholder="https://..." {...form.getInputProps('backImage')} />
            </div>

            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select value={form.values.status} onValueChange={(v) => form.setFieldValue('status', v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Chờ duyệt</SelectItem>
                  <SelectItem value="APPROVED">Đã duyệt</SelectItem>
                  <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                  <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Cột 2 */}
          <div className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Thông tin chi tiết (Item Info)</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="itemGrade">Item Grade</Label>
                <Input id="itemGrade" placeholder="MINT 9" {...form.getInputProps('itemGrade')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="labelType">Label Type</Label>
                <Input id="labelType" placeholder="W/ FUGITIVE INK..." {...form.getInputProps('labelType')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Năm phát hành</Label>
                <Input id="year" placeholder="2023" {...form.getInputProps('year')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input id="cardNumber" placeholder="200" {...form.getInputProps('cardNumber')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brandTitle">Brand / Title</Label>
              <Input id="brandTitle" placeholder="POKEMON JAPANESE..." {...form.getInputProps('brandTitle')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" placeholder="VENUSAUR EX" {...form.getInputProps('subject')} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" placeholder="TCG CARDS" {...form.getInputProps('category')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="varietyPedigree">Variety / Pedigree</Label>
                <Input id="varietyPedigree" placeholder="SPECIAL ART RARE" {...form.getInputProps('varietyPedigree')} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="psaEstimate">Định giá</Label>
                <Input id="psaEstimate" placeholder="$98.00" {...form.getInputProps('psaEstimate')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="psaPopulation">Population</Label>
                <Input id="psaPopulation" type="number" {...form.getInputProps('psaPopulation')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="psaPopHigher">Pop Higher</Label>
                <Input id="psaPopHigher" type="number" {...form.getInputProps('psaPopHigher')} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="lg" className="bg-brand hover:bg-brand-dark">
            <Save className="mr-2 h-4 w-4" /> Lưu Sản Phẩm
          </Button>
        </div>
      </form>
    </div>
  );
}

import type { Route } from './+types/_index';
import { useState } from 'react';
import { useRevalidator } from 'react-router';
import { useForm } from '@mantine/form';
import { Globe, Image, Loader2, Save } from 'lucide-react';
import { zodResolver } from 'mantine-form-zod-resolver';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { getApiError, http } from '~/lib/http';

// ─── Server exports ────────────────────────────────────────────────────────────
export { loader } from './loader.server';

// ─── Meta ─────────────────────────────────────────────────────────────────────
export const meta = (_: Route.MetaArgs) => [
  { title: 'Settings — Admin Portal' },
  { name: 'description', content: 'Site-wide settings' },
];

// ─── Schema ───────────────────────────────────────────────────────────────────
const SettingsSchema = z.object({
  siteName: z.string().min(1, 'Site name is required'),
  siteDescription: z.string(),
  siteUrl: z.string().url('Must be a valid URL').or(z.literal('')),
  adminEmail: z.string().email('Must be a valid email').or(z.literal('')),
  mediaOrganizeByDate: z.boolean(),
});

type SettingsValues = z.infer<typeof SettingsSchema>;

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SettingsPage({ loaderData }: Route.ComponentProps) {
  const { siteSettings } = loaderData;
  const revalidator = useRevalidator();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<SettingsValues>({
    validate: zodResolver(SettingsSchema),
    initialValues: {
      siteName: siteSettings.siteName,
      siteDescription: siteSettings.siteDescription,
      siteUrl: siteSettings.siteUrl,
      adminEmail: siteSettings.adminEmail,
      mediaOrganizeByDate: siteSettings.mediaOrganizeByDate,
    },
  });

  const handleSubmit = form.onSubmit(async (values) => {
    setIsSaving(true);
    try {
      await http.patch('/api/settings', values);
      revalidator.revalidate();
      toast.success('Settings saved');
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setIsSaving(false);
    }
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-foreground text-xl font-semibold">Settings</h1>
          <p className="text-muted-foreground mt-1 text-sm">Configure site-wide options</p>
        </div>
        <Button size="sm" type="button" onClick={() => handleSubmit()} disabled={isSaving}>
          {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
          Save settings
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* ── General ── */}
        <SettingsSection title="General" icon={<Globe className="size-4" />}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="site-name">Site name</Label>
              <Input id="site-name" placeholder="My CMS Site" {...form.getInputProps('siteName')} />
              {form.errors.siteName && <p className="text-destructive text-xs">{form.errors.siteName}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="admin-email">Admin email</Label>
              <Input id="admin-email" type="email" placeholder="admin@example.com" {...form.getInputProps('adminEmail')} />
              {form.errors.adminEmail && <p className="text-destructive text-xs">{form.errors.adminEmail}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="site-desc">Tagline / Description</Label>
            <Textarea
              id="site-desc"
              placeholder="A short description of your site"
              rows={2}
              className="resize-none"
              {...form.getInputProps('siteDescription')}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="site-url">Site URL</Label>
            <Input id="site-url" type="url" placeholder="https://example.com" {...form.getInputProps('siteUrl')} />
            {form.errors.siteUrl && <p className="text-destructive text-xs">{form.errors.siteUrl}</p>}
          </div>
        </SettingsSection>

        {/* ── Media ── */}
        <SettingsSection title="Media" icon={<Image className="size-4" />}>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className="mt-0.5 size-4 rounded"
              checked={form.values.mediaOrganizeByDate}
              onChange={(e) => form.setFieldValue('mediaOrganizeByDate', e.target.checked)}
            />
            <div>
              <span className="text-sm font-medium">Organize uploads into month- and year-based folders</span>
              <p className="text-muted-foreground text-xs">E.g. uploads/2025/03/image.jpg</p>
            </div>
          </label>
        </SettingsSection>
      </form>
    </div>
  );
}

// ─── SettingsSection ──────────────────────────────────────────────────────────

function SettingsSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="border-border bg-card rounded-xl border">
      <div className="border-border flex items-center gap-2 border-b px-5 py-4 text-sm font-medium">
        <span className="text-muted-foreground">{icon}</span>
        {title}
      </div>
      <div className="flex flex-col gap-4 px-5 py-5">{children}</div>
    </div>
  );
}

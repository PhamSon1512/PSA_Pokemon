import type { Route } from './+types/login';
import type { ApiSuccess, AuthTokens, SafeUser } from '~/.server/types';
import { useEffect, useRef, useState } from 'react';
import { redirect, useNavigate } from 'react-router';
import { useForm } from '@mantine/form';
import Cookies from 'js-cookie';
import { Eye, EyeOff, Lock, LogIn, Mail, ShieldCheck } from 'lucide-react';
import { zodResolver } from 'mantine-form-zod-resolver';
import { parseCookie, TOKEN_COOKIE } from '~/.server/session';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { ThemeToggle } from '~/components/ui/theme-toggle';
import { getApiError, http } from '~/lib/http';
import { LoginBodySchema } from '~/openapi/auth-users.openapi';

// ─── Loader: redirect if already authenticated ────────────────────────────────
export async function loader({ request }: Route.LoaderArgs) {
  const token = parseCookie(request.headers.get('Cookie'), TOKEN_COOKIE);
  if (token) throw redirect('/admin');
  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: zodResolver(LoginBodySchema),
  });

  // Focus email on mount
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  async function handleSubmit(values: typeof form.values) {
    setGeneralError(null);
    setIsSubmitting(true);

    try {
      const res = await http.post<ApiSuccess<AuthTokens & { user: SafeUser }>>('/api/auth/login', values);

      const { token, refreshToken, user } = res.data.data;

      // Require admin role
      if (user.role !== 'admin') {
        setGeneralError('You do not have permission to access the admin area.');
        return;
      }

      // Persist only the access token client-side so xior can attach it as Bearer.
      // The refresh token is already set as HttpOnly by the server's Set-Cookie header
      // — never set it here or it would lose HttpOnly protection.
      Cookies.set('token', token, {
        expires: 1,
        sameSite: 'lax',
        secure: window.location.protocol === 'https:',
      });

      navigate('/admin');
    } catch (err: unknown) {
      const message = getApiError(err, 'Login failed');
      setGeneralError(message === 'Invalid credentials' ? 'Incorrect email or password.' : message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-background relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* Theme toggle — top-right corner */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Background gradient blobs — subtle in both light & dark */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[20%] size-[600px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.12)_0%,transparent_70%)]" />
        <div className="absolute -right-[10%] -bottom-[10%] size-[500px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.1)_0%,transparent_70%)]" />
        <div className="absolute top-[30%] left-[40%] size-[300px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.07)_0%,transparent_70%)]" />
      </div>

      {/* Grid pattern overlay */}
      <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(var(--foreground)_1px,transparent_1px),linear-gradient(90deg,var(--foreground)_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.03] dark:opacity-[0.04]" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-[420px] px-4">
        {/* Logo / Brand */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#6366f1,#8b5cf6)] shadow-[0_0_30px_rgba(99,102,241,0.4)]">
            <ShieldCheck className="size-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-foreground text-2xl font-bold tracking-tight">Admin Portal</h1>
            <p className="text-muted-foreground mt-1 text-sm">Sign in to continue</p>
          </div>
        </div>

        {/* Form card */}
        <div className="border-border bg-card rounded-2xl border p-8 shadow-xl backdrop-blur-xl">
          {/* General error */}
          {generalError && (
            <div className="border-destructive/30 bg-destructive/10 mb-6 flex items-start gap-3 rounded-lg border px-4 py-3">
              <span className="bg-destructive/20 text-destructive mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                !
              </span>
              <p className="text-destructive text-sm">{generalError}</p>
            </div>
          )}

          <form onSubmit={form.onSubmit(handleSubmit)} noValidate className="flex flex-col gap-5">
            {/* Email field */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-foreground/80">
                Email
              </Label>
              <div className="relative">
                <Mail className="text-muted-foreground/50 absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  ref={emailRef}
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  autoComplete="email"
                  aria-invalid={!!form.errors.email}
                  aria-describedby={form.errors.email ? 'email-error' : undefined}
                  className="h-11 pl-10 focus-visible:border-[#6366f1] focus-visible:ring-[#6366f1]/20"
                  {...form.getInputProps('email')}
                />
              </div>
              {form.errors.email && (
                <p id="email-error" className="text-destructive text-xs">
                  {form.errors.email}
                </p>
              )}
            </div>

            {/* Password field */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-foreground/80">
                Password
              </Label>
              <div className="relative">
                <Lock className="text-muted-foreground/50 absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  aria-invalid={!!form.errors.password}
                  aria-describedby={form.errors.password ? 'password-error' : undefined}
                  className="h-11 pr-10 pl-10 focus-visible:border-[#6366f1] focus-visible:ring-[#6366f1]/20"
                  {...form.getInputProps('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="text-muted-foreground/50 hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {form.errors.password && (
                <p id="password-error" className="text-destructive text-xs">
                  {form.errors.password}
                </p>
              )}
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 h-11 bg-[linear-gradient(135deg,#6366f1,#8b5cf6)] font-medium text-white shadow-[0_4px_24px_rgba(99,102,241,0.3)] transition-all hover:shadow-[0_4px_32px_rgba(99,102,241,0.5)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="size-4" />
                  Sign In
                </span>
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-muted-foreground/50 mt-6 text-center text-xs">Restricted area for administrators only</p>
      </div>
    </div>
  );
}

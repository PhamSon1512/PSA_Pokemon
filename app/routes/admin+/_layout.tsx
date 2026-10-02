import type { Route } from './+types/_layout';
import { useState } from 'react';
import { data, NavLink, Outlet, redirect, useSubmit } from 'react-router';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Image,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Settings,
  ShieldCheck,
  Sun,
  Users,
  X,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { clearAuthCookies, requireAuthSession } from '~/.server';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { cn } from '~/lib/utils';

// ─── Navigation items ──────────────────────────────────────────────────────────
type NavItem = { label: string; href: string; icon: React.ElementType; end: boolean };
type NavSection = { section: string } | NavItem;

const navItems: NavSection[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, end: true },
  // Library
  { section: 'Library' },
  { label: 'Media', href: '/admin/media', icon: Image as any, end: false },
  // Admin
  { section: 'Admin' },
  { label: 'Users', href: '/admin/users', icon: Users, end: false },
  { label: 'Roles & Permissions', href: '/admin/rbac', icon: KeyRound, end: false },
  { label: 'Settings', href: '/admin/settings', icon: Settings, end: false },
];

// ─── Loader: protect all admin routes ─────────────────────────────────
export async function loader({ request, context }: Route.LoaderArgs) {
  // requireAuthSession handles expired token refresh automatically.
  // If both tokens are invalid it throws a redirect to /login.
  const { user, headers } = await requireAuthSession(request, context);

  if (user.role !== 'admin') {
    // Clear cookies so the non-admin token cannot be reused — then redirect
    const responseHeaders = new Headers(headers ?? {});
    clearAuthCookies().forEach((c) => responseHeaders.append('Set-Cookie', c));
    throw redirect('/login', { headers: responseHeaders });
  }

  // Forward Set-Cookie header if a new access token was issued during refresh
  return data({ user }, { headers: headers ?? {} });
}

// ─── Action: handle logout ─────────────────────────────────────────────────────
export async function action({ request }: Route.ActionArgs) {
  // Only accept POST — guards against accidental GET-based logout (e.g. prefetch)
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const headers = new Headers();
  clearAuthCookies().forEach((c) => headers.append('Set-Cookie', c));
  return redirect('/login', { headers });
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminLayout({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Derive initials from local part of email (before @), max 2 chars
  const initials = user.email.split('@')[0].slice(0, 2).toUpperCase();

  return (
    <div className="bg-background flex h-screen overflow-hidden">
      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Mobile hamburger — floating, top-left, hidden on desktop ── */}
      <button
        onClick={() => setMobileOpen((v) => !v)}
        className="border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground fixed top-3 left-3 z-50 flex size-9 items-center justify-center rounded-lg border shadow-md transition-colors lg:hidden"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
      </button>

      {/* ── Sidebar ── */}
      <aside
        className={cn(
          'border-border bg-sidebar fixed inset-y-0 left-0 z-50 flex flex-col border-r backdrop-blur-xl transition-[width,transform] duration-300 ease-in-out lg:relative',
          collapsed ? 'w-[68px]' : 'w-[240px]',
          // Mobile: slide in/out; Desktop: always visible
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Brand */}
        <div className={cn('border-border flex h-16 shrink-0 items-center border-b px-4', collapsed ? 'justify-center' : 'gap-3')}>
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#6366f1,#8b5cf6)] shadow-[0_0_16px_rgba(99,102,241,0.35)]">
            <ShieldCheck className="size-4 text-white" />
          </div>
          {!collapsed && <span className="text-sidebar-foreground truncate text-sm font-semibold">Admin Portal</span>}
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
          {navItems.map((item, idx) => {
            // Section header
            if ('section' in item) {
              return collapsed ? (
                <div key={item.section} className="border-border/50 my-1 border-t" />
              ) : (
                <p
                  key={item.section}
                  className="text-muted-foreground/50 px-3 pt-3 pb-1 text-[10px] font-semibold tracking-widest uppercase"
                >
                  {item.section}
                </p>
              );
            }

            return (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-primary/15 text-sidebar-primary'
                      : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    collapsed && 'justify-center px-2',
                  )
                }
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="size-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* User menu — footer trigger */}
        <div className="border-border shrink-0 border-t p-2">
          <UserMenu email={user.email} role={user.role} initials={initials} collapsed={collapsed} />
        </div>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="border-border bg-background text-muted-foreground hover:text-foreground absolute top-20 -right-3 hidden size-6 items-center justify-center rounded-full border shadow-md transition-colors lg:flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="size-3" /> : <ChevronLeft className="size-3" />}
        </button>
      </aside>

      {/* ── Main content ── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// ─── UserMenu ─────────────────────────────────────────────────────────────────
// Footer trigger: shows avatar + user info. Dropdown opens upward (side="top").
function UserMenu({ email, role, initials, collapsed }: { email: string; role: string; initials: string; collapsed: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const submit = useSubmit();
  const isDark = resolvedTheme === 'dark';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'hover:bg-accent flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
            collapsed && 'justify-center px-2',
          )}
          title={collapsed ? email : undefined}
        >
          {/* Avatar */}
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6366f1,#8b5cf6)] text-[11px] font-bold text-white">
            {initials}
          </div>

          {/* Info — hidden when collapsed */}
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1 text-left">
                <p className="text-sidebar-foreground truncate text-xs font-medium">{email}</p>
                <p className="text-muted-foreground text-[10px] capitalize">{role}</p>
              </div>
              <ChevronsUpDown className="text-muted-foreground/50 size-3.5 shrink-0" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>

      {/* Menu opens upward — align to start of trigger */}
      <DropdownMenuContent side="top" align="start" className="border-border/50 w-56">
        {/* Theme toggle */}
        <DropdownMenuItem onClick={() => setTheme(isDark ? 'light' : 'dark')}>
          {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          {isDark ? 'Light mode' : 'Dark mode'}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem variant="destructive" onClick={() => submit(null, { method: 'post' })}>
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

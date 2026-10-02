import type { Route } from './+types/_index';
import { data, Link } from 'react-router';
import { count, isNull } from 'drizzle-orm';
import { Activity, Image, Users } from 'lucide-react';
import { getDb } from '~/.server/db';
import { requireAuthSession } from '~/.server/guard';
import { media, users } from '~/models';

// ─── Loader ──────────────────────────────────────────────────────────────────
export async function loader({ request, context }: Route.LoaderArgs) {
  const { user } = await requireAuthSession(request, context);

  const db = getDb(context);

  const [[{ totalUsers }], [{ totalMedia }]] = await Promise.all([
    db.select({ totalUsers: count() }).from(users).where(isNull(users.deletedAt)),
    db.select({ totalMedia: count() }).from(media).where(isNull(media.deletedAt)),
  ]);

  return data({ user, totalUsers, totalMedia });
}

// ─── Meta ─────────────────────────────────────────────────────────────────────
export const meta = (_: Route.MetaArgs) => [
  { title: 'Dashboard — Admin Portal' },
  { name: 'description', content: 'Admin dashboard overview' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard({ loaderData }: Route.ComponentProps) {
  const { user, totalUsers, totalMedia } = loaderData;

  const stats = [
    {
      label: 'Total Users',
      value: String(totalUsers),
      sub: 'active accounts',
      icon: Users,
      color: 'from-[#06b6d4] to-[#3b82f6]',
      glow: '[--glow:rgba(6,182,212,0.2)]',
      href: '/admin/users',
    },
    {
      label: 'Media Files',
      value: String(totalMedia),
      sub: 'in library',
      icon: Image,
      color: 'from-[#10b981] to-[#059669]',
      glow: '[--glow:rgba(16,185,129,0.2)]',
      href: '/admin/media',
    },
  ];

  const quickLinks = [
    { label: 'Media Library', href: '/admin/media', desc: 'Upload and manage files' },
    { label: 'Site Settings', href: '/admin/settings', desc: 'Configure your site' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Greeting */}
      <div>
        <h1 className="text-foreground text-xl font-semibold">Welcome back{user.email ? `, ${user.email.split('@')[0]}` : ''}</h1>
        <p className="text-muted-foreground mt-1 text-sm">Here&apos;s what&apos;s happening with your site today.</p>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, sub, icon: Icon, color, glow, href }) => (
          <Link
            key={label}
            to={href}
            className="border-border bg-card relative overflow-hidden rounded-xl border p-5 shadow-sm transition-all hover:border-[rgba(99,102,241,0.3)] hover:shadow-md"
          >
            {/* Glow */}
            <div
              className={`pointer-events-none absolute -top-4 -right-4 size-24 rounded-full bg-[--glow] opacity-40 blur-2xl ${glow}`}
            />

            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-xs">{label}</p>
                <p className="text-card-foreground mt-1.5 text-2xl font-bold">{value}</p>
                <p className="text-muted-foreground mt-0.5 text-[11px]">{sub}</p>
              </div>
              <div className={`flex size-9 items-center justify-center rounded-lg bg-gradient-to-br ${color} shadow-sm`}>
                <Icon className="size-4 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Quick links ── */}
      <div className="border-border bg-card rounded-xl border p-5 shadow-sm">
        <h2 className="text-card-foreground mb-4 flex items-center gap-2 text-sm font-medium">
          <Activity className="text-muted-foreground size-4" />
          Quick actions
        </h2>
        <div className="flex flex-col gap-1">
          {quickLinks.map(({ label, href, desc }) => (
            <Link
              key={href}
              to={href}
              className="hover:bg-accent group flex items-center justify-between rounded-lg px-2 py-2 transition-colors"
            >
              <div>
                <p className="text-foreground text-xs font-medium">{label}</p>
                <p className="text-muted-foreground text-[10px]">{desc}</p>
              </div>
              <span className="text-muted-foreground/50 group-hover:text-muted-foreground text-sm">→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

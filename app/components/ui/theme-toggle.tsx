import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '~/lib/utils';

interface ThemeToggleProps {
  /** When true, hides the text label — used in collapsed sidebar */
  collapsed?: boolean;
  className?: string;
}

// ─── Theme Toggle ──────────────────────────────────────────────────────────────
// Two display modes:
//   collapsed=true  → icon only (fits collapsed sidebar width)
//   collapsed=false → icon + label (fits expanded sidebar row)
export function ThemeToggle({ collapsed, className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();

  const isDark = resolvedTheme === 'dark';
  const label = isDark ? 'Light mode' : 'Dark mode';

  const toggle = () => setTheme(isDark ? 'light' : 'dark');

  return (
    <button onClick={toggle} aria-label="Toggle theme" title={label} className={cn('relative flex items-center', className)}>
      {/* Icon wrapper — swap Sun/Moon via dark: variant */}
      <span className="relative size-4 shrink-0">
        <Sun className="absolute inset-0 size-4 scale-100 rotate-0 transition-all duration-200 dark:scale-0 dark:-rotate-90" />
        <Moon className="absolute inset-0 size-4 scale-0 rotate-90 transition-all duration-200 dark:scale-100 dark:rotate-0" />
      </span>

      {/* Label — hidden when sidebar is collapsed */}
      {!collapsed && <span className="ml-3 truncate">{label}</span>}
    </button>
  );
}

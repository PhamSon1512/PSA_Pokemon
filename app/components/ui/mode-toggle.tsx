import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from './button';

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9 opacity-50">
        <Sun className="h-[1.1rem] w-[1.1rem]" />
        <span className="sr-only">Chuyển đổi giao diện</span>
      </Button>
    );
  }

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      className="h-9 w-9 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-0 focus-visible:ring-offset-0 dark:hover:bg-gray-800 dark:hover:text-gray-50"
    >
      {theme === 'dark' ? (
        <Moon className="text-brand-dark h-[1.1rem] w-[1.1rem]" />
      ) : theme === 'light' ? (
        <Sun className="text-brand-dark h-[1.1rem] w-[1.1rem]" />
      ) : (
        <Monitor className="text-brand-dark h-[1.1rem] w-[1.1rem]" />
      )}
      <span className="sr-only">Chuyển đổi giao diện</span>
    </Button>
  );
}

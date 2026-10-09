import * as React from 'react';
import { cn } from '~/lib/utils';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  currencySuffix?: string;
  className?: string;
}

/**
 * CurrencyInput — formats number with vi-VN locale, appends "VNĐ" suffix.
 */
export function CurrencyInput({
  value,
  onChange,
  currencySuffix = 'VNĐ',
  className,
  placeholder = '0',
  ...props
}: CurrencyInputProps) {
  const [display, setDisplay] = React.useState('');

  // Sync display when value is changed externally
  React.useEffect(() => {
    if (value !== undefined && value !== null && !isNaN(value)) {
      setDisplay(value.toLocaleString('vi-VN'));
    } else {
      setDisplay('');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    if (!raw) {
      setDisplay('');
      onChange(undefined);
      return;
    }
    const num = parseInt(raw, 10);
    setDisplay(num.toLocaleString('vi-VN'));
    onChange(num);
  };

  return (
    <div className="relative flex items-center">
      <input
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        placeholder={placeholder as string}
        className={cn(
          'border-input placeholder:text-muted-foreground dark:bg-input/30 flex h-9 w-full rounded-md border bg-transparent px-3 pr-12 text-right text-base shadow-xs transition-colors outline-none selection:bg-amber-500 selection:text-white md:text-sm',
          'hover:border-amber-500 hover:bg-amber-500/5 dark:hover:bg-amber-500/10',
          'focus:border-amber-500 focus-visible:border-amber-500 focus-visible:ring-[3px] focus-visible:ring-amber-500/20',
          'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
          className,
        )}
        {...(props as any)}
      />
      <span className="pointer-events-none absolute right-3 text-xs font-medium text-gray-400 dark:text-gray-500">
        {currencySuffix}
      </span>
    </div>
  );
}

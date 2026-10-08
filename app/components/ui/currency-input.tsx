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
          'placeholder:text-muted-foreground flex h-9 w-full rounded-lg border border-gray-200 bg-white px-3 pr-12 text-right text-sm font-medium transition-colors focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white',
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

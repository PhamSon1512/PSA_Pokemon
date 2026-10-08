import * as React from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '~/lib/utils';

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
}

/**
 * NumberStepper — compact [−] [value] [+] layout.
 * Minus on LEFT, value in CENTER, Plus on RIGHT.
 */
export function NumberStepper({
  value,
  onChange,
  min = 0,
  max = 999999,
  step = 1,
  disabled = false,
  className,
}: NumberStepperProps) {
  const decrement = () => {
    if (value - step >= min) onChange(value - step);
  };
  const increment = () => {
    if (value + step <= max) onChange(value + step);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value, 10);
    if (!isNaN(v) && v >= min && v <= max) onChange(v);
  };

  return (
    <div
      className={cn(
        'flex h-9 items-center overflow-hidden rounded-lg border border-gray-200 bg-white transition-colors dark:border-white/10 dark:bg-white/5',
        'hover:border-amber-500 hover:bg-amber-500/5 dark:hover:bg-amber-500/10',
        'focus-within:border-amber-500 focus-within:ring-[3px] focus-within:ring-amber-500/20',
        disabled && 'pointer-events-none opacity-50',
        className,
      )}
    >
      {/* − */}
      <button
        type="button"
        onClick={decrement}
        disabled={disabled || value <= min}
        className="flex h-full w-9 shrink-0 items-center justify-center border-r border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-amber-600 disabled:opacity-40 dark:border-white/10 dark:hover:bg-white/5"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>

      {/* value */}
      <input
        type="number"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className="h-full min-w-0 flex-1 [appearance:textfield] bg-transparent text-center text-sm font-semibold text-gray-800 focus:outline-none dark:text-white [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />

      {/* + */}
      <button
        type="button"
        onClick={increment}
        disabled={disabled || value >= max}
        className="flex h-full w-9 shrink-0 items-center justify-center border-l border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-amber-600 disabled:opacity-40 dark:border-white/10 dark:hover:bg-white/5"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

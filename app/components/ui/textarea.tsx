import * as React from 'react';
import { cn } from '~/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'border-input placeholder:text-muted-foreground dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-colors outline-none selection:bg-amber-500 selection:text-white disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'hover:border-amber-500 hover:bg-amber-500/5 dark:hover:bg-amber-500/10',
        'focus:border-amber-500 focus-visible:border-amber-500 focus-visible:ring-[3px] focus-visible:ring-amber-500/20',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };

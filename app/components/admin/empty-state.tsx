import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  message: ReactNode;
}

/**
 * Centered empty-state block: dimmed icon + descriptive text.
 * Replaces the repeated "flex flex-col items-center justify-center gap-3 py-16 text-center" pattern.
 */
export function EmptyState({ icon: Icon, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <Icon className="text-muted-foreground/30 size-8" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
}

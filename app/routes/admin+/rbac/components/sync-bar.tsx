import type { DiscoveredRoute } from '~/.server/discover-routes';
import { useState } from 'react';
import { AlertCircle, Check, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~/components/ui/collapsible';
import { useAsyncAction } from '~/hooks/use-async-action';
import { http } from '~/lib/http';
import { cn } from '~/lib/utils';
import { METHOD_COLORS } from '../helpers';

export function SyncBar({ missing }: { missing: DiscoveredRoute[] }) {
  const { isBusy, run } = useAsyncAction();
  const [expanded, setExpanded] = useState(false);

  const handleSync = () =>
    run(() => http.post('/api/admin/sync'), {
      successMessage: 'Routes synced to permissions successfully',
      errorMessage: 'Failed to sync routes',
    });

  if (missing.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-[rgba(16,185,129,0.3)] bg-[rgba(16,185,129,0.06)] px-4 py-3">
        <Check className="size-4 shrink-0 text-[#059669]" />
        <p className="text-sm text-[#059669]">All API routes are synced to permissions.</p>
      </div>
    );
  }

  // Group missing routes by base path for the preview panel
  const grouped = missing.reduce((map, r) => {
    const key = r.resource.includes('/:') ? r.resource.slice(0, r.resource.indexOf('/:')) : r.resource;
    const list = map.get(key) ?? [];
    list.push(r);
    return map.set(key, list);
  }, new Map<string, typeof missing>());

  return (
    <Collapsible
      open={expanded}
      onOpenChange={setExpanded}
      className="overflow-hidden rounded-xl border border-[rgba(245,158,11,0.35)] bg-[rgba(245,158,11,0.06)]"
    >
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <AlertCircle className="size-4 shrink-0 text-[#d97706]" />
        <p className="flex-1 text-sm text-[#d97706]">
          <strong>
            {missing.length} API route{missing.length > 1 ? 's' : ''}
          </strong>{' '}
          not yet in database
        </p>
        <CollapsibleTrigger asChild>
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-[11px] text-[#d97706]/70 underline underline-offset-2 hover:text-[#d97706] hover:no-underline"
          >
            {expanded ? 'hide' : 'preview'}
          </Button>
        </CollapsibleTrigger>
        <Button
          type="button"
          size="sm"
          disabled={isBusy}
          onClick={handleSync}
          className="border-0 bg-[#d97706] text-white hover:bg-[#b45309]"
        >
          {isBusy ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
          Sync from routes
        </Button>
      </div>

      {/* Expandable preview — grouped by base path */}
      <CollapsibleContent>
        <div className="border-t border-[rgba(245,158,11,0.2)] px-4 py-3">
          <div className="flex flex-col gap-2">
            {Array.from(grouped.entries()).map(([basePath, routes]) => (
              <div
                key={basePath}
                className="flex items-center gap-3 rounded-lg border border-[rgba(245,158,11,0.2)] bg-[rgba(245,158,11,0.04)] px-3 py-2"
              >
                <code className="text-muted-foreground min-w-0 flex-1 truncate font-mono text-[11px]">{basePath}</code>
                <div className="flex shrink-0 flex-wrap gap-1">
                  {routes.map((r) => (
                    <span
                      key={r.action}
                      className={cn(
                        'rounded px-1.5 py-0.5 font-mono text-[9px] font-bold',
                        METHOD_COLORS[r.action] ?? 'bg-muted text-muted-foreground',
                      )}
                    >
                      {r.action}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

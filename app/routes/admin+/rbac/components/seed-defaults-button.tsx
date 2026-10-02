import { Database, Loader2 } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { useAsyncAction } from '~/hooks/use-async-action';
import { http } from '~/lib/http';

// Renders a button to run seedRbac() via API.
export function SeedDefaultsButton() {
  const { isBusy, run } = useAsyncAction();

  const handleSeed = () =>
    run(() => http.post('/api/admin/seed'), {
      successMessage: 'Default roles seeded successfully',
      errorMessage: 'Failed to seed default roles',
    });

  return (
    <Button type="button" size="sm" disabled={isBusy} variant="outline" onClick={handleSeed}>
      {isBusy ? <Loader2 className="size-3.5 animate-spin" /> : <Database className="size-3.5" />}
      Seed default roles
    </Button>
  );
}

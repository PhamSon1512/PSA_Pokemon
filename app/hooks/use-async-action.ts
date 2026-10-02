import { useState } from 'react';
import { useRevalidator } from 'react-router';
import { toast } from 'sonner';
import { getApiError } from '~/lib/http';

/**
 * Encapsulates the repetitive async-action pattern used in every admin dialog:
 *   1. Set busy state
 *   2. Call async fn
 *   3. On success: revalidate + optional success toast
 *   4. On error: show error toast via getApiError
 *   5. Reset busy state in finally
 *
 * Returns `{ isBusy, run }`.
 */
export function useAsyncAction() {
  const revalidator = useRevalidator();
  const [isBusy, setIsBusy] = useState(false);

  async function run(
    fn: () => Promise<void>,
    options?: {
      onSuccess?: () => void;
      successMessage?: string;
      /** Pass a static error message to override getApiError */
      errorMessage?: string;
      revalidate?: boolean;
    },
  ): Promise<void> {
    const { onSuccess, successMessage, errorMessage, revalidate = true } = options ?? {};
    setIsBusy(true);
    try {
      await fn();
      if (revalidate) revalidator.revalidate();
      if (successMessage) toast.success(successMessage);
      onSuccess?.();
    } catch (err) {
      toast.error(errorMessage ?? getApiError(err));
    } finally {
      setIsBusy(false);
    }
  }

  return { isBusy, run };
}

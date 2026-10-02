import type { Route } from './+types/_404.$';
import { ErrorBoundary as GeneralError } from '~/components';
import { metaBuilder } from '~/lib/utils';

export const meta = () => metaBuilder('Error');

export const loader = async () => {
  throw new Response('Not found', { status: 404 });
};

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <GeneralError error={error} />;
}

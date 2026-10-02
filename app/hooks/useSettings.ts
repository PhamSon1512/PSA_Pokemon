import { useRouteLoaderData } from 'react-router';

export function useSettings() {
  return useRouteLoaderData('root');
}

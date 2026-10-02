import { useLocation, useSearchParams } from 'react-router';
import queryString from 'query-string';

export function useQuery() {
  const { search } = useLocation();
  const [, setSearchParams] = useSearchParams();

  const query = queryString.parse(search);
  const setQuery = (value: Record<string, string>) => {
    setSearchParams({ ...query, ...value } as Record<string, string>);
  };

  return [query, setQuery] as const;
}

import { useEffect } from 'react';
import { useRevalidator } from 'react-router';

export function useRevalidateOnFocus() {
  const revalidator = useRevalidator();

  useEffect(() => {
    function onFocus() {
      revalidator.revalidate();
    }
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [revalidator]);

  useEffect(() => {
    function onVisibilityChange() {
      revalidator.revalidate();
    }
    window.addEventListener('visibilitychange', onVisibilityChange);
    return () => window.removeEventListener('visibilitychange', onVisibilityChange);
  }, [revalidator]);
}

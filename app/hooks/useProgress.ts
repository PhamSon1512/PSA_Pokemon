import { useEffect } from 'react';
import { useNavigation } from 'react-router';
import progress from 'nprogress';

export function useProgress() {
  const { state } = useNavigation();

  useEffect(() => {
    if (state === 'idle') progress.done();
    else progress.start();
  }, [state]);
}

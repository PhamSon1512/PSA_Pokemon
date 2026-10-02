import { useEffect } from 'react';
import { useNavigation } from 'react-router';
import NProgress from 'nprogress';

NProgress.configure({ showSpinner: false });

export function useNProgress() {
  const navigation = useNavigation();

  useEffect(() => {
    if (navigation.state === 'loading' || navigation.state === 'submitting') {
      NProgress.start();
    } else {
      NProgress.done();
    }
  }, [navigation.state]);
}

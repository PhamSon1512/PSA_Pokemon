import { useEffect } from 'react';
import LazyLoad from 'vanilla-lazyload';

export function useLazyLoad() {
  useEffect(() => {
    const lazyLoadInstance = new LazyLoad({
      elements_selector: '.lazy',
    });

    // Cleanup on unmount
    return () => {
      if (lazyLoadInstance) {
        lazyLoadInstance.destroy();
      }
    };
  }, []);
}

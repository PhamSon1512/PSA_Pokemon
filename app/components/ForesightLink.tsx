import type { ReactNode } from 'react';
import type { LinkProps } from 'react-router';
import type { ForesightRect } from 'js.foresight';
import { useEffect, useRef, useState } from 'react';
import { Link, useFetcher } from 'react-router';
import { ForesightManager } from 'js.foresight';

interface ForesightLinkProps extends Omit<LinkProps, 'prefetch'> {
  children: ReactNode;
  className?: string;
  hitSlop?: number | ForesightRect;
  unregisterOnCallback?: boolean;
  name?: string;
}

export function ForesightLink({
  children,
  className,
  hitSlop = 0,
  unregisterOnCallback = true,
  name = '',
  ...props
}: ForesightLinkProps) {
  const fetcher = useFetcher();
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    if (!linkRef.current) {
      return;
    }

    const { isTouchDevice, unregister } = ForesightManager.instance.register({
      element: linkRef.current,
      callback: () => {
        if (fetcher.state === 'idle' && !fetcher.data) {
          fetcher.load(props.to.toString());
        }
      },
      hitSlop,
      unregisterOnCallback,
      name,
    });

    setIsTouchDevice(isTouchDevice);

    return () => {
      unregister();
    };
  }, [linkRef]);

  return (
    <Link ref={linkRef} {...props} prefetch={isTouchDevice ? 'render' : 'none'} className={className}>
      {children}
    </Link>
  );
}

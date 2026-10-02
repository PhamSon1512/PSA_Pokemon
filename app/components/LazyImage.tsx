import type { ImgHTMLAttributes } from 'react';
import { useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  fallback?: string;
  useNative?: boolean;
  fadeIn?: boolean;
  blurPlaceholder?: boolean;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyImage({
  src,
  alt,
  placeholder,
  fallback,
  useNative = true,
  fadeIn = true,
  blurPlaceholder = true,
  className,
  onLoad,
  onError,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholder);
  const imgRef = useRef<HTMLImageElement>(null);

  // Check if native lazy loading is supported
  const supportsNativeLazyLoading =
    typeof window !== 'undefined' && typeof HTMLImageElement !== 'undefined' && 'loading' in HTMLImageElement.prototype;
  const shouldUseNative = useNative && supportsNativeLazyLoading;

  useEffect(() => {
    if (shouldUseNative) {
      // Use native lazy loading - set src directly
      setCurrentSrc(src);
    } else if (imgRef.current) {
      // Use vanilla-lazyload - set data attributes
      imgRef.current.setAttribute('data-src', src);
      if (props.srcSet) {
        imgRef.current.setAttribute('data-srcset', props.srcSet);
      }
      // Set placeholder as initial src
      setCurrentSrc(
        placeholder ||
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
      );
    }
  }, [src, props.srcSet, shouldUseNative, placeholder]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    if (fallback) {
      setCurrentSrc(fallback);
    }
    onError?.();
  };

  const imageClasses = clsx(className, {
    'transition-opacity duration-300': fadeIn,
    'opacity-0': fadeIn && !isLoaded,
    'opacity-100': fadeIn && isLoaded,
    'blur-sm': blurPlaceholder && !isLoaded && currentSrc === placeholder,
    'blur-none': isLoaded || currentSrc !== placeholder,
  });

  return (
    <div className="relative overflow-hidden">
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        loading={shouldUseNative ? 'lazy' : undefined}
        className={clsx(
          imageClasses,
          !shouldUseNative && 'lazy', // Add lazy class for vanilla-lazyload
        )}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />

      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex animate-pulse items-center justify-center bg-gray-200">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
        </div>
      )}

      {/* Error state */}
      {hasError && !fallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
          <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

import React, { useState, useCallback } from 'react';

interface SafeImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'onLoad' | 'onError'> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  onLoad?: () => void;  // ✅ Função, não string
  onError?: () => void; // ✅ Função, não string
  loading?: 'lazy' | 'eager';
}

/**
 * Type-safe image component that prevents onLoad/onError string errors (React #231)
 * Handles AVIF fallback to WebP/JPEG automatically
 *
 * @author Dr. Philipe Saraiva Cruz
 */
export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  fallbackSrc,
  onLoad: onLoadProp,
  onError: onErrorProp,
  loading = 'lazy',
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // ✅ Type-safe onLoad handler
  const handleLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    if (typeof onLoadProp === 'function') {
      onLoadProp();
    }
  }, [onLoadProp]);

  // ✅ Type-safe onError handler with fallback
  const handleError = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    console.warn(`[SafeImage] Failed to load: ${currentSrc}`);

    if (!hasError && fallbackSrc) {
      console.info(`[SafeImage] Falling back to: ${fallbackSrc}`);
      setCurrentSrc(fallbackSrc);
      setHasError(true);
      return;
    }

    if (typeof onErrorProp === 'function') {
      onErrorProp();
    }
  }, [currentSrc, fallbackSrc, hasError, onErrorProp]);

  return (
    <img
      {...props}
      src={currentSrc}
      alt={alt}
      loading={loading}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
};

'use client';

import React, { useState, ImgHTMLAttributes } from 'react';

interface ImageWithFallbackProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  src: string;
  alt: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
  sizes?: string;
  priority?: boolean;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className,
  width,
  height,
  loading = 'lazy',
  decoding = 'async',
  sizes,
  priority = false,
  onError,
  onLoad,
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>(src);
  const [hasError, setHasError] = useState<boolean>(false);
  const [triedFormats, setTriedFormats] = useState<Set<string>>(new Set([src]));

  const getAlternativeFormat = (originalSrc: string): string | null => {
    const lastDotIndex = originalSrc.lastIndexOf('.');
    if (lastDotIndex === -1) return null;

    const basePath = originalSrc.substring(0, lastDotIndex);
    const currentExt = originalSrc.substring(lastDotIndex + 1).toLowerCase();

    const fallbackFormats: Record<string, string[]> = {
      'avif': ['webp', 'png', 'jpg', 'jpeg'],
      'webp': ['png', 'jpg', 'jpeg'],
      'png': ['webp', 'jpg', 'jpeg'],
      'jpg': ['webp', 'png', 'jpeg'],
      'jpeg': ['webp', 'png', 'jpg']
    };

    const alternatives = fallbackFormats[currentExt] || ['png', 'jpg', 'webp'];

    for (const format of alternatives) {
      const alternativeSrc = `${basePath}.${format}`;
      if (!triedFormats.has(alternativeSrc)) {
        return alternativeSrc;
      }
    }

    return null;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const nextSrc = getAlternativeFormat(currentSrc);

    if (nextSrc) {
      setTriedFormats(prev => new Set([...prev, nextSrc]));
      setCurrentSrc(nextSrc);
      setHasError(false);
    } else {
      setHasError(true);
      console.warn(`All image format fallbacks failed for: ${src}`);
    }

    if (onError) {
      onError(e);
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(false);
    if (onLoad) {
      onLoad(e);
    }
  };

  if (hasError) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-slate-100 text-slate-400`}
        style={{ width, height }}
        {...props}
      >
        <div className="text-center">
          <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          <p className="text-xs">Imagem não disponível</p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={priority ? 'eager' : loading}
      decoding={decoding}
      sizes={sizes}
      onError={handleImageError}
      onLoad={handleImageLoad}
      {...props}
    />
  );
};

export default ImageWithFallback;

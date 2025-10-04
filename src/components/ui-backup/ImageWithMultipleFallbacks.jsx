import React, { useState } from 'react';

/**
 * Image component with multiple image fallbacks and automatic format fallback
 */
const ImageWithMultipleFallbacks = ({
  sources = [], // Array of image sources in order of preference
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
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(sources[0] || '');
  const [hasError, setHasError] = useState(false);
  const [triedFormats, setTriedFormats] = useState(new Set([sources[0]]));

  const getAlternativeFormat = (originalSrc) => {
    // Get the file extension and base path
    const lastDotIndex = originalSrc.lastIndexOf('.');
    if (lastDotIndex === -1) return null;

    const basePath = originalSrc.substring(0, lastDotIndex);
    const currentExt = originalSrc.substring(lastDotIndex + 1).toLowerCase();

    // Define fallback priority: webp -> png -> jpg -> jpeg
    const fallbackFormats = {
      'avif': ['webp', 'png', 'jpg', 'jpeg'],
      'webp': ['png', 'jpg', 'jpeg'],
      'png': ['webp', 'jpg', 'jpeg'],
      'jpg': ['webp', 'png', 'jpeg'],
      'jpeg': ['webp', 'png', 'jpg']
    };

    const alternatives = fallbackFormats[currentExt] || ['png', 'jpg', 'webp'];

    // Find the first alternative that hasn't been tried
    for (const format of alternatives) {
      const alternativeSrc = `${basePath}.${format}`;
      if (!triedFormats.has(alternativeSrc)) {
        return alternativeSrc;
      }
    }

    return null;
  };

  const handleImageError = (e) => {
    // First try alternative formats for current source
    const nextFormatSrc = getAlternativeFormat(currentSrc);

    if (nextFormatSrc) {
      setTriedFormats(prev => new Set([...prev, nextFormatSrc]));
      setCurrentSrc(nextFormatSrc);
      setHasError(false);
      return;
    }

    // If no more formats available, try next source
    const nextSourceIndex = currentSourceIndex + 1;
    if (nextSourceIndex < sources.length) {
      const nextSource = sources[nextSourceIndex];
      setCurrentSourceIndex(nextSourceIndex);
      setCurrentSrc(nextSource);
      setTriedFormats(prev => new Set([...prev, nextSource]));
      setHasError(false);
      return;
    }

    // All sources and formats exhausted
    setHasError(true);
    console.warn(`All image sources and format fallbacks failed for: ${sources.join(', ')}`);

    if (onError) {
      onError(e);
    }
  };

  const handleImageLoad = (e) => {
    setHasError(false);
    if (onLoad) {
      onLoad(e);
    }
  };

  if (hasError || !sources.length) {
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

export default ImageWithMultipleFallbacks;
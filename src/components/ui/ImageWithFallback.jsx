import React, { useState, memo } from 'react';
import PropTypes from 'prop-types';

/**
 * ImageWithFallback - Image component with automatic format fallback and picture element support
 *
 * Features:
 * - Progressive format fallback (AVIF → WebP → PNG → JPG)
 * - Picture element with source sets for modern formats
 * - fetchpriority for LCP optimization
 * - Explicit dimensions for CLS prevention
 * - Error handling with graceful degradation
 *
 * @example Priority image (LCP)
 * <ImageWithFallback
 *   src="/img/hero.avif"
 *   alt="Hero"
 *   width={800}
 *   height={600}
 *   priority={true}
 * />
 */
const ImageWithFallback = memo(({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
  decoding = 'async',
  sizes,
  priority = false,
  fetchPriority,
  onError,
  onLoad,
  usePicture = true,
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [triedFormats, setTriedFormats] = useState(new Set([src]));
  const [isLoaded, setIsLoaded] = useState(false);

  // Generate image sources for different formats
  const getImageSources = () => {
    if (!src) return { avif: null, webp: null, fallback: src };

    const lastDotIndex = src.lastIndexOf('.');
    if (lastDotIndex === -1) return { avif: null, webp: null, fallback: src };

    const basePath = src.substring(0, lastDotIndex);
    const ext = src.substring(lastDotIndex + 1).toLowerCase();

    // If source is already AVIF, generate fallbacks
    if (ext === 'avif') {
      return {
        avif: src,
        webp: `${basePath}.webp`,
        fallback: `${basePath}.jpg`
      };
    }

    // If source is WebP, no AVIF available
    if (ext === 'webp') {
      return {
        avif: `${basePath}.avif`,
        webp: src,
        fallback: `${basePath}.jpg`
      };
    }

    // For other formats (jpg, png, etc)
    return {
      avif: `${basePath}.avif`,
      webp: `${basePath}.webp`,
      fallback: src
    };
  };

  const sources = getImageSources();

  const getAlternativeFormat = (originalSrc) => {
    const lastDotIndex = originalSrc.lastIndexOf('.');
    if (lastDotIndex === -1) return null;

    const basePath = originalSrc.substring(0, lastDotIndex);
    const currentExt = originalSrc.substring(lastDotIndex + 1).toLowerCase();

    // Define fallback priority: avif -> webp -> png -> jpg -> jpeg
    const fallbackFormats = {
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

  const handleImageError = (e) => {
    const nextSrc = getAlternativeFormat(currentSrc);

    if (nextSrc) {
      setTriedFormats(prev => new Set([...prev, nextSrc]));
      setCurrentSrc(nextSrc);
      setHasError(false);
    } else {
      setHasError(true);
    }

    onError?.(e);
  };

  const handleImageLoad = (e) => {
    setHasError(false);
    setIsLoaded(true);
    onLoad?.(e);
  };

  // Determine loading strategy
  const finalLoading = priority ? 'eager' : loading;
  const finalDecoding = priority ? 'sync' : decoding;
  const finalFetchPriority = fetchPriority || (priority ? 'high' : undefined);

  // Error state placeholder
  if (hasError) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-slate-100 text-slate-400`}
        style={{
          width: width ? `${width}px` : undefined,
          height: height ? `${height}px` : undefined,
          aspectRatio: width && height ? `${width}/${height}` : undefined
        }}
        role="img"
        aria-label={alt}
        {...props}
      >
        <div className="text-center p-2">
          <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          <p className="text-xs">Imagem não disponível</p>
        </div>
      </div>
    );
  }

  // Container styles for CLS prevention
  const containerStyle = {
    position: 'relative',
    display: 'inline-block',
    maxWidth: '100%',
    aspectRatio: width && height ? `${width}/${height}` : undefined
  };

  // Render with picture element for modern format support
  if (usePicture && (sources.avif || sources.webp)) {
    return (
      <picture style={containerStyle}>
        {/* AVIF - Best compression */}
        {sources.avif && (
          <source
            srcSet={sources.avif}
            type="image/avif"
            sizes={sizes}
          />
        )}

        {/* WebP - Good compression, wide support */}
        {sources.webp && (
          <source
            srcSet={sources.webp}
            type="image/webp"
            sizes={sizes}
          />
        )}

        {/* Fallback image */}
        <img
          src={currentSrc}
          alt={alt}
          className={className}
          width={width}
          height={height}
          loading={finalLoading}
          decoding={finalDecoding}
          sizes={sizes}
          fetchpriority={finalFetchPriority}
          onError={handleImageError}
          onLoad={handleImageLoad}
          style={{
            maxWidth: '100%',
            height: 'auto'
          }}
          {...props}
        />
      </picture>
    );
  }

  // Simple img fallback
  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={finalLoading}
      decoding={finalDecoding}
      sizes={sizes}
      fetchpriority={finalFetchPriority}
      onError={handleImageError}
      onLoad={handleImageLoad}
      style={{
        maxWidth: '100%',
        height: 'auto',
        aspectRatio: width && height ? `${width}/${height}` : undefined
      }}
      {...props}
    />
  );
});

ImageWithFallback.displayName = 'ImageWithFallback';

ImageWithFallback.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  loading: PropTypes.oneOf(['lazy', 'eager']),
  decoding: PropTypes.oneOf(['async', 'sync', 'auto']),
  sizes: PropTypes.string,
  priority: PropTypes.bool,
  fetchPriority: PropTypes.oneOf(['high', 'low', 'auto']),
  onError: PropTypes.func,
  onLoad: PropTypes.func,
  usePicture: PropTypes.bool
};

export default ImageWithFallback;

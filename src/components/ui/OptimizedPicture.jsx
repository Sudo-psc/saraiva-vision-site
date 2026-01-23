import React, { useState, useEffect, useRef, memo } from 'react';
import PropTypes from 'prop-types';

/**
 * OptimizedPicture - High-performance image component for Core Web Vitals optimization
 *
 * Features:
 * - AVIF → WebP → fallback progressive format selection
 * - Responsive srcset for multiple screen densities
 * - Native lazy loading with IntersectionObserver fallback
 * - fetchpriority="high" for LCP images
 * - Explicit dimensions and aspect-ratio for CLS prevention
 * - Shimmer placeholder during loading
 * - Error handling with format fallback
 *
 * @example LCP Image (Hero)
 * <OptimizedPicture
 *   src="/img/hero.avif"
 *   alt="Hero image"
 *   width={800}
 *   height={600}
 *   priority={true}
 *   sizes="(min-width: 1024px) 800px, 100vw"
 * />
 *
 * @example Lazy-loaded image
 * <OptimizedPicture
 *   src="/Blog/image.jpg"
 *   alt="Blog image"
 *   width={400}
 *   height={300}
 *   className="rounded-lg"
 * />
 */
const OptimizedPicture = memo(({
  src,
  alt,
  width,
  height,
  className = '',
  sizes = '100vw',
  loading,
  decoding,
  priority = false,
  fetchPriority,
  disableAvif = false,
  placeholder = 'shimmer',
  objectFit = 'cover',
  aspectRatio,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentFormat, setCurrentFormat] = useState('avif');
  const imgRef = useRef(null);
  const observerRef = useRef(null);
  const [isInView, setIsInView] = useState(priority);

  // Calculate aspect ratio from dimensions
  const calculatedAspectRatio = aspectRatio || (width && height ? `${width}/${height}` : undefined);

  // Determine loading strategy
  const finalLoading = priority ? 'eager' : (loading || 'lazy');
  const finalDecoding = priority ? 'sync' : (decoding || 'async');
  const finalFetchPriority = fetchPriority || (priority ? 'high' : 'auto');

  // Generate image sources for different formats
  const getImageSources = () => {
    if (!src) return { avif: null, webp: null, fallback: src };

    // Check if URL is from Sanity CDN
    const isSanityUrl = src.includes('cdn.sanity.io');

    if (isSanityUrl) {
      const hasParams = src.includes('?');
      const separator = hasParams ? '&' : '?';
      return {
        avif: null,
        webp: `${src}${separator}fm=webp`,
        fallback: src
      };
    }

    // For local images, check if already has extension
    const lastDotIndex = src.lastIndexOf('.');
    if (lastDotIndex === -1) {
      return { avif: disableAvif ? null : `${src}.avif`, webp: `${src}.webp`, fallback: `${src}.jpg` };
    }

    const basePath = src.substring(0, lastDotIndex);
    const ext = src.substring(lastDotIndex + 1).toLowerCase();

    // If source is already AVIF, generate fallbacks
    if (ext === 'avif') {
      return {
        avif: disableAvif ? null : src,
        webp: `${basePath}.webp`,
        fallback: `${basePath}.jpg`
      };
    }

    return {
      avif: disableAvif ? null : `${basePath}.avif`,
      webp: `${basePath}.webp`,
      fallback: src
    };
  };

  // Generate responsive srcset
  const generateSrcSet = (baseSrc) => {
    if (!baseSrc || !width) return baseSrc;

    // For Sanity URLs, use URL parameters
    if (baseSrc.includes('cdn.sanity.io')) {
      const hasParams = baseSrc.includes('?');
      const separator = hasParams ? '&' : '?';
      return [
        `${baseSrc}${separator}w=${width} 1x`,
        `${baseSrc}${separator}w=${width * 1.5} 1.5x`,
        `${baseSrc}${separator}w=${width * 2} 2x`
      ].join(', ');
    }

    // For local images, just return the source (responsive variants require build-time generation)
    return baseSrc;
  };

  const sources = getImageSources();

  // IntersectionObserver for lazy loading enhancement
  useEffect(() => {
    if (priority || isInView) return;

    // Use native lazy loading where supported, with IntersectionObserver as enhancement
    if ('IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsInView(true);
              observerRef.current?.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: '200px 0px', // Start loading 200px before entering viewport
          threshold: 0.01
        }
      );

      if (imgRef.current) {
        observerRef.current.observe(imgRef.current);
      }
    } else {
      // Fallback: load immediately if IntersectionObserver not supported
      setIsInView(true);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority, isInView]);

  // Handle image load
  const handleLoad = (e) => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.(e);
  };

  // Handle image error with format fallback
  const handleError = (e) => {
    if (currentFormat === 'avif' && sources.webp) {
      setCurrentFormat('webp');
    } else if (currentFormat === 'webp' && sources.fallback) {
      setCurrentFormat('fallback');
    } else {
      setHasError(true);
      onError?.(e);
    }
  };

  // Container styles for CLS prevention
  const containerStyle = {
    position: 'relative',
    width: width ? `${width}px` : '100%',
    maxWidth: '100%',
    aspectRatio: calculatedAspectRatio,
    overflow: 'hidden',
    backgroundColor: hasError ? '#f1f5f9' : undefined
  };

  // Image styles
  const imgStyle = {
    width: '100%',
    height: '100%',
    objectFit,
    transition: priority ? 'none' : 'opacity 0.3s ease-in-out',
    opacity: (priority || isLoaded) ? 1 : 0
  };

  // Placeholder styles
  const placeholderStyle = {
    position: 'absolute',
    inset: 0,
    backgroundColor: '#e2e8f0',
    opacity: (priority || isLoaded) ? 0 : 1,
    transition: priority ? 'none' : 'opacity 0.3s ease-in-out',
    pointerEvents: 'none'
  };

  // Shimmer animation styles
  const shimmerStyle = placeholder === 'shimmer' ? {
    ...placeholderStyle,
    backgroundImage: 'linear-gradient(90deg, #e2e8f0 0%, #f1f5f9 50%, #e2e8f0 100%)',
    backgroundSize: '200% 100%',
    animation: isLoaded ? 'none' : 'shimmer 1.5s infinite linear'
  } : placeholderStyle;

  // Error state
  if (hasError) {
    return (
      <div
        ref={imgRef}
        className={`flex items-center justify-center bg-slate-100 text-slate-400 ${className}`}
        style={containerStyle}
        role="img"
        aria-label={alt}
      >
        <div className="text-center p-4">
          <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          <span className="text-xs">Imagem não disponível</span>
        </div>
      </div>
    );
  }

  return (
    <div ref={imgRef} style={containerStyle} className={className}>
      {/* Shimmer/Blur placeholder */}
      <div style={shimmerStyle} aria-hidden="true" />

      {/* Picture element with progressive format support */}
      {(isInView || priority) && (
        <picture>
          {/* AVIF - Best compression (50% smaller than WebP) */}
          {sources.avif && (
            <source
              srcSet={generateSrcSet(sources.avif)}
              type="image/avif"
              sizes={sizes}
            />
          )}

          {/* WebP - Good compression, 95%+ browser support */}
          {sources.webp && (
            <source
              srcSet={generateSrcSet(sources.webp)}
              type="image/webp"
              sizes={sizes}
            />
          )}

          {/* Fallback (JPEG/PNG) */}
          <img
            src={sources.fallback}
            srcSet={generateSrcSet(sources.fallback)}
            alt={alt}
            width={width}
            height={height}
            loading={finalLoading}
            decoding={finalDecoding}
            fetchpriority={finalFetchPriority}
            sizes={sizes}
            onLoad={handleLoad}
            onError={handleError}
            style={imgStyle}
            {...props}
          />
        </picture>
      )}

      {/* CSS for shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
});

OptimizedPicture.displayName = 'OptimizedPicture';

OptimizedPicture.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  className: PropTypes.string,
  sizes: PropTypes.string,
  loading: PropTypes.oneOf(['lazy', 'eager']),
  decoding: PropTypes.oneOf(['async', 'sync', 'auto']),
  priority: PropTypes.bool,
  fetchPriority: PropTypes.oneOf(['high', 'low', 'auto']),
  disableAvif: PropTypes.bool,
  placeholder: PropTypes.oneOf(['shimmer', 'blur', 'none']),
  objectFit: PropTypes.oneOf(['cover', 'contain', 'fill', 'none', 'scale-down']),
  aspectRatio: PropTypes.string,
  onLoad: PropTypes.func,
  onError: PropTypes.func
};

export default OptimizedPicture;

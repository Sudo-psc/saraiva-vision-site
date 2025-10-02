import { env } from '@/utils/env';
/**
 * Optimized Image Component V2
 * Manifest-based responsive images with robust fallback
 * Only generates srcsets for EXISTING variants
 */

import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

// Import manifest generated at build time
let imageManifest = null;
try {
  imageManifest = await import('/image-manifest.json');
} catch (error) {
  console.warn('Image manifest not found, using legacy mode');
}

const OptimizedImageV2 = ({
  src,
  alt,
  className = '',
  sizes = '(max-width: 480px) 480px, (max-width: 768px) 768px, (max-width: 1280px) 1280px, 1920px',
  loading = 'lazy',
  aspectRatio,
  width,
  height,
  fallbackSrc = '/img/blog-fallback.jpg',
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [fallbackAttempted, setFallbackAttempted] = useState(false);
  const imgRef = useRef(null);

  // Extract basename from src
  const getBasename = (filepath) => {
    const filename = filepath.split('/').pop();
    const lastDot = filename.lastIndexOf('.');
    return lastDot > 0 ? filename.substring(0, lastDot) : filename;
  };

  const basename = getBasename(src);
  const imagePath = src.substring(0, src.lastIndexOf('/') + 1);

  /**
   * Get available variants from manifest
   */
  const getAvailableVariants = (format) => {
    if (!imageManifest?.manifest?.[basename]) {
      // Fallback: try common sizes but expect 404s
      console.debug(`No manifest entry for: ${basename}, using fallback mode`);
      return [];
    }

    const variants = imageManifest.manifest[basename].variants[format] || [];
    return variants;
  };

  /**
   * Generate srcset ONLY for existing variants
   */
  const generateSrcSet = (format) => {
    const availableSizes = getAvailableVariants(format);

    if (availableSizes.length === 0) {
      return ''; // Don't generate srcset if no variants exist
    }

    const srcset = availableSizes
      .map(size => `${imagePath}${basename}-${size}w.${format} ${size}w`)
      .join(', ');

    if (env.DEV) {
      console.debug(`[${basename}] Generated ${format} srcset:`, srcset);
    }

    return srcset;
  };

  const handleLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    if (fallbackAttempted) {
      // Already tried fallback, give up
      console.error(`Fatal: Fallback image also failed for ${basename}`);
      setHasError(true);
      return;
    }

    console.warn(`Image load error: ${e.target?.src || src}`);

    // Try fallback
    if (imgRef.current && fallbackSrc) {
      console.log(`Attempting fallback: ${fallbackSrc}`);
      imgRef.current.src = fallbackSrc;
      setFallbackAttempted(true);
    } else {
      setHasError(true);
    }

    if (onError) onError(e);
  };

  const handleSourceError = (format, e) => {
    // Browser will automatically fall through to next <source>
    if (env.DEV) {
      console.debug(`[${basename}] ${format.toUpperCase()} source failed, falling back to next format`);
    }
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!imgRef.current || loading !== 'lazy' || !('IntersectionObserver' in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            observer.unobserve(img);
          }
        });
      },
      {
        rootMargin: '100px', // Start loading 100px before visible
        threshold: 0.01
      }
    );

    observer.observe(imgRef.current);

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [loading]);

  // Check if we have any modern format variants
  const avifSrcset = generateSrcSet('avif');
  const webpSrcset = generateSrcSet('webp');
  const hasModernFormats = avifSrcset || webpSrcset;

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Loading placeholder with skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 animate-pulse">
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-300 animate-pulse"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
      )}

      {hasModernFormats ? (
        <picture>
          {/* AVIF - Best compression */}
          {avifSrcset && (
            <source
              type="image/avif"
              srcSet={avifSrcset}
              sizes={sizes}
              onError={(e) => handleSourceError('avif', e)}
            />
          )}

          {/* WebP - Good compression */}
          {webpSrcset && (
            <source
              type="image/webp"
              srcSet={webpSrcset}
              sizes={sizes}
              onError={(e) => handleSourceError('webp', e)}
            />
          )}

          {/* Original fallback */}
          <img
            ref={imgRef}
            src={hasError && fallbackSrc ? fallbackSrc : src}
            alt={alt}
            width={width}
            height={height}
            loading={loading}
            decoding="async"
            onLoad={handleLoad}
            onError={handleError}
            className={`w-full h-full object-cover transition-opacity duration-500 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </picture>
      ) : (
        // No modern formats available, use original only
        <img
          ref={imgRef}
          src={hasError && fallbackSrc ? fallbackSrc : src}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Error state - ONLY show if fallback also failed */}
      {hasError && fallbackAttempted && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
          <div className="text-center p-6 max-w-xs">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm font-medium text-gray-600">Imagem indisponível</p>
            <p className="text-xs text-gray-500 mt-1">{basename}</p>
          </div>
        </div>
      )}

      {/* Dev-only debug info */}
      {env.DEV && !isLoaded && !hasError && (
        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-mono">
          Loading: {basename}
        </div>
      )}
    </div>
  );
};

OptimizedImageV2.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  sizes: PropTypes.string,
  loading: PropTypes.oneOf(['lazy', 'eager']),
  aspectRatio: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
  fallbackSrc: PropTypes.string,
  onLoad: PropTypes.func,
  onError: PropTypes.func
};

export default OptimizedImageV2;
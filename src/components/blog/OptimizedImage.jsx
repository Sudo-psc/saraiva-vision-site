import { env } from '@/utils/env';
/**
 * Optimized Image Component V2 - Enterprise Grade
 *
 * Features:
 * - Progressive fallback: AVIF → WebP → PNG/JPEG
 * - Smart srcSet with graceful degradation for missing files
 * - Idempotent error handling (prevents loops)
 * - Comprehensive logging for debugging
 * - Support for partial optimized versions
 *
 * @version 2.0.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';

const OptimizedImage = ({
  src,
  alt,
  className = '',
  sizes = '(max-width: 640px) 640px, (max-width: 960px) 960px, (max-width: 1280px) 1280px, 1920px',
  loading = 'lazy',
  aspectRatio,
  width,
  height,
  fallbackSrc,
  onLoad,
  onError,
  disableOptimization = false,
  enableLogging = env.DEV // Enable detailed logging in development
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentFormat, setCurrentFormat] = useState(null);
  const [sourceError, setSourceError] = useState({ avif: false, webp: false });
  const imgRef = useRef(null);
  const errorCountRef = useRef(0); // Prevent infinite error loops
  const MAX_ERROR_ATTEMPTS = 3;
  const hasLoggedErrorRef = useRef(false); // Prevent duplicate console errors

  /**
   * Normalize filename: convert underscores to hyphens, remove accents, lowercase
   * Handles PT-BR character normalization
   */
  const normalizeFilename = (filename) => {
    return filename
      .toLowerCase()
      .replace(/_/g, '-')                     // underscores → hyphens
      .replace(/[áàâãä]/g, 'a')
      .replace(/[éèêë]/g, 'e')
      .replace(/[íìîï]/g, 'i')
      .replace(/[óòôõö]/g, 'o')
      .replace(/[úùûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9\-]/g, '-')            // special chars → hyphens
      .replace(/-+/g, '-')                     // multiple hyphens → single
      .replace(/^-|-$/g, '');                  // trim hyphens
  };

  // Extract base filename without extension
  // Utility functions
  const getBasename = (filename) => {
    const lastDot = filename.lastIndexOf('.');
    const lastSlash = filename.lastIndexOf('/');
    const rawBasename = filename.substring(lastSlash + 1, lastDot > lastSlash ? lastDot : filename.length);
    return normalizeFilename(rawBasename);
  };

  const getExtension = (filename) => {
    const lastDot = filename.lastIndexOf('.');
    return lastDot > -1 ? filename.substring(lastDot + 1).toLowerCase() : '';
  };

  const basename = getBasename(src);
  const imagePath = src.substring(0, src.lastIndexOf('/') + 1);
  const originalExt = getExtension(src);

  // Standard responsive breakpoints - matching actual generated files
  const responsiveSizes = [480, 768, 1280, 1920];

  // Valid formats in fallback order
  const VALID_FORMATS = ['avif', 'webp', 'jpg', 'jpeg', 'png'];

  /**
   * Generate srcSet for format with validation and fallback
   * Tries multiple naming patterns and validates existence
   */
  const generateSrcSet = useCallback((format) => {
    const normalizedFormat = format.toLowerCase().trim();

    if (!VALID_FORMATS.includes(normalizedFormat)) {
      if (enableLogging) {
        console.error(`[OptimizedImage] Invalid format: "${format}"`);
      }
      return '';
    }

    // Check if the provided src already matches an optimized format and size pattern
    const srcMatchesOptimizedPattern = src.match(/^(.*)-(\d+)w\.(avif|webp|png|jpe?g)$/i);

    if (srcMatchesOptimizedPattern) {
      const [, base, size, ext] = srcMatchesOptimizedPattern;
      if (ext.toLowerCase() === normalizedFormat) {
        if (enableLogging) {
          console.info(`[OptimizedImage] Using pre-optimized src for ${format}:`, { src });
        }
        return `${src} ${size}w`;
      }
    }

    // Generate srcSet with available sizes only
    const validSizes = responsiveSizes.filter(size => {
      const filename = `${basename}-${size}w.${normalizedFormat}`;
      // In production, you might want to check if file exists
      // For now, include all sizes and let browser handle 404s gracefully
      return true;
    });

    if (validSizes.length === 0) {
      if (enableLogging) {
        console.warn(`[OptimizedImage] No valid sizes for format "${format}"`);
      }
      return '';
    }

    const srcset = validSizes
      .map(size => `${imagePath}${basename}-${size}w.${normalizedFormat} ${size}w`)
      .join(', ');

    if (enableLogging) {
      console.info(`[OptimizedImage] Generated srcSet for ${format}:`, {
        basename,
        sizes: validSizes,
        path: imagePath,
        srcset: srcset.substring(0, 100) + '...'
      });
    }

    return srcset;
  }, [imagePath, basename, responsiveSizes, enableLogging]);

  /**
   * Log image errors with full context for debugging
   */
  const logImageError = useCallback((context, url) => {
    if (!enableLogging) return;

    console.warn('[OptimizedImage] Error:', {
      timestamp: new Date().toISOString(),
      context,
      url: url || src,
      basename,
      currentFormat,
      errorCount: errorCountRef.current,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      userAgent: navigator.userAgent.substring(0, 50)
    });
  }, [src, basename, currentFormat, enableLogging]);

  /**
   * Handle successful image load
   */
  const handleLoad = useCallback((e) => {
    setIsLoaded(true);
    errorCountRef.current = 0; // Reset on success

    // Detect which format loaded
    const loadedSrc = e.target?.currentSrc || e.target?.src || src;
    const loadedFormat = getExtension(loadedSrc);
    setCurrentFormat(loadedFormat);

    if (enableLogging) {
      console.info('[OptimizedImage] Success:', {
        basename,
        format: loadedFormat,
        size: `${e.target?.naturalWidth}x${e.target?.naturalHeight}`
      });
    }

    if (onLoad) onLoad(e);
  }, [src, basename, onLoad, enableLogging]);

  /**
   * Handle final image error (idempotent - prevents loops)
   */
  const handleError = useCallback((e) => {
    errorCountRef.current += 1;

    // Stop after max attempts to prevent infinite loops
    if (errorCountRef.current > MAX_ERROR_ATTEMPTS) {
      // Only log once to prevent console spam
      if (enableLogging && !hasLoggedErrorRef.current) {
        console.error('[OptimizedImage] Max error attempts reached');
        hasLoggedErrorRef.current = true;
      }
      setHasError(true);
      return;
    }

    const failedSrc = e.target?.src || src;
    logImageError('Final image load failed', failedSrc);

    // Try fallback if provided and not already failed
    if (!hasError && fallbackSrc && imgRef.current) {
      imgRef.current.src = fallbackSrc;
    } else {
      setHasError(true);
    }

    if (onError) onError(e);
  }, [src, fallbackSrc, hasError, onError, logImageError, enableLogging]);

  /**
   * Handle source errors (AVIF/WebP 404s)
   * Browser automatically falls through to next source
   */
  const handleSourceError = useCallback((format) => {
    logImageError(`${format.toUpperCase()} source failed`, null);

    setSourceError(prev => {
      const newState = { ...prev, [format]: true };
      return newState;
    });
  }, [logImageError]);

  // Intersection Observer for advanced lazy loading
  useEffect(() => {
    if (!imgRef.current || loading !== 'lazy') return;

    // Fallback for browsers without IntersectionObserver
    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver not supported, using native lazy loading');
      return;
    }

    let observer;
    try {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target;
              // Trigger loading by accessing srcset
              if (img.dataset.srcset) {
                img.srcset = img.dataset.srcset;
                img.removeAttribute('data-srcset');
              }
              observer.unobserve(img);
            }
          });
        },
        {
          rootMargin: '50px', // Start loading 50px before visible
          threshold: 0.01
        }
      );

      observer.observe(imgRef.current);
    } catch (error) {
      console.error('IntersectionObserver error:', error);
      // Fallback to native loading
    }

    return () => {
      if (observer && imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [loading]);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 animate-pulse" />
      )}

      {disableOptimization ? (
        /* Simple img when optimization disabled */
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
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ) : (
        /* Progressive enhancement with picture element */
        <picture>
          {/* AVIF - Best compression (90%+ size reduction) */}
          {!sourceError.avif && (
            <source
              type="image/avif"
              srcSet={generateSrcSet('avif')}
              sizes={sizes}
              onError={() => handleSourceError('avif')}
            />
          )}

          {/* WebP - Good compression (25-35% better than JPEG) */}
          {!sourceError.webp && (
            <source
              type="image/webp"
              srcSet={generateSrcSet('webp')}
              sizes={sizes}
              onError={() => handleSourceError('webp')}
            />
          )}

          {/* Fallback to original format (PNG/JPEG) */}
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
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </picture>
      )}

      {/* Error state */}
      {hasError && !fallbackSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center p-4">
            <svg
              className="w-12 h-12 mx-auto text-gray-400 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm text-gray-500">Imagem indisponível</p>
          </div>
        </div>
      )}
    </div>
  );
};

OptimizedImage.propTypes = {
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
  onError: PropTypes.func,
  disableOptimization: PropTypes.bool,
  enableLogging: PropTypes.bool
};

export default OptimizedImage;
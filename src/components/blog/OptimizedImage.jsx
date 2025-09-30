/**
 * Optimized Image Component
 * Responsive images with lazy loading, WebP/AVIF support, and performance optimizations
 */

import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const OptimizedImage = ({
  src,
  alt,
  className = '',
  sizes = '(max-width: 480px) 480px, (max-width: 768px) 768px, (max-width: 1280px) 1280px, 1920px',
  loading = 'lazy',
  aspectRatio,
  width,
  height,
  fallbackSrc,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [sourceError, setSourceError] = useState({ avif: false, webp: false });
  const imgRef = useRef(null);

  // Extract base filename without extension
  const getBasename = (filename) => {
    const lastDot = filename.lastIndexOf('.');
    const lastSlash = filename.lastIndexOf('/');
    return filename.substring(lastSlash + 1, lastDot > lastSlash ? lastDot : filename.length);
  };

  const basename = getBasename(src);
  const imagePath = src.substring(0, src.lastIndexOf('/') + 1);

  // Generate responsive image sources - only for sizes that exist
  // Use smaller sizes for fallback (480, 768 more likely to exist than 1280, 1920)
  const responsiveSizes = [480, 768, 1280];

  // Valid image formats for srcset generation
  const VALID_FORMATS = ['avif', 'webp', 'jpg', 'jpeg', 'png'];

  const generateSrcSet = (format) => {
    // Validate format to prevent typos like 'avi' or 'avit'
    const normalizedFormat = format.toLowerCase().trim();

    if (!VALID_FORMATS.includes(normalizedFormat)) {
      console.error(`Invalid image format: "${format}". Expected one of: ${VALID_FORMATS.join(', ')}`);
      return '';
    }

    const srcset = responsiveSizes
      .map(size => `${imagePath}${basename}-${size}w.${normalizedFormat} ${size}w`)
      .join(', ');

    // Debug logging (remove in production)
    if (import.meta.env.DEV) {
      console.debug(`Generated ${normalizedFormat} srcset:`, srcset);
    }

    return srcset;
  };

  const handleLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    console.warn(`Image load error: ${e.target?.src || src}`);
    setHasError(true);
    if (onError) onError(e);

    // Try fallback to original image
    if (imgRef.current && !fallbackSrc) {
      imgRef.current.src = src;
    }
  };

  const handleSourceError = (format) => {
    // Handle source errors (404s for AVIF/WebP)
    // Browser will fall through to next format
    if (import.meta.env.DEV) {
      console.warn(`Failed to load ${format.toUpperCase()} sources for: ${basename}`);
      console.debug(`Expected files: ${responsiveSizes.map(s => `${basename}-${s}w.${format}`).join(', ')}`);
    }
    setSourceError(prev => ({ ...prev, [format]: true }));
  };

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

      <picture>
        {/* AVIF - Best compression, modern browsers */}
        {!sourceError.avif && (
          <source
            type="image/avif"
            srcSet={generateSrcSet('avif')}
            sizes={sizes}
            onError={() => handleSourceError('avif')}
          />
        )}

        {/* WebP - Good compression, wide support */}
        {!sourceError.webp && (
          <source
            type="image/webp"
            srcSet={generateSrcSet('webp')}
            sizes={sizes}
            onError={() => handleSourceError('webp')}
          />
        )}

        {/* Fallback to original image */}
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
          style={{ overflow: 'hidden' }}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </picture>

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
  onError: PropTypes.func
};

export default OptimizedImage;

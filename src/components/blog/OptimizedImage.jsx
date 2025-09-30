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
  fallbackSrc,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  // Extract base filename without extension
  const getBasename = (filename) => {
    const lastDot = filename.lastIndexOf('.');
    const lastSlash = filename.lastIndexOf('/');
    return filename.substring(lastSlash + 1, lastDot > lastSlash ? lastDot : filename.length);
  };

  const basename = getBasename(src);
  const imagePath = src.substring(0, src.lastIndexOf('/') + 1);

  // Generate responsive image sources
  const responsiveSizes = [480, 768, 1280, 1920];

  const generateSrcSet = (format) => {
    return responsiveSizes
      .map(size => `${imagePath}${basename}-${size}w.${format} ${size}w`)
      .join(', ');
  };

  const handleLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    setHasError(true);
    if (onError) onError(e);

    // Try fallback to original image
    if (imgRef.current && !fallbackSrc) {
      imgRef.current.src = src;
    }
  };

  // Intersection Observer for advanced lazy loading
  useEffect(() => {
    if (!imgRef.current || loading !== 'lazy') return;

    const observer = new IntersectionObserver(
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

    return () => {
      if (imgRef.current) {
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
        <source
          type="image/avif"
          srcSet={generateSrcSet('avif')}
          sizes={sizes}
        />

        {/* WebP - Good compression, wide support */}
        <source
          type="image/webp"
          srcSet={generateSrcSet('webp')}
          sizes={sizes}
        />

        {/* Fallback to original image */}
        <img
          ref={imgRef}
          src={hasError && fallbackSrc ? fallbackSrc : src}
          alt={alt}
          loading={loading}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
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
  fallbackSrc: PropTypes.string,
  onLoad: PropTypes.func,
  onError: PropTypes.func
};

export default OptimizedImage;

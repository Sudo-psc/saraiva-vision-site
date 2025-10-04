import { useState, useEffect, useRef, useCallback } from 'react';
import { useIntersectionObserver } from './useIntersectionObserver.js';

/**
 * Enhanced lazy loading hook for medical images with healthcare compliance
 * Optimizes image loading performance while maintaining medical image quality
 * @param {Object} options - Lazy loading configuration options
 * @returns {Object} - Loading state and handlers
 */
export const useLazyLoad = (options = {}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const imageRef = useRef(null);

  const {
    threshold = 0.1,
    rootMargin = '50px',
    retryAttempts = 3,
    retryDelay = 1000,
    placeholder = null,
    onError = null,
    onLoad = null,
    enableWebP = true,
    enableAVIF = true,
    quality = 85,
    preserveMedicalQuality = true
  } = options;

  const [ref, isIntersecting] = useIntersectionObserver({
    threshold,
    rootMargin
  });

  /**
   * Determine optimal image format based on browser support
   * @returns {string} - Preferred image format
   */
  const getOptimalFormat = useCallback(() => {
    if (enableAVIF && supportsAVIF()) {
      return 'avif';
    }
    if (enableWebP && supportsWebP()) {
      return 'webp';
    }
    return 'fallback';
  }, [enableAVIF, enableWebP]);

  /**
   * Check browser WebP support
   * @returns {boolean} - Whether WebP is supported
   */
  const supportsWebP = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }, []);

  /**
   * Check browser AVIF support
   * @returns {boolean} - Whether AVIF is supported
   */
  const supportsAVIF = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const avif = new Image();
    return avif.src && avif.decode && avif.decode();
  }, []);

  /**
   * Generate responsive image sources for medical images
   * @param {string} src - Base image source
   * @returns {Object} - Responsive source sets
   */
  const generateResponsiveSources = useCallback((src) => {
    const format = getOptimalFormat();
    const baseSrc = src.replace(/\.(webp|avif|jpg|jpeg|png)$/i, '');

    // Enhanced quality for medical images when preserveMedicalQuality is true
    const medicalQuality = preserveMedicalQuality ? 95 : quality;

    const sources = {
      webp: {
        srcSet: `${baseSrc}-1920w.webp 1920w, ${baseSrc}-1280w.webp 1280w, ${baseSrc}-960w.webp 960w, ${baseSrc}-640w.webp 640w, ${baseSrc}-320w.webp 320w`,
        sizes: '(max-width: 640px) 320px, (max-width: 960px) 640px, (max-width: 1280px) 960px, (max-width: 1920px) 1280px, 1920px',
        type: 'image/webp'
      },
      avif: {
        srcSet: `${baseSrc}-1920w.avif 1920w, ${baseSrc}-1280w.avif 1280w, ${baseSrc}-960w.avif 960w, ${baseSrc}-640w.avif 640w, ${baseSrc}-320w.avif 320w`,
        sizes: '(max-width: 640px) 320px, (max-width: 960px) 640px, (max-width: 1280px) 960px, (max-width: 1920px) 1280px, 1920px',
        type: 'image/avif'
      },
      fallback: {
        srcSet: `${baseSrc}-1920w.jpg 1920w, ${baseSrc}-1280w.jpg 1280w, ${baseSrc}-960w.jpg 960w, ${baseSrc}-640w.jpg 640px, ${baseSrc}-320w.jpg 320w`,
        sizes: '(max-width: 640px) 320px, (max-width: 960px) 640px, (max-width: 1280px) 960px, (max-width: 1920px) 1280px, 1920px'
      }
    };

    return sources[format] || sources.fallback;
  }, [getOptimalFormat, quality, preserveMedicalQuality]);

  /**
   * Load image with retry logic and error handling
   * @param {string} src - Image source to load
   */
  const loadImage = useCallback(async (src) => {
    if (!src || isLoaded || isLoading) return;

    setIsLoading(true);
    setHasError(false);

    const img = new Image();

    img.onload = () => {
      setIsLoaded(true);
      setIsLoading(false);
      setRetryCount(0);
      onLoad?.(src);
    };

    img.onerror = () => {
      setIsLoading(false);

      if (retryCount < retryAttempts) {
        // Exponential backoff for retry
        const delay = retryDelay * Math.pow(2, retryCount);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          loadImage(src);
        }, delay);
      } else {
        setHasError(true);
        onError?.(src, retryCount);
      }
    };

    // Apply medical image quality settings
    if (preserveMedicalQuality) {
      img.crossOrigin = 'anonymous';
    }

    img.src = src;
  }, [isLoaded, isLoading, retryCount, retryAttempts, retryDelay, onLoad, onError, preserveMedicalQuality]);

  /**
   * Handle intersection change - trigger image loading
   */
  useEffect(() => {
    if (isIntersecting && !isLoaded && !isLoading) {
      if (imageRef.current && imageRef.current.dataset.src) {
        loadImage(imageRef.current.dataset.src);
      }
    }
  }, [isIntersecting, isLoaded, isLoading, loadImage]);

  /**
   * Merge refs for proper element handling
   */
  const setRefs = useCallback((node) => {
    imageRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  }, [ref]);

  /**
   * Manually trigger image loading
   */
  const manualLoad = useCallback((src) => {
    if (src) {
      loadImage(src);
    } else if (imageRef.current && imageRef.current.dataset.src) {
      loadImage(imageRef.current.dataset.src);
    }
  }, [loadImage]);

  /**
   * Reset loading state for retry
   */
  const reset = useCallback(() => {
    setIsLoaded(false);
    setIsLoading(false);
    setHasError(false);
    setRetryCount(0);
  }, []);

  return {
    ref: setRefs,
    isLoaded,
    isLoading,
    hasError,
    isIntersecting,
    retryCount,
    generateResponsiveSources,
    getOptimalFormat,
    supportsWebP: supportsWebP(),
    supportsAVIF: supportsAVIF(),
    manualLoad,
    reset,
    imageProps: {
      'data-src': imageRef.current?.dataset.src,
      'data-loaded': isLoaded,
      'data-error': hasError,
      'data-loading': isLoading,
      'data-retry-count': retryCount
    }
  };
};

/**
 * Enhanced medical image component with lazy loading
 * @param {Object} props - Component props
 */
export const LazyMedicalImage = ({
  src,
  alt,
  className = '',
  placeholder = '/img/placeholder.svg',
  fallback = '/img/blog-fallback.jpg',
  preserveMedicalQuality = true,
  onLoad,
  onError,
  ...props
}) => {
  const {
    ref,
    isLoaded,
    isLoading,
    hasError,
    generateResponsiveSources,
    getOptimalFormat,
    supportsWebP,
    supportsAVIF,
    imageProps
  } = useLazyLoad({
    preserveMedicalQuality,
    onLoad,
    onError,
    ...props
  });

  const [currentSrc, setCurrentSrc] = useState(placeholder);

  // Generate sources when component mounts or src changes
  const sources = src ? generateResponsiveSources(src) : null;

  useEffect(() => {
    if (isLoaded && src) {
      setCurrentSrc(src);
    } else if (hasError) {
      setCurrentSrc(fallback);
    }
  }, [isLoaded, hasError, src, fallback]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder while loading */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Main image with responsive sources */}
      <picture>
        {supportsAVIF && sources?.avif && (
          <source
            type="image/avif"
            srcSet={sources.avif.srcSet}
            sizes={sources.avif.sizes}
          />
        )}
        {supportsWebP && sources?.webp && (
          <source
            type="image/webp"
            srcSet={sources.webp.srcSet}
            sizes={sources.webp.sizes}
          />
        )}
        <img
          ref={ref}
          src={currentSrc}
          alt={alt}
          data-src={src}
          className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
          loading="lazy"
          decoding="async"
          {...imageProps}
          {...props}
        />
      </picture>

      {/* Error state with accessibility */}
      {hasError && (
        <div className="absolute inset-0 bg-red-50 flex flex-col items-center justify-center p-4">
          <svg
            className="w-8 h-8 text-red-500 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0S3.34 2.667 2.57 4l-6.732 13C-4.85 18.667-3.888 20-2.348 20z"
            />
          </svg>
          <span className="text-red-700 text-sm text-center">
            Imagem médica não disponível
          </span>
        </div>
      )}

      {/* Loading indicator for accessibility */}
      {isLoading && (
        <span className="sr-only" aria-live="polite">
          Carregando imagem médica: {alt}
        </span>
      )}
    </div>
  );
};

export default useLazyLoad;
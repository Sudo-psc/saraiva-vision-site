import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ImageIcon, AlertCircle } from 'lucide-react';

/**
 * OptimizedImage - High-performance image component with format optimization
 * Features lazy loading, WebP/AVIF support, and progressive loading
 */
const OptimizedImage = ({
    src,
    alt = '',
    width,
    height,
    className = '',
    enableLazyLoading = true,
    enableFormatOptimization = true,
    enableProgressiveLoading = true,
    placeholder = null,
    onLoad = null,
    onError = null,
    sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw',
    quality = 85,
    ...props
}) => {
    // State management
    const [isLoaded, setIsLoaded] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isVisible, setIsVisible] = useState(!enableLazyLoading);
    const [currentSrc, setCurrentSrc] = useState(null);
    const [loadedFormats, setLoadedFormats] = useState(new Set());

    // Refs
    const imageRef = useRef(null);
    const observerRef = useRef(null);
    const loadTimeoutRef = useRef(null);

    // Format support detection
    const [formatSupport, setFormatSupport] = useState({
        avif: false,
        webp: false,
        jpeg: true,
        png: true
    });

    // Detect format support
    useEffect(() => {
        if (!enableFormatOptimization) return;

        const detectFormatSupport = async () => {
            const support = { ...formatSupport };

            // Test AVIF support
            try {
                const avifTest = new Image();
                avifTest.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
                await new Promise((resolve, reject) => {
                    avifTest.onload = resolve;
                    avifTest.onerror = reject;
                    setTimeout(reject, 100);
                });
                support.avif = true;
            } catch {
                support.avif = false;
            }

            // Test WebP support
            try {
                const webpTest = new Image();
                webpTest.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
                await new Promise((resolve, reject) => {
                    webpTest.onload = resolve;
                    webpTest.onerror = reject;
                    setTimeout(reject, 100);
                });
                support.webp = true;
            } catch {
                support.webp = false;
            }

            setFormatSupport(support);
        };

        detectFormatSupport();
    }, [enableFormatOptimization]);

    // Generate optimized image URLs
    const generateOptimizedUrls = useCallback((originalSrc) => {
        if (!originalSrc || !enableFormatOptimization) {
            return [originalSrc];
        }

        const urls = [];
        const baseUrl = originalSrc.split('?')[0];
        const isExternalUrl = baseUrl.startsWith('http');

        // For external URLs (like Instagram), we can't optimize formats
        if (isExternalUrl) {
            return [originalSrc];
        }

        // Generate different format URLs for local images
        const extension = baseUrl.split('.').pop()?.toLowerCase();
        const basePath = baseUrl.replace(/\.[^/.]+$/, '');

        // Add AVIF if supported
        if (formatSupport.avif) {
            urls.push(`${basePath}.avif`);
        }

        // Add WebP if supported
        if (formatSupport.webp) {
            urls.push(`${basePath}.webp`);
        }

        // Add original format as fallback
        urls.push(originalSrc);

        return urls;
    }, [enableFormatOptimization, formatSupport]);

    // Generate responsive image URLs with different sizes
    const generateResponsiveUrls = useCallback((originalSrc, targetWidth) => {
        if (!originalSrc || !enableFormatOptimization) {
            return originalSrc;
        }

        const isExternalUrl = originalSrc.startsWith('http');

        // For external URLs, return as-is (Instagram doesn't support custom sizing)
        if (isExternalUrl) {
            return originalSrc;
        }

        // For local images, generate different sizes
        const extension = originalSrc.split('.').pop()?.toLowerCase();
        const basePath = originalSrc.replace(/\.[^/.]+$/, '');

        const sizes = [320, 640, 960, 1280, 1920];
        const closestSize = sizes.find(size => size >= targetWidth) || sizes[sizes.length - 1];

        return `${basePath}-${closestSize}w.${extension}`;
    }, [enableFormatOptimization]);

    // Intersection Observer for lazy loading
    useEffect(() => {
        if (!enableLazyLoading || isVisible) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        observer.disconnect();
                    }
                });
            },
            {
                rootMargin: '50px',
                threshold: 0.1
            }
        );

        if (imageRef.current) {
            observer.observe(imageRef.current);
            observerRef.current = observer;
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [enableLazyLoading, isVisible]);

    // Load image with format fallback
    const loadImage = useCallback(async (srcList) => {
        if (!srcList || srcList.length === 0) return;

        for (const src of srcList) {
            try {
                const img = new Image();

                // Set up promise for image loading
                const loadPromise = new Promise((resolve, reject) => {
                    img.onload = () => {
                        setLoadedFormats(prev => new Set([...prev, src]));
                        resolve(src);
                    };
                    img.onerror = reject;
                });

                // Set timeout for loading
                const timeoutPromise = new Promise((_, reject) => {
                    loadTimeoutRef.current = setTimeout(() => {
                        reject(new Error('Image load timeout'));
                    }, 10000);
                });

                img.src = src;

                const loadedSrc = await Promise.race([loadPromise, timeoutPromise]);

                if (loadTimeoutRef.current) {
                    clearTimeout(loadTimeoutRef.current);
                }

                setCurrentSrc(loadedSrc);
                setIsLoaded(true);
                setIsError(false);

                if (onLoad) {
                    onLoad({ src: loadedSrc, format: src.split('.').pop() });
                }

                return;
            } catch (error) {
                console.warn(`Failed to load image format: ${src}`, error);
                continue;
            }
        }

        // If all formats failed
        setIsError(true);
        setIsLoaded(true);

        if (onError) {
            onError(new Error('All image formats failed to load'));
        }
    }, [onLoad, onError]);

    // Start loading when visible
    useEffect(() => {
        if (!isVisible || !src || isLoaded) return;

        const optimizedUrls = generateOptimizedUrls(src);
        loadImage(optimizedUrls);

        return () => {
            if (loadTimeoutRef.current) {
                clearTimeout(loadTimeoutRef.current);
            }
        };
    }, [isVisible, src, isLoaded, generateOptimizedUrls, loadImage]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
            if (loadTimeoutRef.current) {
                clearTimeout(loadTimeoutRef.current);
            }
        };
    }, []);

    // Generate srcSet for responsive images
    const generateSrcSet = useCallback(() => {
        if (!enableFormatOptimization || !src) return '';

        const sizes = [320, 640, 960, 1280, 1920];
        return sizes
            .map(size => {
                const url = generateResponsiveUrls(src, size);
                return `${url} ${size}w`;
            })
            .join(', ');
    }, [enableFormatOptimization, src, generateResponsiveUrls]);

    // Animation variants
    const imageVariants = {
        loading: {
            opacity: 0,
            scale: 1.05,
            filter: 'blur(4px)'
        },
        loaded: {
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            transition: {
                duration: 0.4,
                ease: "easeOut"
            }
        },
        error: {
            opacity: 0.5,
            scale: 1,
            filter: 'grayscale(100%)',
            transition: {
                duration: 0.3
            }
        }
    };

    const placeholderVariants = {
        loading: {
            opacity: 1,
            scale: 1
        },
        loaded: {
            opacity: 0,
            scale: 0.95,
            transition: {
                duration: 0.3,
                delay: 0.1
            }
        }
    };

    return (
        <div
            ref={imageRef}
            className={`optimized-image-container relative overflow-hidden ${className}`}
            style={{ width, height }}
        >
            {/* Lazy loading placeholder */}
            {!isVisible && (
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                    <div className="flex items-center gap-2 text-gray-400">
                        <ImageIcon className="w-5 h-5" />
                        <span className="text-sm">Loading...</span>
                    </div>
                </div>
            )}

            {/* Loading skeleton/placeholder */}
            {isVisible && !isLoaded && (
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                    variants={placeholderVariants}
                    animate="loading"
                    style={{
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 2s infinite linear'
                    }}
                >
                    {placeholder || (
                        <div className="flex items-center justify-center h-full">
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                    )}
                </motion.div>
            )}

            {/* Progressive loading blur placeholder */}
            {enableProgressiveLoading && isVisible && !isLoaded && src && (
                <motion.img
                    src={src}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover filter blur-lg scale-110"
                    style={{ opacity: 0.3 }}
                    variants={placeholderVariants}
                    animate="loading"
                />
            )}

            {/* Main optimized image */}
            {isVisible && currentSrc && !isError && (
                <motion.img
                    src={currentSrc}
                    srcSet={generateSrcSet()}
                    sizes={sizes}
                    alt={alt}
                    width={width}
                    height={height}
                    className="w-full h-full object-cover"
                    variants={imageVariants}
                    animate={isLoaded ? "loaded" : "loading"}
                    loading={enableLazyLoading ? "lazy" : "eager"}
                    decoding="async"
                    {...props}
                />
            )}

            {/* Error state */}
            {isError && (
                <motion.div
                    className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center text-gray-400"
                    variants={imageVariants}
                    animate="error"
                >
                    <AlertCircle className="w-8 h-8 mb-2" />
                    <span className="text-sm">Image unavailable</span>
                </motion.div>
            )}

            {/* Format indicator (development only) */}
            {process.env.NODE_ENV === 'development' && isLoaded && currentSrc && (
                <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    {currentSrc.split('.').pop()?.toUpperCase()}
                </div>
            )}

            {/* Loading progress indicator */}
            {isVisible && !isLoaded && !isError && (
                <div className="absolute bottom-2 left-2 right-2">
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 rounded-full animate-pulse"
                            style={{ width: '60%' }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

// CSS for shimmer animation
const shimmerCSS = `
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
`;

// Inject CSS if not already present
if (typeof document !== 'undefined' && !document.getElementById('optimized-image-styles')) {
    const style = document.createElement('style');
    style.id = 'optimized-image-styles';
    style.textContent = shimmerCSS;
    document.head.appendChild(style);
}

export default OptimizedImage;
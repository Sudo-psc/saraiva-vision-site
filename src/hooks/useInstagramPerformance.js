import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useInstagramPerformance - Hook for managing Instagram feed performance optimizations
 * Handles lazy loading, image optimization, and performance monitoring
 */
const useInstagramPerformance = (options = {}) => {
    const {
        enableLazyLoading = true,
        enableImageOptimization = true,
        enablePerformanceMonitoring = true,
        lazyLoadingThreshold = 0.1,
        lazyLoadingRootMargin = '50px',
        imageQuality = 85,
        maxConcurrentLoads = 3,
        loadTimeout = 10000
    } = options;

    // State management
    const [loadingImages, setLoadingImages] = useState(new Set());
    const [loadedImages, setLoadedImages] = useState(new Set());
    const [failedImages, setFailedImages] = useState(new Set());
    const [performanceMetrics, setPerformanceMetrics] = useState({
        totalImages: 0,
        loadedImages: 0,
        failedImages: 0,
        averageLoadTime: 0,
        totalLoadTime: 0,
        largestContentfulPaint: 0,
        firstContentfulPaint: 0
    });

    // Refs
    const observerRef = useRef(null);
    const loadQueueRef = useRef([]);
    const loadTimesRef = useRef(new Map());
    const performanceObserverRef = useRef(null);

    // Initialize Intersection Observer for lazy loading
    useEffect(() => {
        if (!enableLazyLoading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const src = img.dataset.src;

                        if (src && !loadedImages.has(src) && !loadingImages.has(src)) {
                            loadImage(img, src);
                        }

                        observer.unobserve(img);
                    }
                });
            },
            {
                threshold: lazyLoadingThreshold,
                rootMargin: lazyLoadingRootMargin
            }
        );

        observerRef.current = observer;

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [enableLazyLoading, lazyLoadingThreshold, lazyLoadingRootMargin, loadedImages, loadingImages]);

    // Initialize Performance Observer
    useEffect(() => {
        if (!enablePerformanceMonitoring || typeof window === 'undefined' || !window.PerformanceObserver) {
            return;
        }

        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();

                entries.forEach((entry) => {
                    if (entry.entryType === 'paint') {
                        setPerformanceMetrics(prev => ({
                            ...prev,
                            [entry.name === 'first-contentful-paint' ? 'firstContentfulPaint' : 'largestContentfulPaint']: entry.startTime
                        }));
                    }

                    if (entry.entryType === 'largest-contentful-paint') {
                        setPerformanceMetrics(prev => ({
                            ...prev,
                            largestContentfulPaint: entry.startTime
                        }));
                    }
                });
            });

            observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
            performanceObserverRef.current = observer;

            return () => {
                if (performanceObserverRef.current) {
                    performanceObserverRef.current.disconnect();
                }
            };
        } catch (error) {
            console.warn('Performance Observer not supported:', error);
        }
    }, [enablePerformanceMonitoring]);

    // Load image with performance tracking
    const loadImage = useCallback(async (imgElement, src) => {
        if (loadingImages.has(src) || loadedImages.has(src)) return;

        const startTime = performance.now();

        setLoadingImages(prev => new Set([...prev, src]));
        setPerformanceMetrics(prev => ({
            ...prev,
            totalImages: prev.totalImages + 1
        }));

        try {
            // Create a new image for preloading
            const img = new Image();

            // Set up loading promise with timeout
            const loadPromise = new Promise((resolve, reject) => {
                img.onload = () => {
                    const loadTime = performance.now() - startTime;
                    loadTimesRef.current.set(src, loadTime);

                    // Update performance metrics
                    setPerformanceMetrics(prev => {
                        const newTotalLoadTime = prev.totalLoadTime + loadTime;
                        const newLoadedCount = prev.loadedImages + 1;

                        return {
                            ...prev,
                            loadedImages: newLoadedCount,
                            totalLoadTime: newTotalLoadTime,
                            averageLoadTime: newTotalLoadTime / newLoadedCount
                        };
                    });

                    resolve();
                };

                img.onerror = () => {
                    reject(new Error(`Failed to load image: ${src}`));
                };
            });

            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error('Image load timeout'));
                }, loadTimeout);
            });

            // Set optimized image source
            if (enableImageOptimization) {
                img.src = getOptimizedImageUrl(src, imgElement.width || 400);
            } else {
                img.src = src;
            }

            // Wait for load or timeout
            await Promise.race([loadPromise, timeoutPromise]);

            // Update the actual image element
            if (imgElement) {
                imgElement.src = img.src;
                imgElement.classList.add('loaded');
            }

            setLoadedImages(prev => new Set([...prev, src]));

        } catch (error) {
            console.warn('Failed to load image:', src, error);

            setFailedImages(prev => new Set([...prev, src]));
            setPerformanceMetrics(prev => ({
                ...prev,
                failedImages: prev.failedImages + 1
            }));

            // Set fallback image
            if (imgElement) {
                imgElement.src = '/img/placeholder.svg';
                imgElement.classList.add('error');
            }
        } finally {
            setLoadingImages(prev => {
                const newSet = new Set(prev);
                newSet.delete(src);
                return newSet;
            });
        }
    }, [loadingImages, loadedImages, loadTimeout, enableImageOptimization]);

    // Get optimized image URL
    const getOptimizedImageUrl = useCallback((src, width = 400) => {
        if (!enableImageOptimization || !src) return src;

        // For external URLs (like Instagram), return as-is
        if (src.startsWith('http')) {
            return src;
        }

        // For local images, try to get optimized versions
        try {
            const url = new URL(src, window.location.origin);
            const pathname = url.pathname;
            const extension = pathname.split('.').pop()?.toLowerCase();

            // Check if browser supports modern formats
            const supportsWebP = document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0;
            const supportsAVIF = false; // Would need proper detection

            if (supportsAVIF && ['jpg', 'jpeg', 'png'].includes(extension)) {
                return pathname.replace(/\.[^/.]+$/, '.avif');
            }

            if (supportsWebP && ['jpg', 'jpeg', 'png'].includes(extension)) {
                return pathname.replace(/\.[^/.]+$/, '.webp');
            }

            return src;
        } catch {
            return src;
        }
    }, [enableImageOptimization]);

    // Register image for lazy loading
    const registerImage = useCallback((imgElement, src) => {
        if (!enableLazyLoading || !imgElement || !src) return;

        imgElement.dataset.src = src;
        imgElement.classList.add('lazy');

        if (observerRef.current) {
            observerRef.current.observe(imgElement);
        }
    }, [enableLazyLoading]);

    // Preload critical images
    const preloadImage = useCallback((src, priority = 'low') => {
        if (!src || loadedImages.has(src) || loadingImages.has(src)) return;

        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = enableImageOptimization ? getOptimizedImageUrl(src) : src;

        if (priority === 'high') {
            link.fetchPriority = 'high';
        }

        document.head.appendChild(link);

        // Clean up after loading
        link.onload = () => {
            setLoadedImages(prev => new Set([...prev, src]));
            document.head.removeChild(link);
        };

        link.onerror = () => {
            setFailedImages(prev => new Set([...prev, src]));
            document.head.removeChild(link);
        };
    }, [loadedImages, loadingImages, enableImageOptimization, getOptimizedImageUrl]);

    // Batch preload multiple images
    const preloadImages = useCallback((srcList, priority = 'low') => {
        srcList.forEach(src => preloadImage(src, priority));
    }, [preloadImage]);

    // Get loading state for specific image
    const getImageLoadingState = useCallback((src) => {
        return {
            isLoading: loadingImages.has(src),
            isLoaded: loadedImages.has(src),
            isFailed: failedImages.has(src),
            loadTime: loadTimesRef.current.get(src) || 0
        };
    }, [loadingImages, loadedImages, failedImages]);

    // Get overall loading progress
    const getLoadingProgress = useCallback(() => {
        const total = performanceMetrics.totalImages;
        const loaded = performanceMetrics.loadedImages;
        const failed = performanceMetrics.failedImages;

        return {
            total,
            loaded,
            failed,
            pending: total - loaded - failed,
            percentage: total > 0 ? Math.round((loaded / total) * 100) : 0,
            isComplete: total > 0 && (loaded + failed) === total
        };
    }, [performanceMetrics]);

    // Clear performance data
    const clearPerformanceData = useCallback(() => {
        setLoadingImages(new Set());
        setLoadedImages(new Set());
        setFailedImages(new Set());
        setPerformanceMetrics({
            totalImages: 0,
            loadedImages: 0,
            failedImages: 0,
            averageLoadTime: 0,
            totalLoadTime: 0,
            largestContentfulPaint: 0,
            firstContentfulPaint: 0
        });
        loadTimesRef.current.clear();
    }, []);

    // Generate performance report
    const getPerformanceReport = useCallback(() => {
        const progress = getLoadingProgress();

        return {
            ...performanceMetrics,
            ...progress,
            loadTimes: Array.from(loadTimesRef.current.entries()),
            recommendations: generateRecommendations()
        };
    }, [performanceMetrics, getLoadingProgress]);

    // Generate performance recommendations
    const generateRecommendations = useCallback(() => {
        const recommendations = [];

        if (performanceMetrics.averageLoadTime > 2000) {
            recommendations.push('Consider optimizing image sizes or using a CDN');
        }

        if (performanceMetrics.failedImages > 0) {
            recommendations.push('Some images failed to load - check image URLs');
        }

        if (performanceMetrics.largestContentfulPaint > 2500) {
            recommendations.push('LCP is slow - consider preloading critical images');
        }

        return recommendations;
    }, [performanceMetrics]);

    return {
        // State
        loadingImages,
        loadedImages,
        failedImages,
        performanceMetrics,

        // Methods
        registerImage,
        loadImage,
        preloadImage,
        preloadImages,
        getOptimizedImageUrl,
        getImageLoadingState,
        getLoadingProgress,
        getPerformanceReport,
        clearPerformanceData,

        // Configuration
        enableLazyLoading,
        enableImageOptimization,
        enablePerformanceMonitoring
    };
};

export default useInstagramPerformance;
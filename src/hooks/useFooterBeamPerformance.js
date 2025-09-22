import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook for monitoring and optimizing footer beam background performance
 * Dynamically adjusts beam intensity based on actual frame rate performance
 */
export const useFooterBeamPerformance = (initialIntensity = 'medium') => {
    const [currentIntensity, setCurrentIntensity] = useState(initialIntensity);
    const [performanceMetrics, setPerformanceMetrics] = useState({
        averageFrameTime: 16.67, // Target 60fps
        frameCount: 0,
        isOptimizing: false,
    });

    const frameTimesRef = useRef([]);
    const lastFrameTimeRef = useRef(performance.now());
    const performanceCheckIntervalRef = useRef(null);

    // Measure frame performance
    const measureFramePerformance = useCallback(() => {
        const now = performance.now();
        const frameTime = now - lastFrameTimeRef.current;
        lastFrameTimeRef.current = now;

        // Keep a rolling window of frame times (last 60 frames)
        frameTimesRef.current.push(frameTime);
        if (frameTimesRef.current.length > 60) {
            frameTimesRef.current.shift();
        }

        // Calculate average frame time
        const averageFrameTime = frameTimesRef.current.reduce((sum, time) => sum + time, 0) / frameTimesRef.current.length;

        setPerformanceMetrics(prev => ({
            ...prev,
            averageFrameTime,
            frameCount: prev.frameCount + 1,
        }));

        return averageFrameTime;
    }, []);

    // Optimize intensity based on performance
    const optimizeIntensity = useCallback((averageFrameTime) => {
        // Performance thresholds (in milliseconds)
        const EXCELLENT_THRESHOLD = 16.67; // 60fps
        const GOOD_THRESHOLD = 20; // 50fps
        const POOR_THRESHOLD = 33.33; // 30fps

        let newIntensity = currentIntensity;

        if (averageFrameTime > POOR_THRESHOLD) {
            // Performance is poor, reduce to subtle
            newIntensity = 'subtle';
        } else if (averageFrameTime > GOOD_THRESHOLD) {
            // Performance is okay, use medium
            newIntensity = 'medium';
        } else if (averageFrameTime <= EXCELLENT_THRESHOLD) {
            // Performance is excellent, can use strong if desired
            if (initialIntensity === 'strong') {
                newIntensity = 'strong';
            } else {
                newIntensity = 'medium';
            }
        }

        if (newIntensity !== currentIntensity) {
            setCurrentIntensity(newIntensity);
            setPerformanceMetrics(prev => ({ ...prev, isOptimizing: true }));

            // Reset optimization flag after a delay
            setTimeout(() => {
                setPerformanceMetrics(prev => ({ ...prev, isOptimizing: false }));
            }, 1000);
        }
    }, [currentIntensity, initialIntensity]);

    // Start performance monitoring
    const startPerformanceMonitoring = useCallback(() => {
        if (performanceCheckIntervalRef.current) return;

        performanceCheckIntervalRef.current = setInterval(() => {
            if (frameTimesRef.current.length >= 30) { // Wait for enough samples
                const averageFrameTime = frameTimesRef.current.reduce((sum, time) => sum + time, 0) / frameTimesRef.current.length;
                optimizeIntensity(averageFrameTime);
            }
        }, 2000); // Check every 2 seconds
    }, [optimizeIntensity]);

    // Stop performance monitoring
    const stopPerformanceMonitoring = useCallback(() => {
        if (performanceCheckIntervalRef.current) {
            clearInterval(performanceCheckIntervalRef.current);
            performanceCheckIntervalRef.current = null;
        }
    }, []);

    // Get device-specific beam configuration
    const getBeamConfig = useCallback(() => {
        const baseConfigs = {
            subtle: {
                beamCount: 6,
                opacity: 0.4,
                speed: 0.5,
                blur: 15,
            },
            medium: {
                beamCount: 10,
                opacity: 0.6,
                speed: 0.7,
                blur: 20,
            },
            strong: {
                beamCount: 14,
                opacity: 0.8,
                speed: 1.0,
                blur: 25,
            },
        };

        return baseConfigs[currentIntensity];
    }, [currentIntensity]);

    // Check if device supports advanced features
    const getDeviceCapabilities = useCallback(() => {
        return {
            supportsBackdropFilter: CSS.supports('backdrop-filter', 'blur(1px)'),
            supportsTransform3D: CSS.supports('transform', 'translateZ(1px)'),
            prefersReducedMotion: window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || false,
            deviceMemory: (navigator).deviceMemory || 4,
            hardwareConcurrency: navigator.hardwareConcurrency || 4,
            connectionType: (navigator).connection?.effectiveType || 'unknown',
        };
    }, []);

    // Adaptive configuration based on device and network
    const getAdaptiveConfig = useCallback(() => {
        const capabilities = getDeviceCapabilities();
        const baseConfig = getBeamConfig();

        // Reduce effects on low-end devices
        if (capabilities.deviceMemory < 4 || capabilities.hardwareConcurrency < 4) {
            return {
                ...baseConfig,
                beamCount: Math.floor(baseConfig.beamCount * 0.6),
                opacity: baseConfig.opacity * 0.7,
                blur: Math.max(10, baseConfig.blur - 5),
            };
        }

        // Reduce effects on slow connections
        if (capabilities.connectionType === 'slow-2g' || capabilities.connectionType === '2g') {
            return {
                ...baseConfig,
                beamCount: Math.floor(baseConfig.beamCount * 0.7),
                opacity: baseConfig.opacity * 0.8,
            };
        }

        return baseConfig;
    }, [getBeamConfig, getDeviceCapabilities]);

    // Initialize performance monitoring
    useEffect(() => {
        // Check if reduced motion is preferred
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
            setCurrentIntensity('subtle');
            return;
        }

        startPerformanceMonitoring();

        return () => {
            stopPerformanceMonitoring();
        };
    }, [startPerformanceMonitoring, stopPerformanceMonitoring]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopPerformanceMonitoring();
        };
    }, [stopPerformanceMonitoring]);

    return {
        currentIntensity,
        performanceMetrics,
        measureFramePerformance,
        getBeamConfig,
        getAdaptiveConfig,
        getDeviceCapabilities,
        startPerformanceMonitoring,
        stopPerformanceMonitoring,
    };
};
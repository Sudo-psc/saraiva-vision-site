import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useSocialIcons3D Hook
 * 
 * Manages state and performance optimizations for 3D social icons.
 * Handles hover states, performance monitoring, and graceful degradation
 * for devices with limited capabilities.
 * 
 * Requirements covered: 2.1, 2.2, 2.4, 2.5
 */

export const useSocialIcons3D = (options = {}) => {
    const {
        enablePerformanceMonitoring = true,
        enableReducedMotion = true,
        maxConcurrentAnimations = 3
    } = options;

    // State management
    const [hoveredIcon, setHoveredIcon] = useState(null);
    const [activeAnimations, setActiveAnimations] = useState(0);
    const [performanceLevel, setPerformanceLevel] = useState('high');
    const [reducedMotion, setReducedMotion] = useState(false);
    const [deviceCapabilities, setDeviceCapabilities] = useState({
        supportsTransform3D: true,
        supportsBackdropFilter: true,
        supportsWebGL: true,
        performanceLevel: 'high'
    });

    // Refs for performance monitoring
    const frameTimeRef = useRef([]);
    const animationFrameRef = useRef(null);
    const performanceObserverRef = useRef(null);

    // Detect device capabilities
    useEffect(() => {
        const detectCapabilities = () => {
            const capabilities = {
                supportsTransform3D: CSS.supports('transform-style', 'preserve-3d'),
                supportsBackdropFilter: CSS.supports('backdrop-filter', 'blur(10px)'),
                supportsWebGL: (() => {
                    try {
                        const canvas = document.createElement('canvas');
                        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
                    } catch (e) {
                        return false;
                    }
                })(),
                performanceLevel: 'high'
            };

            // Detect performance level based on hardware
            const { deviceMemory, hardwareConcurrency } = navigator;
            if (deviceMemory && deviceMemory < 4) {
                capabilities.performanceLevel = 'low';
            } else if (hardwareConcurrency && hardwareConcurrency < 4) {
                capabilities.performanceLevel = 'medium';
            }

            setDeviceCapabilities(capabilities);
            setPerformanceLevel(capabilities.performanceLevel);
        };

        detectCapabilities();
    }, []);

    // Detect reduced motion preference
    useEffect(() => {
        if (!enableReducedMotion) return;

        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReducedMotion(mediaQuery.matches);

        const handleChange = (e) => setReducedMotion(e.matches);
        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [enableReducedMotion]);

    // Performance monitoring
    useEffect(() => {
        if (!enablePerformanceMonitoring || typeof PerformanceObserver === 'undefined') return;

        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();

            entries.forEach((entry) => {
                if (entry.entryType === 'measure') {
                    frameTimeRef.current.push(entry.duration);

                    // Keep only last 60 measurements (1 second at 60fps)
                    if (frameTimeRef.current.length > 60) {
                        frameTimeRef.current.shift();
                    }

                    // Calculate average frame time
                    const avgFrameTime = frameTimeRef.current.reduce((sum, time) => sum + time, 0) / frameTimeRef.current.length;

                    // Adjust performance level based on frame times
                    if (avgFrameTime > 33.33) { // Below 30fps
                        setPerformanceLevel('low');
                    } else if (avgFrameTime > 16.67) { // Below 60fps
                        setPerformanceLevel('medium');
                    } else {
                        setPerformanceLevel('high');
                    }
                }
            });
        });

        observer.observe({ entryTypes: ['measure'] });
        performanceObserverRef.current = observer;

        return () => {
            if (performanceObserverRef.current) {
                performanceObserverRef.current.disconnect();
            }
        };
    }, [enablePerformanceMonitoring]);

    // Handle icon hover with performance considerations
    const handleIconHover = useCallback((iconName) => {
        // Limit concurrent animations for performance
        if (iconName && activeAnimations >= maxConcurrentAnimations) {
            return;
        }

        setHoveredIcon(iconName);

        if (iconName) {
            setActiveAnimations(prev => prev + 1);

            // Auto-reset animation count after a delay
            setTimeout(() => {
                setActiveAnimations(prev => Math.max(0, prev - 1));
            }, 1000);
        }
    }, [activeAnimations, maxConcurrentAnimations]);

    // Get optimized animation settings based on performance
    const getAnimationSettings = useCallback(() => {
        if (reducedMotion) {
            return {
                duration: 0,
                enableGlassBubble: false,
                enableDepthShadows: false,
                enable3DTransforms: false
            };
        }

        switch (performanceLevel) {
            case 'low':
                return {
                    duration: 0.2,
                    enableGlassBubble: false,
                    enableDepthShadows: false,
                    enable3DTransforms: deviceCapabilities.supportsTransform3D,
                    maxBubbleLayers: 1
                };
            case 'medium':
                return {
                    duration: 0.3,
                    enableGlassBubble: true,
                    enableDepthShadows: true,
                    enable3DTransforms: deviceCapabilities.supportsTransform3D,
                    maxBubbleLayers: 2
                };
            default: // high
                return {
                    duration: 0.4,
                    enableGlassBubble: true,
                    enableDepthShadows: true,
                    enable3DTransforms: deviceCapabilities.supportsTransform3D,
                    maxBubbleLayers: 3
                };
        }
    }, [performanceLevel, reducedMotion, deviceCapabilities]);

    // Get CSS custom properties for dynamic theming
    const getCSSProperties = useCallback(() => {
        const settings = getAnimationSettings();

        return {
            '--social-icon-duration': `${settings.duration}s`,
            '--social-icon-glass-opacity': settings.enableGlassBubble ? '0.1' : '0',
            '--social-icon-shadow-layers': settings.enableDepthShadows ? '3' : '1',
            '--social-icon-transform-3d': settings.enable3DTransforms ? 'preserve-3d' : 'flat',
            '--social-icon-bubble-layers': settings.maxBubbleLayers || 1
        };
    }, [getAnimationSettings]);

    // Cleanup function
    const cleanup = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        if (performanceObserverRef.current) {
            performanceObserverRef.current.disconnect();
        }
    }, []);

    // Performance metrics for debugging
    const getPerformanceMetrics = useCallback(() => {
        return {
            averageFrameTime: frameTimeRef.current.length > 0
                ? frameTimeRef.current.reduce((sum, time) => sum + time, 0) / frameTimeRef.current.length
                : 0,
            performanceLevel,
            activeAnimations,
            deviceCapabilities,
            reducedMotion
        };
    }, [performanceLevel, activeAnimations, deviceCapabilities, reducedMotion]);

    return {
        // State
        hoveredIcon,
        performanceLevel,
        reducedMotion,
        deviceCapabilities,
        activeAnimations,

        // Actions
        handleIconHover,
        cleanup,

        // Settings
        getAnimationSettings,
        getCSSProperties,
        getPerformanceMetrics
    };
};
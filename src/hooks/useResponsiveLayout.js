import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useResponsiveLayout - Hook for managing responsive breakpoints and layout
 * Provides breakpoint detection, device capabilities, and layout utilities
 */
const useResponsiveLayout = (options = {}) => {
    const {
        breakpoints = {
            xs: 0,
            sm: 640,
            md: 768,
            lg: 1024,
            xl: 1280,
            '2xl': 1536
        },
        debounceMs = 100,
        enableTouchDetection = true,
        enableOrientationDetection = true
    } = options;

    // State management
    const [currentBreakpoint, setCurrentBreakpoint] = useState('lg');
    const [windowSize, setWindowSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 1024,
        height: typeof window !== 'undefined' ? window.innerHeight : 768
    });
    const [deviceCapabilities, setDeviceCapabilities] = useState({
        isTouchDevice: false,
        isRetina: false,
        supportsHover: true,
        prefersReducedMotion: false,
        orientation: 'landscape'
    });

    // Refs
    const debounceRef = useRef(null);
    const resizeObserverRef = useRef(null);

    // Get current breakpoint based on width
    const getCurrentBreakpoint = useCallback((width) => {
        const sortedBreakpoints = Object.entries(breakpoints)
            .sort(([, a], [, b]) => b - a); // Sort descending

        for (const [name, minWidth] of sortedBreakpoints) {
            if (width >= minWidth) {
                return name;
            }
        }

        return 'xs';
    }, [breakpoints]);

    // Detect device capabilities
    const detectDeviceCapabilities = useCallback(() => {
        if (typeof window === 'undefined') return;

        const capabilities = {
            isTouchDevice: enableTouchDetection && (
                'ontouchstart' in window ||
                navigator.maxTouchPoints > 0 ||
                navigator.msMaxTouchPoints > 0
            ),
            isRetina: window.devicePixelRatio > 1,
            supportsHover: window.matchMedia('(hover: hover)').matches,
            prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            orientation: enableOrientationDetection ? (
                window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
            ) : 'landscape'
        };

        setDeviceCapabilities(capabilities);
        return capabilities;
    }, [enableTouchDetection, enableOrientationDetection]);

    // Handle window resize with debouncing
    const handleResize = useCallback(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            const newSize = {
                width: window.innerWidth,
                height: window.innerHeight
            };

            const newBreakpoint = getCurrentBreakpoint(newSize.width);

            setWindowSize(newSize);
            setCurrentBreakpoint(newBreakpoint);
            detectDeviceCapabilities();
        }, debounceMs);
    }, [getCurrentBreakpoint, detectDeviceCapabilities, debounceMs]);

    // Setup event listeners
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Initial detection
        handleResize();

        // Setup resize listener
        window.addEventListener('resize', handleResize);

        // Setup orientation change listener
        if (enableOrientationDetection) {
            window.addEventListener('orientationchange', handleResize);
        }

        // Setup media query listeners for device capabilities
        const hoverMediaQuery = window.matchMedia('(hover: hover)');
        const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

        const handleHoverChange = () => {
            setDeviceCapabilities(prev => ({
                ...prev,
                supportsHover: hoverMediaQuery.matches
            }));
        };

        const handleMotionChange = () => {
            setDeviceCapabilities(prev => ({
                ...prev,
                prefersReducedMotion: motionMediaQuery.matches
            }));
        };

        hoverMediaQuery.addEventListener('change', handleHoverChange);
        motionMediaQuery.addEventListener('change', handleMotionChange);

        return () => {
            window.removeEventListener('resize', handleResize);

            if (enableOrientationDetection) {
                window.removeEventListener('orientationchange', handleResize);
            }

            hoverMediaQuery.removeEventListener('change', handleHoverChange);
            motionMediaQuery.removeEventListener('change', handleMotionChange);

            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [handleResize, enableOrientationDetection]);

    // Utility functions
    const isBreakpoint = useCallback((breakpoint) => {
        return currentBreakpoint === breakpoint;
    }, [currentBreakpoint]);

    const isBreakpointUp = useCallback((breakpoint) => {
        const currentWidth = windowSize.width;
        const targetWidth = breakpoints[breakpoint] || 0;
        return currentWidth >= targetWidth;
    }, [windowSize.width, breakpoints]);

    const isBreakpointDown = useCallback((breakpoint) => {
        const currentWidth = windowSize.width;
        const targetWidth = breakpoints[breakpoint] || 0;
        return currentWidth < targetWidth;
    }, [windowSize.width, breakpoints]);

    const getGridColumns = useCallback((postCount = 4) => {
        const configs = {
            1: { xs: 1, sm: 1, md: 1, lg: 1, xl: 1, '2xl': 1 },
            2: { xs: 1, sm: 2, md: 2, lg: 2, xl: 2, '2xl': 2 },
            3: { xs: 1, sm: 2, md: 3, lg: 3, xl: 3, '2xl': 3 },
            4: { xs: 1, sm: 2, md: 2, lg: 4, xl: 4, '2xl': 4 },
            5: { xs: 1, sm: 2, md: 3, lg: 4, xl: 5, '2xl': 5 },
            6: { xs: 1, sm: 2, md: 3, lg: 4, xl: 6, '2xl': 6 }
        };

        const postCountKey = Math.min(Math.max(postCount, 1), 6);
        return configs[postCountKey][currentBreakpoint] || configs[4][currentBreakpoint];
    }, [currentBreakpoint]);

    const getResponsiveValue = useCallback((values) => {
        if (typeof values === 'object' && values !== null) {
            // Return value for current breakpoint or closest smaller one
            const sortedBreakpoints = Object.keys(breakpoints).sort((a, b) => breakpoints[b] - breakpoints[a]);

            for (const bp of sortedBreakpoints) {
                if (isBreakpointUp(bp) && values[bp] !== undefined) {
                    return values[bp];
                }
            }

            // Fallback to first available value
            return Object.values(values)[0];
        }

        return values;
    }, [isBreakpointUp, breakpoints]);

    // CSS class generators
    const getResponsiveClasses = useCallback((classMap) => {
        if (typeof classMap === 'string') return classMap;

        return getResponsiveValue(classMap) || '';
    }, [getResponsiveValue]);

    const getGridClasses = useCallback((postCount = 4) => {
        const columns = getGridColumns(postCount);
        return `grid-cols-${columns}`;
    }, [getGridColumns]);

    const getGapClasses = useCallback(() => {
        const gapMap = {
            xs: 'gap-3',
            sm: 'gap-3',
            md: 'gap-4',
            lg: 'gap-6',
            xl: 'gap-6',
            '2xl': 'gap-6'
        };

        return gapMap[currentBreakpoint] || 'gap-4';
    }, [currentBreakpoint]);

    // Touch gesture utilities
    const createTouchHandler = useCallback((onSwipe) => {
        if (!deviceCapabilities.isTouchDevice) return {};

        let touchStart = null;
        let touchEnd = null;

        return {
            onTouchStart: (e) => {
                touchEnd = null;
                touchStart = e.targetTouches[0].clientX;
            },
            onTouchMove: (e) => {
                touchEnd = e.targetTouches[0].clientX;
            },
            onTouchEnd: () => {
                if (!touchStart || !touchEnd) return;

                const distance = touchStart - touchEnd;
                const isLeftSwipe = distance > 50;
                const isRightSwipe = distance < -50;

                if (isLeftSwipe || isRightSwipe) {
                    onSwipe({
                        direction: isLeftSwipe ? 'left' : 'right',
                        distance: Math.abs(distance)
                    });
                }
            }
        };
    }, [deviceCapabilities.isTouchDevice]);

    return {
        // Current state
        currentBreakpoint,
        windowSize,
        deviceCapabilities,

        // Breakpoint utilities
        isBreakpoint,
        isBreakpointUp,
        isBreakpointDown,

        // Layout utilities
        getGridColumns,
        getResponsiveValue,
        getResponsiveClasses,
        getGridClasses,
        getGapClasses,

        // Touch utilities
        createTouchHandler,

        // Constants
        breakpoints
    };
};

export default useResponsiveLayout;
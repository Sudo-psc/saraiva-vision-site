import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for detecting glass morphism capabilities and managing glass effects
 * @returns {Object} Glass morphism state and utilities
 */
export const useGlassMorphism = () => {
    const [capabilities, setCapabilities] = useState({
        supportsBackdropFilter: false,
        supportsTransform3D: false,
        performanceLevel: 'high',
        reducedMotion: false,
        devicePixelRatio: 1,
        isTouch: false
    });

    const [glassIntensity, setGlassIntensity] = useState('medium');

    // Feature detection for backdrop-filter
    const detectBackdropFilter = useCallback(() => {
        if (typeof window === 'undefined') return false;

        const testElement = document.createElement('div');
        testElement.style.backdropFilter = 'blur(1px)';

        // Check if the property was set
        const supportsBackdropFilter = testElement.style.backdropFilter !== '';

        // Also check webkit prefix
        if (!supportsBackdropFilter) {
            testElement.style.webkitBackdropFilter = 'blur(1px)';
            return testElement.style.webkitBackdropFilter !== '';
        }

        return supportsBackdropFilter;
    }, []);

    // Feature detection for 3D transforms
    const detectTransform3D = useCallback(() => {
        if (typeof window === 'undefined') return false;

        const testElement = document.createElement('div');
        testElement.style.transform = 'translate3d(0, 0, 0)';

        return testElement.style.transform !== '';
    }, []);

    // Performance level detection based on device capabilities
    const detectPerformanceLevel = useCallback(() => {
        if (typeof window === 'undefined') return 'medium';

        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        // Check for hardware acceleration
        if (!gl) return 'low';

        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';

        // Check device memory if available
        const deviceMemory = navigator.deviceMemory || 4;
        const hardwareConcurrency = navigator.hardwareConcurrency || 4;

        // Performance scoring
        let score = 0;

        // Memory score (0-3 points)
        if (deviceMemory >= 8) score += 3;
        else if (deviceMemory >= 4) score += 2;
        else if (deviceMemory >= 2) score += 1;

        // CPU score (0-2 points)
        if (hardwareConcurrency >= 8) score += 2;
        else if (hardwareConcurrency >= 4) score += 1;

        // GPU score (0-2 points)
        if (renderer.toLowerCase().includes('nvidia') || renderer.toLowerCase().includes('amd')) {
            score += 2;
        } else if (renderer.toLowerCase().includes('intel')) {
            score += 1;
        }

        // Device pixel ratio penalty for high DPI displays
        const dpr = window.devicePixelRatio || 1;
        if (dpr > 2) score -= 1;

        if (score >= 6) return 'high';
        if (score >= 3) return 'medium';
        return 'low';
    }, []);

    // Detect reduced motion preference
    const detectReducedMotion = useCallback(() => {
        if (typeof window === 'undefined') return false;

        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }, []);

    // Detect touch device
    const detectTouch = useCallback(() => {
        if (typeof window === 'undefined') return false;

        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }, []);

    // Get responsive glass intensity based on screen size and capabilities
    const getResponsiveIntensity = useCallback((screenWidth, performanceLevel) => {
        if (performanceLevel === 'low') return 'subtle';

        if (screenWidth < 480) return 'subtle';
        if (screenWidth < 768) return 'medium';
        if (screenWidth < 1024) return 'medium';

        return performanceLevel === 'high' ? 'strong' : 'medium';
    }, []);

    // Initialize capabilities detection
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const updateCapabilities = () => {
            const supportsBackdropFilter = detectBackdropFilter();
            const supportsTransform3D = detectTransform3D();
            const performanceLevel = detectPerformanceLevel();
            const reducedMotion = detectReducedMotion();
            const devicePixelRatio = window.devicePixelRatio || 1;
            const isTouch = detectTouch();

            setCapabilities({
                supportsBackdropFilter,
                supportsTransform3D,
                performanceLevel,
                reducedMotion,
                devicePixelRatio,
                isTouch
            });

            // Set initial glass intensity based on screen size and performance
            const screenWidth = window.innerWidth;
            const intensity = getResponsiveIntensity(screenWidth, performanceLevel);
            setGlassIntensity(intensity);

            // Add CSS class for feature detection
            document.documentElement.classList.toggle('no-backdrop-filter', !supportsBackdropFilter);
            document.documentElement.classList.toggle('no-transform-3d', !supportsTransform3D);
            document.documentElement.classList.toggle('reduced-motion', reducedMotion);
            document.documentElement.classList.toggle('touch-device', isTouch);
        };

        updateCapabilities();

        // Listen for resize events to update responsive intensity
        const handleResize = () => {
            const screenWidth = window.innerWidth;
            const intensity = getResponsiveIntensity(screenWidth, capabilities.performanceLevel);
            setGlassIntensity(intensity);
        };

        // Listen for reduced motion changes
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const handleMotionChange = (e) => {
            setCapabilities(prev => ({ ...prev, reducedMotion: e.matches }));
            document.documentElement.classList.toggle('reduced-motion', e.matches);
        };

        window.addEventListener('resize', handleResize);
        mediaQuery.addEventListener('change', handleMotionChange);

        return () => {
            window.removeEventListener('resize', handleResize);
            mediaQuery.removeEventListener('change', handleMotionChange);
        };
    }, [detectBackdropFilter, detectTransform3D, detectPerformanceLevel, detectReducedMotion, detectTouch, getResponsiveIntensity, capabilities.performanceLevel]);

    // Get glass class names based on intensity and capabilities
    const getGlassClasses = useCallback((intensity = glassIntensity, additionalClasses = '') => {
        const baseClass = 'glass-morphism';
        const intensityClass = `glass-${intensity}`;

        let classes = [baseClass, intensityClass];

        if (additionalClasses) {
            classes.push(additionalClasses);
        }

        return classes.join(' ');
    }, [glassIntensity]);

    // Get CSS custom properties for dynamic theming
    const getGlassStyles = useCallback((customIntensity = glassIntensity) => {
        const intensityMap = {
            subtle: {
                '--glass-opacity': '0.05',
                '--glass-blur': '10px',
                '--glass-saturation': '120%'
            },
            medium: {
                '--glass-opacity': '0.1',
                '--glass-blur': '20px',
                '--glass-saturation': '150%'
            },
            strong: {
                '--glass-opacity': '0.15',
                '--glass-blur': '30px',
                '--glass-saturation': '180%'
            }
        };

        return intensityMap[customIntensity] || intensityMap.medium;
    }, [glassIntensity]);

    // Check if glass effects should be enabled
    const shouldEnableGlass = useCallback(() => {
        return capabilities.supportsBackdropFilter &&
            !capabilities.reducedMotion &&
            capabilities.performanceLevel !== 'low';
    }, [capabilities]);

    return {
        capabilities,
        glassIntensity,
        setGlassIntensity,
        getGlassClasses,
        getGlassStyles,
        shouldEnableGlass,
        getResponsiveIntensity
    };
};

export default useGlassMorphism;
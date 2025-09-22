import { useState, useEffect, useCallback } from 'react';
import { useGlassMorphism } from './useGlassMorphism';

/**
 * Responsive design breakpoints
 */
const BREAKPOINTS = {
    mobile: 0,
    tablet: 768,
    desktop: 1024,
    large: 1440
};

/**
 * Hook for managing responsive design across all screen sizes
 * Provides optimized settings for mobile, tablet, and desktop
 */
export const useResponsiveDesign = () => {
    const { capabilities, getResponsiveIntensity } = useGlassMorphism();

    const [screenSize, setScreenSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 1024,
        height: typeof window !== 'undefined' ? window.innerHeight : 768,
        orientation: typeof window !== 'undefined' ?
            (window.innerWidth > window.innerHeight ? 'landscape' : 'portrait') : 'landscape'
    });

    const [deviceType, setDeviceType] = useState('desktop');
    const [responsiveConfig, setResponsiveConfig] = useState({});

    // Detect device type based on screen size and capabilities
    const detectDeviceType = useCallback((width) => {
        if (width < BREAKPOINTS.tablet) return 'mobile';
        if (width < BREAKPOINTS.desktop) return 'tablet';
        return 'desktop';
    }, []);

    // Get mobile-optimized configuration
    const getMobileConfig = useCallback(() => ({
        glass: {
            intensity: capabilities.performanceLevel === 'low' ? 'subtle' : 'subtle',
            blur: '8px',
            opacity: 0.03,
            saturation: '110%',
            enableBackdrop: capabilities.supportsBackdropFilter && capabilities.performanceLevel !== 'low'
        },
        beams: {
            particleCount: capabilities.performanceLevel === 'high' ? 15 : 8,
            intensity: 'subtle',
            animationSpeed: 0.5,
            enableAnimation: !capabilities.reducedMotion && capabilities.performanceLevel !== 'low'
        },
        socialIcons: {
            enable3D: false, // Disable 3D on mobile for performance
            hoverScale: 1.1,
            touchScale: 1.05,
            animationDuration: '0.2s',
            enableGlassBubble: false
        },
        layout: {
            padding: '1rem',
            spacing: '0.75rem',
            iconSize: '2rem',
            fontSize: '0.875rem'
        },
        performance: {
            enableGPUAcceleration: capabilities.performanceLevel === 'high',
            useTransform3D: false,
            enableWillChange: false
        }
    }), [capabilities]);

    // Get tablet-optimized configuration
    const getTabletConfig = useCallback(() => ({
        glass: {
            intensity: getResponsiveIntensity(screenSize.width, capabilities.performanceLevel),
            blur: '15px',
            opacity: 0.08,
            saturation: '140%',
            enableBackdrop: capabilities.supportsBackdropFilter
        },
        beams: {
            particleCount: capabilities.performanceLevel === 'high' ? 25 : 15,
            intensity: 'medium',
            animationSpeed: 0.7,
            enableAnimation: !capabilities.reducedMotion
        },
        socialIcons: {
            enable3D: capabilities.supportsTransform3D && capabilities.performanceLevel !== 'low',
            hoverScale: 1.15,
            touchScale: 1.1,
            animationDuration: '0.25s',
            enableGlassBubble: capabilities.performanceLevel === 'high',
            rotateX: '-10deg',
            rotateY: '10deg',
            translateZ: '25px'
        },
        layout: {
            padding: '1.5rem',
            spacing: '1rem',
            iconSize: '2.25rem',
            fontSize: '0.9375rem'
        },
        performance: {
            enableGPUAcceleration: true,
            useTransform3D: capabilities.supportsTransform3D,
            enableWillChange: true
        }
    }), [capabilities, getResponsiveIntensity, screenSize.width]);

    // Get desktop full-resolution configuration
    const getDesktopConfig = useCallback(() => ({
        glass: {
            intensity: capabilities.performanceLevel === 'low' ? 'medium' : 'strong',
            blur: '25px',
            opacity: 0.12,
            saturation: '180%',
            enableBackdrop: capabilities.supportsBackdropFilter
        },
        beams: {
            particleCount: capabilities.performanceLevel === 'high' ? 40 :
                capabilities.performanceLevel === 'medium' ? 25 : 15,
            intensity: 'strong',
            animationSpeed: 1.0,
            enableAnimation: !capabilities.reducedMotion
        },
        socialIcons: {
            enable3D: capabilities.supportsTransform3D,
            hoverScale: 1.2,
            touchScale: 1.15,
            animationDuration: '0.3s',
            enableGlassBubble: true,
            rotateX: '-15deg',
            rotateY: '15deg',
            translateZ: '50px'
        },
        layout: {
            padding: '2rem',
            spacing: '1.25rem',
            iconSize: '2.5rem',
            fontSize: '1rem'
        },
        performance: {
            enableGPUAcceleration: true,
            useTransform3D: capabilities.supportsTransform3D,
            enableWillChange: true
        }
    }), [capabilities]);

    // Get configuration based on device type
    const getDeviceConfig = useCallback(() => {
        switch (deviceType) {
            case 'mobile':
                return getMobileConfig();
            case 'tablet':
                return getTabletConfig();
            case 'desktop':
            default:
                return getDesktopConfig();
        }
    }, [deviceType, getMobileConfig, getTabletConfig, getDesktopConfig]);

    // Handle orientation change for beam animations
    const handleOrientationChange = useCallback(() => {
        const newOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';

        setScreenSize(prev => ({
            ...prev,
            orientation: newOrientation
        }));

        // Adjust beam particle count based on orientation
        const config = getDeviceConfig();
        if (newOrientation === 'portrait' && deviceType === 'tablet') {
            // Reduce particles in portrait mode for better performance
            config.beams.particleCount = Math.floor(config.beams.particleCount * 0.7);
        }

        return config;
    }, [deviceType, getDeviceConfig]);

    // Update screen size and device type
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const updateScreenSize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            const orientation = width > height ? 'landscape' : 'portrait';
            const newDeviceType = detectDeviceType(width);

            setScreenSize({ width, height, orientation });
            setDeviceType(newDeviceType);
        };

        updateScreenSize();

        const handleResize = () => {
            updateScreenSize();
        };

        const handleOrientationChangeEvent = () => {
            // Delay to ensure dimensions are updated
            setTimeout(() => {
                updateScreenSize();
                handleOrientationChange();
            }, 100);
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleOrientationChangeEvent);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleOrientationChangeEvent);
        };
    }, [detectDeviceType, handleOrientationChange]);

    // Update responsive configuration when device type or capabilities change
    useEffect(() => {
        const config = getDeviceConfig();
        setResponsiveConfig(config);
    }, [deviceType, capabilities, getDeviceConfig]);

    // Get CSS custom properties for responsive design
    const getResponsiveStyles = useCallback(() => {
        const config = responsiveConfig;
        if (!config.glass) return {};

        return {
            // Glass morphism properties
            '--footer-glass-opacity': config.glass.opacity,
            '--footer-glass-blur': config.glass.blur,
            '--footer-glass-saturation': config.glass.saturation,

            // Beam animation properties
            '--footer-beam-particle-count': config.beams?.particleCount || 20,
            '--footer-beam-intensity': config.beams?.intensity === 'subtle' ? '0.3' :
                config.beams?.intensity === 'medium' ? '0.6' : '1.0',
            '--footer-beam-speed': config.beams?.animationSpeed || 1.0,

            // Social icons properties
            '--footer-social-scale': config.socialIcons?.hoverScale || 1.2,
            '--footer-social-rotate-x': config.socialIcons?.rotateX || '-15deg',
            '--footer-social-rotate-y': config.socialIcons?.rotateY || '15deg',
            '--footer-social-translate-z': config.socialIcons?.translateZ || '50px',
            '--footer-social-duration': config.socialIcons?.animationDuration || '0.3s',

            // Layout properties
            '--footer-padding': config.layout?.padding || '2rem',
            '--footer-spacing': config.layout?.spacing || '1.25rem',
            '--footer-icon-size': config.layout?.iconSize || '2.5rem',
            '--footer-font-size': config.layout?.fontSize || '1rem'
        };
    }, [responsiveConfig]);

    // Get responsive class names
    const getResponsiveClasses = useCallback(() => {
        const classes = [
            `device-${deviceType}`,
            `orientation-${screenSize.orientation}`,
            `performance-${capabilities.performanceLevel}`
        ];

        if (capabilities.isTouch) classes.push('touch-device');
        if (capabilities.reducedMotion) classes.push('reduced-motion');
        if (!capabilities.supportsBackdropFilter) classes.push('no-backdrop-filter');
        if (!capabilities.supportsTransform3D) classes.push('no-transform-3d');

        return classes.join(' ');
    }, [deviceType, screenSize.orientation, capabilities]);

    // Check if specific features should be enabled
    const shouldEnableFeature = useCallback((feature) => {
        const config = responsiveConfig;

        switch (feature) {
            case 'glass':
                return config.glass?.enableBackdrop && !capabilities.reducedMotion;
            case 'beams':
                return config.beams?.enableAnimation && !capabilities.reducedMotion;
            case '3d-icons':
                return config.socialIcons?.enable3D && capabilities.supportsTransform3D;
            case 'glass-bubble':
                return config.socialIcons?.enableGlassBubble && capabilities.performanceLevel !== 'low';
            case 'gpu-acceleration':
                return config.performance?.enableGPUAcceleration;
            default:
                return true;
        }
    }, [responsiveConfig, capabilities]);

    return {
        screenSize,
        deviceType,
        responsiveConfig,
        getResponsiveStyles,
        getResponsiveClasses,
        shouldEnableFeature,
        handleOrientationChange,
        breakpoints: BREAKPOINTS
    };
};

export default useResponsiveDesign;
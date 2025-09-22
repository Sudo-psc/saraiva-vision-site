import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePerformanceMonitor } from './usePerformanceMonitor';
import { useDeviceCapabilities } from './useDeviceCapabilities';
import { useReducedMotion } from './useReducedMotion';

/**
 * Comprehensive performance optimization hook for the enhanced footer
 * Combines performance monitoring, device capabilities, and accessibility preferences
 */
export const useFooterPerformanceOptimization = (options = {}) => {
    const {
        enableAutoOptimization = true,
        aggressiveOptimization = false,
        debugMode = false
    } = options;

    // Initialize all monitoring hooks
    const performanceMonitor = usePerformanceMonitor({
        targetFPS: 60,
        degradationThreshold: 45,
        criticalThreshold: 30,
        enableAutoAdjustment: enableAutoOptimization
    });

    const deviceCapabilities = useDeviceCapabilities();
    const reducedMotion = useReducedMotion();

    // Combined optimization state
    const [optimizationState, setOptimizationState] = useState({
        level: 'high',
        reason: 'initial',
        timestamp: Date.now()
    });

    // Calculate optimal settings based on all factors
    const getOptimalSettings = useCallback(() => {
        const performanceSettings = performanceMonitor.getOptimizedSettings();
        const deviceRecommendations = deviceCapabilities.getPerformanceRecommendations();
        const motionSettings = reducedMotion.getAnimationSettings();

        // Start with performance-based settings
        let settings = { ...performanceSettings };

        // Apply device capability constraints
        if (!deviceRecommendations.enableBackdropFilter) {
            settings.enableBackdropFilter = false;
            settings.glassBlur = 0;
        }

        if (!deviceRecommendations.enable3DTransforms) {
            settings.enable3DTransforms = false;
        }

        if (!deviceRecommendations.enableWebGLEffects) {
            settings.beamParticleCount = Math.min(settings.beamParticleCount, 10);
        }

        // Apply reduced motion preferences
        if (reducedMotion.prefersReducedMotion) {
            settings = {
                ...settings,
                animationDuration: 0,
                enableComplexAnimations: false,
                enable3DTransforms: false,
                beamParticleCount: 0
            };
        }

        // Apply device-specific optimizations
        if (deviceCapabilities.capabilities.isLowEndDevice) {
            settings = {
                ...settings,
                glassBlur: Math.min(settings.glassBlur, 5),
                glassOpacity: Math.min(settings.glassOpacity, 0.02),
                beamParticleCount: Math.min(settings.beamParticleCount, 5),
                animationDuration: Math.min(settings.animationDuration, 100),
                enableComplexAnimations: false
            };
        }

        // Aggressive optimization mode
        if (aggressiveOptimization) {
            settings = {
                ...settings,
                glassBlur: Math.min(settings.glassBlur, 10),
                beamParticleCount: Math.min(settings.beamParticleCount, 15),
                animationDuration: Math.min(settings.animationDuration, 150)
            };
        }

        return settings;
    }, [
        performanceMonitor,
        deviceCapabilities,
        reducedMotion,
        aggressiveOptimization
    ]);

    // Determine overall optimization level
    const optimizationLevel = useMemo(() => {
        const factors = [];

        // Performance factors
        if (performanceMonitor.performanceLevel === 'low') {
            factors.push('lowPerformance');
        } else if (performanceMonitor.performanceLevel === 'medium') {
            factors.push('mediumPerformance');
        }

        // Device factors
        if (deviceCapabilities.capabilities.isLowEndDevice) {
            factors.push('lowEndDevice');
        }

        if (deviceCapabilities.capabilities.isMobile) {
            factors.push('mobileDevice');
        }

        // Accessibility factors
        if (reducedMotion.prefersReducedMotion) {
            factors.push('reducedMotion');
        }

        // Feature support factors
        if (!deviceCapabilities.capabilities.supportsBackdropFilter) {
            factors.push('noBackdropFilter');
        }

        if (!deviceCapabilities.capabilities.supportsTransform3D) {
            factors.push('no3DTransforms');
        }

        // Determine level based on factors
        if (factors.length >= 3) {
            return 'minimal';
        } else if (factors.length >= 2) {
            return 'reduced';
        } else if (factors.length >= 1) {
            return 'optimized';
        } else {
            return 'full';
        }
    }, [performanceMonitor.performanceLevel, deviceCapabilities.capabilities, reducedMotion.prefersReducedMotion]);

    // Update optimization state when level changes
    useEffect(() => {
        setOptimizationState(prev => ({
            level: optimizationLevel,
            reason: `Performance: ${performanceMonitor.performanceLevel}, Device: ${deviceCapabilities.capabilities.isLowEndDevice ? 'low-end' : 'capable'}, Motion: ${reducedMotion.prefersReducedMotion ? 'reduced' : 'normal'}`,
            timestamp: Date.now()
        }));
    }, [optimizationLevel, performanceMonitor.performanceLevel, deviceCapabilities.capabilities.isLowEndDevice, reducedMotion.prefersReducedMotion]);

    // Get CSS custom properties for optimization
    const getCSSProperties = useCallback(() => {
        const settings = getOptimalSettings();
        const motionProps = reducedMotion.getMotionCSSProperties();

        return {
            ...motionProps,
            '--footer-glass-blur': `${settings.glassBlur}px`,
            '--footer-glass-opacity': settings.glassOpacity,
            '--footer-beam-particles': settings.beamParticleCount,
            '--footer-animation-duration': `${settings.animationDuration}ms`,
            '--footer-enable-backdrop-filter': settings.enableBackdropFilter ? '1' : '0',
            '--footer-enable-3d-transforms': settings.enable3DTransforms ? '1' : '0',
            '--footer-optimization-level': optimizationLevel
        };
    }, [getOptimalSettings, reducedMotion, optimizationLevel]);

    // Get component props for optimization
    const getComponentProps = useCallback(() => {
        const settings = getOptimalSettings();

        return {
            enableGlassEffect: settings.enableBackdropFilter && optimizationLevel !== 'minimal',
            enable3DTransforms: settings.enable3DTransforms && optimizationLevel !== 'minimal',
            enableBeamBackground: settings.beamParticleCount > 0 && optimizationLevel !== 'minimal',
            enableComplexAnimations: settings.enableComplexAnimations && optimizationLevel === 'full',
            glassBlur: settings.glassBlur,
            glassOpacity: settings.glassOpacity,
            beamParticleCount: settings.beamParticleCount,
            animationDuration: settings.animationDuration,
            performanceLevel: performanceMonitor.performanceLevel,
            optimizationLevel,
            reducedMotion: reducedMotion.prefersReducedMotion
        };
    }, [getOptimalSettings, optimizationLevel, performanceMonitor.performanceLevel, reducedMotion.prefersReducedMotion]);

    // Debug information
    const debugInfo = useMemo(() => {
        if (!debugMode) return null;

        return {
            performanceMonitor: {
                level: performanceMonitor.performanceLevel,
                fps: performanceMonitor.currentFPS,
                isMonitoring: performanceMonitor.isMonitoring
            },
            deviceCapabilities: deviceCapabilities.capabilities,
            reducedMotion: {
                prefersReducedMotion: reducedMotion.prefersReducedMotion,
                isInitialized: reducedMotion.isInitialized
            },
            optimization: optimizationState,
            settings: getOptimalSettings()
        };
    }, [
        debugMode,
        performanceMonitor,
        deviceCapabilities.capabilities,
        reducedMotion,
        optimizationState,
        getOptimalSettings
    ]);

    // Manual optimization override
    const setManualOptimization = useCallback((level) => {
        performanceMonitor.setManualPerformanceLevel(level);
        setOptimizationState(prev => ({
            ...prev,
            level,
            reason: 'manual override',
            timestamp: Date.now()
        }));
    }, [performanceMonitor]);

    return {
        // Current state
        optimizationLevel,
        optimizationState,

        // Settings and props
        getOptimalSettings,
        getCSSProperties,
        getComponentProps,

        // Individual hook access
        performanceMonitor,
        deviceCapabilities,
        reducedMotion,

        // Controls
        setManualOptimization,

        // Debug
        debugInfo,

        // Utility methods
        isOptimal: optimizationLevel === 'full',
        isMinimal: optimizationLevel === 'minimal',
        shouldEnableEffect: (effectName) => {
            const props = getComponentProps();
            switch (effectName) {
                case 'glass':
                    return props.enableGlassEffect;
                case '3d':
                    return props.enable3DTransforms;
                case 'beams':
                    return props.enableBeamBackground;
                case 'animations':
                    return props.enableComplexAnimations;
                default:
                    return optimizationLevel !== 'minimal';
            }
        }
    };
};

export default useFooterPerformanceOptimization;
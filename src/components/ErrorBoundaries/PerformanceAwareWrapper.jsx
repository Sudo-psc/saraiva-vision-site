import React, { useState, useEffect } from 'react';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import AnimationErrorBoundary from './AnimationErrorBoundary';

/**
 * Wrapper component that combines performance monitoring with error boundaries
 * Automatically adjusts animations based on performance and user preferences
 */
const PerformanceAwareWrapper = ({
    children,
    fallback,
    enableMonitoring = true,
    monitoringOptions = {},
    className = '',
    ...props
}) => {
    const {
        performanceLevel,
        startMonitoring,
        stopMonitoring,
        getOptimizedSettings,
        deviceCapabilities
    } = usePerformanceMonitor(monitoringOptions);

    const { prefersReducedMotion, getAnimationSettings } = useReducedMotion();
    const [isVisible, setIsVisible] = useState(false);

    // Start monitoring when component becomes visible
    useEffect(() => {
        if (enableMonitoring && isVisible) {
            startMonitoring();
            return () => stopMonitoring();
        }
    }, [enableMonitoring, isVisible, startMonitoring, stopMonitoring]);

    // Intersection observer for visibility detection
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.1 }
        );

        const element = document.querySelector(`[data-performance-wrapper="${className}"]`);
        if (element) {
            observer.observe(element);
        }

        return () => observer.disconnect();
    }, [className]);

    // Get combined settings from performance and accessibility preferences
    const getCombinedSettings = () => {
        const performanceSettings = getOptimizedSettings();
        const accessibilitySettings = getAnimationSettings(performanceSettings);

        return {
            ...performanceSettings,
            ...accessibilitySettings,
            deviceCapabilities,
            performanceLevel,
            prefersReducedMotion
        };
    };

    // Fallback component for errors
    const ErrorFallback = ({ error }) => {
        if (fallback) {
            return fallback;
        }

        return (
            <div className={`performance-fallback ${className}`}>
                {typeof children === 'function' ?
                    children({
                        settings: {
                            enableAnimations: false,
                            enable3D: false,
                            enableBeams: false,
                            enableGlass: false
                        },
                        hasError: true
                    }) :
                    children
                }
            </div>
        );
    };

    return (
        <div
            data-performance-wrapper={className}
            className={`performance-aware-wrapper ${className}`}
            {...props}
        >
            <AnimationErrorBoundary fallback={ErrorFallback}>
                {typeof children === 'function' ?
                    children({
                        settings: getCombinedSettings(),
                        isVisible,
                        hasError: false
                    }) :
                    children
                }
            </AnimationErrorBoundary>
        </div>
    );
};

export default PerformanceAwareWrapper;
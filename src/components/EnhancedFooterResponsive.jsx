import React, { useEffect, useRef } from 'react';
import { useResponsiveDesign } from '../hooks/useResponsiveDesign';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
import ResponsiveBeamBackground from './ResponsiveBeamBackground';
import '../styles/responsive-footer.css';

/**
 * Enhanced Footer with Responsive Design System
 * Adapts glass effects, animations, and layout based on device capabilities
 */
const EnhancedFooterResponsive = ({
    children,
    className = '',
    enableGlass = true,
    enableBeams = true,
    beamColors = ['#3B82F6', '#8B5CF6', '#06B6D4']
}) => {
    const footerRef = useRef(null);
    const { trackComponentMount, trackInteraction } = usePerformanceMonitor('EnhancedFooterResponsive');

    const {
        screenSize,
        deviceType,
        responsiveConfig,
        getResponsiveStyles,
        getResponsiveClasses,
        shouldEnableFeature
    } = useResponsiveDesign();

    // Track component mount performance
    useEffect(() => {
        const cleanup = trackComponentMount();
        return cleanup;
    }, [trackComponentMount]);

    // Apply responsive styles to CSS custom properties
    useEffect(() => {
        if (!footerRef.current) return;

        const styles = getResponsiveStyles();
        const footer = footerRef.current;

        // Apply CSS custom properties
        Object.entries(styles).forEach(([property, value]) => {
            footer.style.setProperty(property, value);
        });
    }, [getResponsiveStyles, responsiveConfig]);

    // Handle interaction tracking
    const handleInteraction = (type, event) => {
        trackInteraction(type);

        // Add haptic feedback for touch devices
        if ('vibrate' in navigator && deviceType !== 'desktop') {
            navigator.vibrate(10);
        }
    };

    // Get responsive class names
    const responsiveClasses = getResponsiveClasses();
    const combinedClasses = `enhanced-footer ${responsiveClasses} ${className}`.trim();

    // Check if features should be enabled
    const glassEnabled = enableGlass && shouldEnableFeature('glass');
    const beamsEnabled = enableBeams && shouldEnableFeature('beams');

    return (
        <footer
            ref={footerRef}
            className={combinedClasses}
            style={{
                position: 'relative',
                overflow: 'hidden',
                ...getResponsiveStyles()
            }}
            onTouchStart={() => handleInteraction('touch-start')}
            onMouseEnter={() => handleInteraction('mouse-enter')}
        >
            {/* Beam Background Layer */}
            {beamsEnabled && (
                <ResponsiveBeamBackground
                    colors={beamColors}
                    enableAnimation={shouldEnableFeature('beams')}
                    className="footer-beam-background"
                />
            )}

            {/* Glass Morphism Layer */}
            {glassEnabled && (
                <div
                    className="glass-layer"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(
              135deg,
              rgba(255, 255, 255, var(--footer-glass-opacity)),
              rgba(255, 255, 255, calc(var(--footer-glass-opacity) * 0.5))
            )`,
                        backdropFilter: shouldEnableFeature('glass') ?
                            `blur(var(--footer-glass-blur)) saturate(var(--footer-glass-saturation))` : 'none',
                        WebkitBackdropFilter: shouldEnableFeature('glass') ?
                            `blur(var(--footer-glass-blur)) saturate(var(--footer-glass-saturation))` : 'none',
                        border: `1px solid rgba(255, 255, 255, calc(var(--footer-glass-opacity) * 2))`,
                        pointerEvents: 'none',
                        zIndex: 1
                    }}
                    aria-hidden="true"
                />
            )}

            {/* Footer Content */}
            <div
                className="footer-content"
                style={{
                    position: 'relative',
                    zIndex: 2,
                    display: 'grid',
                    gap: 'var(--footer-spacing)',
                    gridTemplateColumns: deviceType === 'mobile' ? '1fr' :
                        deviceType === 'tablet' && screenSize.orientation === 'portrait' ? '1fr' :
                            deviceType === 'tablet' ? 'repeat(2, 1fr)' :
                                'repeat(4, 1fr)'
                }}
            >
                {children}
            </div>

            {/* Debug Info (Development Only) */}
            {process.env.NODE_ENV === 'development' && (
                <div
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'rgba(0, 0, 0, 0.8)',
                        color: 'white',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        zIndex: 1000,
                        pointerEvents: 'none'
                    }}
                >
                    <div>Device: {deviceType}</div>
                    <div>Size: {screenSize.width}×{screenSize.height}</div>
                    <div>Orientation: {screenSize.orientation}</div>
                    <div>Glass: {glassEnabled ? 'ON' : 'OFF'}</div>
                    <div>Beams: {beamsEnabled ? 'ON' : 'OFF'}</div>
                    <div>Performance: {responsiveConfig.performance?.enableGPUAcceleration ? 'GPU' : 'CPU'}</div>
                </div>
            )}
        </footer>
    );
};

export default EnhancedFooterResponsive;
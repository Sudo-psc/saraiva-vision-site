import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useResponsiveDesign } from '../hooks/useResponsiveDesign';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';

/**
 * Responsive Social Icons Component
 * Adapts 3D effects and interactions based on device capabilities
 */
const ResponsiveSocialIcons = ({
    socialLinks = [],
    className = '',
    enableGlassBubble = true
}) => {
    const [hoveredIcon, setHoveredIcon] = useState(null);
    const [touchedIcon, setTouchedIcon] = useState(null);
    const iconsRef = useRef({});

    const { trackInteraction } = usePerformanceMonitor('ResponsiveSocialIcons');

    const {
        deviceType,
        responsiveConfig,
        shouldEnableFeature,
        getResponsiveStyles
    } = useResponsiveDesign();

    // Get social icon configuration
    const iconConfig = responsiveConfig.socialIcons || {};
    const enable3D = shouldEnableFeature('3d-icons');
    const enableBubble = enableGlassBubble && shouldEnableFeature('glass-bubble');

    // Handle hover interactions
    const handleMouseEnter = useCallback((iconName) => {
        if (deviceType === 'desktop') {
            setHoveredIcon(iconName);
            trackInteraction('icon-hover', iconName);
        }
    }, [deviceType, trackInteraction]);

    const handleMouseLeave = useCallback(() => {
        if (deviceType === 'desktop') {
            setHoveredIcon(null);
        }
    }, [deviceType]);

    // Handle touch interactions
    const handleTouchStart = useCallback((iconName, event) => {
        event.preventDefault();
        setTouchedIcon(iconName);
        trackInteraction('icon-touch', iconName);

        // Add haptic feedback
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }

        // Clear touch state after animation
        setTimeout(() => {
            setTouchedIcon(null);
        }, 200);
    }, [trackInteraction]);

    // Handle click/tap
    const handleClick = useCallback((link, iconName, event) => {
        trackInteraction('icon-click', iconName);

        // Open link in new tab
        if (link) {
            window.open(link, '_blank', 'noopener,noreferrer');
        }
    }, [trackInteraction]);

    // Get transform styles based on device and state
    const getIconTransform = useCallback((iconName, isHovered, isTouched) => {
        if (!enable3D) {
            // Fallback to simple scale for devices without 3D support
            if (isHovered || isTouched) {
                return `scale(${iconConfig.hoverScale || 1.1})`;
            }
            return 'scale(1)';
        }

        // 3D transforms for supported devices
        if (isHovered && deviceType === 'desktop') {
            return `perspective(1000px) 
              rotateX(${iconConfig.rotateX || '-15deg'}) 
              rotateY(${iconConfig.rotateY || '15deg'}) 
              translateZ(${iconConfig.translateZ || '50px'}) 
              scale(${iconConfig.hoverScale || 1.2})`;
        }

        if (isTouched && deviceType !== 'desktop') {
            const scale = iconConfig.touchScale || 1.05;
            if (deviceType === 'tablet' && enable3D) {
                return `perspective(1000px) 
                rotateX(${iconConfig.rotateX || '-10deg'}) 
                rotateY(${iconConfig.rotateY || '10deg'}) 
                translateZ(${iconConfig.translateZ || '25px'}) 
                scale(${scale})`;
            }
            return `scale(${scale})`;
        }

        return 'scale(1)';
    }, [enable3D, iconConfig, deviceType]);

    // Get glass bubble styles
    const getGlassBubbleStyles = useCallback((iconName, isHovered) => {
        if (!enableBubble || !isHovered || deviceType !== 'desktop') {
            return {
                width: '0',
                height: '0',
                opacity: 0
            };
        }

        return {
            width: '120%',
            height: '120%',
            opacity: 0.3,
            backdropFilter: shouldEnableFeature('glass') ? 'blur(10px)' : 'none',
            WebkitBackdropFilter: shouldEnableFeature('glass') ? 'blur(10px)' : 'none'
        };
    }, [enableBubble, deviceType, shouldEnableFeature]);

    // Apply responsive styles
    useEffect(() => {
        const styles = getResponsiveStyles();

        Object.entries(iconsRef.current).forEach(([iconName, iconElement]) => {
            if (iconElement) {
                Object.entries(styles).forEach(([property, value]) => {
                    if (property.startsWith('--footer-social') || property.startsWith('--footer-icon')) {
                        iconElement.style.setProperty(property, value);
                    }
                });
            }
        });
    }, [getResponsiveStyles]);

    if (!socialLinks.length) {
        return null;
    }

    return (
        <div
            className={`social-icons-container ${className}`}
            style={{
                display: 'flex',
                gap: 'var(--footer-spacing)',
                justifyContent: 'center',
                alignItems: 'center',
                flexWrap: 'wrap'
            }}
        >
            {socialLinks.map((social, index) => {
                const isHovered = hoveredIcon === social.name;
                const isTouched = touchedIcon === social.name;
                const iconTransform = getIconTransform(social.name, isHovered, isTouched);
                const bubbleStyles = getGlassBubbleStyles(social.name, isHovered);

                return (
                    <div
                        key={social.name}
                        ref={el => iconsRef.current[social.name] = el}
                        className="social-icon-3d"
                        style={{
                            position: 'relative',
                            width: 'var(--footer-icon-size)',
                            height: 'var(--footer-icon-size)',
                            cursor: 'pointer',
                            transform: iconTransform,
                            transition: `transform var(--footer-social-duration) var(--footer-ease-bounce)`,
                            touchAction: 'manipulation'
                        }}
                        onMouseEnter={() => handleMouseEnter(social.name)}
                        onMouseLeave={handleMouseLeave}
                        onTouchStart={(e) => handleTouchStart(social.name, e)}
                        onClick={(e) => handleClick(social.href, social.name, e)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Visit our ${social.name} page`}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleClick(social.href, social.name, e);
                            }
                        }}
                    >
                        {/* Glass Bubble Effect */}
                        {enableBubble && (
                            <div
                                className="glass-bubble"
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
                                    borderRadius: '50%',
                                    transition: `all var(--footer-social-duration) var(--footer-ease-out)`,
                                    pointerEvents: 'none',
                                    zIndex: -1,
                                    ...bubbleStyles
                                }}
                                aria-hidden="true"
                            />
                        )}

                        {/* Social Icon */}
                        <img
                            src={social.image || social.icon}
                            alt={`${social.name} icon`}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                borderRadius: deviceType === 'mobile' ? '8px' : '12px',
                                filter: isHovered && deviceType === 'desktop' ?
                                    'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3))' :
                                    'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
                                transition: 'filter var(--footer-social-duration) ease-out'
                            }}
                            loading="lazy"
                            draggable={false}
                        />

                        {/* Focus indicator for keyboard navigation */}
                        <div
                            className="focus-indicator"
                            style={{
                                position: 'absolute',
                                top: '-2px',
                                left: '-2px',
                                right: '-2px',
                                bottom: '-2px',
                                border: '2px solid transparent',
                                borderRadius: deviceType === 'mobile' ? '10px' : '14px',
                                transition: 'border-color 0.2s ease-out',
                                pointerEvents: 'none'
                            }}
                            aria-hidden="true"
                        />

                        <style jsx>{`
              .social-icon-3d:focus .focus-indicator {
                border-color: #3B82F6;
                box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
              }

              .social-icon-3d:focus {
                outline: none;
              }

              /* High contrast mode support */
              @media (prefers-contrast: high) {
                .social-icon-3d {
                  border: 1px solid currentColor;
                }
                
                .social-icon-3d:focus .focus-indicator {
                  border-color: currentColor;
                }
              }

              /* Reduced motion support */
              @media (prefers-reduced-motion: reduce) {
                .social-icon-3d {
                  transition: none !important;
                }
                
                .glass-bubble {
                  transition: none !important;
                }
              }
            `}</style>
                    </div>
                );
            })}
        </div>
    );
};

export default ResponsiveSocialIcons;
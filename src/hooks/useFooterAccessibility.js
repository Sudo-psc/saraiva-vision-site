/**
 * useFooterAccessibility Hook
 * 
 * Provides comprehensive accessibility features for the enhanced footer
 * including keyboard navigation, ARIA support, and focus management
 * for 3D interactive elements and glass morphism effects.
 * 
 * Requirements covered: 6.1, 6.2, 6.4, 6.5
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Hook for managing footer accessibility features
 */
export const useFooterAccessibility = (options = {}) => {
    const {
        enableKeyboardNavigation = true,
        enableScreenReaderSupport = true,
        enableFocusManagement = true,
        announceChanges = true
    } = options;

    const [focusedSocialIndex, setFocusedSocialIndex] = useState(-1);
    const [announcementText, setAnnouncementText] = useState('');
    const [isNavigatingWithKeyboard, setIsNavigatingWithKeyboard] = useState(false);
    const prefersReducedMotion = useReducedMotion();
    const socialIconsRef = useRef([]);
    const lastInteractionType = useRef('mouse');

    // Detect keyboard vs mouse interaction
    useEffect(() => {
        const handleKeyDown = () => {
            lastInteractionType.current = 'keyboard';
            setIsNavigatingWithKeyboard(true);
        };

        const handleMouseDown = () => {
            lastInteractionType.current = 'mouse';
            setIsNavigatingWithKeyboard(false);
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleMouseDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleMouseDown);
        };
    }, []);

    // Announce changes to screen readers
    const announce = useCallback((text) => {
        if (!announceChanges || !enableScreenReaderSupport) return;

        setAnnouncementText(text);
        // Clear announcement after screen reader has time to read it
        setTimeout(() => setAnnouncementText(''), 1000);
    }, [announceChanges, enableScreenReaderSupport]);

    // Register social icon refs for keyboard navigation
    const registerSocialIcon = useCallback((index, ref) => {
        if (ref) {
            socialIconsRef.current[index] = ref;
        }
    }, []);

    // Focus specific social icon
    const focusSocialIcon = useCallback((index) => {
        const iconRef = socialIconsRef.current[index];
        if (iconRef && iconRef.focus) {
            iconRef.focus();
            setFocusedSocialIndex(index);
        }
    }, []);

    // Navigate to next social icon
    const navigateToNextSocial = useCallback(() => {
        const totalIcons = socialIconsRef.current.length;
        if (totalIcons === 0) return;

        const nextIndex = focusedSocialIndex < totalIcons - 1
            ? focusedSocialIndex + 1
            : 0; // Wrap to first

        focusSocialIcon(nextIndex);
        announce(`Focused on ${socialIconsRef.current[nextIndex]?.getAttribute('aria-label') || 'social icon'}`);
    }, [focusedSocialIndex, focusSocialIcon, announce]);

    // Navigate to previous social icon
    const navigateToPreviousSocial = useCallback(() => {
        const totalIcons = socialIconsRef.current.length;
        if (totalIcons === 0) return;

        const prevIndex = focusedSocialIndex > 0
            ? focusedSocialIndex - 1
            : totalIcons - 1; // Wrap to last

        focusSocialIcon(prevIndex);
        announce(`Focused on ${socialIconsRef.current[prevIndex]?.getAttribute('aria-label') || 'social icon'}`);
    }, [focusedSocialIndex, focusSocialIcon, announce]);

    // Handle keyboard navigation for social icons
    const handleSocialKeyDown = useCallback((event, socialIndex, socialName, socialHref) => {
        if (!enableKeyboardNavigation) return;

        switch (event.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                event.preventDefault();
                navigateToNextSocial();
                break;

            case 'ArrowLeft':
            case 'ArrowUp':
                event.preventDefault();
                navigateToPreviousSocial();
                break;

            case 'Enter':
            case ' ': // Space key
                event.preventDefault();
                if (socialHref) {
                    announce(`Opening ${socialName} in new tab`);
                    window.open(socialHref, '_blank', 'noopener,noreferrer');
                }
                break;

            case 'Home':
                event.preventDefault();
                focusSocialIcon(0);
                announce(`Focused on first social icon`);
                break;

            case 'End':
                event.preventDefault();
                focusSocialIcon(socialIconsRef.current.length - 1);
                announce(`Focused on last social icon`);
                break;

            case 'Escape':
                event.preventDefault();
                // Remove focus from social icons
                if (document.activeElement && document.activeElement.blur) {
                    document.activeElement.blur();
                }
                setFocusedSocialIndex(-1);
                announce('Exited social media navigation');
                break;
        }
    }, [enableKeyboardNavigation, navigateToNextSocial, navigateToPreviousSocial, focusSocialIcon, announce]);

    // Handle focus events for social icons
    const handleSocialFocus = useCallback((socialIndex, socialName) => {
        setFocusedSocialIndex(socialIndex);

        if (lastInteractionType.current === 'keyboard') {
            announce(`${socialName} social media link, ${socialIndex + 1} of ${socialIconsRef.current.length}`);
        }
    }, [announce]);

    // Handle blur events for social icons
    const handleSocialBlur = useCallback(() => {
        // Small delay to check if focus moved to another social icon
        setTimeout(() => {
            const activeElement = document.activeElement;
            const isFocusOnSocialIcon = socialIconsRef.current.some(ref => ref === activeElement);

            if (!isFocusOnSocialIcon) {
                setFocusedSocialIndex(-1);
            }
        }, 10);
    }, []);

    // Generate ARIA props for social icons
    const getSocialAriaProps = useCallback((social, index, isHovered) => {
        const baseProps = {
            role: 'button',
            tabIndex: 0,
            'aria-label': `Open ${social.name} profile in new tab`,
            'aria-describedby': `social-${social.name.toLowerCase()}-description`,
            'data-social-index': index
        };

        // Add state information for screen readers
        if (isHovered && !prefersReducedMotion) {
            baseProps['aria-expanded'] = 'true';
            baseProps['aria-description'] = `${social.name} icon with 3D hover effect active`;
        }

        // Add keyboard navigation hints
        if (isNavigatingWithKeyboard && focusedSocialIndex === index) {
            baseProps['aria-current'] = 'true';
        }

        return baseProps;
    }, [prefersReducedMotion, isNavigatingWithKeyboard, focusedSocialIndex]);

    // Generate ARIA props for the enhanced footer container
    const getFooterAriaProps = useCallback(() => {
        return {
            role: 'contentinfo',
            'aria-label': 'Site footer with enhanced visual effects',
            'aria-describedby': 'footer-description'
        };
    }, []);

    // Generate ARIA props for glass morphism layers
    const getGlassLayerAriaProps = useCallback(() => {
        return {
            'aria-hidden': 'true',
            role: 'presentation'
        };
    }, []);

    // Generate focus indicator styles that work with 3D transforms
    const getFocusIndicatorStyles = useCallback((isKeyboardFocused, is3DActive) => {
        if (!isKeyboardFocused) return {};

        const baseStyles = {
            outline: '2px solid #3b82f6',
            outlineOffset: '2px',
            borderRadius: '8px'
        };

        // Adjust focus indicator for 3D transforms
        if (is3DActive && !prefersReducedMotion) {
            return {
                ...baseStyles,
                boxShadow: '0 0 0 2px #3b82f6, 0 4px 12px rgba(59, 130, 246, 0.3)',
                transform: 'translateZ(60px)' // Bring focus indicator forward
            };
        }

        return baseStyles;
    }, [prefersReducedMotion]);

    // Check if high contrast mode is enabled
    const [isHighContrast, setIsHighContrast] = useState(false);

    useEffect(() => {
        const checkHighContrast = () => {
            // Check if window.matchMedia is available (not in test environment)
            if (typeof window !== 'undefined' && window.matchMedia) {
                try {
                    // Check for Windows high contrast mode
                    const isHighContrastMode = window.matchMedia('(prefers-contrast: high)').matches ||
                        window.matchMedia('(-ms-high-contrast: active)').matches;
                    setIsHighContrast(isHighContrastMode);
                } catch (error) {
                    // Fallback for environments that don't support these media queries
                    setIsHighContrast(false);
                }
            } else {
                // Test environment or server-side rendering
                setIsHighContrast(false);
            }
        };

        checkHighContrast();

        // Listen for changes only if matchMedia is available
        if (typeof window !== 'undefined' && window.matchMedia) {
            try {
                const mediaQuery = window.matchMedia('(prefers-contrast: high)');
                const msMediaQuery = window.matchMedia('(-ms-high-contrast: active)');

                if (mediaQuery.addEventListener) {
                    mediaQuery.addEventListener('change', checkHighContrast);
                    msMediaQuery.addEventListener('change', checkHighContrast);
                }

                return () => {
                    if (mediaQuery.removeEventListener) {
                        mediaQuery.removeEventListener('change', checkHighContrast);
                        msMediaQuery.removeEventListener('change', checkHighContrast);
                    }
                };
            } catch (error) {
                // Ignore errors in test environment
                return () => { };
            }
        }
    }, []);

    // Get high contrast safe styles
    const getHighContrastStyles = useCallback(() => {
        if (!isHighContrast) return {};

        return {
            backgroundColor: 'ButtonFace',
            color: 'ButtonText',
            border: '1px solid ButtonText',
            // Disable glass effects in high contrast mode
            backdropFilter: 'none',
            background: 'ButtonFace'
        };
    }, [isHighContrast]);

    return {
        // State
        focusedSocialIndex,
        announcementText,
        isNavigatingWithKeyboard,
        isHighContrast,
        prefersReducedMotion,

        // Functions
        announce,
        registerSocialIcon,
        focusSocialIcon,
        navigateToNextSocial,
        navigateToPreviousSocial,

        // Event handlers
        handleSocialKeyDown,
        handleSocialFocus,
        handleSocialBlur,

        // ARIA props generators
        getSocialAriaProps,
        getFooterAriaProps,
        getGlassLayerAriaProps,

        // Style generators
        getFocusIndicatorStyles,
        getHighContrastStyles,

        // Accessibility settings
        shouldReduceMotion: prefersReducedMotion,
        shouldDisableGlass: isHighContrast || prefersReducedMotion
    };
};

export default useFooterAccessibility;
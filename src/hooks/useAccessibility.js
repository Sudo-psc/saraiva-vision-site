import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for managing accessibility features in enhanced components
 * Provides utilities for focus management, ARIA announcements, and keyboard navigation
 */
export const useAccessibility = ({
    enableAnnouncements = true,
    enableFocusManagement = true,
    enableKeyboardNavigation = true
} = {}) => {
    const [isHighContrast, setIsHighContrast] = useState(false);
    const [isKeyboardUser, setIsKeyboardUser] = useState(false);
    const [lastFocusedElement, setLastFocusedElement] = useState(null);
    const announcementRef = useRef(null);
    const focusTimeoutRef = useRef(null);

    // Detect high contrast mode
    useEffect(() => {
        const detectHighContrast = () => {
            // Create a test element to detect high contrast mode
            const testElement = document.createElement('div');
            testElement.style.position = 'absolute';
            testElement.style.left = '-9999px';
            testElement.style.color = 'rgb(31, 41, 55)'; // slate-700
            testElement.style.backgroundColor = 'rgb(31, 41, 55)';
            document.body.appendChild(testElement);

            const computedStyle = window.getComputedStyle(testElement);
            const isHighContrastMode = computedStyle.color !== computedStyle.backgroundColor;

            document.body.removeChild(testElement);
            setIsHighContrast(isHighContrastMode);
        };

        detectHighContrast();

        // Listen for changes in system preferences
        const mediaQuery = window.matchMedia('(prefers-contrast: high)');
        const handleContrastChange = (e) => {
            setIsHighContrast(e.matches);
        };

        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleContrastChange);
        } else {
            // Fallback for older browsers
            mediaQuery.addListener(handleContrastChange);
        }

        return () => {
            if (mediaQuery.removeEventListener) {
                mediaQuery.removeEventListener('change', handleContrastChange);
            } else {
                mediaQuery.removeListener(handleContrastChange);
            }
        };
    }, []);

    // Detect keyboard usage
    useEffect(() => {
        if (!enableKeyboardNavigation) return;

        const handleKeyDown = (event) => {
            if (event.key === 'Tab') {
                setIsKeyboardUser(true);
            }
        };

        const handleMouseDown = () => {
            setIsKeyboardUser(false);
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleMouseDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleMouseDown);
        };
    }, [enableKeyboardNavigation]);

    // Create or get announcement element
    const getAnnouncementElement = useCallback(() => {
        if (!enableAnnouncements) return null;

        if (!announcementRef.current) {
            const element = document.createElement('div');
            element.setAttribute('aria-live', 'polite');
            element.setAttribute('aria-atomic', 'true');
            element.className = 'sr-only';
            element.id = 'accessibility-announcements';
            document.body.appendChild(element);
            announcementRef.current = element;
        }
        return announcementRef.current;
    }, [enableAnnouncements]);

    // Announce message to screen readers
    const announce = useCallback((message, priority = 'polite') => {
        if (!enableAnnouncements || !message) return;

        const element = getAnnouncementElement();
        if (!element) return;

        // Clear previous announcement
        element.textContent = '';
        element.setAttribute('aria-live', priority);

        // Set new announcement after a brief delay to ensure it's read
        setTimeout(() => {
            element.textContent = message;
        }, 100);

        // Clear announcement after it's been read
        setTimeout(() => {
            if (element.textContent === message) {
                element.textContent = '';
            }
        }, 3000);
    }, [enableAnnouncements, getAnnouncementElement]);

    // Focus management utilities
    const saveFocus = useCallback(() => {
        if (!enableFocusManagement) return;
        setLastFocusedElement(document.activeElement);
    }, [enableFocusManagement]);

    const restoreFocus = useCallback(() => {
        if (!enableFocusManagement || !lastFocusedElement) return;

        if (focusTimeoutRef.current) {
            clearTimeout(focusTimeoutRef.current);
        }

        focusTimeoutRef.current = setTimeout(() => {
            if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
                try {
                    lastFocusedElement.focus();
                } catch (error) {
                    console.warn('Failed to restore focus:', error);
                }
            }
            setLastFocusedElement(null);
        }, 100);
    }, [enableFocusManagement, lastFocusedElement]);

    const trapFocus = useCallback((containerElement) => {
        if (!enableFocusManagement || !containerElement) return () => { };

        const focusableElements = containerElement.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleKeyDown = (event) => {
            if (event.key !== 'Tab') return;

            if (event.shiftKey) {
                if (document.activeElement === firstElement) {
                    event.preventDefault();
                    lastElement?.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    event.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        containerElement.addEventListener('keydown', handleKeyDown);

        return () => {
            containerElement.removeEventListener('keydown', handleKeyDown);
        };
    }, [enableFocusManagement]);

    // Generate accessible IDs
    const generateId = useCallback((prefix = 'accessible') => {
        return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
    }, []);

    // Get ARIA attributes for enhanced elements
    const getAriaAttributes = useCallback((type, options = {}) => {
        const baseAttributes = {};

        switch (type) {
            case 'social-icon':
                return {
                    role: 'button',
                    'aria-label': options.label || `Visit ${options.name} page`,
                    'aria-describedby': options.describedBy,
                    tabIndex: 0,
                    ...baseAttributes
                };

            case 'scroll-button':
                return {
                    role: 'button',
                    'aria-label': options.label || 'Scroll to top of page',
                    'aria-describedby': options.describedBy,
                    tabIndex: 0,
                    ...baseAttributes
                };

            case 'glass-container':
                return {
                    role: options.role || 'region',
                    'aria-label': options.label,
                    'aria-describedby': options.describedBy,
                    ...baseAttributes
                };

            case 'animated-element':
                return {
                    'aria-hidden': options.decorative ? 'true' : 'false',
                    role: options.decorative ? 'presentation' : undefined,
                    ...baseAttributes
                };

            default:
                return baseAttributes;
        }
    }, []);

    // Check if animations should be disabled for accessibility
    const shouldDisableAnimations = useCallback(() => {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }, []);

    // Get focus styles that work with glass effects
    const getFocusStyles = useCallback((options = {}) => {
        const {
            glassEffect = false,
            highContrast = isHighContrast,
            color = 'blue'
        } = options;

        if (highContrast) {
            return {
                outline: '2px solid ButtonText',
                outlineOffset: '2px',
                backgroundColor: 'ButtonFace',
                color: 'ButtonText'
            };
        }

        const colorMap = {
            blue: {
                ring: 'ring-blue-400',
                shadow: 'shadow-blue-500/25'
            },
            white: {
                ring: 'ring-white',
                shadow: 'shadow-white/25'
            },
            slate: {
                ring: 'ring-slate-400',
                shadow: 'shadow-slate-500/25'
            }
        };

        const colors = colorMap[color] || colorMap.blue;

        return {
            className: [
                'focus:outline-none',
                `focus:ring-2 focus:${colors.ring}`,
                'focus:ring-offset-2',
                glassEffect ? 'focus:ring-offset-transparent' : 'focus:ring-offset-slate-800',
                `focus:shadow-lg focus:${colors.shadow}`
            ].join(' ')
        };
    }, [isHighContrast]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (announcementRef.current && document.body.contains(announcementRef.current)) {
                document.body.removeChild(announcementRef.current);
            }
            if (focusTimeoutRef.current) {
                clearTimeout(focusTimeoutRef.current);
            }
        };
    }, []);

    return {
        // State
        isHighContrast,
        isKeyboardUser,

        // Announcement utilities
        announce,

        // Focus management
        saveFocus,
        restoreFocus,
        trapFocus,

        // Utility functions
        generateId,
        getAriaAttributes,
        shouldDisableAnimations,
        getFocusStyles
    };
};

export default useAccessibility;
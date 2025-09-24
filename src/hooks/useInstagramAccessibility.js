import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for Instagram component accessibility features
 * Provides keyboard navigation, screen reader support, and ARIA management
 */
const useInstagramAccessibility = ({
    enableKeyboardNavigation = true,
    enableScreenReader = true,
    enableFocusManagement = true,
    announceUpdates = true
}) => {
    // State for accessibility features
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const [announcements, setAnnouncements] = useState([]);
    const [keyboardMode, setKeyboardMode] = useState(false);
    const [screenReaderActive, setScreenReaderActive] = useState(false);

    // Refs for managing focus and announcements
    const announcementRef = useRef(null);
    const focusableElementsRef = useRef([]);
    const lastAnnouncementRef = useRef('');

    // Detect screen reader usage
    useEffect(() => {
        const detectScreenReader = () => {
            // Check for common screen reader indicators
            const hasScreenReader =
                window.speechSynthesis ||
                navigator.userAgent.includes('NVDA') ||
                navigator.userAgent.includes('JAWS') ||
                navigator.userAgent.includes('VoiceOver') ||
                document.querySelector('[aria-live]') !== null;

            setScreenReaderActive(hasScreenReader);
        };

        detectScreenReader();

        // Listen for screen reader specific events
        const handleFocus = () => setScreenReaderActive(true);
        document.addEventListener('focusin', handleFocus, { once: true });

        return () => {
            document.removeEventListener('focusin', handleFocus);
        };
    }, []);

    // Keyboard navigation detection
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Tab' || event.key === 'ArrowUp' || event.key === 'ArrowDown' ||
                event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                setKeyboardMode(true);
            }
        };

        const handleMouseDown = () => {
            setKeyboardMode(false);
        };

        if (enableKeyboardNavigation) {
            document.addEventListener('keydown', handleKeyDown);
            document.addEventListener('mousedown', handleMouseDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleMouseDown);
        };
    }, [enableKeyboardNavigation]);

    // Announce content updates to screen readers
    const announce = useCallback((message, priority = 'polite') => {
        if (!enableScreenReader || !announceUpdates || !message) return;

        // Avoid duplicate announcements
        if (message === lastAnnouncementRef.current) return;
        lastAnnouncementRef.current = message;

        const announcement = {
            id: Date.now(),
            message,
            priority,
            timestamp: new Date()
        };

        setAnnouncements(prev => [...prev.slice(-4), announcement]);

        // Clear announcement after delay
        setTimeout(() => {
            setAnnouncements(prev => prev.filter(a => a.id !== announcement.id));
        }, 5000);
    }, [enableScreenReader, announceUpdates]);

    // Generate accessible descriptions for posts
    const generatePostDescription = useCallback((post) => {
        if (!post) return '';

        const parts = [];

        // Media type
        if (post.media_type) {
            parts.push(`${post.media_type.toLowerCase().replace('_', ' ')}`);
        }

        // Username
        if (post.username) {
            parts.push(`by ${post.username}`);
        }

        // Caption (truncated)
        if (post.caption) {
            const caption = post.caption.length > 100
                ? post.caption.substring(0, 100) + '...'
                : post.caption;
            parts.push(`Caption: ${caption}`);
        }

        // Timestamp
        if (post.timestamp) {
            const date = new Date(post.timestamp);
            parts.push(`Posted ${date.toLocaleDateString()}`);
        }

        // Stats
        if (post.stats) {
            const statsParts = [];
            if (post.stats.likes) statsParts.push(`${post.stats.likes} likes`);
            if (post.stats.comments) statsParts.push(`${post.stats.comments} comments`);
            if (statsParts.length > 0) {
                parts.push(statsParts.join(', '));
            }
        }

        return parts.join('. ');
    }, []);

    // Generate ARIA labels for interactive elements
    const generateAriaLabel = useCallback((element, context = {}) => {
        switch (element) {
            case 'post':
                return `Instagram post. ${generatePostDescription(context.post)}. Click to open on Instagram.`;

            case 'refresh':
                return 'Refresh Instagram posts';

            case 'expand-caption':
                return context.expanded ? 'Show less of caption' : 'Show more of caption';

            case 'stats-tooltip':
                return 'View detailed engagement statistics';

            case 'grid-navigation':
                return `Navigate Instagram posts. ${context.current} of ${context.total}`;

            default:
                return '';
        }
    }, [generatePostDescription]);

    // Keyboard navigation handlers
    const handleKeyNavigation = useCallback((event, items = [], onSelect = null) => {
        if (!enableKeyboardNavigation || !items.length) return false;

        const { key } = event;
        let newIndex = focusedIndex;

        switch (key) {
            case 'ArrowUp':
            case 'ArrowLeft':
                event.preventDefault();
                newIndex = focusedIndex <= 0 ? items.length - 1 : focusedIndex - 1;
                break;

            case 'ArrowDown':
            case 'ArrowRight':
                event.preventDefault();
                newIndex = focusedIndex >= items.length - 1 ? 0 : focusedIndex + 1;
                break;

            case 'Home':
                event.preventDefault();
                newIndex = 0;
                break;

            case 'End':
                event.preventDefault();
                newIndex = items.length - 1;
                break;

            case 'Enter':
            case ' ':
                event.preventDefault();
                if (onSelect && focusedIndex >= 0 && focusedIndex < items.length) {
                    onSelect(items[focusedIndex], focusedIndex);
                }
                return true;

            case 'Escape':
                event.preventDefault();
                setFocusedIndex(-1);
                return true;

            default:
                return false;
        }

        setFocusedIndex(newIndex);

        // Focus the element if focus management is enabled
        if (enableFocusManagement && focusableElementsRef.current[newIndex]) {
            focusableElementsRef.current[newIndex].focus();
        }

        return true;
    }, [focusedIndex, enableKeyboardNavigation, enableFocusManagement]);

    // Register focusable elements
    const registerFocusableElements = useCallback((elements) => {
        focusableElementsRef.current = elements;
    }, []);

    // Focus management utilities
    const focusElement = useCallback((index) => {
        if (!enableFocusManagement || !focusableElementsRef.current[index]) return;

        focusableElementsRef.current[index].focus();
        setFocusedIndex(index);
    }, [enableFocusManagement]);

    const focusFirst = useCallback(() => {
        focusElement(0);
    }, [focusElement]);

    const focusLast = useCallback(() => {
        focusElement(focusableElementsRef.current.length - 1);
    }, [focusElement]);

    // Generate skip links for better navigation
    const generateSkipLinks = useCallback((sections = []) => {
        return sections.map((section, index) => ({
            id: `skip-to-${section.id}`,
            href: `#${section.id}`,
            label: `Skip to ${section.label}`,
            index
        }));
    }, []);

    // ARIA live region management
    const createLiveRegion = useCallback((priority = 'polite') => {
        return {
            'aria-live': priority,
            'aria-atomic': 'true',
            'aria-relevant': 'additions text'
        };
    }, []);

    // High contrast mode detection
    const [highContrastMode, setHighContrastMode] = useState(false);

    useEffect(() => {
        const checkHighContrast = () => {
            // Check for Windows high contrast mode
            const isHighContrast = window.matchMedia('(prefers-contrast: high)').matches ||
                window.matchMedia('(-ms-high-contrast: active)').matches ||
                window.matchMedia('(-ms-high-contrast: black-on-white)').matches ||
                window.matchMedia('(-ms-high-contrast: white-on-black)').matches;

            setHighContrastMode(isHighContrast);
        };

        checkHighContrast();

        // Listen for changes
        const mediaQueries = [
            window.matchMedia('(prefers-contrast: high)'),
            window.matchMedia('(-ms-high-contrast: active)')
        ];

        mediaQueries.forEach(mq => {
            if (mq.addEventListener) {
                mq.addEventListener('change', checkHighContrast);
            } else {
                // Fallback for older browsers
                mq.addListener(checkHighContrast);
            }
        });

        return () => {
            mediaQueries.forEach(mq => {
                if (mq.removeEventListener) {
                    mq.removeEventListener('change', checkHighContrast);
                } else {
                    mq.removeListener(checkHighContrast);
                }
            });
        };
    }, []);

    // Accessibility validation
    const validateAccessibility = useCallback((element) => {
        const issues = [];

        if (!element) return issues;

        // Check for missing alt text on images
        const images = element.querySelectorAll('img');
        images.forEach((img, index) => {
            if (!img.alt && !img.getAttribute('aria-label')) {
                issues.push({
                    type: 'missing-alt-text',
                    element: `Image ${index + 1}`,
                    severity: 'error'
                });
            }
        });

        // Check for missing ARIA labels on interactive elements
        const interactive = element.querySelectorAll('button, a, [role="button"]');
        interactive.forEach((el, index) => {
            if (!el.getAttribute('aria-label') && !el.textContent.trim()) {
                issues.push({
                    type: 'missing-aria-label',
                    element: `Interactive element ${index + 1}`,
                    severity: 'error'
                });
            }
        });

        // Check for proper heading structure
        const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let lastLevel = 0;
        headings.forEach((heading, index) => {
            const level = parseInt(heading.tagName.charAt(1));
            if (level > lastLevel + 1) {
                issues.push({
                    type: 'heading-structure',
                    element: `Heading ${index + 1} (${heading.tagName})`,
                    severity: 'warning'
                });
            }
            lastLevel = level;
        });

        return issues;
    }, []);

    return {
        // State
        focusedIndex,
        keyboardMode,
        screenReaderActive,
        highContrastMode,
        announcements,

        // Functions
        announce,
        generatePostDescription,
        generateAriaLabel,
        handleKeyNavigation,
        registerFocusableElements,
        focusElement,
        focusFirst,
        focusLast,
        generateSkipLinks,
        createLiveRegion,
        validateAccessibility,

        // Utilities
        setFocusedIndex,
        setKeyboardMode
    };
};

export default useInstagramAccessibility;
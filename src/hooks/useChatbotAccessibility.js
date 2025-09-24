import { useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for chatbot accessibility features
 * 
 * Provides WCAG 2.1 AA compliance features including:
 * - Screen reader announcements
 * - Keyboard navigation
 * - Focus management
 * - ARIA attributes
 */
export const useChatbotAccessibility = () => {
    const announcementRef = useRef(null);
    const focusHistoryRef = useRef([]);

    // Initialize announcement area
    useEffect(() => {
        // Create or find announcement area
        let announcementArea = document.getElementById('chat-announcements');
        if (!announcementArea) {
            announcementArea = document.createElement('div');
            announcementArea.id = 'chat-announcements';
            announcementArea.setAttribute('aria-live', 'polite');
            announcementArea.setAttribute('aria-atomic', 'true');
            announcementArea.className = 'sr-only';
            document.body.appendChild(announcementArea);
        }
        announcementRef.current = announcementArea;

        return () => {
            // Cleanup on unmount
            if (announcementRef.current && announcementRef.current.parentNode) {
                announcementRef.current.parentNode.removeChild(announcementRef.current);
            }
        };
    }, []);

    // Announce messages to screen readers
    const announceMessage = useCallback((message, priority = 'polite') => {
        if (!announcementRef.current) return;

        // Clear previous announcement
        announcementRef.current.textContent = '';

        // Set new announcement with slight delay to ensure screen readers pick it up
        setTimeout(() => {
            if (announcementRef.current) {
                announcementRef.current.setAttribute('aria-live', priority);
                announcementRef.current.textContent = `Nova mensagem do assistente: ${message}`;
            }
        }, 100);

        // Clear announcement after a delay to avoid repetition
        setTimeout(() => {
            if (announcementRef.current) {
                announcementRef.current.textContent = '';
            }
        }, 3000);
    }, []);

    // Announce system messages
    const announceSystemMessage = useCallback((message) => {
        announceMessage(message, 'assertive');
    }, [announceMessage]);

    // Focus management utilities
    const focusManagement = {
        // Store current focus for restoration
        storeFocus: useCallback(() => {
            const activeElement = document.activeElement;
            if (activeElement && activeElement !== document.body) {
                focusHistoryRef.current.push(activeElement);
            }
        }, []),

        // Restore previous focus
        restoreFocus: useCallback(() => {
            const lastFocused = focusHistoryRef.current.pop();
            if (lastFocused && typeof lastFocused.focus === 'function') {
                try {
                    lastFocused.focus();
                } catch (error) {
                    console.warn('Could not restore focus:', error);
                }
            }
        }, []),

        // Focus trap for modal-like behavior
        trapFocus: useCallback((container) => {
            if (!container) return null;

            const focusableElements = container.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );

            const firstFocusable = focusableElements[0];
            const lastFocusable = focusableElements[focusableElements.length - 1];

            const handleTabKey = (e) => {
                if (e.key !== 'Tab') return;

                if (e.shiftKey) {
                    // Shift + Tab
                    if (document.activeElement === firstFocusable) {
                        e.preventDefault();
                        lastFocusable?.focus();
                    }
                } else {
                    // Tab
                    if (document.activeElement === lastFocusable) {
                        e.preventDefault();
                        firstFocusable?.focus();
                    }
                }
            };

            container.addEventListener('keydown', handleTabKey);

            return () => {
                container.removeEventListener('keydown', handleTabKey);
            };
        }, []),

        // Get focus props for elements
        getFocusProps: useCallback(() => ({
            onFocus: (e) => {
                // Add focus ring for keyboard users
                if (e.target.matches(':focus-visible')) {
                    e.target.classList.add('keyboard-focus');
                }
            },
            onBlur: (e) => {
                e.target.classList.remove('keyboard-focus');
            }
        }), [])
    };

    // Keyboard navigation utilities
    const keyboardNavigation = {
        // Handle arrow key navigation in message list
        handleMessageNavigation: useCallback((e, messageElements) => {
            if (!messageElements || messageElements.length === 0) return;

            const currentIndex = Array.from(messageElements).findIndex(
                el => el.contains(document.activeElement)
            );

            let nextIndex = currentIndex;

            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    nextIndex = Math.max(0, currentIndex - 1);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    nextIndex = Math.min(messageElements.length - 1, currentIndex + 1);
                    break;
                case 'Home':
                    e.preventDefault();
                    nextIndex = 0;
                    break;
                case 'End':
                    e.preventDefault();
                    nextIndex = messageElements.length - 1;
                    break;
                default:
                    return;
            }

            const targetElement = messageElements[nextIndex];
            if (targetElement) {
                const focusableChild = targetElement.querySelector('button, [href], [tabindex]:not([tabindex="-1"])');
                if (focusableChild) {
                    focusableChild.focus();
                } else {
                    targetElement.focus();
                }
            }
        }, []),

        // Get keyboard navigation props for input
        getInputProps: useCallback(() => ({
            onKeyDown: (e) => {
                // Handle Escape to close
                if (e.key === 'Escape') {
                    announceSystemMessage('Assistente virtual fechado');
                }

                // Handle Ctrl+A to select all
                if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
                    // Let default behavior handle this
                    return;
                }
            }
        }), [announceSystemMessage]),

        // Handle quick action navigation
        handleQuickActionNavigation: useCallback((e, actionElements) => {
            if (!actionElements || actionElements.length === 0) return;

            const currentIndex = Array.from(actionElements).findIndex(
                el => el === document.activeElement
            );

            let nextIndex = currentIndex;

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    nextIndex = currentIndex > 0 ? currentIndex - 1 : actionElements.length - 1;
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    nextIndex = currentIndex < actionElements.length - 1 ? currentIndex + 1 : 0;
                    break;
                default:
                    return;
            }

            actionElements[nextIndex]?.focus();
        }, [])
    };

    // High contrast and reduced motion detection
    const accessibilityPreferences = {
        prefersReducedMotion: useCallback(() => {
            return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        }, []),

        prefersHighContrast: useCallback(() => {
            return window.matchMedia('(prefers-contrast: high)').matches;
        }, []),

        prefersDarkMode: useCallback(() => {
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }, [])
    };

    // ARIA utilities
    const ariaUtils = {
        // Generate unique IDs for ARIA relationships
        generateId: useCallback((prefix = 'chatbot') => {
            return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }, []),

        // Get ARIA props for messages
        getMessageProps: useCallback((message, index, total) => ({
            role: 'article',
            'aria-label': `${message.role === 'user' ? 'Sua mensagem' : 'Resposta do assistente'} ${index + 1} de ${total}`,
            'aria-describedby': message.metadata?.containsMedicalContent ? 'medical-disclaimer' : undefined,
            tabIndex: -1
        }), []),

        // Get ARIA props for input
        getInputAriaProps: useCallback((messageCount) => ({
            'aria-label': 'Digite sua mensagem para o assistente virtual',
            'aria-describedby': 'input-help chat-status',
            'aria-expanded': 'true',
            'aria-haspopup': 'false',
            role: 'textbox',
            'aria-multiline': 'false'
        }), [])
    };

    return {
        announceMessage,
        announceSystemMessage,
        focusManagement,
        keyboardNavigation,
        accessibilityPreferences,
        ariaUtils
    };
};
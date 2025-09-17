/**
 * useFocusTrap Hook
 * Provides focus trapping functionality for modals and dialogs
 * Ensures keyboard accessibility compliance with WCAG 2.1 guidelines
 */

import { useEffect, useRef } from 'react';

// Selector for focusable elements
const FOCUSABLE_SELECTOR = `
  a[href]:not([tabindex="-1"]),
  button:not([disabled]):not([tabindex="-1"]),
  textarea:not([disabled]):not([tabindex="-1"]),
  input:not([disabled]):not([tabindex="-1"]),
  select:not([disabled]):not([tabindex="-1"]),
  [tabindex]:not([tabindex="-1"])
`;

export function useFocusTrap(isActive = false, options = {}) {
  const containerRef = useRef(null);
  const previousActiveElement = useRef(null);
  
  const {
    // Auto-focus first element when trap activates
    autoFocus = true,
    // Return focus to previous element when deactivating
    returnFocus = true,
    // Allow clicking outside to maintain focus
    clickOutsideDeactivates = false,
    // Callback when escape key is pressed
    onEscape
  } = options;

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(FOCUSABLE_SELECTOR);
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];

    // Store currently focused element to restore later
    if (returnFocus && document.activeElement) {
      previousActiveElement.current = document.activeElement;
    }

    // Auto-focus first element if enabled
    if (autoFocus && firstFocusableElement) {
      // Small delay to ensure element is rendered
      setTimeout(() => {
        firstFocusableElement.focus();
      }, 100);
    }

    // Handle tab key navigation
    const handleTabKey = (e) => {
      if (e.key !== 'Tab' || focusableElements.length === 0) return;

      if (focusableElements.length === 1) {
        // If only one focusable element, prevent tabbing away
        e.preventDefault();
        firstFocusableElement.focus();
        return;
      }

      // Forward tab
      if (!e.shiftKey) {
        if (document.activeElement === lastFocusableElement) {
          e.preventDefault();
          firstFocusableElement.focus();
        }
      }
      // Backward tab (Shift + Tab)
      else {
        if (document.activeElement === firstFocusableElement) {
          e.preventDefault();
          lastFocusableElement.focus();
        }
      }
    };

    // Handle escape key
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        if (onEscape) {
          onEscape();
        }
      }
    };

    // Handle clicks outside (if enabled)
    const handleClickOutside = (e) => {
      if (clickOutsideDeactivates && !container.contains(e.target)) {
        if (onEscape) {
          onEscape();
        }
      }
    };

    // Prevent focus from escaping the container
    const handleFocusOut = (e) => {
      // If focus moves outside the container, bring it back
      if (!container.contains(e.relatedTarget)) {
        e.preventDefault();
        if (firstFocusableElement) {
          firstFocusableElement.focus();
        }
      }
    };

    // Add event listeners
    document.addEventListener('keydown', handleTabKey);
    document.addEventListener('keydown', handleEscapeKey);
    container.addEventListener('focusout', handleFocusOut);
    
    if (clickOutsideDeactivates) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup function
    return () => {
      document.removeEventListener('keydown', handleTabKey);
      document.removeEventListener('keydown', handleEscapeKey);
      container.removeEventListener('focusout', handleFocusOut);
      
      if (clickOutsideDeactivates) {
        document.removeEventListener('mousedown', handleClickOutside);
      }

      // Restore focus to previous element
      if (returnFocus && previousActiveElement.current) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
            try {
              previousActiveElement.current.focus();
            } catch (error) {
              console.warn('Error restoring focus:', error);
            }
          }
        }, 100);
      }
    };
  }, [isActive, autoFocus, returnFocus, clickOutsideDeactivates, onEscape]);

  return containerRef;
}

// Alternative simple focus trap for basic use cases
export function useSimpleFocusTrap(isActive, onEscape) {
  return useFocusTrap(isActive, {
    autoFocus: true,
    returnFocus: true,
    clickOutsideDeactivates: false,
    onEscape
  });
}

export default useFocusTrap;
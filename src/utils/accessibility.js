/**
 * Accessibility utilities for carousel autoplay functionality
 * Supporting WCAG 2.1 AA compliance
 */

/**
 * Checks if user prefers reduced motion
 * @returns {boolean} True if user prefers reduced motion
 */
export const prefersReducedMotion = () => {
	if (typeof window === 'undefined') return false;

	try {
		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		return mediaQuery.matches;
	} catch (error) {
		console.warn('Error detecting prefers-reduced-motion:', error);
		return false;
	}
};

/**
 * Creates ARIA live announcement for screen readers
 * @param {string} message - Message to announce
 * @param {string} priority - 'polite' or 'assertive'
 */
export const announceToScreenReader = (message, priority = 'polite') => {
	if (typeof document === 'undefined') return;

	const announcement = document.createElement('div');
	announcement.setAttribute('aria-live', priority);
	announcement.setAttribute('aria-atomic', 'true');
	announcement.className = 'sr-only';
	announcement.textContent = message;

	document.body.appendChild(announcement);

	// Remove after announcement
	setTimeout(() => {
		if (document.body.contains(announcement)) {
			document.body.removeChild(announcement);
		}
	}, 1000);
};

/**
 * Generates accessible carousel navigation labels
 * @param {number} currentIndex - Current slide index (0-based)
 * @param {number} totalSlides - Total number of slides
 * @param {function} t - Translation function
 * @returns {object} Accessibility labels
 */
export const getCarouselAccessibilityLabels = (currentIndex, totalSlides, t) => {
	return {
		container: t('carousel.container.label', {
			current: currentIndex + 1,
			total: totalSlides
		}),
		previous: t('carousel.controls.previous'),
		next: t('carousel.controls.next'),
		playPause: t('carousel.controls.playPause'),
		slideChanged: t('carousel.announcements.slideChanged', {
			current: currentIndex + 1,
			total: totalSlides
		})
	};
};

/**
 * Checks if element is focusable
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} True if element is focusable
 */
export const isFocusable = (element) => {
	if (!element) return false;

	const focusableSelectors = [
		'a[href]',
		'button:not([disabled])',
		'input:not([disabled])',
		'select:not([disabled])',
		'textarea:not([disabled])',
		'[tabindex]:not([tabindex="-1"])'
	];

	return focusableSelectors.some(selector =>
		element.matches(selector) || element.querySelector(selector)
	);
};

/**
 * Manages focus trap for carousel during keyboard navigation
 * @param {HTMLElement} container - Carousel container
 * @param {boolean} isActive - Whether focus trap is active
 */
export const manageFocusTrap = (container, isActive) => {
	if (!container) return;

	const focusableElements = container.querySelectorAll(
		'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
	);

	if (isActive && focusableElements.length > 0) {
		const firstElement = focusableElements[0];
		const lastElement = focusableElements[focusableElements.length - 1];

		const handleTabKey = (e) => {
			if (e.key === 'Tab') {
				if (e.shiftKey) {
					if (document.activeElement === firstElement) {
						e.preventDefault();
						lastElement.focus();
					}
				} else {
					if (document.activeElement === lastElement) {
						e.preventDefault();
						firstElement.focus();
					}
				}
			}
		};

		container.addEventListener('keydown', handleTabKey);

		// Return cleanup function
		return () => {
			container.removeEventListener('keydown', handleTabKey);
		};
	}

	return () => { }; // No-op cleanup
};

/**
 * Validates touch target sizes for accessibility (minimum 44px)
 * @param {HTMLElement} element - Element to validate
 * @returns {boolean} True if touch target is accessible
 */
export const isAccessibleTouchTarget = (element) => {
	if (!element) return false;

	const rect = element.getBoundingClientRect();
	const MIN_SIZE = 44; // WCAG minimum touch target size

	return rect.width >= MIN_SIZE && rect.height >= MIN_SIZE;
};

/**
 * CSS classes for screen reader only content
 */
export const SR_ONLY_CLASS = 'sr-only';

/**
 * Default CSS for screen reader only content
 * Should be included in global styles
 */
export const SR_ONLY_STYLES = `
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
`;

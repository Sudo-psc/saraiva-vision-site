/**
 * Test utilities for autoplay carousel functionality
 * Supports testing timers, DOM interactions, and accessibility
 */

import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Mock implementation for timers in autoplay tests
 */
export const mockTimers = () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.runOnlyPendingTimers();
		vi.useRealTimers();
	});
};

/**
 * Mock implementation for reduced motion media query
 * @param {boolean} matches - Whether prefers-reduced-motion matches
 */
export const mockReducedMotion = (matches = false) => {
	const mockMatchMedia = vi.fn((query) => ({
		matches: query === '(prefers-reduced-motion: reduce)' ? matches : false,
		media: query,
		onchange: null,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	}));

	Object.defineProperty(window, 'matchMedia', {
		writable: true,
		value: mockMatchMedia,
	});

	return mockMatchMedia;
};

/**
 * Mock implementation for page visibility API
 * @param {string} visibilityState - 'visible' | 'hidden' | 'prerender'
 */
export const mockPageVisibility = (visibilityState = 'visible') => {
	Object.defineProperty(document, 'visibilityState', {
		writable: true,
		value: visibilityState,
	});

	Object.defineProperty(document, 'hidden', {
		writable: true,
		value: visibilityState === 'hidden',
	});

	const visibilityChangeEvent = new Event('visibilitychange');

	return {
		changeVisibility: (newState) => {
			document.visibilityState = newState;
			document.hidden = newState === 'hidden';
			document.dispatchEvent(visibilityChangeEvent);
		}
	};
};

/**
 * Mock implementation for ResizeObserver
 */
export const mockResizeObserver = () => {
	const mockResizeObserver = vi.fn(() => ({
		observe: vi.fn(),
		unobserve: vi.fn(),
		disconnect: vi.fn(),
	}));

	global.ResizeObserver = mockResizeObserver;
	return mockResizeObserver;
};

/**
 * Mock implementation for Intersection Observer
 */
export const mockIntersectionObserver = () => {
	const mockIntersectionObserver = vi.fn(() => ({
		observe: vi.fn(),
		unobserve: vi.fn(),
		disconnect: vi.fn(),
	}));

	global.IntersectionObserver = mockIntersectionObserver;
	return mockIntersectionObserver;
};

/**
 * Waits for autoplay progression with timeout
 * @param {number} expectedSlide - Expected slide index
 * @param {number} timeout - Timeout in milliseconds
 */
export const waitForAutoplayProgression = async (expectedSlide, timeout = 5000) => {
	return waitFor(() => {
		const carousel = screen.getByTestId('services-carousel');
		expect(carousel).toHaveAttribute('data-current-index', expectedSlide.toString());
	}, { timeout });
};

/**
 * Simulates touch gesture for mobile testing
 * @param {HTMLElement} element - Element to touch
 * @param {object} gesture - Gesture configuration
 */
export const simulateTouchGesture = async (element, gesture) => {
	const { startX = 0, startY = 0, endX = 0, endY = 0, duration = 300 } = gesture;

	fireEvent.touchStart(element, {
		touches: [{ clientX: startX, clientY: startY }]
	});

	// Simulate movement
	const steps = 10;
	const stepX = (endX - startX) / steps;
	const stepY = (endY - startY) / steps;

	for (let i = 1; i <= steps; i++) {
		await new Promise(resolve => setTimeout(resolve, duration / steps));
		fireEvent.touchMove(element, {
			touches: [{
				clientX: startX + (stepX * i),
				clientY: startY + (stepY * i)
			}]
		});
	}

	fireEvent.touchEnd(element);
};

/**
 * Keyboard navigation helpers
 */
export const keyboardNavigation = {
	arrowRight: (element) => fireEvent.keyDown(element, { key: 'ArrowRight' }),
	arrowLeft: (element) => fireEvent.keyDown(element, { key: 'ArrowLeft' }),
	space: (element) => fireEvent.keyDown(element, { key: ' ' }),
	enter: (element) => fireEvent.keyDown(element, { key: 'Enter' }),
	tab: (element) => fireEvent.keyDown(element, { key: 'Tab' }),
	shiftTab: (element) => fireEvent.keyDown(element, { key: 'Tab', shiftKey: true })
};

/**
 * Performance measurement helpers
 */
export const performanceHelpers = {
	measureFPS: (duration = 1000) => {
		let frameCount = 0;
		let startTime = performance.now();

		const countFrames = () => {
			frameCount++;
			if (performance.now() - startTime < duration) {
				requestAnimationFrame(countFrames);
			}
		};

		requestAnimationFrame(countFrames);

		return new Promise(resolve => {
			setTimeout(() => {
				const fps = frameCount / (duration / 1000);
				resolve(fps);
			}, duration);
		});
	},

	measureTransitionTime: async (element, trigger) => {
		const startTime = performance.now();

		return new Promise(resolve => {
			const observer = new MutationObserver(() => {
				const endTime = performance.now();
				observer.disconnect();
				resolve(endTime - startTime);
			});

			observer.observe(element, {
				attributes: true,
				attributeFilter: ['data-current-index']
			});

			trigger();
		});
	}
};

/**
 * Accessibility testing helpers
 */
export const accessibilityHelpers = {
	checkAriaAttributes: (element, expectedAttributes) => {
		Object.entries(expectedAttributes).forEach(([attr, value]) => {
			expect(element).toHaveAttribute(attr, value);
		});
	},

	checkFocusManagement: async (container) => {
		const focusableElements = container.querySelectorAll(
			'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
		);

		// Test tab navigation
		for (let i = 0; i < focusableElements.length; i++) {
			keyboardNavigation.tab(container);
			await waitFor(() => {
				expect(focusableElements[i]).toHaveFocus();
			});
		}
	},

	checkScreenReaderAnnouncements: () => {
		const liveRegions = document.querySelectorAll('[aria-live]');
		return Array.from(liveRegions).map(region => ({
			priority: region.getAttribute('aria-live'),
			content: region.textContent
		}));
	}
};

/**
 * Common test setup for carousel tests
 */
export const setupCarouselTest = (options = {}) => {
	const {
		enableReducedMotion = false,
		visibilityState = 'visible',
		mockTimers: shouldMockTimers = true
	} = options;

	// Setup mocks
	if (shouldMockTimers) mockTimers();
	mockReducedMotion(enableReducedMotion);
	mockPageVisibility(visibilityState);
	mockResizeObserver();
	mockIntersectionObserver();

	// Mock requestAnimationFrame for consistent testing
	global.requestAnimationFrame = vi.fn(cb => setTimeout(cb, 16));
	global.cancelAnimationFrame = vi.fn(id => clearTimeout(id));

	return {
		user: userEvent.setup(),
		waitForAutoplay: waitForAutoplayProgression,
		touch: simulateTouchGesture,
		keyboard: keyboardNavigation,
		performance: performanceHelpers,
		a11y: accessibilityHelpers
	};
};

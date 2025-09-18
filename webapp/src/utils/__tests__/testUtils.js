// src/utils/__tests__/testUtils.js
// Utilitários de teste para carrossel de serviços
import { vi } from 'vitest';

export function mockTimers() {
	vi.useFakeTimers();
}

export function restoreTimers() {
	vi.useRealTimers();
}

export function mockReducedMotion(value = true) {
	Object.defineProperty(window, 'matchMedia', {
		value: vi.fn().mockImplementation(query => ({
			matches: value,
			media: query,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn()
		}))
	});
}

export function simulateViewport(width = 1024) {
	window.innerWidth = width;
	window.dispatchEvent(new Event('resize'));
}

export function setupCarouselTest() {
	// Mock prefers-reduced-motion (default to reduced motion for tests)
	mockReducedMotion(true);
	
	// Mock framer-motion's useReducedMotion hook
	vi.doMock('framer-motion', async (importOriginal) => {
		const actual = await importOriginal();
		return {
			...actual,
			useReducedMotion: vi.fn(() => true), // Default to reduced motion
		};
	});
	
	// Mock timers
	mockTimers();
	
	// Mock document.hidden for page visibility
	Object.defineProperty(document, 'hidden', {
		value: false,
		writable: true
	});
	
	Object.defineProperty(document, 'visibilityState', {
		value: 'visible',
		writable: true
	});

	// Mock requestAnimationFrame
	global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16));
	global.cancelAnimationFrame = vi.fn(clearTimeout);

	return {
		mockTimers,
		restoreTimers,
		mockReducedMotion,
		simulateViewport
	};
}

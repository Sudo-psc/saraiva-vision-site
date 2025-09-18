/**
 * Contract tests for useAutoplayCarousel hook
 * These tests MUST FAIL before implementation
 * Testing the hook interface defined in contracts/useAutoplayCarousel.md
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAutoplayCarousel } from '@/hooks/useAutoplayCarousel';

// Mock framer-motion
vi.mock('framer-motion', async (importOriginal) => {
	const actual = await importOriginal();
	return {
		...actual,
		useReducedMotion: vi.fn(() => false), // Default to NO reduced motion for most tests
	};
});

describe('useAutoplayCarousel Hook Contract', () => {
	beforeEach(() => {
		setupCarouselTest();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('Hook Interface Contract', () => {
		it('should return the correct interface structure', () => {
			const { result } = renderHook(() =>
				useAutoplayCarousel({ totalSlides: 5 })
			);

			// Current State properties
			expect(result.current).toHaveProperty('currentIndex');
			expect(result.current).toHaveProperty('isPlaying');
			expect(result.current).toHaveProperty('isPaused');
			expect(result.current).toHaveProperty('isEnabled');
			expect(result.current).toHaveProperty('direction');

			// Control methods
			expect(result.current).toHaveProperty('play');
			expect(result.current).toHaveProperty('pause');
			expect(result.current).toHaveProperty('toggle');
			expect(result.current).toHaveProperty('stop');
			expect(result.current).toHaveProperty('next');
			expect(result.current).toHaveProperty('previous');
			expect(result.current).toHaveProperty('goTo');

			// Event handlers
			expect(result.current).toHaveProperty('handlers');
			expect(result.current.handlers).toHaveProperty('onMouseEnter');
			expect(result.current.handlers).toHaveProperty('onMouseLeave');
			expect(result.current.handlers).toHaveProperty('onFocus');
			expect(result.current.handlers).toHaveProperty('onBlur');
			expect(result.current.handlers).toHaveProperty('onTouchStart');
			expect(result.current.handlers).toHaveProperty('onTouchEnd');

			// Configuration
			expect(result.current).toHaveProperty('updateConfig');
			expect(result.current).toHaveProperty('config');

			// Progress info
			expect(result.current).toHaveProperty('progress');
			expect(result.current).toHaveProperty('timeRemaining');
		});

		it('should have correct initial state values', () => {
			const { result } = renderHook(() =>
				useAutoplayCarousel({ totalSlides: 5, initialIndex: 0 })
			);

			expect(result.current.currentIndex).toBe(0);
			expect(result.current.isPlaying).toBe(false); // Starts paused
			expect(result.current.isPaused).toBe(false);
			expect(result.current.isEnabled).toBe(true); // Unless prefers-reduced-motion
			expect(result.current.direction).toBe('forward');
			expect(result.current.progress).toBeGreaterThanOrEqual(0);
			expect(result.current.progress).toBeLessThanOrEqual(1);
		});

		it('should have all control methods as functions', () => {
			const { result } = renderHook(() =>
				useAutoplayCarousel({ totalSlides: 5 })
			);

			expect(typeof result.current.play).toBe('function');
			expect(typeof result.current.pause).toBe('function');
			expect(typeof result.current.toggle).toBe('function');
			expect(typeof result.current.stop).toBe('function');
			expect(typeof result.current.next).toBe('function');
			expect(typeof result.current.previous).toBe('function');
			expect(typeof result.current.goTo).toBe('function');
			expect(typeof result.current.updateConfig).toBe('function');
		});

		it('should have all event handlers as functions', () => {
			const { result } = renderHook(() =>
				useAutoplayCarousel({ totalSlides: 5 })
			);

			const { handlers } = result.current;
			expect(typeof handlers.onMouseEnter).toBe('function');
			expect(typeof handlers.onMouseLeave).toBe('function');
			expect(typeof handlers.onFocus).toBe('function');
			expect(typeof handlers.onBlur).toBe('function');
			expect(typeof handlers.onTouchStart).toBe('function');
			expect(typeof handlers.onTouchEnd).toBe('function');
		});
	});

	describe('Parameter Validation Contract', () => {
		it('should throw for invalid totalSlides', () => {
			expect(() => {
				renderHook(() => useAutoplayCarousel({ totalSlides: 0 }));
			}).toThrow('totalSlides must be > 0');

			expect(() => {
				renderHook(() => useAutoplayCarousel({ totalSlides: -1 }));
			}).toThrow('totalSlides must be > 0');
		});

		it('should throw for invalid initialIndex', () => {
			expect(() => {
				renderHook(() => useAutoplayCarousel({
					totalSlides: 5,
					initialIndex: 5 // >= totalSlides
				}));
			}).toThrow('initialIndex must be < totalSlides');

			expect(() => {
				renderHook(() => useAutoplayCarousel({
					totalSlides: 5,
					initialIndex: -1
				}));
			}).toThrow('initialIndex must be >= 0');
		});

		it('should validate configuration values', () => {
			expect(() => {
				renderHook(() => useAutoplayCarousel({
					totalSlides: 5,
					config: { defaultInterval: 500 } // Below minimum
				}));
			}).toThrow('defaultInterval must be >= 1000ms');

			expect(() => {
				renderHook(() => useAutoplayCarousel({
					totalSlides: 5,
					config: { transitionDuration: -100 } // Negative
				}));
			}).toThrow('transitionDuration must be >= 0');

			expect(() => {
				renderHook(() => useAutoplayCarousel({
					totalSlides: 5,
					config: { resumeDelay: 15000 } // Above maximum
				}));
			}).toThrow('resumeDelay must be <= 10000ms');
		});
	});

	describe('State Management Contract', () => {
		it('should handle play/pause state transitions correctly', () => {
			const { result } = renderHook(() =>
				useAutoplayCarousel({ totalSlides: 5 })
			);

			act(() => {
				result.current.play();
			});
			expect(result.current.isPlaying).toBe(true);
			expect(result.current.isPaused).toBe(false);

			act(() => {
				result.current.pause();
			});
			expect(result.current.isPlaying).toBe(false);
			expect(result.current.isPaused).toBe(true);
		});

		it('should respect totalSlides boundary in navigation', () => {
			const { result } = renderHook(() =>
				useAutoplayCarousel({ totalSlides: 3 })
			);

			const initialIndex = result.current.currentIndex;

			// Try to go to invalid index
			act(() => {
				result.current.goTo(3); // >= totalSlides
			});
			expect(result.current.currentIndex).toBe(initialIndex); // Should not change

			act(() => {
				result.current.goTo(-1); // Invalid negative
			});
			expect(result.current.currentIndex).toBe(initialIndex); // Should not change
		});

		it('should navigate correctly with next/previous', () => {
			const { result } = renderHook(() =>
				useAutoplayCarousel({ totalSlides: 3, initialIndex: 1 })
			);

			act(() => {
				result.current.next();
			});
			expect(result.current.currentIndex).toBe(2);
			expect(result.current.direction).toBe('forward');

			act(() => {
				result.current.previous();
			});
			expect(result.current.currentIndex).toBe(1);
			expect(result.current.direction).toBe('backward');
		});

		it('should wrap around boundaries correctly', () => {
			const { result } = renderHook(() =>
				useAutoplayCarousel({ totalSlides: 3 })
			);

			// Go to last slide
			act(() => {
				result.current.goTo(2);
			});

			// Next should wrap to beginning
			act(() => {
				result.current.next();
			});
			expect(result.current.currentIndex).toBe(0);

			// Previous should wrap to end
			act(() => {
				result.current.previous();
			});
			expect(result.current.currentIndex).toBe(2);
		});
	});

	describe('Event Handlers Contract', () => {
		it('should pause on mouse interaction', () => {
			const { result } = renderHook(() =>
				useAutoplayCarousel({ totalSlides: 5 })
			);

			act(() => {
				result.current.play();
			});
			expect(result.current.isPlaying).toBe(true);

			act(() => {
				result.current.handlers.onMouseEnter();
			});
			expect(result.current.isPlaying).toBe(false);
		});

		it('should resume after mouse interaction with delay', async () => {
			const { result } = renderHook(() =>
				useAutoplayCarousel({
					totalSlides: 5,
					config: { resumeDelay: 1000 }
				})
			);

			act(() => {
				result.current.play();
				result.current.handlers.onMouseEnter();
				result.current.handlers.onMouseLeave();
			});

			// Should not be playing immediately
			expect(result.current.isPlaying).toBe(false);

			// Advance timers past resume delay
			act(() => {
				vi.advanceTimersByTime(1500);
			});

			expect(result.current.isPlaying).toBe(true);
		});

		it('should pause on focus interactions', () => {
			const { result } = renderHook(() =>
				useAutoplayCarousel({ totalSlides: 5 })
			);

			act(() => {
				result.current.play();
				result.current.handlers.onFocus();
			});

			expect(result.current.isPlaying).toBe(false);
		});

		it('should pause on touch interactions', () => {
			const { result } = renderHook(() =>
				useAutoplayCarousel({ totalSlides: 5 })
			);

			act(() => {
				result.current.play();
				result.current.handlers.onTouchStart();
			});

			expect(result.current.isPlaying).toBe(false);
		});
	});

	describe('Configuration Contract', () => {
		it('should accept partial config updates', () => {
			const { result } = renderHook(() =>
				useAutoplayCarousel({ totalSlides: 5 })
			);

			act(() => {
				result.current.updateConfig({
					defaultInterval: 6000,
					pauseOnHover: false
				});
			});

			expect(result.current.config.defaultInterval).toBe(6000);
			expect(result.current.config.pauseOnHover).toBe(false);
			// Other config values should remain unchanged
			expect(result.current.config.respectReducedMotion).toBe(true);
		});

		it('should validate config changes', () => {
			const { result } = renderHook(() =>
				useAutoplayCarousel({ totalSlides: 5 })
			);

			expect(() => {
				act(() => {
					result.current.updateConfig({ defaultInterval: 500 }); // Below minimum
				});
			}).toThrow('defaultInterval must be >= 1000ms');
		});
	});

	describe('Accessibility Contract', () => {
		it('should respect prefers-reduced-motion', () => {
			// Override the hook to return true specifically for this test
			const framerMotion = require('framer-motion');
			const originalFn = framerMotion.useReducedMotion;
			framerMotion.useReducedMotion = vi.fn().mockReturnValue(true);
			
			const { result } = renderHook(() =>
				useAutoplayCarousel({ totalSlides: 5 })
			);

			expect(result.current.isEnabled).toBe(false); // Should be disabled due to mock
			expect(result.current.isPlaying).toBe(false);

			// Should not start autoplay when disabled
			act(() => {
				result.current.play();
			});
			expect(result.current.isPlaying).toBe(false);
			
			// Restore original function
			framerMotion.useReducedMotion = originalFn;
		});
	});

	describe('Progress Tracking Contract', () => {
		it('should provide progress information', () => {
			const { result } = renderHook(() =>
				useAutoplayCarousel({ totalSlides: 5 })
			);

			act(() => {
				result.current.play();
			});

			expect(result.current.progress).toBeGreaterThanOrEqual(0);
			expect(result.current.progress).toBeLessThanOrEqual(1);
			expect(result.current.timeRemaining).toBeGreaterThan(0);
			expect(result.current.timeRemaining).toBeLessThanOrEqual(
				result.current.config.defaultInterval
			);
		});

		it('should update progress over time', () => {
			const { result } = renderHook(() =>
				useAutoplayCarousel({
					totalSlides: 5,
					config: { defaultInterval: 2000 }
				})
			);

			act(() => {
				result.current.play();
			});

			const initialProgress = result.current.progress;
			const initialTimeRemaining = result.current.timeRemaining;

			act(() => {
				vi.advanceTimersByTime(500); // Advance half a second
			});

			expect(result.current.progress).toBeGreaterThan(initialProgress);
			expect(result.current.timeRemaining).toBeLessThan(initialTimeRemaining);
		});
	});

	describe('Callback Contract', () => {
		it('should call onSlideChange when slide changes', () => {
			const onSlideChange = vi.fn();
			const { result } = renderHook(() =>
				useAutoplayCarousel({
					totalSlides: 5,
					onSlideChange
				})
			);

			act(() => {
				result.current.next();
			});
			expect(onSlideChange).toHaveBeenCalledWith(1, 'forward');

			act(() => {
				result.current.previous();
			});
			expect(onSlideChange).toHaveBeenCalledWith(0, 'backward');
		});

		it('should call onSlideChange for autoplay transitions', async () => {
			const onSlideChange = vi.fn();
			const { result } = renderHook(() =>
				useAutoplayCarousel({
					totalSlides: 5,
					config: { defaultInterval: 1000 },
					onSlideChange
				})
			);

			act(() => {
				result.current.play();
				vi.advanceTimersByTime(1500); // Past interval
			});

			expect(onSlideChange).toHaveBeenCalledWith(
				expect.any(Number),
				'forward'
			);
		});
	});

	describe('Memory Management Contract', () => {
		it('should cleanup timers on unmount', () => {
			const { result, unmount } = renderHook(() =>
				useAutoplayCarousel({ totalSlides: 5 })
			);

			act(() => {
				result.current.play();
			});

			// Mock console to catch any timer warnings
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

			unmount();

			// Advance timers to see if any fire after unmount
			act(() => {
				vi.advanceTimersByTime(10000);
			});

			// Should not have any timer-related errors
			expect(consoleSpy).not.toHaveBeenCalled();

			consoleSpy.mockRestore();
		});
	});

	describe('Timer Precision Contract', () => {
		it('should respect timing intervals within tolerance', async () => {
			const onSlideChange = vi.fn();
			const { result } = renderHook(() =>
				useAutoplayCarousel({
					totalSlides: 5,
					config: { defaultInterval: 2000 },
					onSlideChange
				})
			);

			act(() => {
				result.current.play();
			});

			// Should not transition before interval
			act(() => {
				vi.advanceTimersByTime(1800);
			});
			expect(onSlideChange).not.toHaveBeenCalled();

			// Should transition after interval
			act(() => {
				vi.advanceTimersByTime(300); // Total: 2100ms
			});
			expect(onSlideChange).toHaveBeenCalledWith(1, 'forward');
		});
	});
});

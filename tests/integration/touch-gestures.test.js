/**
 * Integration test: Touch gestures
 * Tests swipe navigation and mobile touch interactions
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Services } from '@/components/Services';
import { setupCarouselTest } from '@/tests/utils/testUtils';

// Mock i18next
vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key, options) => {
			const translations = {
				'services.title': 'Our Services',
				'carousel.controls.previous': 'Previous slide',
				'carousel.controls.next': 'Next slide',
				'carousel.announcements.slideChanged': `Slide ${options?.current || 1} of ${options?.total || 1}`,
				'carousel.announcements.swipeDetected': 'Swipe gesture detected'
			};
			return translations[key] || key;
		}
	})
}));

describe('Integration: Touch Gestures', () => {
	let user;

	beforeEach(() => {
		// Mock touch environment
		Object.defineProperty(navigator, 'maxTouchPoints', {
			writable: true,
			value: 5
		});

		setupCarouselTest({
			enableReducedMotion: false,
			visibilityState: 'visible',
			mockTimers: true
		});

		user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('Scenario 5: Touch and Swipe Navigation 📱', () => {
		it('should navigate to next slide on swipe left', async () => {
			render(<Services />);

			const carousel = screen.getByTestId('services-carousel');

			expect(carousel).toHaveAttribute('data-current-index', '0');

			// Simulate swipe left gesture (next slide)
			const touchStart = new TouchEvent('touchstart', {
				touches: [{
					clientX: 200,
					clientY: 100,
					identifier: 0
				}]
			});

			const touchMove = new TouchEvent('touchmove', {
				touches: [{
					clientX: 100,
					clientY: 100,
					identifier: 0
				}]
			});

			const touchEnd = new TouchEvent('touchend', {
				changedTouches: [{
					clientX: 100,
					clientY: 100,
					identifier: 0
				}]
			});

			carousel.dispatchEvent(touchStart);
			carousel.dispatchEvent(touchMove);
			carousel.dispatchEvent(touchEnd);

			await waitFor(() => {
				expect(carousel).toHaveAttribute('data-current-index', '1');
			});
		});

		it('should navigate to previous slide on swipe right', async () => {
			render(<Services />);

			const carousel = screen.getByTestId('services-carousel');
			const nextButton = screen.getByRole('button', { name: /next slide/i });

			// Go to slide 2 first
			await user.click(nextButton);
			expect(carousel).toHaveAttribute('data-current-index', '1');

			// Simulate swipe right gesture (previous slide)
			const touchStart = new TouchEvent('touchstart', {
				touches: [{
					clientX: 100,
					clientY: 100,
					identifier: 0
				}]
			});

			const touchMove = new TouchEvent('touchmove', {
				touches: [{
					clientX: 200,
					clientY: 100,
					identifier: 0
				}]
			});

			const touchEnd = new TouchEvent('touchend', {
				changedTouches: [{
					clientX: 200,
					clientY: 100,
					identifier: 0
				}]
			});

			carousel.dispatchEvent(touchStart);
			carousel.dispatchEvent(touchMove);
			carousel.dispatchEvent(touchEnd);

			await waitFor(() => {
				expect(carousel).toHaveAttribute('data-current-index', '0');
			});
		});

		it('should require minimum swipe distance to trigger navigation', async () => {
			render(<Services />);

			const carousel = screen.getByTestId('services-carousel');

			expect(carousel).toHaveAttribute('data-current-index', '0');

			// Small swipe that shouldn't trigger navigation
			const touchStart = new TouchEvent('touchstart', {
				touches: [{ clientX: 100, clientY: 100, identifier: 0 }]
			});

			const touchMove = new TouchEvent('touchmove', {
				touches: [{ clientX: 90, clientY: 100, identifier: 0 }] // Only 10px movement
			});

			const touchEnd = new TouchEvent('touchend', {
				changedTouches: [{ clientX: 90, clientY: 100, identifier: 0 }]
			});

			carousel.dispatchEvent(touchStart);
			carousel.dispatchEvent(touchMove);
			carousel.dispatchEvent(touchEnd);

			// Should remain on first slide
			expect(carousel).toHaveAttribute('data-current-index', '0');
		});

		it('should pause autoplay during touch interaction', async () => {
			render(<Services />);

			const carousel = screen.getByTestId('services-carousel');

			// Start autoplay
			vi.advanceTimersByTime(1500);
			expect(carousel).toHaveAttribute('data-playing', 'true');

			// Touch start should pause autoplay
			const touchStart = new TouchEvent('touchstart', {
				touches: [{ clientX: 100, clientY: 100, identifier: 0 }]
			});

			carousel.dispatchEvent(touchStart);

			await waitFor(() => {
				expect(carousel).toHaveAttribute('data-playing', 'false');
				expect(carousel).toHaveAttribute('data-pause-reason', 'touch');
			});
		});

		it('should resume autoplay after touch interaction ends', async () => {
			render(<Services />);

			const carousel = screen.getByTestId('services-carousel');

			// Start autoplay and pause with touch
			vi.advanceTimersByTime(1500);

			const touchStart = new TouchEvent('touchstart', {
				touches: [{ clientX: 100, clientY: 100, identifier: 0 }]
			});

			const touchEnd = new TouchEvent('touchend', {
				changedTouches: [{ clientX: 100, clientY: 100, identifier: 0 }]
			});

			carousel.dispatchEvent(touchStart);
			expect(carousel).toHaveAttribute('data-playing', 'false');

			carousel.dispatchEvent(touchEnd);

			// Should resume after delay
			vi.advanceTimersByTime(1200);

			await waitFor(() => {
				expect(carousel).toHaveAttribute('data-playing', 'true');
			});
		});

		it('should handle multi-touch gestures gracefully', async () => {
			render(<Services />);

			const carousel = screen.getByTestId('services-carousel');

			expect(carousel).toHaveAttribute('data-current-index', '0');

			// Multi-touch should not trigger navigation
			const multiTouch = new TouchEvent('touchstart', {
				touches: [
					{ clientX: 100, clientY: 100, identifier: 0 },
					{ clientX: 200, clientY: 100, identifier: 1 }
				]
			});

			carousel.dispatchEvent(multiTouch);

			// Should not navigate
			expect(carousel).toHaveAttribute('data-current-index', '0');
		});

		it('should show visual feedback during swipe', async () => {
			render(<Services />);

			const carousel = screen.getByTestId('services-carousel');

			const touchStart = new TouchEvent('touchstart', {
				touches: [{ clientX: 200, clientY: 100, identifier: 0 }]
			});

			const touchMove = new TouchEvent('touchmove', {
				touches: [{ clientX: 150, clientY: 100, identifier: 0 }]
			});

			carousel.dispatchEvent(touchStart);
			carousel.dispatchEvent(touchMove);

			// Should show swipe indicator or visual feedback
			await waitFor(() => {
				expect(carousel).toHaveAttribute('data-swiping', 'true');
			});
		});

		it('should handle vertical scrolling vs horizontal swipes', async () => {
			render(<Services />);

			const carousel = screen.getByTestId('services-carousel');

			expect(carousel).toHaveAttribute('data-current-index', '0');

			// Vertical swipe should not trigger navigation
			const touchStart = new TouchEvent('touchstart', {
				touches: [{ clientX: 100, clientY: 100, identifier: 0 }]
			});

			const touchMove = new TouchEvent('touchmove', {
				touches: [{ clientX: 100, clientY: 50, identifier: 0 }] // Vertical movement
			});

			const touchEnd = new TouchEvent('touchend', {
				changedTouches: [{ clientX: 100, clientY: 50, identifier: 0 }]
			});

			carousel.dispatchEvent(touchStart);
			carousel.dispatchEvent(touchMove);
			carousel.dispatchEvent(touchEnd);

			// Should not navigate
			expect(carousel).toHaveAttribute('data-current-index', '0');
		});

		it('should support velocity-based swipe detection', async () => {
			render(<Services />);

			const carousel = screen.getByTestId('services-carousel');

			expect(carousel).toHaveAttribute('data-current-index', '0');

			// Fast swipe with shorter distance should still trigger navigation
			const touchStart = new TouchEvent('touchstart', {
				touches: [{ clientX: 150, clientY: 100, identifier: 0 }],
				timeStamp: 0
			});

			const touchMove = new TouchEvent('touchmove', {
				touches: [{ clientX: 120, clientY: 100, identifier: 0 }],
				timeStamp: 50 // Very fast movement
			});

			const touchEnd = new TouchEvent('touchend', {
				changedTouches: [{ clientX: 120, clientY: 100, identifier: 0 }],
				timeStamp: 100
			});

			carousel.dispatchEvent(touchStart);
			carousel.dispatchEvent(touchMove);
			carousel.dispatchEvent(touchEnd);

			await waitFor(() => {
				expect(carousel).toHaveAttribute('data-current-index', '1');
			});
		});

		it('should provide haptic feedback on supported devices', async () => {
			// Mock haptic feedback
			const mockVibrate = vi.fn();
			Object.defineProperty(navigator, 'vibrate', {
				writable: true,
				value: mockVibrate
			});

			render(<Services />);

			const carousel = screen.getByTestId('services-carousel');

			// Successful swipe should trigger haptic feedback
			const touchStart = new TouchEvent('touchstart', {
				touches: [{ clientX: 200, clientY: 100, identifier: 0 }]
			});

			const touchMove = new TouchEvent('touchmove', {
				touches: [{ clientX: 100, clientY: 100, identifier: 0 }]
			});

			const touchEnd = new TouchEvent('touchend', {
				changedTouches: [{ clientX: 100, clientY: 100, identifier: 0 }]
			});

			carousel.dispatchEvent(touchStart);
			carousel.dispatchEvent(touchMove);
			carousel.dispatchEvent(touchEnd);

			await waitFor(() => {
				expect(mockVibrate).toHaveBeenCalledWith(expect.any(Number));
			});
		});

		it('should handle touch cancellation correctly', async () => {
			render(<Services />);

			const carousel = screen.getByTestId('services-carousel');

			expect(carousel).toHaveAttribute('data-current-index', '0');

			// Start swipe
			const touchStart = new TouchEvent('touchstart', {
				touches: [{ clientX: 200, clientY: 100, identifier: 0 }]
			});

			const touchMove = new TouchEvent('touchmove', {
				touches: [{ clientX: 100, clientY: 100, identifier: 0 }]
			});

			// Touch cancelled instead of ended
			const touchCancel = new TouchEvent('touchcancel', {
				changedTouches: [{ clientX: 100, clientY: 100, identifier: 0 }]
			});

			carousel.dispatchEvent(touchStart);
			carousel.dispatchEvent(touchMove);
			carousel.dispatchEvent(touchCancel);

			// Should not navigate on cancellation
			expect(carousel).toHaveAttribute('data-current-index', '0');
		});

		it('should announce swipe actions to screen readers', async () => {
			render(<Services />);

			const carousel = screen.getByTestId('services-carousel');
			const liveRegion = screen.getByRole('status', { name: /carousel announcements/i });

			// Perform swipe
			const touchStart = new TouchEvent('touchstart', {
				touches: [{ clientX: 200, clientY: 100, identifier: 0 }]
			});

			const touchMove = new TouchEvent('touchmove', {
				touches: [{ clientX: 100, clientY: 100, identifier: 0 }]
			});

			const touchEnd = new TouchEvent('touchend', {
				changedTouches: [{ clientX: 100, clientY: 100, identifier: 0 }]
			});

			carousel.dispatchEvent(touchStart);
			carousel.dispatchEvent(touchMove);
			carousel.dispatchEvent(touchEnd);

			await waitFor(() => {
				expect(liveRegion).toHaveTextContent(/slide 2 of \d+/i);
			});
		});
	});

	describe('Touch Performance and Edge Cases', () => {
		it('should handle rapid touch events without performance issues', async () => {
			render(<Services />);

			const carousel = screen.getByTestId('services-carousel');

			// Rapid touch events
			for (let i = 0; i < 10; i++) {
				const touchStart = new TouchEvent('touchstart', {
					touches: [{ clientX: 100 + i, clientY: 100, identifier: 0 }]
				});

				const touchEnd = new TouchEvent('touchend', {
					changedTouches: [{ clientX: 100 + i, clientY: 100, identifier: 0 }]
				});

				carousel.dispatchEvent(touchStart);
				carousel.dispatchEvent(touchEnd);
			}

			// Should handle gracefully without errors
			expect(carousel).toBeInTheDocument();
		});

		it('should prevent default touch behavior during swipes', async () => {
			render(<Services />);

			const carousel = screen.getByTestId('services-carousel');

			const touchStart = new TouchEvent('touchstart', {
				touches: [{ clientX: 200, clientY: 100, identifier: 0 }]
			});

			const touchMove = new TouchEvent('touchmove', {
				touches: [{ clientX: 100, clientY: 100, identifier: 0 }]
			});

			// Mock preventDefault
			touchMove.preventDefault = vi.fn();

			carousel.dispatchEvent(touchStart);
			carousel.dispatchEvent(touchMove);

			// Should prevent default to avoid conflicts with browser scrolling
			expect(touchMove.preventDefault).toHaveBeenCalled();
		});

		it('should maintain smooth animations during touch', async () => {
			render(<Services />);

			const carousel = screen.getByTestId('services-carousel');

			// Mock requestAnimationFrame for animation tracking
			const rafCalls = [];
			global.requestAnimationFrame = vi.fn((cb) => {
				rafCalls.push(Date.now());
				return setTimeout(cb, 16);
			});

			// Perform swipe
			const touchStart = new TouchEvent('touchstart', {
				touches: [{ clientX: 200, clientY: 100, identifier: 0 }]
			});

			const touchMove = new TouchEvent('touchmove', {
				touches: [{ clientX: 100, clientY: 100, identifier: 0 }]
			});

			const touchEnd = new TouchEvent('touchend', {
				changedTouches: [{ clientX: 100, clientY: 100, identifier: 0 }]
			});

			carousel.dispatchEvent(touchStart);
			carousel.dispatchEvent(touchMove);
			carousel.dispatchEvent(touchEnd);

			// Should use animation frames for smooth transitions
			expect(rafCalls.length).toBeGreaterThan(0);
		});

		it('should handle edge swipes at carousel boundaries', async () => {
			render(<Services />);

			const carousel = screen.getByTestId('services-carousel');

			// Already on first slide, swipe right should wrap or provide feedback
			expect(carousel).toHaveAttribute('data-current-index', '0');

			const touchStart = new TouchEvent('touchstart', {
				touches: [{ clientX: 100, clientY: 100, identifier: 0 }]
			});

			const touchMove = new TouchEvent('touchmove', {
				touches: [{ clientX: 200, clientY: 100, identifier: 0 }]
			});

			const touchEnd = new TouchEvent('touchend', {
				changedTouches: [{ clientX: 200, clientY: 100, identifier: 0 }]
			});

			carousel.dispatchEvent(touchStart);
			carousel.dispatchEvent(touchMove);
			carousel.dispatchEvent(touchEnd);

			await waitFor(() => {
				// Should wrap to last slide
				const totalSlides = parseInt(carousel.getAttribute('data-total-slides') || '5');
				expect(carousel).toHaveAttribute('data-current-index', (totalSlides - 1).toString());
			});
		});

		it('should cleanup touch event listeners properly', async () => {
			const { unmount } = render(<Services />);

			const carousel = screen.getByTestId('services-carousel');

			// Start a touch interaction
			const touchStart = new TouchEvent('touchstart', {
				touches: [{ clientX: 100, clientY: 100, identifier: 0 }]
			});

			carousel.dispatchEvent(touchStart);

			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

			// Unmount during touch interaction
			unmount();

			// Should not cause memory leaks or errors
			expect(consoleSpy).not.toHaveBeenCalled();
			consoleSpy.mockRestore();
		});
	});

	describe('Accessibility and Touch', () => {
		it('should work with assistive touch technologies', async () => {
			render(<Services />);

			const carousel = screen.getByTestId('services-carousel');

			// Assistive touch should be able to trigger navigation
			const assistiveEvent = new CustomEvent('assistive-touch', {
				detail: { direction: 'next' }
			});

			carousel.dispatchEvent(assistiveEvent);

			await waitFor(() => {
				expect(carousel).toHaveAttribute('data-current-index', '1');
			});
		});

		it('should respect touch sensitivity preferences', async () => {
			// Mock reduced touch sensitivity
			Object.defineProperty(navigator, 'maxTouchPoints', {
				writable: true,
				value: 1 // Limited touch support
			});

			render(<Services />);

			const carousel = screen.getByTestId('services-carousel');

			// Should require more deliberate gestures
			const touchStart = new TouchEvent('touchstart', {
				touches: [{ clientX: 200, clientY: 100, identifier: 0 }]
			});

			const touchMove = new TouchEvent('touchmove', {
				touches: [{ clientX: 170, clientY: 100, identifier: 0 }] // Smaller movement
			});

			const touchEnd = new TouchEvent('touchend', {
				changedTouches: [{ clientX: 170, clientY: 100, identifier: 0 }]
			});

			carousel.dispatchEvent(touchStart);
			carousel.dispatchEvent(touchMove);
			carousel.dispatchEvent(touchEnd);

			// Should not navigate with reduced sensitivity
			expect(carousel).toHaveAttribute('data-current-index', '0');
		});
	});
});

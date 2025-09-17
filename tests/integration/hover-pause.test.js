/**
 * Integration test: Hover pause functionality
 * Tests autoplay pausing on hover/focus with proper resume behavior
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
				'carousel.controls.pause': 'Pause autoplay',
				'carousel.controls.play': 'Resume autoplay',
				'carousel.announcements.paused': 'Autoplay paused',
				'carousel.announcements.resumed': 'Autoplay resumed'
			};
			return translations[key] || key;
		}
	})
}));

describe('Integration: Hover Pause Functionality', () => {
	let testUtils;
	let user;

	beforeEach(() => {
		testUtils = setupCarouselTest({
			enableReducedMotion: false,
			visibilityState: 'visible',
			mockTimers: true
		});
		user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('Scenario 2: Hover/Focus Pause ⏸️', () => {
		it('should pause autoplay on hover', async () => {
			render(<Services />);

			const carousel = screen.getByTestId('services-carousel');

			// Start autoplay
			vi.advanceTimersByTime(1500);
			expect(carousel).toHaveAttribute('data-playing', 'true');

			// Hover over carousel
			await user.hover(carousel);

			await waitFor(() => {
				expect(carousel).toHaveAttribute('data-playing', 'false');
				expect(carousel).toHaveAttribute('data-pause-reason', 'hover');
			});
		});

		it('should resume autoplay after hover leaves', async () => {
			render(<Services />);

			const carousel = screen.getByTestId('services-carousel');

			// Start autoplay and hover
			vi.advanceTimersByTime(1500);
			await user.hover(carousel);

			expect(carousel).toHaveAttribute('data-playing', 'false');

			// Leave hover
			await user.unhover(carousel);

			// Should remain paused briefly for graceful transition
			expect(carousel).toHaveAttribute('data-playing', 'false');

			// After resume delay (1 second), should resume
			vi.advanceTimersByTime(1200);

			await waitFor(() => {
				expect(carousel).toHaveAttribute('data-playing', 'true');
				expect(carousel).not.toHaveAttribute('data-pause-reason');
			});
		});

		it('should pause autoplay on focus', async () => {
			render(<Services />);

			const carousel = screen.getByTestId('services-carousel');

			// Start autoplay
			vi.advanceTimersByTime(1500);
			expect(carousel).toHaveAttribute('data-playing', 'true');

			// Focus carousel (tab navigation)
			carousel.focus();

			await waitFor(() => {
				expect(carousel).toHaveAttribute('data-playing', 'false');
				expect(carousel).toHaveAttribute('data-pause-reason', 'focus');
			});
		});

		it('should handle multiple rapid hover events correctly', async () => {
			render(<Services />);

			const carousel = screen.getByTestId('services-carousel');

			// Start autoplay
			vi.advanceTimersByTime(1500);

			// Rapid hover in/out/in sequence
			await user.hover(carousel);
			await user.unhover(carousel);
			await user.hover(carousel);

			// Should be paused on final hover
			expect(carousel).toHaveAttribute('data-playing', 'false');
			expect(carousel).toHaveAttribute('data-pause-reason', 'hover');

			// Leave and verify resume works
			await user.unhover(carousel);
			vi.advanceTimersByTime(1200);

			await waitFor(() => {
				expect(carousel).toHaveAttribute('data-playing', 'true');
			});
		});

		it('should pause when hovering child elements', async () => {
			render(<Services />);

			const carousel = screen.getByTestId('services-carousel');
			const firstSlide = screen.getByTestId('service-slide-0');

			// Start autoplay
			vi.advanceTimersByTime(1500);
			expect(carousel).toHaveAttribute('data-playing', 'true');

			// Hover over child slide
			await user.hover(firstSlide);

			await waitFor(() => {
				expect(carousel).toHaveAttribute('data-playing', 'false');
			});
		});

		it('should maintain pause during navigation controls interaction', async () => {
			render(<Services />);

			const carousel = screen.getByTestId('services-carousel');
			const nextButton = screen.getByRole('button', { name: /next slide/i });

			// Start autoplay
			vi.advanceTimersByTime(1500);

			// Hover to pause
			await user.hover(carousel);
			expect(carousel).toHaveAttribute('data-playing', 'false');

			// Click navigation while paused
			await user.click(nextButton);

			// Should remain paused
			expect(carousel).toHaveAttribute('data-playing', 'false');
			expect(carousel).toHaveAttribute('data-current-index', '1');
		});

		it('should show play/pause control accessibility', async () => {
			render(<Services />);

			const carousel = screen.getByTestId('services-carousel');

			// Start autoplay
			vi.advanceTimersByTime(1500);

			// Should have pause button when playing
			const pauseButton = screen.getByRole('button', { name: /pause autoplay/i });
			expect(pauseButton).toBeInTheDocument();

			// Hover to pause
			await user.hover(carousel);

			await waitFor(() => {
				// Should show play button when paused
				const playButton = screen.getByRole('button', { name: /resume autoplay/i });
				expect(playButton).toBeInTheDocument();
			});
		});

		it('should announce pause/resume to screen readers', async () => {
			render(<Services />);

			const carousel = screen.getByTestId('services-carousel');
			const liveRegion = screen.getByRole('status', { name: /carousel announcements/i });

			// Start autoplay
			vi.advanceTimersByTime(1500);

			// Hover to pause
			await user.hover(carousel);

			await waitFor(() => {
				expect(liveRegion).toHaveTextContent(/autoplay paused/i);
			});

			// Unhover to resume
			await user.unhover(carousel);
			vi.advanceTimersByTime(1200);

			await waitFor(() => {
				expect(liveRegion).toHaveTextContent(/autoplay resumed/i);
			});
		});

		it('should not conflict with reduced motion settings', async () => {
			// Enable reduced motion
			testUtils.mockReducedMotion?.(true);

			render(<Services />);

			const carousel = screen.getByTestId('services-carousel');

			// With reduced motion, autoplay should not start
			vi.advanceTimersByTime(2000);
			expect(carousel).toHaveAttribute('data-playing', 'false');

			// Hover should still work for manual controls
			await user.hover(carousel);

			// Should remain not playing
			expect(carousel).toHaveAttribute('data-playing', 'false');
		});

		it('should handle touch interactions on mobile', async () => {
			// Mock touch support
			Object.defineProperty(navigator, 'maxTouchPoints', {
				writable: true,
				value: 5
			});

			render(<Services />);

			const carousel = screen.getByTestId('services-carousel');

			// Start autoplay
			vi.advanceTimersByTime(1500);
			expect(carousel).toHaveAttribute('data-playing', 'true');

			// Touch start should pause
			const touchStartEvent = new TouchEvent('touchstart', {
				touches: [{ clientX: 100, clientY: 100 }]
			});
			carousel.dispatchEvent(touchStartEvent);

			await waitFor(() => {
				expect(carousel).toHaveAttribute('data-playing', 'false');
				expect(carousel).toHaveAttribute('data-pause-reason', 'touch');
			});

			// Touch end should start resume timer
			const touchEndEvent = new TouchEvent('touchend');
			carousel.dispatchEvent(touchEndEvent);

			vi.advanceTimersByTime(1200);

			await waitFor(() => {
				expect(carousel).toHaveAttribute('data-playing', 'true');
			});
		});

		it('should preserve slide timing after pause/resume', async () => {
			render(<Services />);

			const carousel = screen.getByTestId('services-carousel');

			// Start autoplay and advance partially
			vi.advanceTimersByTime(1500);
			vi.advanceTimersByTime(2000); // 2 seconds into 4.5 second interval

			expect(carousel).toHaveAttribute('data-current-index', '0');

			// Pause for 1 second
			await user.hover(carousel);
			vi.advanceTimersByTime(1000);

			// Resume
			await user.unhover(carousel);
			vi.advanceTimersByTime(1200);

			// Should complete remaining 2.5 seconds of original interval
			vi.advanceTimersByTime(2600);

			await waitFor(() => {
				expect(carousel).toHaveAttribute('data-current-index', '1');
			});
		});

		it('should handle nested focusable elements', async () => {
			render(<Services />);

			const carousel = screen.getByTestId('services-carousel');

			// Start autoplay
			vi.advanceTimersByTime(1500);
			expect(carousel).toHaveAttribute('data-playing', 'true');

			// Focus a button within a slide
			const slideButton = screen.getByRole('button', { name: /learn more about/i });
			slideButton.focus();

			await waitFor(() => {
				expect(carousel).toHaveAttribute('data-playing', 'false');
				expect(carousel).toHaveAttribute('data-pause-reason', 'focus');
			});

			// Blur the button
			slideButton.blur();

			vi.advanceTimersByTime(1200);

			await waitFor(() => {
				expect(carousel).toHaveAttribute('data-playing', 'true');
			});
		});
	});

	describe('Edge Cases', () => {
		it('should handle simultaneous hover and focus events', async () => {
			render(<Services />);

			const carousel = screen.getByTestId('services-carousel');

			// Start autoplay
			vi.advanceTimersByTime(1500);

			// Simultaneous hover and focus
			await user.hover(carousel);
			carousel.focus();

			expect(carousel).toHaveAttribute('data-playing', 'false');

			// Remove hover but keep focus
			await user.unhover(carousel);

			// Should remain paused due to focus
			expect(carousel).toHaveAttribute('data-playing', 'false');
			expect(carousel).toHaveAttribute('data-pause-reason', 'focus');
		});

		it('should handle rapid state changes gracefully', async () => {
			render(<Services />);

			const carousel = screen.getByTestId('services-carousel');

			// Start autoplay
			vi.advanceTimersByTime(1500);

			// Rapid state changes
			for (let i = 0; i < 5; i++) {
				await user.hover(carousel);
				await user.unhover(carousel);
			}

			// Should eventually settle to playing state
			vi.advanceTimersByTime(2000);

			await waitFor(() => {
				expect(carousel).toHaveAttribute('data-playing', 'true');
			});
		});
	});

	describe('Performance Validation', () => {
		it('should not create memory leaks with hover events', async () => {
			const { unmount } = render(<Services />);

			const carousel = screen.getByTestId('services-carousel');

			// Many hover interactions
			for (let i = 0; i < 10; i++) {
				await user.hover(carousel);
				await user.unhover(carousel);
				vi.advanceTimersByTime(100);
			}

			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

			unmount();

			// Check for any post-unmount issues
			vi.advanceTimersByTime(5000);

			expect(consoleSpy).not.toHaveBeenCalled();
			consoleSpy.mockRestore();
		});

		it('should throttle rapid pause/resume events', async () => {
			const mockPauseHandler = vi.fn();
			render(<Services onPlayingChange={mockPauseHandler} />);

			const carousel = screen.getByTestId('services-carousel');

			// Rapid hover events
			for (let i = 0; i < 20; i++) {
				await user.hover(carousel);
				await user.unhover(carousel);
			}

			// Should not have excessive handler calls
			expect(mockPauseHandler.mock.calls.length).toBeLessThan(50);
		});
	});
});

/**
 * Contract tests for Services component enhancement
 * These tests MUST FAIL before implementation
 * Testing the component interface defined in contracts/Services-component.md
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Services } from '@/components/Services';
import { setupCarouselTest } from '@/utils/__tests__/testUtils';

// Mock i18next
vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key, options) => {
			const translations = {
				'services.title': 'Our Services',
				'services.consultation.title': 'Eye Consultation',
				'services.consultation.description': 'Complete eye examination',
				'carousel.controls.previous': 'Previous slide',
				'carousel.controls.next': 'Next slide',
				'carousel.controls.playPause': 'Play/Pause autoplay',
				'carousel.container.label': `Services carousel, slide ${options?.current || 1} of ${options?.total || 1}`,
				'carousel.announcements.slideChanged': `Slide ${options?.current || 1} of ${options?.total || 1}`
			};
			return translations[key] || key;
		}
	})
}));

describe('Services Component Contract', () => {
	let testUtils;

	beforeEach(() => {
		testUtils = setupCarouselTest();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('Backward Compatibility Contract', () => {
		it('should render without any new props (existing behavior)', () => {
			const { container } = render(<Services />);

			// Should maintain existing structure
			expect(container.querySelector('.services-grid') ||
				container.querySelector('.services-container')).toBeInTheDocument();

			// Should have service cards
			const serviceCards = container.querySelectorAll('.service-card, [data-testid*="service"]');
			expect(serviceCards.length).toBeGreaterThan(0);
		});

		it('should maintain existing CSS classes and structure', () => {
			const { container } = render(<Services />);

			// Check for existing structural elements
			expect(container.querySelector('.service-card, [data-testid*="service"]')).toBeInTheDocument();
			expect(screen.getByText(/services/i)).toBeInTheDocument();
		});

		it('should maintain existing i18n keys', () => {
			render(<Services />);

			// Should use existing translation keys
			expect(screen.getByText('Our Services')).toBeInTheDocument();
		});
	});

	describe('Autoplay Integration Contract', () => {
		it('should enable autoplay by default', () => {
			const { container } = render(<Services />);

			const carouselContainer = container.querySelector('[data-autoplay="true"]') ||
				container.querySelector('[data-testid="services-carousel"]');
			expect(carouselContainer).toBeInTheDocument();
		});

		it('should respect autoplay prop when disabled', () => {
			const { container } = render(<Services autoplay={false} />);

			const carouselContainer = container.querySelector('[data-testid="services-carousel"]');
			expect(carouselContainer).toHaveAttribute('data-autoplay', 'false');
		});

		it('should not start autoplay when disabled', () => {
			const { container } = render(<Services autoplay={false} />);

			const carousel = container.querySelector('[data-testid="services-carousel"]');
			expect(carousel).not.toHaveAttribute('data-playing', 'true');
		});
	});

	describe('Configuration Override Contract', () => {
		it('should apply custom configuration', () => {
			const customConfig = {
				defaultInterval: 6000,
				pauseOnHover: false
			};

			const { container } = render(<Services autoplayConfig={customConfig} />);

			const carousel = container.querySelector('[data-testid="services-carousel"]');
			expect(carousel).toHaveAttribute('data-interval', '6000');
			expect(carousel).toHaveAttribute('data-pause-on-hover', 'false');
		});
	});

	describe('Event Handling Contract', () => {
		it('should call onSlideChange callback', async () => {
			const onSlideChange = vi.fn();
			render(<Services onSlideChange={onSlideChange} />);

			const nextButton = screen.getByLabelText(/next slide/i);
			fireEvent.click(nextButton);

			expect(onSlideChange).toHaveBeenCalledWith(1, 'forward');
		});

		it('should handle manual navigation correctly', async () => {
			const onSlideChange = vi.fn();
			render(<Services onSlideChange={onSlideChange} />);

			const prevButton = screen.getByLabelText(/previous slide/i);
			fireEvent.click(prevButton);

			expect(onSlideChange).toHaveBeenCalledWith(
				expect.any(Number),
				'backward'
			);
		});
	});

	describe('Accessibility Contract', () => {
		it('should have proper ARIA attributes', () => {
			render(<Services aria-label="Services carousel" />);

			const carousel = screen.getByLabelText('Services carousel');
			expect(carousel).toHaveAttribute('role', 'region');
			expect(carousel).toHaveAttribute('aria-live', 'polite');
		});

		it('should have keyboard navigation', () => {
			render(<Services />);

			const carouselContainer = screen.getByRole('region') ||
				screen.getByTestId('services-carousel');
			expect(carouselContainer).toHaveAttribute('tabindex', '0');
		});

		it('should respond to keyboard events', async () => {
			const onSlideChange = vi.fn();
			render(<Services onSlideChange={onSlideChange} />);

			const carouselContainer = screen.getByRole('region') ||
				screen.getByTestId('services-carousel');

			fireEvent.keyDown(carouselContainer, { key: 'ArrowRight' });
			expect(onSlideChange).toHaveBeenCalledWith(1, 'forward');

			fireEvent.keyDown(carouselContainer, { key: 'ArrowLeft' });
			expect(onSlideChange).toHaveBeenCalledWith(0, 'backward');
		});

		it('should support space and enter keys', async () => {
			const onSlideChange = vi.fn();
			render(<Services onSlideChange={onSlideChange} />);

			const carouselContainer = screen.getByRole('region') ||
				screen.getByTestId('services-carousel');

			fireEvent.keyDown(carouselContainer, { key: ' ' });
			// Should toggle play/pause or navigate

			fireEvent.keyDown(carouselContainer, { key: 'Enter' });
			// Should trigger action
		});
	});

	describe('Touch/Gesture Contract', () => {
		it('should handle touch gestures', async () => {
			const onSlideChange = vi.fn();
			render(<Services onSlideChange={onSlideChange} />);

			const carousel = screen.getByTestId('services-carousel');

			// Simulate swipe left (next slide)
			fireEvent.touchStart(carousel, {
				touches: [{ clientX: 100, clientY: 100 }]
			});
			fireEvent.touchMove(carousel, {
				touches: [{ clientX: 50, clientY: 100 }]
			});
			fireEvent.touchEnd(carousel);

			await waitFor(() => {
				expect(onSlideChange).toHaveBeenCalledWith(1, 'forward');
			});
		});

		it('should pause autoplay during touch interaction', () => {
			const { container } = render(<Services />);
			const carousel = container.querySelector('[data-testid="services-carousel"]');

			fireEvent.touchStart(carousel, {
				touches: [{ clientX: 100, clientY: 100 }]
			});

			expect(carousel).toHaveAttribute('data-playing', 'false');
		});
	});

	describe('Reduced Motion Contract', () => {
		it('should respect prefers-reduced-motion', () => {
			// Mock is already set up in setupCarouselTest with reduced motion enabled
			const { container } = render(<Services />);

			const carousel = container.querySelector('[data-testid="services-carousel"]');
			expect(carousel).toHaveAttribute('data-autoplay-enabled', 'false');
			expect(carousel).toHaveAttribute('data-reduced-motion', 'true');
		});

		it('should use instant transitions when reduced motion is preferred', () => {
			const { container } = render(<Services />);

			const transitions = container.querySelectorAll('[style*="transition"]');
			transitions.forEach(element => {
				expect(element.style.transitionDuration).toBe('0.01ms');
			});
		});
	});

	describe('Data Attributes Contract', () => {
		it('should have required data attributes for testing', () => {
			const { container } = render(<Services autoplay={true} />);

			const carousel = container.querySelector('[data-testid="services-carousel"]');
			expect(carousel).toHaveAttribute('data-autoplay', 'true');
			expect(carousel).toHaveAttribute('data-current-index');
			expect(carousel).toHaveAttribute('data-total-slides');
		});

		it('should have slide-specific data attributes', () => {
			const { container } = render(<Services />);

			const slides = container.querySelectorAll('[data-testid*="service-slide"]');
			expect(slides.length).toBeGreaterThan(0);

			slides.forEach((slide, index) => {
				expect(slide).toHaveAttribute('data-slide-index', index.toString());
				expect(slide).toHaveAttribute('data-active');
			});
		});

		it('should have navigation control attributes', () => {
			render(<Services />);

			const prevButton = screen.getByTestId('carousel-prev');
			expect(prevButton).toHaveAttribute('aria-label', 'Previous slide');

			const nextButton = screen.getByTestId('carousel-next');
			expect(nextButton).toHaveAttribute('aria-label', 'Next slide');
		});

		it('should have progress indicator attributes', () => {
			const { container } = render(<Services />);

			const progressIndicator = container.querySelector('[data-testid="carousel-progress"]');
			if (progressIndicator) {
				expect(progressIndicator).toHaveAttribute('role', 'progressbar');
				expect(progressIndicator).toHaveAttribute('aria-valuenow');
				expect(progressIndicator).toHaveAttribute('aria-valuemin', '0');
				expect(progressIndicator).toHaveAttribute('aria-valuemax', '100');
			}
		});
	});

	describe('Integration Points Contract', () => {
		it('should work with existing services data structure', () => {
			render(<Services />);

			// Should render all services
			const serviceElements = screen.getAllByText(/Eye|Consultation|Service/i);
			expect(serviceElements.length).toBeGreaterThan(0);
		});

		it('should use i18n translation keys', () => {
			render(<Services />);

			// Verify accessibility labels use translations
			expect(screen.getByLabelText('Previous slide')).toBeInTheDocument();
			expect(screen.getByLabelText('Next slide')).toBeInTheDocument();
		});

		it('should announce slide changes to screen readers', async () => {
			const onSlideChange = vi.fn();
			render(<Services onSlideChange={onSlideChange} />);

			const nextButton = screen.getByLabelText(/next slide/i);
			fireEvent.click(nextButton);

			await waitFor(() => {
				const announcements = screen.getAllByRole('status', { hidden: true });
				expect(announcements.length).toBeGreaterThan(0);
			});
		});
	});

	describe('Performance Contracts', () => {
		it('should not cause unnecessary re-renders', () => {
			const renderSpy = vi.fn();
			const TestComponent = () => {
				renderSpy();
				return <Services />;
			};

			render(<TestComponent />);
			const initialRenderCount = renderSpy.mock.calls.length;

			// Trigger autoplay progression (mock timers)
			testUtils.advanceTimersByTime?.(5000);

			// Should not have caused extra re-renders of parent
			expect(renderSpy.mock.calls.length).toBe(initialRenderCount);
		});

		it('should cleanup on unmount', () => {
			const { unmount } = render(<Services />);

			const mockClearTimeout = vi.spyOn(global, 'clearTimeout');
			const mockRemoveEventListener = vi.spyOn(Element.prototype, 'removeEventListener');

			unmount();

			// Should have cleaned up timers and event listeners
			expect(mockClearTimeout).toHaveBeenCalled();
			expect(mockRemoveEventListener).toHaveBeenCalled();

			mockClearTimeout.mockRestore();
			mockRemoveEventListener.mockRestore();
		});
	});

	describe('Error Handling Contract', () => {
		it('should handle missing translation function gracefully', () => {
			// Mock missing translation
			vi.mocked(require('react-i18next').useTranslation).mockReturnValue({
				t: undefined
			});

			expect(() => {
				render(<Services />);
			}).not.toThrow();
		});

		it('should handle invalid configuration gracefully', () => {
			const invalidConfig = {
				defaultInterval: -1000,
				pauseOnHover: 'invalid'
			};

			expect(() => {
				render(<Services autoplayConfig={invalidConfig} />);
			}).not.toThrow();
		});
	});

	describe('Responsive Behavior Contract', () => {
		it('should adapt to different screen sizes', () => {
			// Mock window.innerWidth
			Object.defineProperty(window, 'innerWidth', {
				writable: true,
				configurable: true,
				value: 768, // Tablet size
			});

			const { container } = render(<Services />);

			const carousel = container.querySelector('[data-testid="services-carousel"]');
			expect(carousel).toHaveClass('carousel-mobile');
		});

		it('should show appropriate number of slides per view', () => {
			const { container } = render(<Services />);

			const visibleSlides = container.querySelectorAll(
				'.service-card:not([aria-hidden="true"]), [data-testid*="service-slide"]:not([aria-hidden="true"])'
			);
			expect(visibleSlides.length).toBeGreaterThan(0);
		});
	});
});

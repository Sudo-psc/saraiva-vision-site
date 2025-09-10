/**
 * Integration test: Navigation controls
 * Tests manual navigation with keyboard, touch, and mouse interactions
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
        'carousel.controls.goto': `Go to slide ${options?.index || 1}`,
        'carousel.announcements.slideChanged': `Slide ${options?.current || 1} of ${options?.total || 1}`,
        'carousel.announcements.userNavigated': 'User navigation detected, autoplay will resume after delay'
      };
      return translations[key] || key;
    }
  })
}));

describe('Integration: Navigation Controls', () => {
  let user;

  beforeEach(() => {
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

  describe('Scenario 3: Manual Navigation 🎮', () => {
    it('should navigate to next slide with next button', async () => {
      render(<Services />);

      const carousel = screen.getByTestId('services-carousel');
      const nextButton = screen.getByRole('button', { name: /next slide/i });
      
      expect(carousel).toHaveAttribute('data-current-index', '0');
      
      await user.click(nextButton);
      
      await waitFor(() => {
        expect(carousel).toHaveAttribute('data-current-index', '1');
      });
    });

    it('should navigate to previous slide with previous button', async () => {
      render(<Services />);

      const carousel = screen.getByTestId('services-carousel');
      const prevButton = screen.getByRole('button', { name: /previous slide/i });
      const nextButton = screen.getByRole('button', { name: /next slide/i });
      
      // Go to slide 2 first
      await user.click(nextButton);
      await user.click(nextButton);
      
      expect(carousel).toHaveAttribute('data-current-index', '2');
      
      // Go back to slide 1
      await user.click(prevButton);
      
      await waitFor(() => {
        expect(carousel).toHaveAttribute('data-current-index', '1');
      });
    });

    it('should navigate with keyboard arrow keys', async () => {
      render(<Services />);

      const carousel = screen.getByTestId('services-carousel');
      
      // Focus the carousel for keyboard navigation
      carousel.focus();
      
      expect(carousel).toHaveAttribute('data-current-index', '0');
      
      // Navigate with arrow keys
      await user.keyboard('{ArrowRight}');
      
      await waitFor(() => {
        expect(carousel).toHaveAttribute('data-current-index', '1');
      });
      
      await user.keyboard('{ArrowLeft}');
      
      await waitFor(() => {
        expect(carousel).toHaveAttribute('data-current-index', '0');
      });
    });

    it('should navigate with dot indicators', async () => {
      render(<Services />);

      const carousel = screen.getByTestId('services-carousel');
      const dotButton = screen.getByRole('button', { name: /go to slide 3/i });
      
      expect(carousel).toHaveAttribute('data-current-index', '0');
      
      await user.click(dotButton);
      
      await waitFor(() => {
        expect(carousel).toHaveAttribute('data-current-index', '2');
      });
    });

    it('should wrap around at boundaries', async () => {
      render(<Services />);

      const carousel = screen.getByTestId('services-carousel');
      const prevButton = screen.getByRole('button', { name: /previous slide/i });
      const nextButton = screen.getByRole('button', { name: /next slide/i });
      const totalSlides = parseInt(carousel.getAttribute('data-total-slides') || '5');
      
      // Go to last slide by clicking previous from first slide
      await user.click(prevButton);
      
      await waitFor(() => {
        expect(carousel).toHaveAttribute('data-current-index', (totalSlides - 1).toString());
      });
      
      // Go to first slide by clicking next from last slide
      await user.click(nextButton);
      
      await waitFor(() => {
        expect(carousel).toHaveAttribute('data-current-index', '0');
      });
    });

    it('should pause autoplay temporarily on manual navigation', async () => {
      render(<Services />);

      const carousel = screen.getByTestId('services-carousel');
      const nextButton = screen.getByRole('button', { name: /next slide/i });
      
      // Start autoplay
      vi.advanceTimersByTime(1500);
      expect(carousel).toHaveAttribute('data-playing', 'true');
      
      // Manual navigation should pause
      await user.click(nextButton);
      
      await waitFor(() => {
        expect(carousel).toHaveAttribute('data-playing', 'false');
        expect(carousel).toHaveAttribute('data-pause-reason', 'user-navigation');
      });
      
      // Should resume after delay (3 seconds)
      vi.advanceTimersByTime(3200);
      
      await waitFor(() => {
        expect(carousel).toHaveAttribute('data-playing', 'true');
      });
    });

    it('should handle touch swipe gestures', async () => {
      render(<Services />);

      const carousel = screen.getByTestId('services-carousel');
      
      expect(carousel).toHaveAttribute('data-current-index', '0');
      
      // Simulate swipe left (next slide)
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 200, clientY: 100 }]
      });
      const touchMove = new TouchEvent('touchmove', {
        touches: [{ clientX: 100, clientY: 100 }]
      });
      const touchEnd = new TouchEvent('touchend');
      
      carousel.dispatchEvent(touchStart);
      carousel.dispatchEvent(touchMove);
      carousel.dispatchEvent(touchEnd);
      
      await waitFor(() => {
        expect(carousel).toHaveAttribute('data-current-index', '1');
      });
    });

    it('should handle mouse wheel navigation', async () => {
      render(<Services />);

      const carousel = screen.getByTestId('services-carousel');
      
      expect(carousel).toHaveAttribute('data-current-index', '0');
      
      // Wheel down should go to next slide
      const wheelEvent = new WheelEvent('wheel', {
        deltaY: 100
      });
      carousel.dispatchEvent(wheelEvent);
      
      await waitFor(() => {
        expect(carousel).toHaveAttribute('data-current-index', '1');
      });
    });

    it('should show visual feedback for active slide', async () => {
      render(<Services />);

      const carousel = screen.getByTestId('services-carousel');
      const nextButton = screen.getByRole('button', { name: /next slide/i });
      
      // Check initial active state
      const firstSlide = screen.getByTestId('service-slide-0');
      expect(firstSlide).toHaveAttribute('data-active', 'true');
      
      // Navigate to next slide
      await user.click(nextButton);
      
      await waitFor(() => {
        const secondSlide = screen.getByTestId('service-slide-1');
        expect(secondSlide).toHaveAttribute('data-active', 'true');
        expect(firstSlide).toHaveAttribute('data-active', 'false');
      });
    });

    it('should update dot indicators correctly', async () => {
      render(<Services />);

      const nextButton = screen.getByRole('button', { name: /next slide/i });
      
      // Check initial dot state
      const firstDot = screen.getByRole('button', { name: /go to slide 1/i });
      expect(firstDot).toHaveAttribute('aria-current', 'true');
      
      // Navigate to next slide
      await user.click(nextButton);
      
      await waitFor(() => {
        const secondDot = screen.getByRole('button', { name: /go to slide 2/i });
        expect(secondDot).toHaveAttribute('aria-current', 'true');
        expect(firstDot).toHaveAttribute('aria-current', 'false');
      });
    });

    it('should announce navigation to screen readers', async () => {
      render(<Services />);

      const liveRegion = screen.getByRole('status', { name: /carousel announcements/i });
      const nextButton = screen.getByRole('button', { name: /next slide/i });
      
      await user.click(nextButton);
      
      await waitFor(() => {
        expect(liveRegion).toHaveTextContent(/slide 2 of \d+/i);
      });
    });

    it('should handle rapid navigation inputs gracefully', async () => {
      render(<Services />);

      const carousel = screen.getByTestId('services-carousel');
      const nextButton = screen.getByRole('button', { name: /next slide/i });
      
      // Rapid clicks
      for (let i = 0; i < 10; i++) {
        await user.click(nextButton);
      }
      
      // Should not break or have unexpected state
      await waitFor(() => {
        const currentIndex = parseInt(carousel.getAttribute('data-current-index') || '0');
        expect(currentIndex).toBeGreaterThanOrEqual(0);
        expect(currentIndex).toBeLessThan(10); // Reasonable bounds
      });
    });

    it('should maintain focus management during navigation', async () => {
      render(<Services />);

      const nextButton = screen.getByRole('button', { name: /next slide/i });
      
      // Focus and navigate
      nextButton.focus();
      await user.click(nextButton);
      
      // Focus should remain on navigation controls
      expect(document.activeElement).toBe(nextButton);
    });
  });

  describe('Accessibility Navigation', () => {
    it('should support Home/End key navigation', async () => {
      render(<Services />);

      const carousel = screen.getByTestId('services-carousel');
      const totalSlides = parseInt(carousel.getAttribute('data-total-slides') || '5');
      
      carousel.focus();
      
      // Go to last slide with End key
      await user.keyboard('{End}');
      
      await waitFor(() => {
        expect(carousel).toHaveAttribute('data-current-index', (totalSlides - 1).toString());
      });
      
      // Go to first slide with Home key
      await user.keyboard('{Home}');
      
      await waitFor(() => {
        expect(carousel).toHaveAttribute('data-current-index', '0');
      });
    });

    it('should support Page Up/Down navigation', async () => {
      render(<Services />);

      const carousel = screen.getByTestId('services-carousel');
      
      carousel.focus();
      
      // Page Down should advance multiple slides
      await user.keyboard('{PageDown}');
      
      await waitFor(() => {
        const currentIndex = parseInt(carousel.getAttribute('data-current-index') || '0');
        expect(currentIndex).toBeGreaterThan(0);
      });
    });

    it('should trap focus within carousel during navigation', async () => {
      render(<Services />);

      const carousel = screen.getByTestId('services-carousel');
      const nextButton = screen.getByRole('button', { name: /next slide/i });
      
      // Focus carousel
      carousel.focus();
      
      // Tab should cycle through carousel controls
      await user.tab();
      expect(document.activeElement).toBe(nextButton);
      
      // Shift+Tab should go back to carousel
      await user.tab({ shift: true });
      expect(document.activeElement).toBe(carousel);
    });

    it('should provide clear button labels', () => {
      render(<Services />);

      // All navigation buttons should have clear labels
      expect(screen.getByRole('button', { name: /previous slide/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next slide/i })).toBeInTheDocument();
      
      // Dot indicators should have slide numbers
      expect(screen.getByRole('button', { name: /go to slide 1/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go to slide 2/i })).toBeInTheDocument();
    });

    it('should support voice control patterns', async () => {
      render(<Services />);

      // Voice commands should be mappable to navigation
      const carousel = screen.getByTestId('services-carousel');
      
      expect(carousel).toHaveAttribute('data-current-index', '0');
      
      // Test programmatic navigation (voice control simulation)
      const navigateEvent = new CustomEvent('navigate', {
        detail: { direction: 'next' }
      });
      carousel.dispatchEvent(navigateEvent);
      
      await waitFor(() => {
        expect(carousel).toHaveAttribute('data-current-index', '1');
      });
    });
  });

  describe('Touch and Gesture Support', () => {
    it('should require minimum swipe distance', async () => {
      render(<Services />);

      const carousel = screen.getByTestId('services-carousel');
      
      // Small swipe should not trigger navigation
      const shortSwipe = [
        new TouchEvent('touchstart', { touches: [{ clientX: 100, clientY: 100 }] }),
        new TouchEvent('touchmove', { touches: [{ clientX: 90, clientY: 100 }] }),
        new TouchEvent('touchend')
      ];
      
      shortSwipe.forEach(event => carousel.dispatchEvent(event));
      
      // Should remain on first slide
      expect(carousel).toHaveAttribute('data-current-index', '0');
    });

    it('should handle multi-touch gestures gracefully', async () => {
      render(<Services />);

      const carousel = screen.getByTestId('services-carousel');
      
      expect(carousel).toHaveAttribute('data-current-index', '0');
      
      // Multi-touch should not trigger navigation
      const multiTouch = new TouchEvent('touchstart', {
        touches: [
          { clientX: 100, clientY: 100 },
          { clientX: 200, clientY: 100 }
        ]
      });
      
      carousel.dispatchEvent(multiTouch);
      
      // Should not navigate or crash
      expect(carousel).toHaveAttribute('data-current-index', '0');
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
      const nextButton = screen.getByRole('button', { name: /next slide/i });
      
      await user.click(nextButton);
      
      // Should trigger haptic feedback if available
      expect(mockVibrate).toHaveBeenCalledWith(expect.any(Number));
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should debounce rapid navigation inputs', async () => {
      const mockNavigate = vi.fn();
      render(<Services onSlideChange={mockNavigate} />);

      const nextButton = screen.getByRole('button', { name: /next slide/i });
      
      // Rapid clicks
      for (let i = 0; i < 5; i++) {
        await user.click(nextButton);
      }
      
      // Should have fewer calls than clicks due to debouncing
      expect(mockNavigate.mock.calls.length).toBeLessThan(5);
    });

    it('should handle navigation during transitions', async () => {
      render(<Services />);

      const carousel = screen.getByTestId('services-carousel');
      const nextButton = screen.getByRole('button', { name: /next slide/i });
      
      expect(carousel).toHaveAttribute('data-current-index', '0');
      
      // Start a transition
      await user.click(nextButton);
      
      // Immediate second navigation
      await user.click(nextButton);
      
      // Should handle gracefully
      await waitFor(() => {
        const currentIndex = parseInt(carousel.getAttribute('data-current-index') || '0');
        expect(currentIndex).toBeGreaterThan(0);
      });
    });

    it('should maintain performance with many slides', async () => {
      // Mock many slides
      vi.mock('@/lib/services', () => ({
        services: Array.from({ length: 50 }, (_, i) => ({
          id: `service-${i}`,
          title: `Service ${i}`,
          description: `Description ${i}`
        }))
      }));
      
      render(<Services />);

      const carousel = screen.getByTestId('services-carousel');
      const nextButton = screen.getByRole('button', { name: /next slide/i });
      
      expect(carousel).toHaveAttribute('data-current-index', '0');
      
      // Navigation should remain responsive
      const startTime = performance.now();
      await user.click(nextButton);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Should be fast
    });
  });
});

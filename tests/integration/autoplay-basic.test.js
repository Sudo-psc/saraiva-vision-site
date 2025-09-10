/**
 * Integration test: Basic autoplay functionality
 * Tests the complete autoplay flow from quickstart scenarios
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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
        'carousel.announcements.slideChanged': `Slide ${options?.current || 1} of ${options?.total || 1}`
      };
      return translations[key] || key;
    }
  })
}));

describe('Integration: Basic Autoplay Functionality', () => {
  let testUtils;

  beforeEach(() => {
    testUtils = setupCarouselTest({
      enableReducedMotion: false,
      visibilityState: 'visible',
      mockTimers: true
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Scenario 1: Basic Autoplay Functionality ⏯️', () => {
    it('should start autoplay automatically after initial delay', async () => {
      render(<Services />);

      const carousel = screen.getByTestId('services-carousel');
      
      // Initially should not be playing
      expect(carousel).toHaveAttribute('data-playing', 'false');
      
      // Advance past initial delay (1 second)
      vi.advanceTimersByTime(1500);
      
      // Should now be playing
      await waitFor(() => {
        expect(carousel).toHaveAttribute('data-playing', 'true');
      });
    });

    it('should advance slides every 4.5 seconds', async () => {
      render(<Services />);

      const carousel = screen.getByTestId('services-carousel');
      
      // Start autoplay
      vi.advanceTimersByTime(1500); // Past initial delay
      
      // Check initial slide
      expect(carousel).toHaveAttribute('data-current-index', '0');
      
      // Advance to next interval (4.5 seconds)
      vi.advanceTimersByTime(4600);
      
      await waitFor(() => {
        expect(carousel).toHaveAttribute('data-current-index', '1');
      });
      
      // Advance another interval
      vi.advanceTimersByTime(4600);
      
      await waitFor(() => {
        expect(carousel).toHaveAttribute('data-current-index', '2');
      });
    });

    it('should have smooth transitions with Framer Motion', async () => {
      render(<Services />);

      const carousel = screen.getByTestId('services-carousel');
      
      // Start autoplay and advance
      vi.advanceTimersByTime(1500);
      vi.advanceTimersByTime(4600);
      
      await waitFor(() => {
        // Should have motion classes or styles applied
        const activeSlide = carousel.querySelector('[data-active="true"]');
        expect(activeSlide).toHaveClass(/motion-|animate-|transition-/);
      });
    });

    it('should wrap to first slide after last slide', async () => {
      render(<Services />);

      const carousel = screen.getByTestId('services-carousel');
      const totalSlides = parseInt(carousel.getAttribute('data-total-slides') || '5');
      
      // Start autoplay
      vi.advanceTimersByTime(1500);
      
      // Navigate to last slide
      for (let i = 0; i < totalSlides; i++) {
        vi.advanceTimersByTime(4600);
        await waitFor(() => {
          expect(carousel).toHaveAttribute('data-current-index', ((i + 1) % totalSlides).toString());
        });
      }
      
      // Should be back at first slide
      expect(carousel).toHaveAttribute('data-current-index', '0');
    });

    it('should show progress indicator updates', async () => {
      render(<Services />);

      const progressIndicator = screen.getByTestId('carousel-progress');
      
      // Start autoplay
      vi.advanceTimersByTime(1500);
      
      const initialProgress = progressIndicator.getAttribute('aria-valuenow');
      
      // Advance partway through interval
      vi.advanceTimersByTime(2000); // 2 seconds into 4.5 second interval
      
      await waitFor(() => {
        const currentProgress = progressIndicator.getAttribute('aria-valuenow');
        expect(parseInt(currentProgress)).toBeGreaterThan(parseInt(initialProgress));
      });
    });

    it('should maintain consistent timing across multiple cycles', async () => {
      const mockSlideChange = vi.fn();
      render(<Services onSlideChange={mockSlideChange} />);

      // Start autoplay
      vi.advanceTimersByTime(1500);
      
      // Track timing of first few transitions
      const transitionTimes = [];
      
      for (let i = 0; i < 3; i++) {
        const startTime = Date.now();
        vi.advanceTimersByTime(4600);
        
        await waitFor(() => {
          expect(mockSlideChange).toHaveBeenCalledWith(i + 1, 'forward');
        });
        
        transitionTimes.push(Date.now() - startTime);
      }
      
      // All transitions should be within reasonable tolerance
      transitionTimes.forEach(time => {
        expect(time).toBeLessThan(5000); // Should not exceed interval significantly
      });
    });

    it('should handle visibility change correctly', async () => {
      const { changeVisibility } = testUtils.mockPageVisibility?.('visible') || {};
      render(<Services />);

      const carousel = screen.getByTestId('services-carousel');
      
      // Start autoplay
      vi.advanceTimersByTime(1500);
      expect(carousel).toHaveAttribute('data-playing', 'true');
      
      // Tab becomes hidden
      changeVisibility?.('hidden');
      
      await waitFor(() => {
        expect(carousel).toHaveAttribute('data-playing', 'false');
      });
      
      // Tab becomes visible again
      changeVisibility?.('visible');
      
      await waitFor(() => {
        expect(carousel).toHaveAttribute('data-playing', 'true');
      });
    });

    it('should maintain autoplay state across user interactions', async () => {
      render(<Services />);

      const carousel = screen.getByTestId('services-carousel');
      
      // Start autoplay
      vi.advanceTimersByTime(1500);
      expect(carousel).toHaveAttribute('data-playing', 'true');
      
      // Brief interaction should not permanently stop autoplay
      const mockPointerEnter = new Event('pointerenter');
      carousel.dispatchEvent(mockPointerEnter);
      
      expect(carousel).toHaveAttribute('data-playing', 'false');
      
      const mockPointerLeave = new Event('pointerleave');
      carousel.dispatchEvent(mockPointerLeave);
      
      // Should resume after delay
      vi.advanceTimersByTime(1500); // Resume delay
      
      await waitFor(() => {
        expect(carousel).toHaveAttribute('data-playing', 'true');
      });
    });
  });

  describe('Performance Validation', () => {
    it('should not cause memory leaks during extended autoplay', async () => {
      const { unmount } = render(<Services />);

      // Start autoplay and run for extended period
      vi.advanceTimersByTime(1500);
      
      // Simulate many autoplay cycles
      for (let i = 0; i < 10; i++) {
        vi.advanceTimersByTime(4600);
      }
      
      // Monitor for any console errors or warnings
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      unmount();
      
      // Advance timers to check for post-unmount issues
      vi.advanceTimersByTime(10000);
      
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should maintain smooth frame rate during autoplay', async () => {
      render(<Services />);

      // Mock requestAnimationFrame to track calls
      const rafCalls = [];
      global.requestAnimationFrame = vi.fn((cb) => {
        rafCalls.push(Date.now());
        return setTimeout(cb, 16);
      });

      // Start autoplay
      vi.advanceTimersByTime(1500);
      vi.advanceTimersByTime(4600);

      // Should not have excessive RAF calls
      expect(rafCalls.length).toBeLessThan(100); // Reasonable threshold
    });
  });

  describe('Error Handling', () => {
    it('should handle missing services data gracefully', () => {
      // Mock empty services
      vi.mock('@/lib/services', () => ({
        services: []
      }));

      expect(() => {
        render(<Services />);
      }).not.toThrow();
    });

    it('should handle timer errors gracefully', async () => {
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = vi.fn(() => {
        throw new Error('Timer error');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<Services />);

      // Should not crash the component
      expect(screen.getByTestId('services-carousel')).toBeInTheDocument();

      global.setTimeout = originalSetTimeout;
      consoleSpy.mockRestore();
    });
  });
});

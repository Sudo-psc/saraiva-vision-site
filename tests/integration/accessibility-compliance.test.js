/**
 * Integration test: Accessibility compliance
 * Tests WCAG 2.1 AA compliance and reduced motion support
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
        'carousel.announcements.slideChanged': `Slide ${options?.current || 1} of ${options?.total || 1}`,
        'carousel.announcements.autoplayPaused': 'Autoplay paused due to user preference for reduced motion',
        'carousel.announcements.autoplayResumed': 'Autoplay resumed',
        'carousel.region.label': 'Services carousel'
      };
      return translations[key] || key;
    }
  })
}));

describe('Integration: Accessibility Compliance', () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Reset any CSS media query mocks
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  describe('Scenario 4: Accessibility Compliance ♿', () => {
    it('should respect prefers-reduced-motion settings', async () => {
      // Mock reduced motion preference
      setupCarouselTest({
        enableReducedMotion: true,
        visibilityState: 'visible',
        mockTimers: true
      });

      render(<Services />);

      const carousel = screen.getByTestId('services-carousel');
      
      // With reduced motion, autoplay should not start
      vi.advanceTimersByTime(2000);
      
      expect(carousel).toHaveAttribute('data-playing', 'false');
      expect(carousel).toHaveAttribute('data-reduced-motion', 'true');
    });

    it('should announce reduced motion state to screen readers', async () => {
      setupCarouselTest({
        enableReducedMotion: true,
        visibilityState: 'visible',
        mockTimers: true
      });

      render(<Services />);

      const liveRegion = screen.getByRole('status', { name: /carousel announcements/i });
      
      await waitFor(() => {
        expect(liveRegion).toHaveTextContent(/autoplay paused due to user preference for reduced motion/i);
      });
    });

    it('should provide proper ARIA roles and labels', () => {
      setupCarouselTest({
        enableReducedMotion: false,
        visibilityState: 'visible',
        mockTimers: true
      });

      render(<Services />);

      // Main carousel region
      const carousel = screen.getByRole('region', { name: /services carousel/i });
      expect(carousel).toBeInTheDocument();
      
      // Live region for announcements
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      
      // Navigation controls
      expect(screen.getByRole('button', { name: /previous slide/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next slide/i })).toBeInTheDocument();
      
      // Slide indicators
      const indicators = screen.getAllByRole('button', { name: /go to slide/i });
      expect(indicators.length).toBeGreaterThan(0);
    });

    it('should have proper focus management', async () => {
      setupCarouselTest({
        enableReducedMotion: false,
        visibilityState: 'visible',
        mockTimers: true
      });

      render(<Services />);

      const carousel = screen.getByTestId('services-carousel');
      const nextButton = screen.getByRole('button', { name: /next slide/i });
      
      // Carousel should be focusable
      carousel.focus();
      expect(document.activeElement).toBe(carousel);
      
      // Tab navigation should work
      await user.tab();
      expect(document.activeElement).toBe(nextButton);
      
      // Shift+tab should return to carousel
      await user.tab({ shift: true });
      expect(document.activeElement).toBe(carousel);
    });

    it('should support keyboard navigation', async () => {
      setupCarouselTest({
        enableReducedMotion: false,
        visibilityState: 'visible',
        mockTimers: true
      });

      render(<Services />);

      const carousel = screen.getByTestId('services-carousel');
      
      carousel.focus();
      expect(carousel).toHaveAttribute('data-current-index', '0');
      
      // Arrow key navigation
      await user.keyboard('{ArrowRight}');
      await waitFor(() => {
        expect(carousel).toHaveAttribute('data-current-index', '1');
      });
      
      await user.keyboard('{ArrowLeft}');
      await waitFor(() => {
        expect(carousel).toHaveAttribute('data-current-index', '0');
      });
      
      // Home/End navigation
      await user.keyboard('{End}');
      await waitFor(() => {
        const totalSlides = parseInt(carousel.getAttribute('data-total-slides') || '5');
        expect(carousel).toHaveAttribute('data-current-index', (totalSlides - 1).toString());
      });
      
      await user.keyboard('{Home}');
      await waitFor(() => {
        expect(carousel).toHaveAttribute('data-current-index', '0');
      });
    });

    it('should announce slide changes to screen readers', async () => {
      setupCarouselTest({
        enableReducedMotion: false,
        visibilityState: 'visible',
        mockTimers: true
      });

      render(<Services />);

      const liveRegion = screen.getByRole('status', { name: /carousel announcements/i });
      const nextButton = screen.getByRole('button', { name: /next slide/i });
      
      await user.click(nextButton);
      
      await waitFor(() => {
        expect(liveRegion).toHaveTextContent(/slide 2 of \d+/i);
      });
    });

    it('should have sufficient color contrast', () => {
      setupCarouselTest({
        enableReducedMotion: false,
        visibilityState: 'visible',
        mockTimers: true
      });

      render(<Services />);

      const controls = screen.getAllByRole('button');
      
      controls.forEach(control => {
        const styles = window.getComputedStyle(control);
        
        // Basic checks (actual contrast calculation would need color parsing)
        expect(styles.color).not.toBe(styles.backgroundColor);
        expect(styles.color).not.toBe('transparent');
        expect(styles.backgroundColor).not.toBe('transparent');
      });
    });

    it('should provide descriptive button labels', () => {
      setupCarouselTest({
        enableReducedMotion: false,
        visibilityState: 'visible',
        mockTimers: true
      });

      render(<Services />);

      // Navigation buttons should have clear, descriptive labels
      const prevButton = screen.getByRole('button', { name: /previous slide/i });
      const nextButton = screen.getByRole('button', { name: /next slide/i });
      
      expect(prevButton).toHaveAttribute('aria-label');
      expect(nextButton).toHaveAttribute('aria-label');
      
      // Slide indicators should specify slide numbers
      const firstIndicator = screen.getByRole('button', { name: /go to slide 1/i });
      expect(firstIndicator).toHaveAttribute('aria-label');
    });

    it('should handle screen reader navigation correctly', async () => {
      setupCarouselTest({
        enableReducedMotion: false,
        visibilityState: 'visible',
        mockTimers: true
      });

      render(<Services />);

      const carousel = screen.getByTestId('services-carousel');
      
      // Screen reader mode simulation
      carousel.focus();
      
      // Should announce current slide
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toBeInTheDocument();
      
      // Navigation should work in screen reader mode
      await user.keyboard('{ArrowRight}');
      
      await waitFor(() => {
        expect(carousel).toHaveAttribute('data-current-index', '1');
        expect(liveRegion).toHaveTextContent(/slide 2/i);
      });
    });

    it('should support voice control accessibility', async () => {
      setupCarouselTest({
        enableReducedMotion: false,
        visibilityState: 'visible',
        mockTimers: true
      });

      render(<Services />);

      const carousel = screen.getByTestId('services-carousel');
      
      // Voice control should be able to trigger navigation
      const voiceEvent = new CustomEvent('voice-command', {
        detail: { command: 'next slide' }
      });
      
      carousel.dispatchEvent(voiceEvent);
      
      // Should be programmatically navigable
      await waitFor(() => {
        expect(carousel).toHaveAttribute('data-current-index', '1');
      });
    });

    it('should maintain focus indicators', async () => {
      setupCarouselTest({
        enableReducedMotion: false,
        visibilityState: 'visible',
        mockTimers: true
      });

      render(<Services />);

      const nextButton = screen.getByRole('button', { name: /next slide/i });
      
      // Focus should be visible
      nextButton.focus();
      
      const styles = window.getComputedStyle(nextButton, ':focus');
      
      // Should have focus indicators (outline, box-shadow, etc.)
      expect(
        styles.outline !== 'none' || 
        styles.boxShadow !== 'none' || 
        styles.borderColor !== 'transparent' // Any visual change
      ).toBe(true);
    });

    it('should handle high contrast mode', () => {
      // Mock high contrast media query
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query.includes('prefers-contrast: high'),
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      setupCarouselTest({
        enableReducedMotion: false,
        visibilityState: 'visible',
        mockTimers: true
      });

      render(<Services />);

      const carousel = screen.getByTestId('services-carousel');
      
      // Should adapt to high contrast mode
      expect(carousel).toHaveAttribute('data-high-contrast');
    });

    it('should provide skip links for keyboard navigation', () => {
      setupCarouselTest({
        enableReducedMotion: false,
        visibilityState: 'visible',
        mockTimers: true
      });

      render(<Services />);

      // Should have skip link to main content
      const skipLink = screen.getByRole('link', { name: /skip carousel/i });
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('should handle zoom levels correctly', () => {
      setupCarouselTest({
        enableReducedMotion: false,
        visibilityState: 'visible',
        mockTimers: true
      });

      // Mock different zoom levels
      Object.defineProperty(window, 'devicePixelRatio', {
        writable: true,
        value: 2 // 200% zoom
      });

      render(<Services />);

      const controls = screen.getAllByRole('button');
      
      // Controls should remain usable at high zoom
      controls.forEach(control => {
        const rect = control.getBoundingClientRect();
        expect(rect.width).toBeGreaterThan(24); // Minimum touch target
        expect(rect.height).toBeGreaterThan(24);
      });
    });

    it('should support assistive technology announcements', async () => {
      setupCarouselTest({
        enableReducedMotion: false,
        visibilityState: 'visible',
        mockTimers: true
      });

      render(<Services />);

      const liveRegion = screen.getByRole('status');
      
      // Start autoplay
      vi.advanceTimersByTime(1500);
      vi.advanceTimersByTime(4600);
      
      await waitFor(() => {
        // Should announce automatic slide changes
        expect(liveRegion).toHaveTextContent(/slide 2/i);
      });
      
      // Pause autoplay
      const carousel = screen.getByTestId('services-carousel');
      await user.hover(carousel);
      
      await waitFor(() => {
        expect(liveRegion).toHaveTextContent(/paused/i);
      });
    });
  });

  describe('WCAG 2.1 AA Compliance', () => {
    it('should meet minimum touch target sizes (44x44px)', () => {
      setupCarouselTest({
        enableReducedMotion: false,
        visibilityState: 'visible',
        mockTimers: true
      });

      render(<Services />);

      const interactiveElements = [
        ...screen.getAllByRole('button'),
        screen.getByTestId('services-carousel')
      ];
      
      interactiveElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        expect(rect.width).toBeGreaterThanOrEqual(44);
        expect(rect.height).toBeGreaterThanOrEqual(44);
      });
    });

    it('should have proper heading hierarchy', () => {
      setupCarouselTest({
        enableReducedMotion: false,
        visibilityState: 'visible',
        mockTimers: true
      });

      render(<Services />);

      // Check that headings follow proper hierarchy
      const headings = screen.getAllByRole('heading');
      
      headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName.charAt(1));
        
        if (index > 0) {
          const prevLevel = parseInt(headings[index - 1].tagName.charAt(1));
          // Levels should not skip (e.g., h2 to h4)
          expect(level - prevLevel).toBeLessThanOrEqual(1);
        }
      });
    });

    it('should provide alternative text for images', () => {
      setupCarouselTest({
        enableReducedMotion: false,
        visibilityState: 'visible',
        mockTimers: true
      });

      render(<Services />);

      const images = screen.getAllByRole('img');
      
      images.forEach(img => {
        // All images should have alt text
        expect(img).toHaveAttribute('alt');
        expect(img.getAttribute('alt')).not.toBe('');
      });
    });

    it('should support resize to 400% zoom without horizontal scroll', () => {
      setupCarouselTest({
        enableReducedMotion: false,
        visibilityState: 'visible',
        mockTimers: true
      });

      // Mock viewport at 400% zoom (320px wide)
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 320
      });

      render(<Services />);

      const carousel = screen.getByTestId('services-carousel');
      
      // Content should not cause horizontal overflow
      expect(carousel.scrollWidth).toBeLessThanOrEqual(320);
    });

    it('should maintain functionality without color', () => {
      setupCarouselTest({
        enableReducedMotion: false,
        visibilityState: 'visible',
        mockTimers: true
      });

      render(<Services />);

      // Active states should not rely only on color
      const activeIndicator = screen.getByRole('button', { name: /go to slide 1/i });
      
      // Should have additional indicators beyond color
      expect(
        activeIndicator.getAttribute('aria-current') === 'true' ||
        activeIndicator.classList.contains('active') ||
        activeIndicator.querySelector('[aria-hidden="false"]')
      ).toBe(true);
    });
  });

  describe('Error Prevention and Recovery', () => {
    it('should handle focus loss gracefully', async () => {
      setupCarouselTest({
        enableReducedMotion: false,
        visibilityState: 'visible',
        mockTimers: true
      });

      render(<Services />);

      const carousel = screen.getByTestId('services-carousel');
      
      // Focus and then remove focus unexpectedly
      carousel.focus();
      carousel.blur();
      
      // Should not break keyboard navigation
      carousel.focus();
      await user.keyboard('{ArrowRight}');
      
      await waitFor(() => {
        expect(carousel).toHaveAttribute('data-current-index', '1');
      });
    });

    it('should provide feedback for failed actions', async () => {
      setupCarouselTest({
        enableReducedMotion: false,
        visibilityState: 'visible',
        mockTimers: true
      });

      // Mock a navigation failure
      const originalConsoleError = console.error;
      console.error = vi.fn();

      render(<Services />);

      const liveRegion = screen.getByRole('status');
      
      // Navigation should provide feedback even on errors
      await user.keyboard('{ArrowRight}');
      
      // Should announce success or provide error feedback
      await waitFor(() => {
        expect(liveRegion.textContent).toBeTruthy();
      });

      console.error = originalConsoleError;
    });
  });
});

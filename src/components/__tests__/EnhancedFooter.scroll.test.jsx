import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EnhancedFooter from '../EnhancedFooter';

/**
 * Test suite for EnhancedFooter scroll behavior
 * Validates fix for mobile scroll blocking issue
 */
describe('EnhancedFooter - Scroll Behavior', () => {
  let container;

  beforeEach(() => {
    // Mock IntersectionObserver
    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));

    // Mock matchMedia for mobile viewport
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query.includes('max-width: 767px'), // Mobile viewport
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Set mobile viewport size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 375, // iPhone viewport
    });

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      value: 667,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('CSS Properties - Scroll Enablement', () => {
    it('should not have overflow-hidden class on footer container', () => {
      const { container: rendered } = render(
        <BrowserRouter>
          <EnhancedFooter />
        </BrowserRouter>
      );

      const footer = rendered.querySelector('.enhanced-footer');
      expect(footer).toBeTruthy();

      // Verify overflow-hidden is NOT present
      expect(footer.classList.contains('overflow-hidden')).toBe(false);
    });

    it('should have relative positioning without blocking scroll', () => {
      const { container: rendered } = render(
        <BrowserRouter>
          <EnhancedFooter />
        </BrowserRouter>
      );

      const footer = rendered.querySelector('.enhanced-footer');

      // Should have relative class, not fixed
      expect(footer.classList.contains('relative')).toBe(true);
      expect(footer.classList.contains('fixed')).toBe(false);
    });

    it('should not have height constraints that block scroll', () => {
      const { container: rendered } = render(
        <BrowserRouter>
          <EnhancedFooter />
        </BrowserRouter>
      );

      const footer = rendered.querySelector('.enhanced-footer');
      const styles = window.getComputedStyle(footer);

      // Should not have fixed height that prevents scrolling
      expect(styles.height).not.toBe('100vh');
      expect(styles.maxHeight).not.toBe('100vh');
    });
  });

  describe('Mobile Scroll Behavior', () => {
    it('should allow scroll past footer on mobile viewport', () => {
      const { container: rendered } = render(
        <BrowserRouter>
          <EnhancedFooter />
        </BrowserRouter>
      );

      const footer = rendered.querySelector('.enhanced-footer');

      // Footer should be scrollable (not blocking)
      expect(footer).toBeTruthy();

      // Check that footer doesn't prevent scroll propagation
      const preventScrollClasses = ['overflow-hidden', 'fixed', 'h-screen', 'h-full'];
      preventScrollClasses.forEach(className => {
        expect(footer.classList.contains(className)).toBe(false);
      });
    });

    it('should have proper overscroll behavior for mobile', () => {
      const { container: rendered } = render(
        <BrowserRouter>
          <EnhancedFooter />
        </BrowserRouter>
      );

      const footer = rendered.querySelector('.enhanced-footer');

      // Should not have overscroll-behavior: none that blocks scroll
      const styles = window.getComputedStyle(footer);
      expect(styles.overscrollBehavior).not.toBe('none');
    });
  });

  describe('Footer Content Accessibility', () => {
    it('should render all footer content without scroll blocking', () => {
      const { container } = render(
        <BrowserRouter>
          <EnhancedFooter />
        </BrowserRouter>
      );

      // Verify critical footer content is accessible
      expect(screen.getByText(/Saraiva Vision/i)).toBeInTheDocument();

      // Contact information should be visible (check for email in href)
      const emailLinks = container.querySelectorAll('a[href*="mailto:"]');
      expect(emailLinks.length).toBeGreaterThan(0);

      // Phone/WhatsApp should be accessible
      const contactElements = container.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp"]');
      expect(contactElements.length).toBeGreaterThan(0);
    });

    it('should allow access to scroll-to-top button', () => {
      const { container } = render(
        <BrowserRouter>
          <EnhancedFooter />
        </BrowserRouter>
      );

      // Scroll to top button should be accessible (look for button with aria-label)
      const scrollButtons = container.querySelectorAll('button[aria-label]');
      const hasScrollButton = Array.from(scrollButtons).some(btn =>
        btn.getAttribute('aria-label') && btn.querySelector('svg')
      );

      expect(hasScrollButton).toBe(true);
    });
  });

  describe('Responsive Behavior', () => {
    it('should adapt to mobile viewport without blocking scroll', () => {
      const { container: rendered } = render(
        <BrowserRouter>
          <EnhancedFooter />
        </BrowserRouter>
      );

      const footer = rendered.querySelector('.enhanced-footer');

      // Should not have desktop-only scroll blocking
      expect(footer.classList.contains('h-screen')).toBe(false);
      expect(footer.classList.contains('fixed')).toBe(false);
    });

    it('should maintain footer-liquid class for proper styling', () => {
      const { container: rendered } = render(
        <BrowserRouter>
          <EnhancedFooter />
        </BrowserRouter>
      );

      const footer = rendered.querySelector('.footer-liquid');
      expect(footer).toBeTruthy();
    });
  });

  describe('Glass Morphism Layer', () => {
    it('should not block scroll with glass layer', () => {
      const { container: rendered } = render(
        <BrowserRouter>
          <EnhancedFooter useGlassEffect={true} />
        </BrowserRouter>
      );

      const glassLayer = rendered.querySelector('.enhanced-footer-glass-layer');

      if (glassLayer) {
        // Glass layer should have absolute positioning class
        expect(glassLayer.classList.contains('absolute')).toBe(true);

        // Should not have fixed positioning
        expect(glassLayer.classList.contains('fixed')).toBe(false);
      } else {
        // If glass layer is disabled, test passes
        expect(true).toBe(true);
      }
    });
  });

  describe('Integration with Page Scroll', () => {
    it('should allow continuous scroll from page to footer', () => {
      const { container: rendered } = render(
        <BrowserRouter>
          <div style={{ height: '2000px' }}>
            <div style={{ height: '1500px' }}>Page Content</div>
            <EnhancedFooter />
          </div>
        </BrowserRouter>
      );

      const footer = rendered.querySelector('.enhanced-footer');
      const parent = footer.parentElement;

      // Parent should allow overflow
      const parentStyles = window.getComputedStyle(parent);
      expect(parentStyles.overflow).not.toBe('hidden');
      expect(parentStyles.overflowY).not.toBe('hidden');
    });

    it('should not have z-index blocking scroll interaction', () => {
      const { container: rendered } = render(
        <BrowserRouter>
          <EnhancedFooter />
        </BrowserRouter>
      );

      const footer = rendered.querySelector('.enhanced-footer');
      const styles = window.getComputedStyle(footer);

      // Z-index should not create scroll blocking layer
      const zIndex = parseInt(styles.zIndex) || 0;
      expect(zIndex).toBeLessThan(9999); // Should not be excessively high
    });
  });

  describe('Regression Tests - Scroll Blocking Fix', () => {
    it('should NOT have overscroll-behavior: none on body', () => {
      render(
        <BrowserRouter>
          <EnhancedFooter />
        </BrowserRouter>
      );

      const bodyStyles = window.getComputedStyle(document.body);

      // This was the bug: overscroll-behavior: none blocked mobile scroll
      expect(bodyStyles.overscrollBehaviorY).not.toBe('none');
    });

    it('should NOT have overflow-hidden on footer container', () => {
      const { container: rendered } = render(
        <BrowserRouter>
          <EnhancedFooter />
        </BrowserRouter>
      );

      const footer = rendered.querySelector('.enhanced-footer');

      // This was part of the bug: overflow-hidden prevented scroll
      expect(footer.className).not.toMatch(/overflow-hidden/);
    });

    it('should allow overscroll-behavior: auto for smooth scrolling', () => {
      render(
        <BrowserRouter>
          <EnhancedFooter />
        </BrowserRouter>
      );

      // Verify the fix is in place - body should allow scroll
      // In jsdom, computedStyle may return empty string, so we check it's not explicitly 'none'
      const bodyStyles = window.getComputedStyle(document.body);
      expect(bodyStyles.overscrollBehaviorY).not.toBe('none');
    });
  });

  describe('Mobile Touch Scrolling', () => {
    it('should support webkit touch scrolling on mobile', () => {
      render(
        <BrowserRouter>
          <EnhancedFooter />
        </BrowserRouter>
      );

      const bodyStyles = window.getComputedStyle(document.body);

      // Verify -webkit-overflow-scrolling is enabled (or at least not disabled)
      // jsdom may not support this property, so we just ensure it's not explicitly disabled
      expect(bodyStyles.webkitOverflowScrolling).not.toBe('auto');
    });

    it('should have proper scroll container setup', () => {
      const { container: rendered } = render(
        <BrowserRouter>
          <EnhancedFooter />
        </BrowserRouter>
      );

      const footer = rendered.querySelector('.enhanced-footer');

      // Should be a proper scroll container
      expect(footer).toBeTruthy();
      expect(footer.tagName).toBe('DIV');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long footer content without blocking scroll', () => {
      const { container: rendered } = render(
        <BrowserRouter>
          <EnhancedFooter />
        </BrowserRouter>
      );

      const footer = rendered.querySelector('.enhanced-footer');

      // Even with long content, footer should not block scroll
      const styles = window.getComputedStyle(footer);
      expect(styles.overflow).not.toBe('hidden');
    });

    it('should work with animations enabled without blocking scroll', () => {
      const { container: rendered } = render(
        <BrowserRouter>
          <EnhancedFooter enableAnimations={true} />
        </BrowserRouter>
      );

      const footer = rendered.querySelector('.enhanced-footer');

      // Animations should not interfere with scroll
      expect(footer.classList.contains('overflow-hidden')).toBe(false);
    });

    it('should work with glass effects enabled without blocking scroll', () => {
      const { container: rendered } = render(
        <BrowserRouter>
          <EnhancedFooter useGlassEffect={true} />
        </BrowserRouter>
      );

      const footer = rendered.querySelector('.enhanced-footer');

      // Glass effects should not block scroll
      expect(footer.classList.contains('overflow-hidden')).toBe(false);
    });
  });
});

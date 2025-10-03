/**
 * StickyCTA Component Tests
 * Tests for scroll behavior, dismissibility, and WCAG compliance
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import StickyCTA from '@/components/StickyCTA';

// Mock UnifiedCTA component
vi.mock('@/components/UnifiedCTA', () => ({
  default: ({ variant }: { variant: string }) => (
    <div data-testid="unified-cta" data-variant={variant}>
      Unified CTA Mock
    </div>
  ),
}));

describe('StickyCTA', () => {
  beforeEach(() => {
    // Reset scroll position
    window.scrollY = 0;

    // Clear cookies
    document.cookie.split(';').forEach((c) => {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Scroll Behavior', () => {
    it('should not render when scroll position is below threshold', () => {
      const { container } = render(<StickyCTA />);
      expect(container.firstChild).toBeNull();
    });

    it('should render when scroll exceeds default threshold (600px)', async () => {
      const { container } = render(<StickyCTA />);

      // Simulate scroll
      window.scrollY = 700;
      fireEvent.scroll(window);

      await waitFor(() => {
        expect(screen.getByRole('complementary')).toBeInTheDocument();
      });
    });

    it('should respect custom showAfterScroll config', async () => {
      const customThreshold = 300;
      render(<StickyCTA config={{ showAfterScroll: customThreshold }} />);

      // Below threshold
      window.scrollY = 200;
      fireEvent.scroll(window);

      await waitFor(() => {
        expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
      });

      // Above threshold
      window.scrollY = 400;
      fireEvent.scroll(window);

      await waitFor(() => {
        expect(screen.getByRole('complementary')).toBeInTheDocument();
      });
    });

    it('should hide when scrolling back below threshold', async () => {
      render(<StickyCTA />);

      // Scroll down
      window.scrollY = 700;
      fireEvent.scroll(window);

      await waitFor(() => {
        expect(screen.getByRole('complementary')).toBeInTheDocument();
      });

      // Scroll back up
      window.scrollY = 300;
      fireEvent.scroll(window);

      await waitFor(() => {
        expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
      });
    });
  });

  describe('Dismissibility', () => {
    beforeEach(async () => {
      render(<StickyCTA />);

      // Trigger visibility
      window.scrollY = 700;
      fireEvent.scroll(window);

      await waitFor(() => {
        expect(screen.getByRole('complementary')).toBeInTheDocument();
      });
    });

    it('should show dismiss button when dismissible (default)', () => {
      const dismissButton = screen.getByLabelText(/fechar botão de agendamento/i);
      expect(dismissButton).toBeInTheDocument();
    });

    it('should hide CTA when dismiss button is clicked', async () => {
      const dismissButton = screen.getByLabelText(/fechar botão de agendamento/i);
      fireEvent.click(dismissButton);

      await waitFor(() => {
        expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
      });
    });

    it('should not show dismiss button when dismissible is false', async () => {
      const { container } = render(<StickyCTA config={{ dismissible: false }} />);

      window.scrollY = 700;
      fireEvent.scroll(window);

      await waitFor(() => {
        expect(screen.getByRole('complementary')).toBeInTheDocument();
      });

      expect(screen.queryByLabelText(/fechar/i)).not.toBeInTheDocument();
    });

    it('should set cookie on dismiss', async () => {
      const dismissButton = screen.getByLabelText(/fechar botão de agendamento/i);
      fireEvent.click(dismissButton);

      await waitFor(() => {
        expect(document.cookie).toContain('sticky-cta-dismissed=true');
      });
    });

    it('should respect cookie and not render if previously dismissed', () => {
      // Set cookie
      document.cookie = 'sticky-cta-dismissed=true';

      render(<StickyCTA />);

      window.scrollY = 700;
      fireEvent.scroll(window);

      // Should not render even after scroll
      expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    });
  });

  describe('Callbacks', () => {
    it('should call onDismiss callback when dismissed', async () => {
      const onDismiss = vi.fn();
      render(<StickyCTA onDismiss={onDismiss} />);

      window.scrollY = 700;
      fireEvent.scroll(window);

      await waitFor(() => {
        expect(screen.getByRole('complementary')).toBeInTheDocument();
      });

      const dismissButton = screen.getByLabelText(/fechar/i);
      fireEvent.click(dismissButton);

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('should call onCTAClick callback when CTA is clicked', async () => {
      const onCTAClick = vi.fn();
      render(<StickyCTA onCTAClick={onCTAClick} />);

      window.scrollY = 700;
      fireEvent.scroll(window);

      await waitFor(() => {
        expect(screen.getByRole('complementary')).toBeInTheDocument();
      });

      const ctaElement = screen.getByTestId('unified-cta');
      fireEvent.click(ctaElement.parentElement!);

      expect(onCTAClick).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      render(<StickyCTA />);

      window.scrollY = 700;
      fireEvent.scroll(window);

      await waitFor(() => {
        const complementary = screen.getByRole('complementary');
        expect(complementary).toHaveAttribute('aria-label', 'Botão de agendamento fixo');
      });
    });

    it('should render UnifiedCTA with sticky variant', async () => {
      render(<StickyCTA />);

      window.scrollY = 700;
      fireEvent.scroll(window);

      await waitFor(() => {
        const unifiedCTA = screen.getByTestId('unified-cta');
        expect(unifiedCTA).toHaveAttribute('data-variant', 'sticky');
      });
    });

    it('should include safe area spacer for mobile', async () => {
      render(<StickyCTA />);

      window.scrollY = 700;
      fireEvent.scroll(window);

      await waitFor(() => {
        const spacer = document.querySelector('.lg\\:hidden.h-20');
        expect(spacer).toBeInTheDocument();
        expect(spacer).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('should be keyboard accessible', async () => {
      render(<StickyCTA />);

      window.scrollY = 700;
      fireEvent.scroll(window);

      await waitFor(() => {
        const dismissButton = screen.getByLabelText(/fechar/i);
        expect(dismissButton).toHaveClass('focus:ring-2', 'focus:ring-blue-500');
      });
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should only render on mobile (lg:hidden)', async () => {
      render(<StickyCTA />);

      window.scrollY = 700;
      fireEvent.scroll(window);

      await waitFor(() => {
        const container = screen.getByRole('complementary');
        expect(container).toHaveClass('lg:hidden');
      });
    });

    it('should use fixed positioning at bottom', async () => {
      render(<StickyCTA />);

      window.scrollY = 700;
      fireEvent.scroll(window);

      await waitFor(() => {
        const container = screen.getByRole('complementary');
        expect(container).toHaveClass('fixed', 'bottom-0', 'left-0', 'right-0');
      });
    });
  });

  describe('Performance', () => {
    it('should use passive scroll listener', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      render(<StickyCTA />);

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function),
        { passive: true }
      );
    });

    it('should cleanup scroll listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = render(<StickyCTA />);
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    });
  });
});

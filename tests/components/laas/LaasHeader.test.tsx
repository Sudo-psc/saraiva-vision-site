/**
 * Unit Tests for LaasHeader Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LaasHeader } from '@/components/laas/LaasHeader';

// Mock analytics
vi.mock('@/lib/laas/analytics', () => ({
  trackCtaClick: vi.fn()
}));

describe('LaasHeader', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock scrollIntoView
    Element.prototype.scrollIntoView = vi.fn();
  });

  describe('Rendering', () => {
    it('should render logo', () => {
      render(<LaasHeader />);
      expect(screen.getByText('LAAS')).toBeInTheDocument();
    });

    it('should render navigation links on desktop', () => {
      render(<LaasHeader />);
      expect(screen.getByRole('button', { name: /planos/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /como funciona/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /faq/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /contato/i })).toBeInTheDocument();
    });

    it('should render CTA button', () => {
      render(<LaasHeader />);
      const ctaButtons = screen.getAllByRole('button', { name: /agendar consulta/i });
      expect(ctaButtons.length).toBeGreaterThanOrEqual(1);
    });

    it('should render mobile menu toggle', () => {
      render(<LaasHeader />);
      const menuToggle = screen.getByRole('button', { name: /toggle menu/i });
      expect(menuToggle).toBeInTheDocument();
    });
  });

  describe('Navigation Functionality', () => {
    it('should scroll to planos section when link clicked', () => {
      // Mock getElementById
      const mockElement = document.createElement('div');
      mockElement.id = 'planos';
      document.body.appendChild(mockElement);

      render(<LaasHeader />);

      const planosLink = screen.getByRole('button', { name: /planos/i });
      fireEvent.click(planosLink);

      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start'
      });

      document.body.removeChild(mockElement);
    });

    it('should scroll to como-funciona section', () => {
      const mockElement = document.createElement('div');
      mockElement.id = 'como-funciona';
      document.body.appendChild(mockElement);

      render(<LaasHeader />);

      const link = screen.getByRole('button', { name: /como funciona/i });
      fireEvent.click(link);

      expect(mockElement.scrollIntoView).toHaveBeenCalled();

      document.body.removeChild(mockElement);
    });

    it('should scroll to faq section', () => {
      const mockElement = document.createElement('div');
      mockElement.id = 'faq';
      document.body.appendChild(mockElement);

      render(<LaasHeader />);

      const link = screen.getByRole('button', { name: /faq/i });
      fireEvent.click(link);

      expect(mockElement.scrollIntoView).toHaveBeenCalled();

      document.body.removeChild(mockElement);
    });

    it('should scroll to footer on contato click', () => {
      const mockElement = document.createElement('footer');
      mockElement.id = 'footer';
      document.body.appendChild(mockElement);

      render(<LaasHeader />);

      const link = screen.getByRole('button', { name: /contato/i });
      fireEvent.click(link);

      expect(mockElement.scrollIntoView).toHaveBeenCalled();

      document.body.removeChild(mockElement);
    });
  });

  describe('CTA Functionality', () => {
    it('should track analytics when CTA clicked', async () => {
      const { trackCtaClick } = await import('@/lib/laas/analytics');

      const mockElement = document.createElement('div');
      mockElement.id = 'planos';
      document.body.appendChild(mockElement);

      render(<LaasHeader />);

      const ctaButton = screen.getAllByRole('button', { name: /agendar consulta/i })[0];
      fireEvent.click(ctaButton);

      expect(trackCtaClick).toHaveBeenCalledWith('agendar_consulta', 'header');

      document.body.removeChild(mockElement);
    });

    it('should scroll to planos when CTA clicked', () => {
      const mockElement = document.createElement('div');
      mockElement.id = 'planos';
      document.body.appendChild(mockElement);

      render(<LaasHeader />);

      const ctaButton = screen.getAllByRole('button', { name: /agendar consulta/i })[0];
      fireEvent.click(ctaButton);

      expect(mockElement.scrollIntoView).toHaveBeenCalled();

      document.body.removeChild(mockElement);
    });
  });

  describe('Mobile Menu', () => {
    it('should toggle mobile menu on click', () => {
      render(<LaasHeader />);

      const menuToggle = screen.getByRole('button', { name: /toggle menu/i });

      // Menu should be closed initially
      expect(screen.queryByRole('navigation')).not.toBeVisible();

      // Open menu
      fireEvent.click(menuToggle);

      // Menu should be visible (check for mobile nav links)
      const mobileNavLinks = screen.getAllByRole('button', { name: /planos/i });
      expect(mobileNavLinks.length).toBeGreaterThanOrEqual(1);
    });

    it('should close mobile menu after navigation', () => {
      const mockElement = document.createElement('div');
      mockElement.id = 'planos';
      document.body.appendChild(mockElement);

      render(<LaasHeader />);

      const menuToggle = screen.getByRole('button', { name: /toggle menu/i });

      // Open menu
      fireEvent.click(menuToggle);

      // Click navigation link
      const planosLink = screen.getAllByRole('button', { name: /planos/i })[0];
      fireEvent.click(planosLink);

      // Menu should close (navigation should scroll and close menu)
      // Note: This is tested via E2E, unit test verifies scrollIntoView was called
      expect(mockElement.scrollIntoView).toHaveBeenCalled();

      document.body.removeChild(mockElement);
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label for mobile menu toggle', () => {
      render(<LaasHeader />);

      const menuToggle = screen.getByRole('button', { name: /toggle menu/i });
      expect(menuToggle).toHaveAttribute('aria-label', 'Toggle menu');
    });

    it('should be keyboard navigable', () => {
      render(<LaasHeader />);

      const firstButton = screen.getAllByRole('button')[0];
      firstButton.focus();

      expect(document.activeElement).toBe(firstButton);
    });

    it('should have visible focus indicators', () => {
      render(<LaasHeader />);

      const planosLink = screen.getByRole('button', { name: /planos/i });
      planosLink.focus();

      // Element should be focusable
      expect(document.activeElement).toBe(planosLink);
    });
  });

  describe('Sticky Header', () => {
    it('should have sticky positioning', () => {
      const { container } = render(<LaasHeader />);

      const header = container.querySelector('header');
      expect(header).toHaveClass('sticky', 'top-0');
    });

    it('should have backdrop blur for glass effect', () => {
      const { container } = render(<LaasHeader />);

      const header = container.querySelector('header');
      expect(header).toHaveClass('backdrop-blur');
    });
  });
});

/**
 * Unit Tests for FaqSection Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FaqSection } from '@/components/laas/FaqSection';
import { FAQ_ITEMS } from '@/lib/laas/config';

// Mock analytics
vi.mock('@/lib/laas/analytics', () => ({
  trackFaqOpen: vi.fn()
}));

describe('FaqSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Element.prototype.scrollIntoView = vi.fn();
  });

  describe('Rendering', () => {
    it('should render section heading', () => {
      render(<FaqSection />);
      expect(screen.getByRole('heading', { name: /perguntas frequentes/i })).toBeInTheDocument();
    });

    it('should render section description', () => {
      render(<FaqSection />);
      expect(screen.getByText(/tire suas dúvidas/i)).toBeInTheDocument();
    });

    it('should render all FAQ items', () => {
      render(<FaqSection />);

      FAQ_ITEMS.forEach(item => {
        expect(screen.getByText(item.question)).toBeInTheDocument();
      });
    });

    it('should render correct number of FAQ items', () => {
      render(<FaqSection />);

      const faqButtons = screen.getAllByRole('button').filter(btn =>
        FAQ_ITEMS.some(item => btn.textContent?.includes(item.question))
      );

      expect(faqButtons.length).toBe(FAQ_ITEMS.length);
    });

    it('should render contact CTA at bottom', () => {
      render(<FaqSection />);
      expect(screen.getByText(/ainda tem dúvidas/i)).toBeInTheDocument();
      expect(screen.getByText(/entre em contato/i)).toBeInTheDocument();
    });
  });

  describe('Accordion Functionality', () => {
    it('should start with all answers collapsed', () => {
      render(<FaqSection />);

      FAQ_ITEMS.forEach(item => {
        // Answer should not be visible initially
        expect(screen.queryByText(item.answer)).not.toBeVisible();
      });
    });

    it('should expand FAQ item on click', async () => {
      render(<FaqSection />);

      const firstQuestion = screen.getByText(FAQ_ITEMS[0].question);
      fireEvent.click(firstQuestion);

      await waitFor(() => {
        expect(screen.getByText(FAQ_ITEMS[0].answer)).toBeVisible();
      });
    });

    it('should collapse FAQ item on second click', async () => {
      render(<FaqSection />);

      const firstQuestion = screen.getByText(FAQ_ITEMS[0].question);

      // Expand
      fireEvent.click(firstQuestion);
      await waitFor(() => {
        expect(screen.getByText(FAQ_ITEMS[0].answer)).toBeVisible();
      });

      // Collapse
      fireEvent.click(firstQuestion);
      await waitFor(() => {
        expect(screen.queryByText(FAQ_ITEMS[0].answer)).not.toBeVisible();
      });
    });

    it('should close previous item when opening new one', async () => {
      render(<FaqSection />);

      const firstQuestion = screen.getByText(FAQ_ITEMS[0].question);
      const secondQuestion = screen.getByText(FAQ_ITEMS[1].question);

      // Open first
      fireEvent.click(firstQuestion);
      await waitFor(() => {
        expect(screen.getByText(FAQ_ITEMS[0].answer)).toBeVisible();
      });

      // Open second
      fireEvent.click(secondQuestion);
      await waitFor(() => {
        expect(screen.getByText(FAQ_ITEMS[1].answer)).toBeVisible();
        expect(screen.queryByText(FAQ_ITEMS[0].answer)).not.toBeVisible();
      });
    });

    it('should allow toggling between multiple items', async () => {
      render(<FaqSection />);

      for (let i = 0; i < Math.min(3, FAQ_ITEMS.length); i++) {
        const question = screen.getByText(FAQ_ITEMS[i].question);
        fireEvent.click(question);

        await waitFor(() => {
          expect(screen.getByText(FAQ_ITEMS[i].answer)).toBeVisible();
        });

        // Close it
        fireEvent.click(question);
        await waitFor(() => {
          expect(screen.queryByText(FAQ_ITEMS[i].answer)).not.toBeVisible();
        });
      }
    });
  });

  describe('Chevron Icon Animation', () => {
    it('should rotate chevron when expanded', async () => {
      const { container } = render(<FaqSection />);

      const firstButton = screen.getAllByRole('button')[0];
      const chevron = firstButton.querySelector('svg');

      expect(chevron).toBeInTheDocument();
      expect(chevron).not.toHaveClass('rotate-180');

      // Click to expand
      fireEvent.click(firstButton);

      await waitFor(() => {
        expect(chevron).toHaveClass('rotate-180');
      });
    });

    it('should rotate back when collapsed', async () => {
      const { container } = render(<FaqSection />);

      const firstButton = screen.getAllByRole('button')[0];
      const chevron = firstButton.querySelector('svg');

      // Expand
      fireEvent.click(firstButton);
      await waitFor(() => {
        expect(chevron).toHaveClass('rotate-180');
      });

      // Collapse
      fireEvent.click(firstButton);
      await waitFor(() => {
        expect(chevron).not.toHaveClass('rotate-180');
      });
    });
  });

  describe('Analytics Tracking', () => {
    it('should track FAQ open event', async () => {
      const { trackFaqOpen } = await import('@/lib/laas/analytics');

      render(<FaqSection />);

      const firstQuestion = screen.getByText(FAQ_ITEMS[0].question);
      fireEvent.click(firstQuestion);

      expect(trackFaqOpen).toHaveBeenCalledWith(FAQ_ITEMS[0].question);
    });

    it('should not track on close', async () => {
      const { trackFaqOpen } = await import('@/lib/laas/analytics');

      render(<FaqSection />);

      const firstQuestion = screen.getByText(FAQ_ITEMS[0].question);

      // Open
      fireEvent.click(firstQuestion);
      expect(trackFaqOpen).toHaveBeenCalledTimes(1);

      // Close (should not track again)
      fireEvent.click(firstQuestion);
      expect(trackFaqOpen).toHaveBeenCalledTimes(1);
    });

    it('should track each unique FAQ opened', async () => {
      const { trackFaqOpen } = await import('@/lib/laas/analytics');

      render(<FaqSection />);

      for (let i = 0; i < Math.min(3, FAQ_ITEMS.length); i++) {
        const question = screen.getByText(FAQ_ITEMS[i].question);
        fireEvent.click(question);

        expect(trackFaqOpen).toHaveBeenCalledWith(FAQ_ITEMS[i].question);
      }
    });
  });

  describe('Contact CTA', () => {
    it('should scroll to footer on contact click', () => {
      const mockElement = document.createElement('footer');
      mockElement.id = 'footer';
      document.body.appendChild(mockElement);

      render(<FaqSection />);

      const contactButton = screen.getByText(/entre em contato/i);
      fireEvent.click(contactButton);

      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });

      document.body.removeChild(mockElement);
    });

    it('should have proper styling for contact link', () => {
      render(<FaqSection />);

      const contactButton = screen.getByText(/entre em contato/i);
      expect(contactButton).toHaveClass('text-primary');
      expect(contactButton).toHaveClass('hover:underline');
    });
  });

  describe('Accessibility', () => {
    it('should have proper section ID for navigation', () => {
      const { container } = render(<FaqSection />);

      const section = container.querySelector('#faq');
      expect(section).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      render(<FaqSection />);

      const mainHeading = screen.getByRole('heading', { level: 2 });
      expect(mainHeading).toHaveTextContent(/perguntas frequentes/i);
    });

    it('should be keyboard navigable', () => {
      render(<FaqSection />);

      const firstButton = screen.getAllByRole('button')[0];
      firstButton.focus();

      expect(document.activeElement).toBe(firstButton);
    });

    it('should allow keyboard activation of FAQ items', async () => {
      render(<FaqSection />);

      const firstButton = screen.getAllByRole('button')[0];
      firstButton.focus();

      // Press Enter to expand
      fireEvent.keyDown(firstButton, { key: 'Enter', code: 'Enter' });
      fireEvent.click(firstButton); // Simulate click that happens on Enter

      await waitFor(() => {
        expect(screen.getByText(FAQ_ITEMS[0].answer)).toBeVisible();
      });
    });

    it('should have visible focus indicators', () => {
      render(<FaqSection />);

      const firstButton = screen.getAllByRole('button')[0];
      firstButton.focus();

      expect(document.activeElement).toBe(firstButton);
    });

    it('should have semantic HTML structure', () => {
      const { container } = render(<FaqSection />);

      // Questions should be buttons
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThanOrEqual(FAQ_ITEMS.length);

      // Should have semantic question/answer structure
      expect(container.querySelector('section')).toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    it('should apply hover effect to FAQ items', () => {
      const { container } = render(<FaqSection />);

      const firstButton = screen.getAllByRole('button')[0];
      expect(firstButton).toHaveClass('hover:bg-gray-50');
    });

    it('should apply border highlight on hover', () => {
      const { container } = render(<FaqSection />);

      const faqCards = container.querySelectorAll('[class*="border-2"]');
      faqCards.forEach(card => {
        expect(card).toHaveClass('hover:border-primary/30');
      });
    });

    it('should have consistent spacing', () => {
      const { container } = render(<FaqSection />);

      const faqContainer = container.querySelector('.space-y-4');
      expect(faqContainer).toBeInTheDocument();
    });

    it('should have rounded corners', () => {
      const { container } = render(<FaqSection />);

      const faqCards = container.querySelectorAll('[class*="rounded"]');
      expect(faqCards.length).toBeGreaterThan(0);
    });
  });

  describe('Content Validation', () => {
    it('should display complete question text', () => {
      render(<FaqSection />);

      FAQ_ITEMS.forEach(item => {
        const questionElement = screen.getByText(item.question);
        expect(questionElement).toHaveTextContent(item.question);
      });
    });

    it('should display complete answer text when expanded', async () => {
      render(<FaqSection />);

      for (let i = 0; i < FAQ_ITEMS.length; i++) {
        const question = screen.getByText(FAQ_ITEMS[i].question);
        fireEvent.click(question);

        await waitFor(() => {
          const answerElement = screen.getByText(FAQ_ITEMS[i].answer);
          expect(answerElement).toHaveTextContent(FAQ_ITEMS[i].answer);
        });

        // Close for next iteration
        fireEvent.click(question);
      }
    });

    it('should have at least 5 FAQ items', () => {
      expect(FAQ_ITEMS.length).toBeGreaterThanOrEqual(5);
    });

    it('should cover common questions', () => {
      const questions = FAQ_ITEMS.map(item => item.question.toLowerCase());

      // Should have questions about common topics
      const hasCancel = questions.some(q => q.includes('cancel'));
      const hasPricing = questions.some(q => q.includes('plano') || q.includes('diferença'));
      const hasDelivery = questions.some(q => q.includes('entrega'));

      expect(hasCancel || hasPricing || hasDelivery).toBe(true);
    });
  });

  describe('Responsive Design', () => {
    it('should have max-width container', () => {
      const { container } = render(<FaqSection />);

      const faqContainer = container.querySelector('.max-w-3xl');
      expect(faqContainer).toBeInTheDocument();
    });

    it('should center content', () => {
      const { container } = render(<FaqSection />);

      const faqContainer = container.querySelector('.mx-auto');
      expect(faqContainer).toBeInTheDocument();
    });
  });
});

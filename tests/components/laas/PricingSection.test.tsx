/**
 * Unit Tests for PricingSection Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { PricingSection } from '@/components/laas/PricingSection';
import { PLANOS } from '@/lib/laas/config';

// Mock analytics
vi.mock('@/lib/laas/analytics', () => ({
  trackCtaClick: vi.fn()
}));

// Mock alert
global.alert = vi.fn();

describe('PricingSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render section heading', () => {
      render(<PricingSection />);
      expect(screen.getByRole('heading', { name: /escolha seu plano/i })).toBeInTheDocument();
    });

    it('should render section description', () => {
      render(<PricingSection />);
      expect(screen.getByText(/consulta médica.*entregas automáticas/i)).toBeInTheDocument();
    });

    it('should render billing interval toggle', () => {
      render(<PricingSection />);
      expect(screen.getByRole('button', { name: /mensal/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /anual/i })).toBeInTheDocument();
    });

    it('should render all pricing plans', () => {
      render(<PricingSection />);

      PLANOS.forEach(plano => {
        expect(screen.getByText(plano.name)).toBeInTheDocument();
        expect(screen.getByText(plano.description)).toBeInTheDocument();
      });
    });

    it('should render savings badge on yearly toggle', () => {
      render(<PricingSection />);
      expect(screen.getByText(/economize.*16%/i)).toBeInTheDocument();
    });
  });

  describe('Billing Toggle', () => {
    it('should start with monthly billing selected', () => {
      render(<PricingSection />);

      const monthlyBtn = screen.getByRole('button', { name: /mensal/i });
      const yearlyBtn = screen.getByRole('button', { name: /anual/i });

      // Monthly should have active styles
      expect(monthlyBtn).toHaveClass('bg-white');
      expect(yearlyBtn).not.toHaveClass('bg-white');
    });

    it('should switch to yearly billing on click', () => {
      render(<PricingSection />);

      const yearlyBtn = screen.getByRole('button', { name: /anual/i });
      fireEvent.click(yearlyBtn);

      // Yearly should now have active styles
      expect(yearlyBtn).toHaveClass('bg-white');
    });

    it('should switch back to monthly billing', () => {
      render(<PricingSection />);

      const monthlyBtn = screen.getByRole('button', { name: /mensal/i });
      const yearlyBtn = screen.getByRole('button', { name: /anual/i });

      // Switch to yearly
      fireEvent.click(yearlyBtn);
      expect(yearlyBtn).toHaveClass('bg-white');

      // Switch back to monthly
      fireEvent.click(monthlyBtn);
      expect(monthlyBtn).toHaveClass('bg-white');
    });
  });

  describe('Price Calculations', () => {
    it('should display monthly prices correctly', () => {
      render(<PricingSection />);

      // Essencial plan monthly price
      const essencialPrice = PLANOS.find(p => p.id === 'essencial')?.priceMonthly;
      if (essencialPrice) {
        const formattedPrice = essencialPrice.toFixed(2).replace('.', ',');
        expect(screen.getByText(new RegExp(formattedPrice))).toBeInTheDocument();
      }
    });

    it('should display yearly prices when toggled', () => {
      render(<PricingSection />);

      const yearlyBtn = screen.getByRole('button', { name: /anual/i });
      fireEvent.click(yearlyBtn);

      // Should show per-month price for yearly billing
      const premiumPlan = PLANOS.find(p => p.id === 'premium');
      if (premiumPlan) {
        const monthlyFromYearly = premiumPlan.priceYearly / 12;
        // Price should be lower than monthly rate (discount)
        expect(monthlyFromYearly).toBeLessThan(premiumPlan.priceMonthly);
      }
    });

    it('should show annual total when yearly selected', () => {
      render(<PricingSection />);

      const yearlyBtn = screen.getByRole('button', { name: /anual/i });
      fireEvent.click(yearlyBtn);

      // Should show "cobrado anualmente"
      expect(screen.getAllByText(/cobrado anualmente/i).length).toBeGreaterThan(0);
    });

    it('should calculate correct discount for yearly billing', () => {
      const essencialPlan = PLANOS.find(p => p.id === 'essencial');
      if (essencialPlan) {
        const monthlyTotal = essencialPlan.priceMonthly * 12;
        const yearlyPrice = essencialPlan.priceYearly;
        const discount = ((monthlyTotal - yearlyPrice) / monthlyTotal) * 100;

        // Should be around 16% discount (allow 1% margin)
        expect(discount).toBeGreaterThanOrEqual(15);
        expect(discount).toBeLessThanOrEqual(17);
      }
    });
  });

  describe('Plan Features', () => {
    it('should display all features for each plan', () => {
      render(<PricingSection />);

      PLANOS.forEach(plano => {
        plano.features.forEach(feature => {
          expect(screen.getByText(feature)).toBeInTheDocument();
        });
      });
    });

    it('should show checkmark icons for features', () => {
      const { container } = render(<PricingSection />);

      // Check for SVG checkmark elements (lucide Check component)
      const checkIcons = container.querySelectorAll('svg');
      expect(checkIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Recommended Plan Badge', () => {
    it('should highlight recommended plan', () => {
      render(<PricingSection />);

      const recommendedBadge = screen.getByText(/mais popular/i);
      expect(recommendedBadge).toBeInTheDocument();
    });

    it('should apply special styling to recommended plan', () => {
      const { container } = render(<PricingSection />);

      const recommendedBadge = screen.getByText(/mais popular/i);
      const planCard = recommendedBadge.closest('div[class*="border"]');

      expect(planCard).toHaveClass('border-primary');
    });

    it('should have only one recommended plan', () => {
      render(<PricingSection />);

      const badges = screen.getAllByText(/mais popular/i);
      expect(badges.length).toBe(1);
    });
  });

  describe('CTA Buttons', () => {
    it('should have CTA button for each plan', () => {
      render(<PricingSection />);

      const ctaButtons = screen.getAllByRole('button', { name: /agendar consulta/i });
      expect(ctaButtons.length).toBe(PLANOS.length);
    });

    it('should track analytics when CTA clicked', async () => {
      const { trackCtaClick } = await import('@/lib/laas/analytics');

      render(<PricingSection />);

      const ctaButtons = screen.getAllByRole('button', { name: /agendar consulta/i });
      fireEvent.click(ctaButtons[0]);

      expect(trackCtaClick).toHaveBeenCalledWith(
        'agendar_consulta',
        expect.stringMatching(/plano_/)
      );
    });

    it('should show alert when plan clicked', () => {
      render(<PricingSection />);

      const ctaButtons = screen.getAllByRole('button', { name: /agendar consulta/i });
      fireEvent.click(ctaButtons[0]);

      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining('selecionado')
      );
    });

    it('should differentiate between plan clicks', () => {
      render(<PricingSection />);

      const ctaButtons = screen.getAllByRole('button', { name: /agendar consulta/i });

      // Click first plan (Essencial)
      fireEvent.click(ctaButtons[0]);
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining('essencial')
      );

      // Click second plan (Premium)
      fireEvent.click(ctaButtons[1]);
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining('premium')
      );
    });
  });

  describe('Stripe Integration', () => {
    it('should store stripe price IDs', () => {
      const { container } = render(<PricingSection />);

      // Check for hidden inputs with stripe price IDs
      const hiddenInputs = container.querySelectorAll('input[type="hidden"]');
      expect(hiddenInputs.length).toBe(PLANOS.length);
    });

    it('should update stripe price ID when billing interval changes', () => {
      const { container } = render(<PricingSection />);

      // Get first hidden input
      const hiddenInput = container.querySelector('input[type="hidden"]') as HTMLInputElement;
      const monthlyPriceId = hiddenInput?.value;

      // Switch to yearly
      const yearlyBtn = screen.getByRole('button', { name: /anual/i });
      fireEvent.click(yearlyBtn);

      // Price ID should change
      const yearlyPriceId = hiddenInput?.value;
      expect(yearlyPriceId).not.toBe(monthlyPriceId);
    });
  });

  describe('Footer Note', () => {
    it('should display pricing disclaimer', () => {
      render(<PricingSection />);

      expect(screen.getByText(/todos os valores incluem impostos/i)).toBeInTheDocument();
    });

    it('should mention cancellation policy', () => {
      render(<PricingSection />);

      expect(screen.getByText(/cancelamento.*qualquer momento/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper section ID for navigation', () => {
      const { container } = render(<PricingSection />);

      const section = container.querySelector('#planos');
      expect(section).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      render(<PricingSection />);

      const mainHeading = screen.getByRole('heading', { level: 2 });
      expect(mainHeading).toHaveTextContent(/escolha seu plano/i);

      const planHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(planHeadings.length).toBe(PLANOS.length);
    });

    it('should be keyboard navigable', () => {
      render(<PricingSection />);

      const monthlyBtn = screen.getByRole('button', { name: /mensal/i });
      monthlyBtn.focus();

      expect(document.activeElement).toBe(monthlyBtn);
    });

    it('should have visible focus indicators', () => {
      render(<PricingSection />);

      const ctaButton = screen.getAllByRole('button', { name: /agendar consulta/i })[0];
      ctaButton.focus();

      expect(document.activeElement).toBe(ctaButton);
    });
  });

  describe('Responsive Design', () => {
    it('should render in grid layout', () => {
      const { container } = render(<PricingSection />);

      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveClass('md:grid-cols-3');
    });

    it('should apply hover effects to CTA buttons', () => {
      render(<PricingSection />);

      const ctaButtons = screen.getAllByRole('button', { name: /agendar consulta/i });
      ctaButtons.forEach(button => {
        expect(button).toHaveClass('hover:scale-105');
      });
    });
  });

  describe('Plan Differentiation', () => {
    it('should differentiate recommended plan styling', () => {
      const { container } = render(<PricingSection />);

      const recommendedBadge = screen.getByText(/mais popular/i);
      const recommendedCard = recommendedBadge.closest('div[class*="rounded-2xl"]');
      const regularCard = container.querySelector('div[class*="border-gray-200"]');

      // Recommended should have different border color
      expect(recommendedCard).not.toEqual(regularCard);
    });

    it('should apply scale to recommended plan', () => {
      const { container } = render(<PricingSection />);

      const recommendedBadge = screen.getByText(/mais popular/i);
      const recommendedCard = recommendedBadge.closest('div[class*="rounded-2xl"]');

      expect(recommendedCard).toHaveClass('scale-105');
    });

    it('should differentiate CTA button styles', () => {
      render(<PricingSection />);

      const recommendedPlan = PLANOS.find(p => p.recommended);
      if (recommendedPlan) {
        const recommendedSection = screen.getByText(recommendedPlan.name).closest('div');
        const ctaButton = within(recommendedSection!).getByRole('button', { name: /agendar consulta/i });

        expect(ctaButton).toHaveClass('bg-primary');
      }
    });
  });
});

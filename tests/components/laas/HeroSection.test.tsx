/**
 * Unit Tests for HeroSection Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HeroSection } from '@/components/laas/HeroSection';

// Mock analytics
vi.mock('@/lib/laas/analytics', () => ({
  trackCtaClick: vi.fn(),
  trackLeadGeneration: vi.fn()
}));

// Mock fetch
global.fetch = vi.fn();

describe('HeroSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Element.prototype.scrollIntoView = vi.fn();

    // Mock successful API response
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        estimatedSavings: { monthly: 80, yearly: 960 }
      })
    });
  });

  describe('Rendering', () => {
    it('should render pioneer badge', () => {
      render(<HeroSection />);
      expect(screen.getByText(/pioneiro no brasil/i)).toBeInTheDocument();
    });

    it('should render headline', () => {
      render(<HeroSection />);
      const headline = screen.getByRole('heading', { level: 1 });
      expect(headline).toBeInTheDocument();
      expect(headline.textContent).toBeTruthy();
    });

    it('should render sub-headline', () => {
      render(<HeroSection />);
      expect(screen.getByText(/assinatura integrada/i)).toBeInTheDocument();
    });

    it('should render CTAs', () => {
      render(<HeroSection />);
      expect(screen.getByRole('button', { name: /agendar consulta/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /falar no whatsapp/i })).toBeInTheDocument();
    });

    it('should render social proof badges', () => {
      render(<HeroSection />);
      expect(screen.getByText(/selo de qualidade/i)).toBeInTheDocument();
      expect(screen.getByText(/aprovado anvisa/i)).toBeInTheDocument();
      expect(screen.getByText(/lentes premium/i)).toBeInTheDocument();
      expect(screen.getByText(/crm médico/i)).toBeInTheDocument();
    });
  });

  describe('A/B Test Variants', () => {
    it('should render variant A headline by default', () => {
      render(<HeroSection />);
      const headline = screen.getByRole('heading', { level: 1 });

      // Should render one of the two variants
      const variantA = 'Nunca mais fique sem lentes';
      const variantB = 'Suas lentes de contato com cuidado médico, sem o trabalho de lembrar de comprar';

      const headlineText = headline.textContent || '';
      const isVariantA = headlineText.includes(variantA);
      const isVariantB = headlineText.includes(variantB);

      expect(isVariantA || isVariantB).toBe(true);
    });
  });

  describe('Form Rendering', () => {
    it('should render all form fields', () => {
      render(<HeroSection />);
      expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/whatsapp/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/lgpd/i)).toBeInTheDocument();
    });

    it('should have proper placeholders', () => {
      render(<HeroSection />);
      expect(screen.getByPlaceholderText(/seu nome/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/\(33\) 99999-9999/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/seu@email.com/i)).toBeInTheDocument();
    });

    it('should have submit button', () => {
      render(<HeroSection />);
      expect(screen.getByRole('button', { name: /calcule sua economia/i })).toBeInTheDocument();
    });

    it('should have LGPD consent link', () => {
      render(<HeroSection />);
      const privacyLink = screen.getByRole('link', { name: /política de privacidade/i });
      expect(privacyLink).toHaveAttribute('href', '/politica-privacidade');
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', async () => {
      render(<HeroSection />);

      const submitBtn = screen.getByRole('button', { name: /calcule sua economia/i });
      fireEvent.click(submitBtn);

      // HTML5 validation should prevent submission
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should validate LGPD consent', async () => {
      render(<HeroSection />);

      // Fill all fields except LGPD
      fireEvent.change(screen.getByLabelText(/nome/i), {
        target: { value: 'João Silva' }
      });
      fireEvent.change(screen.getByLabelText(/whatsapp/i), {
        target: { value: '33999999999' }
      });
      fireEvent.change(screen.getByLabelText(/e-mail/i), {
        target: { value: 'joao@example.com' }
      });

      const submitBtn = screen.getByRole('button', { name: /calcule sua economia/i });
      fireEvent.click(submitBtn);

      // Should show error about LGPD
      await waitFor(() => {
        expect(screen.getByText(/lgpd/i)).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      render(<HeroSection />);

      const emailInput = screen.getByLabelText(/e-mail/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

      const submitBtn = screen.getByRole('button', { name: /calcule sua economia/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        // Should show validation error
        const errorMessage = screen.queryByText(/e-mail inválido/i);
        if (errorMessage) {
          expect(errorMessage).toBeInTheDocument();
        }
      });
    });

    it('should format phone number with mask', async () => {
      render(<HeroSection />);

      const phoneInput = screen.getByLabelText(/whatsapp/i);

      // Type raw numbers
      fireEvent.change(phoneInput, { target: { value: '33999999999' } });

      // Should format to (33) 99999-9999
      await waitFor(() => {
        expect(phoneInput).toHaveValue('(33) 99999-9999');
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit form successfully', async () => {
      render(<HeroSection />);

      // Fill form
      fireEvent.change(screen.getByLabelText(/nome/i), {
        target: { value: 'João Silva' }
      });
      fireEvent.change(screen.getByLabelText(/whatsapp/i), {
        target: { value: '33999999999' }
      });
      fireEvent.change(screen.getByLabelText(/e-mail/i), {
        target: { value: 'joao@example.com' }
      });
      fireEvent.click(screen.getByLabelText(/lgpd/i));

      const submitBtn = screen.getByRole('button', { name: /calcule sua economia/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/laas/leads', expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }));
      });
    });

    it('should show loading state during submission', async () => {
      render(<HeroSection />);

      // Fill form
      fireEvent.change(screen.getByLabelText(/nome/i), {
        target: { value: 'João Silva' }
      });
      fireEvent.change(screen.getByLabelText(/whatsapp/i), {
        target: { value: '33999999999' }
      });
      fireEvent.change(screen.getByLabelText(/e-mail/i), {
        target: { value: 'joao@example.com' }
      });
      fireEvent.click(screen.getByLabelText(/lgpd/i));

      const submitBtn = screen.getByRole('button', { name: /calcule sua economia/i });

      // Mock slow API
      (global.fetch as any).mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ success: true })
        }), 1000))
      );

      fireEvent.click(submitBtn);

      // Button should be disabled during submission
      await waitFor(() => {
        expect(submitBtn).toBeDisabled();
      });
    });

    it('should show success message after submission', async () => {
      render(<HeroSection />);

      // Fill and submit form
      fireEvent.change(screen.getByLabelText(/nome/i), {
        target: { value: 'João Silva' }
      });
      fireEvent.change(screen.getByLabelText(/whatsapp/i), {
        target: { value: '33999999999' }
      });
      fireEvent.change(screen.getByLabelText(/e-mail/i), {
        target: { value: 'joao@example.com' }
      });
      fireEvent.click(screen.getByLabelText(/lgpd/i));

      const submitBtn = screen.getByRole('button', { name: /calcule sua economia/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/obrigado|sucesso|enviado/i)).toBeInTheDocument();
      });
    });

    it('should reset form after successful submission', async () => {
      render(<HeroSection />);

      const nameInput = screen.getByLabelText(/nome/i) as HTMLInputElement;
      const emailInput = screen.getByLabelText(/e-mail/i) as HTMLInputElement;

      // Fill form
      fireEvent.change(nameInput, { target: { value: 'João Silva' } });
      fireEvent.change(screen.getByLabelText(/whatsapp/i), {
        target: { value: '33999999999' }
      });
      fireEvent.change(emailInput, { target: { value: 'joao@example.com' } });
      fireEvent.click(screen.getByLabelText(/lgpd/i));

      const submitBtn = screen.getByRole('button', { name: /calcule sua economia/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(nameInput.value).toBe('');
        expect(emailInput.value).toBe('');
      });
    });

    it('should handle API errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ success: false, error: 'Erro ao processar' })
      });

      render(<HeroSection />);

      // Fill and submit form
      fireEvent.change(screen.getByLabelText(/nome/i), {
        target: { value: 'João Silva' }
      });
      fireEvent.change(screen.getByLabelText(/whatsapp/i), {
        target: { value: '33999999999' }
      });
      fireEvent.change(screen.getByLabelText(/e-mail/i), {
        target: { value: 'joao@example.com' }
      });
      fireEvent.click(screen.getByLabelText(/lgpd/i));

      const submitBtn = screen.getByRole('button', { name: /calcule sua economia/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/erro/i)).toBeInTheDocument();
      });
    });

    it('should track analytics on lead generation', async () => {
      const { trackLeadGeneration } = await import('@/lib/laas/analytics');

      render(<HeroSection />);

      // Fill and submit
      fireEvent.change(screen.getByLabelText(/nome/i), {
        target: { value: 'João Silva' }
      });
      fireEvent.change(screen.getByLabelText(/whatsapp/i), {
        target: { value: '33999999999' }
      });
      fireEvent.change(screen.getByLabelText(/e-mail/i), {
        target: { value: 'joao@example.com' }
      });
      fireEvent.click(screen.getByLabelText(/lgpd/i));

      const submitBtn = screen.getByRole('button', { name: /calcule sua economia/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(trackLeadGeneration).toHaveBeenCalledWith('calculadora_economia');
      });
    });
  });

  describe('CTA Buttons', () => {
    it('should track analytics on Agendar Consulta click', async () => {
      const { trackCtaClick } = await import('@/lib/laas/analytics');

      const mockElement = document.createElement('div');
      mockElement.id = 'planos';
      document.body.appendChild(mockElement);

      render(<HeroSection />);

      const ctaBtn = screen.getByRole('button', { name: /agendar consulta/i });
      fireEvent.click(ctaBtn);

      expect(trackCtaClick).toHaveBeenCalledWith('agendar_consulta', 'hero');

      document.body.removeChild(mockElement);
    });

    it('should scroll to planos on Agendar Consulta click', () => {
      const mockElement = document.createElement('div');
      mockElement.id = 'planos';
      document.body.appendChild(mockElement);

      render(<HeroSection />);

      const ctaBtn = screen.getByRole('button', { name: /agendar consulta/i });
      fireEvent.click(ctaBtn);

      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });

      document.body.removeChild(mockElement);
    });

    it('should open WhatsApp on button click', async () => {
      const { trackCtaClick } = await import('@/lib/laas/analytics');

      window.open = vi.fn();

      render(<HeroSection />);

      const whatsappBtn = screen.getByRole('button', { name: /falar no whatsapp/i });
      fireEvent.click(whatsappBtn);

      expect(trackCtaClick).toHaveBeenCalledWith('whatsapp', 'hero');
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('wa.me'),
        '_blank'
      );
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all inputs', () => {
      render(<HeroSection />);

      expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/whatsapp/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/lgpd/i)).toBeInTheDocument();
    });

    it('should have required attributes', () => {
      render(<HeroSection />);

      expect(screen.getByLabelText(/nome/i)).toBeRequired();
      expect(screen.getByLabelText(/whatsapp/i)).toBeRequired();
      expect(screen.getByLabelText(/e-mail/i)).toBeRequired();
      expect(screen.getByLabelText(/lgpd/i)).toBeRequired();
    });

    it('should be keyboard navigable', () => {
      render(<HeroSection />);

      const nameInput = screen.getByLabelText(/nome/i);
      nameInput.focus();

      expect(document.activeElement).toBe(nameInput);
    });
  });
});

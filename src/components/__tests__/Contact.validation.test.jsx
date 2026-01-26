import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Contact from '../Contact';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, defaultValue) => defaultValue || key,
    i18n: { language: 'pt' }
  })
}));

vi.mock('@/lib/clinicInfo', () => ({
  clinicInfo: {
    name: 'Clínica Saraiva Vision',
    onlineSchedulingUrl: 'https://www.saraivavision.com.br/agendamento'
  },
  googleMapsProfileUrl: 'https://maps.google.com',
  NAP_CANONICAL: {
    phone: {
      whatsapp: { raw: '5533998601427' }
    }
  },
  generateWhatsAppURL: () => 'https://wa.me/5533998601427'
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    section: ({ children, ...props }) => <section {...props}>{children}</section>,
    h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
  }
}));

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }) => <button {...props}>{children}</button>
}));

vi.mock('@/hooks/useRecaptcha', () => ({
  useRecaptcha: () => ({
    ready: true,
    execute: vi.fn().mockResolvedValue('mock-token')
  })
}));

vi.mock('@/lib/apiUtils', () => ({
  submitContactForm: vi.fn().mockResolvedValue({ success: true }),
  useConnectionStatus: () => ({ isOnline: true }),
  networkMonitor: {}
}));

vi.mock('@/lib/errorHandling', () => ({
  getUserFriendlyError: vi.fn(),
  logError: vi.fn()
}));

vi.mock('@/lib/validation', () => ({
  validateField: (field, value) => {
    if (!value || value.trim() === '') {
      return { success: false, error: 'Campo obrigatório' };
    }
    if (field === 'email' && !value.includes('@')) {
      return { success: false, error: 'E-mail inválido' };
    }
    return { success: true, value, error: null };
  },
  validateContactSubmission: (data) => {
    const errors = {};
    if (!data.name) errors.name = 'Nome é obrigatório';
    if (!data.email) errors.email = 'E-mail é obrigatório';
    if (!data.message) errors.message = 'Mensagem é obrigatória';
    if (!data.consent) errors.consent = 'Consentimento é obrigatório';
    
    return Object.keys(errors).length > 0
      ? { success: false, errors }
      : { success: true, data };
  }
}));

vi.mock('@/hooks/useAnalytics', () => ({
  useAnalytics: () => ({
    trackFormView: vi.fn(),
    trackFormSubmit: vi.fn(),
    trackInteraction: vi.fn()
  }),
  useVisibilityTracking: () => null,
  useSaraivaTracking: () => ({
    trackContactInteraction: vi.fn(),
    trackAppointmentRequest: vi.fn()
  })
}));

vi.mock('@/lib/lgpd/consentManager', () => ({
  consentManager: {
    hasValidConsent: () => true
  }
}));

vi.mock('@/components/ui/ErrorFeedback', () => ({
  default: ({ error }) => <div data-testid="error-feedback">{error?.message}</div>
}));

describe('Contact Form Validation - UX Improvements', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should NOT show validation errors while typing', async () => {
    render(<Contact />);

    const nameInput = screen.getByLabelText(/nome/i);

    // Start typing
    fireEvent.change(nameInput, { target: { value: 'Jo' } });

    // Should NOT show error while typing (even if incomplete)
    await waitFor(() => {
      const errorMessage = screen.queryByText(/campo obrigatório/i);
      expect(errorMessage).not.toBeInTheDocument();
    }, { timeout: 500 });
  });

  it('should clear errors when user starts typing in a field with error', async () => {
    render(<Contact />);

    const nameInput = screen.getByLabelText(/nome/i);

    // Blur without entering anything (should show error)
    fireEvent.focus(nameInput);
    fireEvent.blur(nameInput);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/campo obrigatório/i)).toBeInTheDocument();
    });

    // Start typing - error should disappear
    fireEvent.change(nameInput, { target: { value: 'J' } });

    await waitFor(() => {
      const errorMessage = screen.queryByText(/campo obrigatório/i);
      expect(errorMessage).not.toBeInTheDocument();
    });
  });

  it('should show validation error on blur if field is empty', async () => {
    render(<Contact />);

    const emailInput = screen.getByLabelText(/e-mail/i);

    // Focus and blur without entering anything
    fireEvent.focus(emailInput);
    fireEvent.blur(emailInput);

    // Should show error after blur
    await waitFor(() => {
      expect(screen.getByText(/campo obrigatório/i)).toBeInTheDocument();
    });
  });

  it('should validate email format on blur', async () => {
    render(<Contact />);

    const emailInput = screen.getByLabelText(/e-mail/i);

    // Type invalid email
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    // Should show format error
    await waitFor(() => {
      expect(screen.getByText(/e-mail inválido/i)).toBeInTheDocument();
    });
  });

  it('should allow smooth typing experience without interruptions', async () => {
    render(<Contact />);

    const messageInput = screen.getByLabelText(/mensagem/i);

    // Type a long message
    const longMessage = 'Esta é uma mensagem de teste para verificar que o usuário pode digitar livremente sem interrupções de validação';
    
    fireEvent.change(messageInput, { target: { value: longMessage } });

    // Verify the full message was typed
    expect(messageInput).toHaveValue(longMessage);

    // No errors should be visible during typing
    const errors = screen.queryAllByRole('alert');
    expect(errors.length).toBe(0);
  });

  it('should validate all fields on form submit', async () => {
    render(<Contact />);

    const submitButton = screen.getByRole('button', { name: /enviar/i });

    // Try to submit empty form
    fireEvent.click(submitButton);

    // Should show errors for all required fields
    await waitFor(() => {
      const errorMessages = screen.getAllByText(/obrigatório/i);
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });

  it('should enable submit button when form is valid', async () => {
    render(<Contact />);

    // Fill all required fields
    fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: 'João Silva' } });
    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'joao@email.com' } });
    fireEvent.change(screen.getByLabelText(/telefone/i), { target: { value: '33999999999' } });
    fireEvent.change(screen.getByLabelText(/mensagem/i), { target: { value: 'Gostaria de agendar consulta' } });
    
    const consentCheckbox = screen.getByRole('checkbox', { name: /concordo/i });
    fireEvent.click(consentCheckbox);

    const submitButton = screen.getByRole('button', { name: /enviar/i });
    
    // Button should be enabled
    expect(submitButton).not.toBeDisabled();
  });

  it('should show success message after successful submission', async () => {
    const { submitContactForm } = await import('@/lib/apiUtils');
    submitContactForm.mockResolvedValueOnce({ success: true });

    render(<Contact />);

    // Fill form
    fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: 'João Silva' } });
    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'joao@email.com' } });
    fireEvent.change(screen.getByLabelText(/telefone/i), { target: { value: '33999999999' } });
    fireEvent.change(screen.getByLabelText(/mensagem/i), { target: { value: 'Teste' } });
    fireEvent.click(screen.getByRole('checkbox', { name: /concordo/i }));

    // Submit
    const submitButton = screen.getByRole('button', { name: /enviar/i });
    fireEvent.click(submitButton);

    // Should show success state
    await waitFor(() => {
      expect(screen.getByText(/mensagem enviada/i)).toBeInTheDocument();
    });
  });

  it('should clear form after successful submission', async () => {
    const { submitContactForm } = await import('@/lib/apiUtils');
    submitContactForm.mockResolvedValueOnce({ success: true });

    render(<Contact />);

    const nameInput = screen.getByLabelText(/nome/i);
    const emailInput = screen.getByLabelText(/e-mail/i);

    // Fill and submit
    fireEvent.change(nameInput, { target: { value: 'João Silva' } });
    fireEvent.change(emailInput, { target: { value: 'joao@email.com' } });
    fireEvent.change(screen.getByLabelText(/telefone/i), { target: { value: '33999999999' } });
    fireEvent.change(screen.getByLabelText(/mensagem/i), { target: { value: 'Teste' } });
    fireEvent.click(screen.getByRole('checkbox', { name: /concordo/i }));

    const submitButton = screen.getByRole('button', { name: /enviar/i });
    fireEvent.click(submitButton);

    // Form should be cleared
    await waitFor(() => {
      expect(nameInput).toHaveValue('');
      expect(emailInput).toHaveValue('');
    });
  });

  it('should not validate honeypot field', async () => {
    render(<Contact />);

    // Honeypot field should exist but be hidden
    const honeypotField = document.querySelector('input[name="honeypot"]');
    expect(honeypotField).toBeInTheDocument();
    
    // Typing in honeypot should not trigger validation
    if (honeypotField) {
      fireEvent.change(honeypotField, { target: { value: 'bot value' } });
      fireEvent.blur(honeypotField);
      
      // No validation errors should appear
      await waitFor(() => {
        const errors = screen.queryAllByRole('alert');
        expect(errors.length).toBe(0);
      }, { timeout: 500 });
    }
  });
});

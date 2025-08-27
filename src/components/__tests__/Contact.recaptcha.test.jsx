import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import Contact from '../Contact';
import { Toaster } from '../ui/toaster';

// Mock react-google-recaptcha
vi.mock('react-google-recaptcha', () => ({
  __esModule: true,
  default: vi.fn(({ onChange, onExpired, onError }) => (
    <div data-testid="recaptcha-mock">
      <button 
        onClick={() => onChange('mock-recaptcha-token')} 
        data-testid="recaptcha-complete"
      >
        Complete reCAPTCHA
      </button>
      <button 
        onClick={() => onExpired()} 
        data-testid="recaptcha-expire"
      >
        Expire reCAPTCHA
      </button>
      <button 
        onClick={() => onError()} 
        data-testid="recaptcha-error"
      >
        Error reCAPTCHA
      </button>
    </div>
  )),
}));

// Mock fetch for API calls
global.fetch = vi.fn();

const renderContact = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <Contact />
      <Toaster />
    </I18nextProvider>
  );
};

describe('Contact Component - reCAPTCHA Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Mock environment variable
    import.meta.env.VITE_RECAPTCHA_SITE_KEY = 'test-site-key';
  });

  it('renders reCAPTCHA component', () => {
    renderContact();
    
    expect(screen.getByTestId('recaptcha-mock')).toBeInTheDocument();
    expect(screen.getByText('Verificação de Segurança')).toBeInTheDocument();
  });

  it('shows validation error when form is submitted without completing reCAPTCHA', async () => {
    renderContact();
    
    // Fill in form fields
    fireEvent.change(screen.getByLabelText(/nome/i), {
      target: { value: 'João Silva' }
    });
    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: 'joao@email.com' }
    });
    fireEvent.change(screen.getByLabelText(/telefone/i), {
      target: { value: '33998601427' }
    });
    fireEvent.change(screen.getByLabelText(/mensagem/i), {
      target: { value: 'Esta é uma mensagem de teste' }
    });
    fireEvent.click(screen.getByRole('checkbox'));
    
    // Submit form without completing reCAPTCHA
    fireEvent.click(screen.getByRole('button', { name: /enviar mensagem/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/complete a verificação reCAPTCHA/i)).toBeInTheDocument();
    });
  });

  it('allows form submission after completing reCAPTCHA', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'Message sent successfully' })
    });

    renderContact();
    
    // Fill in form fields
    fireEvent.change(screen.getByLabelText(/nome/i), {
      target: { value: 'João Silva' }
    });
    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: 'joao@email.com' }
    });
    fireEvent.change(screen.getByLabelText(/telefone/i), {
      target: { value: '33998601427' }
    });
    fireEvent.change(screen.getByLabelText(/mensagem/i), {
      target: { value: 'Esta é uma mensagem de teste' }
    });
    fireEvent.click(screen.getByRole('checkbox'));
    
    // Complete reCAPTCHA
    fireEvent.click(screen.getByTestId('recaptcha-complete'));
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /enviar mensagem/i }));
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'João Silva',
          email: 'joao@email.com',
          phone: '33998601427',
          message: 'Esta é uma mensagem de teste',
          consent: true,
          recaptchaToken: 'mock-recaptcha-token'
        })
      });
    });
  });

  it('handles reCAPTCHA expiration', async () => {
    renderContact();
    
    // Complete then expire reCAPTCHA
    fireEvent.click(screen.getByTestId('recaptcha-complete'));
    fireEvent.click(screen.getByTestId('recaptcha-expire'));
    
    await waitFor(() => {
      expect(screen.getByText(/reCAPTCHA expirado/i)).toBeInTheDocument();
    });
  });

  it('handles reCAPTCHA error', async () => {
    renderContact();
    
    // Trigger reCAPTCHA error
    fireEvent.click(screen.getByTestId('recaptcha-error'));
    
    await waitFor(() => {
      expect(screen.getByText(/erro no reCAPTCHA/i)).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'reCAPTCHA validation failed' })
    });

    renderContact();
    
    // Fill form and complete reCAPTCHA
    fireEvent.change(screen.getByLabelText(/nome/i), {
      target: { value: 'João Silva' }
    });
    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: 'joao@email.com' }
    });
    fireEvent.change(screen.getByLabelText(/telefone/i), {
      target: { value: '33998601427' }
    });
    fireEvent.change(screen.getByLabelText(/mensagem/i), {
      target: { value: 'Esta é uma mensagem de teste' }
    });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByTestId('recaptcha-complete'));
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /enviar mensagem/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/erro no envio/i)).toBeInTheDocument();
    });
  });
});
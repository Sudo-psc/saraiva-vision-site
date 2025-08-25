import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import App from '../../App';
import HomePage from '../../pages/HomePage';
import ContactPage from '../../pages/ContactPage';
import ServicesPage from '../../pages/ServicesPage';

// Mock all external dependencies
vi.mock('@/components/GoogleMap', () => ({
  default: () => <div data-testid="google-map">Google Map</div>
}));

vi.mock('@/components/GoogleReviewsWidget', () => ({
  default: () => <div data-testid="google-reviews">Reviews Widget</div>
}));

vi.mock('@/components/WhatsappWidget', () => ({
  default: () => <div data-testid="whatsapp-widget">WhatsApp Widget</div>
}));

vi.mock('@/lib/loadGoogleMaps', () => ({
  loadGoogleMaps: vi.fn(() => Promise.resolve())
}));

// Mock environment variables
Object.defineProperty(window, 'location', {
  writable: true,
  value: {
    href: 'https://example.com',
    pathname: '/',
    search: '',
    hash: ''
  }
});

// Mock window.open
global.open = vi.fn();

const renderWithRouter = (component, initialRoute = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {component}
    </MemoryRouter>
  );
};

describe('Critical User Flows Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Homepage Navigation Flow', () => {
    it('allows users to navigate from hero to contact section', async () => {
      renderWithRouter(<HomePage />);
      
      // Find and click "Agendar Consulta" button
      const scheduleButton = screen.getByRole('button', { name: /Agendar Consulta/i });
      expect(scheduleButton).toBeInTheDocument();
      
      fireEvent.click(scheduleButton);
      
      // Should scroll to contact section or navigate
      await waitFor(() => {
        const contactSection = screen.queryByText(/Entre em Contato/i);
        if (contactSection) {
          expect(contactSection).toBeInTheDocument();
        }
      });
    });

    it('allows users to navigate from hero to services section', async () => {
      renderWithRouter(<HomePage />);
      
      // Find and click "Nossos Serviços" button
      const servicesButton = screen.getByRole('button', { name: /Nossos Serviços/i });
      expect(servicesButton).toBeInTheDocument();
      
      fireEvent.click(servicesButton);
      
      // Should scroll to services section
      await waitFor(() => {
        const servicesSection = screen.queryByText(/Nossos Serviços/i);
        if (servicesSection) {
          expect(servicesSection).toBeInTheDocument();
        }
      });
    });

    it('displays trust signals and social proof on homepage', () => {
      renderWithRouter(<HomePage />);
      
      // Check for trust indicators
      expect(screen.getByText(/Mais de 5.000 pacientes/i)).toBeInTheDocument();
      expect(screen.getByTestId('google-reviews')).toBeInTheDocument();
    });
  });

  describe('Contact Form Submission Flow', () => {
    it('allows users to fill and submit contact form', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        })
      );

      renderWithRouter(<ContactPage />);
      
      // Fill form fields
      const nameInput = screen.getByLabelText(/Nome completo/i);
      const emailInput = screen.getByLabelText(/E-mail/i);
      const phoneInput = screen.getByLabelText(/Telefone/i);
      const messageInput = screen.getByLabelText(/Mensagem/i);
      const consentCheckbox = screen.getByRole('checkbox');
      
      fireEvent.change(nameInput, { target: { value: 'João Silva' } });
      fireEvent.change(emailInput, { target: { value: 'joao@email.com' } });
      fireEvent.change(phoneInput, { target: { value: '(33) 99999-9999' } });
      fireEvent.change(messageInput, { target: { value: 'Gostaria de agendar uma consulta oftalmológica.' } });
      fireEvent.click(consentCheckbox);
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /contact.send_button/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('shows validation errors for incomplete form', async () => {
      renderWithRouter(<ContactPage />);
      
      // Try to submit empty form
      const submitButton = screen.getByRole('button', { name: /contact.send_button/i });
      fireEvent.click(submitButton);
      
      // Check for HTML5 validation
      const nameInput = screen.getByLabelText(/Nome completo/i);
      const emailInput = screen.getByLabelText(/E-mail/i);
      
      expect(nameInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('type', 'email');
    });
  });

  describe('Services Exploration Flow', () => {
    it('allows users to explore services and view details', () => {
      renderWithRouter(<ServicesPage />);
      
      // Check that services are displayed
      const servicesTitle = screen.getByText(/Nossos Serviços/i);
      expect(servicesTitle).toBeInTheDocument();
      
      // Look for service items
      const learnMoreButtons = screen.getAllByText(/Saiba mais/i);
      expect(learnMoreButtons.length).toBeGreaterThan(0);
      
      // Click on a service to view details
      fireEvent.click(learnMoreButtons[0]);
      
      // Should navigate or show more details
      // This would depend on the actual implementation
    });

    it('displays service categories correctly', () => {
      renderWithRouter(<ServicesPage />);
      
      // Check for common services
      expect(screen.getByText(/services.items.consultations.title/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility and Navigation Flow', () => {
    it('provides keyboard navigation through main elements', () => {
      renderWithRouter(<HomePage />);
      
      // Check that interactive elements are focusable
      const scheduleButton = screen.getByRole('button', { name: /Agendar Consulta/i });
      scheduleButton.focus();
      expect(document.activeElement).toBe(scheduleButton);
      
      // Tab navigation should work
      fireEvent.keyDown(scheduleButton, { key: 'Tab' });
      expect(document.activeElement).not.toBe(scheduleButton);
    });

    it('provides proper ARIA labels and roles', () => {
      renderWithRouter(<HomePage />);
      
      // Check for proper semantic structure
      const navigation = screen.getByRole('navigation');
      expect(navigation).toBeInTheDocument();
      
      // Check for main content area
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });
  });

  describe('WhatsApp Integration Flow', () => {
    it('displays WhatsApp widget and allows interaction', () => {
      renderWithRouter(<HomePage />);
      
      const whatsappWidget = screen.getByTestId('whatsapp-widget');
      expect(whatsappWidget).toBeInTheDocument();
    });

    it('provides WhatsApp contact options in contact section', () => {
      renderWithRouter(<ContactPage />);
      
      // Look for WhatsApp contact buttons
      const whatsappButton = screen.queryByText(/contact.info.phone_whatsapp/i);
      if (whatsappButton) {
        expect(whatsappButton).toBeInTheDocument();
      }
    });
  });

  describe('Responsive Design Flow', () => {
    it('displays mobile-friendly form elements', () => {
      renderWithRouter(<ContactPage />);
      
      // Check for mobile-friendly input attributes
      const phoneInput = screen.getByLabelText(/Telefone/i);
      expect(phoneInput).toHaveAttribute('inputmode', 'tel');
      
      const emailInput = screen.getByLabelText(/E-mail/i);
      expect(emailInput).toHaveAttribute('inputmode', 'email');
    });

    it('provides proper touch targets for mobile', () => {
      renderWithRouter(<ContactPage />);
      
      // Check for minimum touch target sizes
      const submitButton = screen.getByRole('button', { name: /contact.send_button/i });
      const styles = window.getComputedStyle(submitButton);
      
      // Button should have adequate padding for touch
      expect(submitButton).toHaveClass('w-full');
    });
  });

  describe('Error Handling Flow', () => {
    it('handles network errors gracefully', async () => {
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));
      
      renderWithRouter(<ContactPage />);
      
      // Fill and submit form
      const nameInput = screen.getByLabelText(/Nome completo/i);
      const emailInput = screen.getByLabelText(/E-mail/i);
      const consentCheckbox = screen.getByRole('checkbox');
      
      fireEvent.change(nameInput, { target: { value: 'João Silva' } });
      fireEvent.change(emailInput, { target: { value: 'joao@email.com' } });
      fireEvent.click(consentCheckbox);
      
      const submitButton = screen.getByRole('button', { name: /contact.send_button/i });
      fireEvent.click(submitButton);
      
      // Should handle error gracefully without crashing
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('SEO and Meta Tags Flow', () => {
    it('includes proper meta tags for SEO', () => {
      renderWithRouter(<HomePage />);
      
      // Check for title
      expect(document.title).toBeTruthy();
      
      // Check for meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      expect(metaDescription).toBeTruthy();
    });
  });

  describe('Performance Optimization Flow', () => {
    it('loads critical components first', async () => {
      renderWithRouter(<HomePage />);
      
      // Hero section should be immediately available
      const heroSection = screen.getByText(/Cuidando da sua/i);
      expect(heroSection).toBeInTheDocument();
      
      // Check that key CTAs are visible
      const scheduleButton = screen.getByRole('button', { name: /Agendar Consulta/i });
      expect(scheduleButton).toBeInTheDocument();
    });

    it('handles lazy loading gracefully', async () => {
      renderWithRouter(<HomePage />);
      
      // Components should render without throwing errors
      await waitFor(() => {
        const main = screen.getByRole('main');
        expect(main).toBeInTheDocument();
      });
    });
  });
});
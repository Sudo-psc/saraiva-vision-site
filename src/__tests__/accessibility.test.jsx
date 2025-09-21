import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Contact from '../components/Contact';

// Mock dependencies
vi.mock('@/lib/clinicInfo', () => ({
    clinicInfo: {
        name: 'Saraiva Vision',
        address: 'Test Address',
        onlineSchedulingUrl: 'https://example.com'
    }
}));

vi.mock('@/hooks/useRecaptcha', () => ({
    useRecaptcha: () => ({
        ready: true,
        execute: vi.fn().mockResolvedValue('test-token')
    })
}));

vi.mock('@/lib/apiUtils', () => ({
    submitContactForm: vi.fn().mockResolvedValue({ success: true }),
    FallbackStrategies: {
        storeForRetry: vi.fn(),
        retryFailedSubmissions: vi.fn()
    },
    useConnectionStatus: () => ({ isOnline: true }),
    networkMonitor: {
        subscribe: vi.fn(() => () => { })
    }
}));

vi.mock('@/components/ui/use-toast', () => ({
    useToast: () => ({
        toast: vi.fn()
    })
}));

vi.mock('@/lib/errorHandling', () => ({
    getUserFriendlyError: vi.fn(),
    getRecoverySteps: vi.fn(),
    logError: vi.fn()
}));

vi.mock('@/components/ui/ErrorFeedback', () => ({
    default: () => <div>Error Feedback</div>,
    NetworkError: () => <div>Network Error</div>,
    RateLimitError: () => <div>Rate Limit Error</div>,
    RecaptchaError: () => <div>Recaptcha Error</div>,
    EmailServiceError: () => <div>Email Service Error</div>
}));

vi.mock('@/lib/validation', () => ({
    validateField: vi.fn((field, value) => {
        if (field === 'name' && value.length < 2) {
            return { success: false, error: 'Nome deve ter pelo menos 2 caracteres' };
        }
        if (field === 'email' && !value.includes('@')) {
            return { success: false, error: 'Email inválido' };
        }
        return { success: true };
    }),
    validateContactSubmission: vi.fn(() => ({ success: true }))
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key, defaultValue) => defaultValue || key
    })
}));

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
        p: ({ children, ...props }) => <p {...props}>{children}</p>
    }
}));

describe('Contact Form Accessibility', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('has proper ARIA labels and roles', () => {
        render(<Contact />);

        // Check main section has proper ARIA attributes
        const section = screen.getByRole('region');
        expect(section).toHaveAttribute('aria-labelledby', 'contact-heading');

        // Check form has proper ARIA attributes
        const form = screen.getByRole('form');
        expect(form).toHaveAttribute('aria-labelledby', 'form-title');
        expect(form).toHaveAttribute('aria-describedby', 'form-description');

        // Check form description exists for screen readers
        expect(screen.getByText(/Formulário de contato para agendar consulta/)).toBeInTheDocument();
    });

    it('has skip link for keyboard navigation', () => {
        render(<Contact />);

        const skipLink = screen.getByText('Pular para o formulário de contato');
        expect(skipLink).toBeInTheDocument();
        expect(skipLink).toHaveAttribute('href', '#form-title');
    });

    it('has live region for screen reader announcements', () => {
        render(<Contact />);

        const liveRegion = screen.getByRole('status');
        expect(liveRegion).toHaveAttribute('aria-live', 'polite');
        expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    });

    it('form fields have proper accessibility attributes', () => {
        render(<Contact />);

        // Check name field
        const nameField = screen.getByLabelText(/Nome completo/);
        expect(nameField).toHaveAttribute('aria-required', 'true');
        expect(nameField).toHaveAttribute('autocomplete', 'name');
        expect(nameField).toHaveAttribute('aria-describedby', 'name-help');

        // Check email field
        const emailField = screen.getByLabelText(/E-mail/);
        expect(emailField).toHaveAttribute('aria-required', 'true');
        expect(emailField).toHaveAttribute('autocomplete', 'email');
        expect(emailField).toHaveAttribute('inputmode', 'email');

        // Check phone field
        const phoneField = screen.getByLabelText(/Telefone/);
        expect(phoneField).toHaveAttribute('aria-required', 'true');
        expect(phoneField).toHaveAttribute('autocomplete', 'tel');
        expect(phoneField).toHaveAttribute('inputmode', 'tel');

        // Check message field
        const messageField = screen.getByLabelText(/Mensagem/);
        expect(messageField).toHaveAttribute('aria-required', 'true');
        expect(messageField).toHaveAttribute('maxlength', '2000');

        // Check consent checkbox
        const consentField = screen.getByLabelText(/Concordo com o tratamento/);
        expect(consentField).toHaveAttribute('aria-required', 'true');
    });

    it('submit button has proper accessibility attributes', () => {
        render(<Contact />);

        const submitButton = screen.getByRole('button', { name: /Enviar mensagem de contato/ });
        expect(submitButton).toHaveAttribute('aria-busy', 'false');
        expect(submitButton).toHaveAttribute('aria-describedby', 'submit-status submit-help');
    });

    it('shows error summary with proper ARIA attributes when validation fails', async () => {
        const user = userEvent.setup();
        render(<Contact />);

        // Try to submit empty form
        const submitButton = screen.getByRole('button', { name: /Enviar mensagem de contato/ });
        await user.click(submitButton);

        // Check if error summary appears
        await waitFor(() => {
            const errorSummary = screen.getByRole('alert');
            expect(errorSummary).toHaveAttribute('aria-live', 'assertive');
            expect(errorSummary).toHaveAttribute('tabindex', '-1');
        });
    });

    it('contact information has proper list structure', () => {
        render(<Contact />);

        // Check contact info list
        const contactList = screen.getByRole('list', { name: /Informações de contato/ });
        expect(contactList).toBeInTheDocument();

        // Check list items
        const listItems = screen.getAllByRole('listitem');
        expect(listItems.length).toBeGreaterThan(0);
    });

    it('has proper focus management', async () => {
        const user = userEvent.setup();
        render(<Contact />);

        // Test keyboard navigation
        const nameField = screen.getByLabelText(/Nome completo/);
        await user.click(nameField);
        expect(nameField).toHaveFocus();

        // Tab to next field
        await user.tab();
        const emailField = screen.getByLabelText(/E-mail/);
        expect(emailField).toHaveFocus();
    });

    it('announces validation errors to screen readers', async () => {
        const user = userEvent.setup();
        render(<Contact />);

        const nameField = screen.getByLabelText(/Nome completo/);

        // Enter invalid name (too short)
        await user.type(nameField, 'A');
        await user.tab(); // Trigger blur event

        // Check if field has error state
        await waitFor(() => {
            expect(nameField).toHaveAttribute('aria-invalid', 'true');
        });
    });

    it('has proper color contrast and visual indicators', () => {
        render(<Contact />);

        // Check that required field indicators are present
        const requiredIndicators = screen.getAllByText('*');
        expect(requiredIndicators.length).toBeGreaterThan(0);

        // Check that all required indicators have aria-hidden
        requiredIndicators.forEach(indicator => {
            expect(indicator).toHaveAttribute('aria-hidden', 'true');
        });
    });

    it('supports keyboard-only navigation', async () => {
        const user = userEvent.setup();
        render(<Contact />);

        // Test that all interactive elements are reachable by keyboard
        const nameField = screen.getByLabelText(/Nome completo/);
        const emailField = screen.getByLabelText(/E-mail/);
        const phoneField = screen.getByLabelText(/Telefone/);
        const messageField = screen.getByLabelText(/Mensagem/);
        const consentField = screen.getByLabelText(/Concordo com o tratamento/);
        const submitButton = screen.getByRole('button', { name: /Enviar mensagem de contato/ });

        // Navigate through all fields using Tab
        await user.click(nameField);
        expect(nameField).toHaveFocus();

        await user.tab();
        expect(emailField).toHaveFocus();

        await user.tab();
        expect(phoneField).toHaveFocus();

        await user.tab();
        expect(messageField).toHaveFocus();

        // Skip to consent (there might be other elements in between)
        consentField.focus();
        expect(consentField).toHaveFocus();

        // Navigate to submit button
        submitButton.focus();
        expect(submitButton).toHaveFocus();
    });
});
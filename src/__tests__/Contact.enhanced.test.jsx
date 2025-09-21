import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Contact from '@/components/Contact';

// Mock all dependencies
vi.mock('@/lib/apiUtils', () => ({
    submitContactForm: vi.fn(),
    FallbackStrategies: {
        storeForRetry: vi.fn(),
        retryFailedSubmissions: vi.fn()
    },
    useConnectionStatus: vi.fn(() => ({ isOnline: true })),
    networkMonitor: {
        subscribe: vi.fn(() => vi.fn())
    }
}));

vi.mock('@/lib/errorHandling', () => ({
    getUserFriendlyError: vi.fn(),
    getRecoverySteps: vi.fn(),
    logError: vi.fn()
}));

vi.mock('@/hooks/useRecaptcha', () => ({
    useRecaptcha: vi.fn(() => ({
        ready: true,
        execute: vi.fn().mockResolvedValue('mock-token')
    }))
}));

vi.mock('@/components/ui/use-toast', () => ({
    useToast: vi.fn(() => ({
        toast: vi.fn()
    }))
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

vi.mock('@/lib/clinicInfo', () => ({
    clinicInfo: {
        name: 'Test Clinic',
        address: 'Test Address',
        onlineSchedulingUrl: 'https://example.com'
    }
}));

vi.mock('@/components/ui/button', () => ({
    Button: ({ children, ...props }) => <button {...props}>{children}</button>
}));

vi.mock('@/components/ui/ErrorFeedback', () => ({
    default: ({ error, onRetry, onDismiss }) => (
        <div data-testid="error-feedback">
            <p>{error?.message || 'Error occurred'}</p>
            {onRetry && <button onClick={onRetry}>Retry</button>}
            {onDismiss && <button onClick={onDismiss}>Dismiss</button>}
        </div>
    )
}));

describe('Enhanced Contact Form', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the enhanced contact form with LGPD consent', () => {
        render(<Contact />);

        // Check for form fields
        expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/telefone/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/mensagem/i)).toBeInTheDocument();

        // Check for LGPD consent section
        expect(screen.getByText(/Proteção de Dados Pessoais \(LGPD\)/i)).toBeInTheDocument();
        expect(screen.getByText(/Concordo com o tratamento dos meus dados pessoais/i)).toBeInTheDocument();

        // Check for submit button
        expect(screen.getByRole('button', { name: /enviar mensagem/i })).toBeInTheDocument();
    });

    it('shows real-time validation feedback', async () => {
        const user = userEvent.setup();
        render(<Contact />);

        const nameInput = screen.getByLabelText(/nome completo/i);

        // Type a short name to trigger validation
        await user.type(nameInput, 'A');
        await user.tab(); // Trigger blur event

        await waitFor(() => {
            expect(screen.getByText(/Nome deve ter pelo menos/i)).toBeInTheDocument();
        });

        // Type a valid name
        await user.clear(nameInput);
        await user.type(nameInput, 'João Silva');
        await user.tab();

        await waitFor(() => {
            expect(screen.getByText(/Nome válido/i)).toBeInTheDocument();
        });
    });

    it('shows character count for message field', () => {
        render(<Contact />);

        const messageField = screen.getByLabelText(/mensagem/i);
        expect(screen.getByText('0/2000')).toBeInTheDocument();
    });

    it('displays validation icons for form fields', async () => {
        const user = userEvent.setup();
        render(<Contact />);

        const emailInput = screen.getByLabelText(/e-mail/i);

        // Type invalid email
        await user.type(emailInput, 'invalid-email');
        await user.tab();

        // Should show error icon (AlertCircle)
        await waitFor(() => {
            const errorIcon = screen.getByLabelText(/e-mail/i).parentElement.querySelector('[data-lucide="alert-circle"]');
            expect(errorIcon).toBeInTheDocument();
        });
    });

    it('shows success message after form submission', async () => {
        const { submitContactForm } = await import('@/lib/apiUtils');
        submitContactForm.mockResolvedValue({ success: true });

        const user = userEvent.setup();
        render(<Contact />);

        // Fill form with valid data
        await user.type(screen.getByLabelText(/nome completo/i), 'João Silva');
        await user.type(screen.getByLabelText(/e-mail/i), 'joao@example.com');
        await user.type(screen.getByLabelText(/telefone/i), '5533998601427');
        await user.type(screen.getByLabelText(/mensagem/i), 'Esta é uma mensagem de teste com conteúdo suficiente');
        await user.click(screen.getByLabelText(/concordo com o tratamento/i));

        // Submit form
        await user.click(screen.getByRole('button', { name: /enviar mensagem/i }));

        // Should show success message
        await waitFor(() => {
            expect(screen.getByText(/Mensagem enviada com sucesso!/i)).toBeInTheDocument();
        });
    });

    it('requires LGPD consent before submission', async () => {
        const user = userEvent.setup();
        render(<Contact />);

        // Fill form without consent
        await user.type(screen.getByLabelText(/nome completo/i), 'João Silva');
        await user.type(screen.getByLabelText(/e-mail/i), 'joao@example.com');
        await user.type(screen.getByLabelText(/telefone/i), '5533998601427');
        await user.type(screen.getByLabelText(/mensagem/i), 'Esta é uma mensagem de teste com conteúdo suficiente');

        // Try to submit without consent
        await user.click(screen.getByRole('button', { name: /enviar mensagem/i }));

        // Should show consent error
        await waitFor(() => {
            expect(screen.getByText(/aceitar os termos de privacidade/i)).toBeInTheDocument();
        });
    });
});
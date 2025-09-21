import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Contact from '@/components/Contact';
import { submitContactForm, FallbackStrategies, networkMonitor } from '@/lib/apiUtils';
import { getUserFriendlyError, getRecoverySteps } from '@/lib/errorHandling';
import ErrorFeedback from '@/components/ui/ErrorFeedback';

// Mock dependencies
vi.mock('@/lib/apiUtils');
vi.mock('@/lib/errorHandling');
vi.mock('@/hooks/useRecaptcha', () => ({
    useRecaptcha: vi.fn()
}));
vi.mock('@/components/ui/use-toast', () => ({
    useToast: vi.fn()
}));

describe('Contact Component Error Handling Integration', () => {
    const mockToast = {
        toast: vi.fn()
    };

    const mockRecaptcha = {
        ready: true,
        execute: vi.fn()
    };

    beforeEach(async () => {
        vi.clearAllMocks();

        // Setup default mocks
        submitContactForm.mockResolvedValue({
            success: true,
            data: { id: '123' },
            timestamp: new Date().toISOString()
        });

        getUserFriendlyError.mockReturnValue({
            userMessage: 'Test error message',
            severity: 'medium',
            type: 'network',
            recovery: 'Try again'
        });

        getRecoverySteps.mockReturnValue(['Step 1', 'Step 2']);

        // Mock hooks
        const { useToast } = await import('@/components/ui/use-toast');
        const { useRecaptcha } = await import('@/hooks/useRecaptcha');

        vi.mocked(useToast).mockReturnValue(mockToast);
        vi.mocked(useRecaptcha).mockReturnValue(mockRecaptcha);

        // Mock network monitor
        networkMonitor.isOnline = vi.fn(() => true);
        networkMonitor.subscribe = vi.fn(() => vi.fn());
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Form Submission Error Handling', () => {
        it('displays error feedback when submission fails', async () => {
            // Mock submission failure
            submitContactForm.mockRejectedValue(new Error('Network error'));
            getUserFriendlyError.mockReturnValue({
                userMessage: 'Falha na conexão.',
                severity: 'medium',
                type: 'network',
                recovery: 'Verifique sua conexão'
            });

            render(<Contact />);

            // Fill form with valid data
            await userEvent.type(screen.getByLabelText(/nome completo/i), 'John Doe');
            await userEvent.type(screen.getByLabelText(/e-mail/i), 'john@example.com');
            await userEvent.type(screen.getByLabelText(/telefone/i), '5533998601427');
            await userEvent.type(screen.getByLabelText(/mensagem/i), 'Test message with sufficient length');
            await userEvent.click(screen.getByLabelText(/consent/i));

            // Submit form
            const submitButton = screen.getByRole('button', { name: /enviar mensagem/i });
            await userEvent.click(submitButton);

            // Wait for error to be displayed
            await waitFor(() => {
                expect(screen.getByText('Falha na conexão.')).toBeInTheDocument();
            });

            // Verify ErrorFeedback component is rendered
            expect(screen.getByTestId('error-feedback')).toBeInTheDocument();
        });

        it('shows retry button for recoverable errors', async () => {
            submitContactForm.mockRejectedValue(new Error('Network error'));
            getUserFriendlyError.mockReturnValue({
                userMessage: 'Falha na conexão.',
                severity: 'medium',
                type: 'network',
                recovery: 'Verifique sua conexão'
            });

            render(<Contact />);

            // Fill and submit form
            await userEvent.type(screen.getByLabelText(/nome completo/i), 'John Doe');
            await userEvent.type(screen.getByLabelText(/e-mail/i), 'john@example.com');
            await userEvent.type(screen.getByLabelText(/telefone/i), '5533998601427');
            await userEvent.type(screen.getByLabelText(/mensagem/i), 'Test message with sufficient length');
            await userEvent.click(screen.getByLabelText(/consent/i));

            const submitButton = screen.getByRole('button', { name: /enviar mensagem/i });
            await userEvent.click(submitButton);

            // Wait for error and retry button
            await waitFor(() => {
                expect(screen.getByText('Falha na conexão.')).toBeInTheDocument();
                expect(screen.getByRole('button', { name: /tentar novamente/i })).toBeInTheDocument();
            });
        });

        it('does not show retry button for non-recoverable errors after max attempts', async () => {
            submitContactForm.mockRejectedValue(new Error('Critical error'));
            getUserFriendlyError.mockReturnValue({
                userMessage: 'Erro crítico.',
                severity: 'critical',
                type: 'critical',
                recovery: 'Contact support'
            });

            render(<Contact />);

            // Fill and submit form
            await userEvent.type(screen.getByLabelText(/nome completo/i), 'John Doe');
            await userEvent.type(screen.getByLabelText(/e-mail/i), 'john@example.com');
            await userEvent.type(screen.getByLabelText(/telefone/i), '5533998601427');
            await userEvent.type(screen.getByLabelText(/mensagem/i), 'Test message with sufficient length');
            await userEvent.click(screen.getByLabelText(/consent/i));

            const submitButton = screen.getByRole('button', { name: /enviar mensagem/i });
            await userEvent.click(submitButton);

            // Wait for error
            await waitFor(() => {
                expect(screen.getByText('Erro crítico.')).toBeInTheDocument();
            });

            // Should not have retry button
            expect(screen.queryByRole('button', { name: /tentar novamente/i })).not.toBeInTheDocument();
        });
    });

    describe('Network Status Handling', () => {
        it('disables submit button when offline', () => {
            networkMonitor.isOnline = vi.fn(() => false);

            render(<Contact />);

            const submitButton = screen.getByRole('button', { name: /sem conexão/i });
            expect(submitButton).toBeDisabled();
        });

        it('shows connection status indicator', () => {
            networkMonitor.isOnline = vi.fn(() => false);

            render(<Contact />);

            expect(screen.getByText('Sem conexão com a internet')).toBeInTheDocument();
            expect(screen.getByText('Verifique sua conexão para enviar o formulário.')).toBeInTheDocument();
        });

        it('auto-retries when coming back online', async () => {
            // Initial offline state
            networkMonitor.isOnline = vi.fn(() => false);

            render(<Contact />);

            // Fill form
            await userEvent.type(screen.getByLabelText(/nome completo/i), 'John Doe');
            await userEvent.type(screen.getByLabelText(/e-mail/i), 'john@example.com');
            await userEvent.type(screen.getByLabelText(/telefone/i), '5533998601427');
            await userEvent.type(screen.getByLabelText(/mensagem/i), 'Test message with sufficient length');
            await userEvent.click(screen.getByLabelText(/consent/i));

            // Try to submit (should fail due to offline)
            const submitButton = screen.getByRole('button', { name: /sem conexão/i });
            expect(submitButton).toBeDisabled();

            // Simulate coming back online
            networkMonitor.isOnline = vi.fn(() => true);

            // Trigger online event (this would normally be handled by the effect)
            const onlineEvent = new Event('online');
            window.dispatchEvent(onlineEvent);

            // Button should be enabled now
            await waitFor(() => {
                const newSubmitButton = screen.getByRole('button', { name: /enviar mensagem/i });
                expect(newSubmitButton).toBeEnabled();
            });
        });
    });

    describe('Retry Mechanism', () => {
        it('handles retry with exponential backoff', async () => {
            let attemptCount = 0;
            submitContactForm
                .mockRejectedValueOnce(new Error('Network error'))
                .mockRejectedValueOnce(new Error('Network error'))
                .mockResolvedValue({
                    success: true,
                    data: { id: '123' },
                    timestamp: new Date().toISOString()
                });

            render(<Contact />);

            // Fill form
            await userEvent.type(screen.getByLabelText(/nome completo/i), 'John Doe');
            await userEvent.type(screen.getByLabelText(/e-mail/i), 'john@example.com');
            await userEvent.type(screen.getByLabelText(/telefone/i), '5533998601427');
            await userEvent.type(screen.getByLabelText(/mensagem/i), 'Test message with sufficient length');
            await userEvent.click(screen.getByLabelText(/consent/i));

            // Submit and fail
            const submitButton = screen.getByRole('button', { name: /enviar mensagem/i });
            await userEvent.click(submitButton);

            // Wait for error
            await waitFor(() => {
                expect(screen.getByText(/falha na conexão/i)).toBeInTheDocument();
            });

            // Click retry
            const retryButton = screen.getByRole('button', { name: /tentar novamente/i });
            await userEvent.click(retryButton);

            // Should show retrying state
            expect(screen.getByText(/tentando novamente \(1\/3\)/i)).toBeInTheDocument();

            // Wait for success
            await waitFor(() => {
                expect(mockToast.toast).toHaveBeenCalledWith({
                    title: expect.any(String),
                    description: expect.any(String),
                    duration: 5000
                });
            });
        });

        it('limits retry attempts to 3', async () => {
            submitContactForm.mockRejectedValue(new Error('Persistent error'));

            render(<Contact />);

            // Fill form
            await userEvent.type(screen.getByLabelText(/nome completo/i), 'John Doe');
            await userEvent.type(screen.getByLabelText(/e-mail/i), 'john@example.com');
            await userEvent.type(screen.getByLabelText(/telefone/i), '5533998601427');
            await userEvent.type(screen.getByLabelText(/mensagem/i), 'Test message with sufficient length');
            await userEvent.click(screen.getByLabelText(/consent/i));

            // Submit and fail 3 times with retries
            for (let i = 0; i < 3; i++) {
                const submitButton = screen.getByRole('button', { name: /enviar mensagem/i });
                await userEvent.click(submitButton);

                await waitFor(() => {
                    expect(screen.getByText(/falha na conexão/i)).toBeInTheDocument();
                });

                if (i < 2) {
                    const retryButton = screen.getByRole('button', { name: /tentar novamente/i });
                    await userEvent.click(retryButton);

                    await waitFor(() => {
                        expect(screen.getByText(/tentando novamente \(${i + 1}\/3\)/i)).toBeInTheDocument();
                    });
                }
            }

            // After 3 attempts, should show alternative contacts
            await waitFor(() => {
                expect(screen.getByText('Contato Alternativo')).toBeInTheDocument();
                expect(screen.getByText('+55 33 99860-1427')).toBeInTheDocument();
                expect(screen.getByText('saraivavision@gmail.com')).toBeInTheDocument();
            });
        });
    });

    describe('Fallback Strategies', () => {
        it('stores failed submissions for retry', async () => {
            submitContactForm.mockRejectedValue(new Error('Network error'));
            FallbackStrategies.storeForRetry.mockReturnValue(true);

            render(<Contact />);

            // Fill and submit form
            await userEvent.type(screen.getByLabelText(/nome completo/i), 'John Doe');
            await userEvent.type(screen.getByLabelText(/e-mail/i), 'john@example.com');
            await userEvent.type(screen.getByLabelText(/telefone/i), '5533998601427');
            await userEvent.type(screen.getByLabelText(/mensagem/i), 'Test message with sufficient length');
            await userEvent.click(screen.getByLabelText(/consent/i));

            const submitButton = screen.getByRole('button', { name: /enviar mensagem/i });
            await userEvent.click(submitButton);

            // Should attempt to store for retry
            await waitFor(() => {
                expect(FallbackStrategies.storeForRetry).toHaveBeenCalledWith(
                    expect.objectContaining({
                        name: 'John Doe',
                        email: 'john@example.com'
                    })
                );
            });

            // Should show saved message toast
            expect(mockToast.toast).toHaveBeenCalledWith({
                title: 'Mensagem salva',
                description: 'Sua mensagem foi salva e será enviada quando a conexão for restabelecida.',
                duration: 4000
            });
        });

        it('shows alternative contacts for critical errors', async () => {
            submitContactForm.mockRejectedValue(new Error('Server error', { status: 500 }));

            render(<Contact />);

            // Fill and submit form
            await userEvent.type(screen.getByLabelText(/nome completo/i), 'John Doe');
            await userEvent.type(screen.getByLabelText(/e-mail/i), 'john@example.com');
            await userEvent.type(screen.getByLabelText(/telefone/i), '5533998601427');
            await userEvent.type(screen.getByLabelText(/mensagem/i), 'Test message with sufficient length');
            await userEvent.click(screen.getByLabelText(/consent/i));

            const submitButton = screen.getByRole('button', { name: /enviar mensagem/i });
            await userEvent.click(submitButton);

            // Should show alternative contacts
            await waitFor(() => {
                expect(screen.getByText('Contato Alternativo')).toBeInTheDocument();
                expect(screen.getByText('Não foi possível enviar sua mensagem. Entre em contato diretamente:')).toBeInTheDocument();
            });
        });
    });

    describe('Error Recovery Steps', () => {
        it('displays recovery steps for different error types', async () => {
            submitContactForm.mockRejectedValue(new Error('Network error'));
            getRecoverySteps.mockReturnValue([
                'Verifique sua conexão com a internet',
                'Tente reiniciar seu roteador',
                'Entre em contato se o problema persistir'
            ]);

            render(<Contact />);

            // Fill and submit form
            await userEvent.type(screen.getByLabelText(/nome completo/i), 'John Doe');
            await userEvent.type(screen.getByLabelText(/e-mail/i), 'john@example.com');
            await userEvent.type(screen.getByLabelText(/telefone/i), '5533998601427');
            await userEvent.type(screen.getByLabelText(/mensagem/i), 'Test message with sufficient length');
            await userEvent.click(screen.getByLabelText(/consent/i));

            const submitButton = screen.getByRole('button', { name: /enviar mensagem/i });
            await userEvent.click(submitButton);

            // Should show recovery steps
            await waitFor(() => {
                expect(screen.getByText('Verifique sua conexão com a internet')).toBeInTheDocument();
                expect(screen.getByText('Tente reiniciar seu roteador')).toBeInTheDocument();
                expect(screen.getByText('Entre em contato se o problema persistir')).toBeInTheDocument();
            });
        });
    });

    describe('Form Validation Errors', () => {
        it('shows field-specific error messages', async () => {
            getUserFriendlyError.mockReturnValue({
                userMessage: 'Nome deve ter pelo menos 3 caracteres',
                severity: 'low',
                type: 'validation',
                field: 'name',
                recovery: 'Digite um nome válido'
            });

            render(<Contact />);

            // Submit with invalid name
            await userEvent.type(screen.getByLabelText(/nome completo/i), 'Jo'); // Too short
            await userEvent.type(screen.getByLabelText(/e-mail/i), 'john@example.com');
            await userEvent.type(screen.getByLabelText(/telefone/i), '5533998601427');
            await userEvent.type(screen.getByLabelText(/mensagem/i), 'Test message with sufficient length');
            await userEvent.click(screen.getByLabelText(/consent/i));

            const submitButton = screen.getByRole('button', { name: /enviar mensagem/i });
            await userEvent.click(submitButton);

            // Should show field-specific error
            await waitFor(() => {
                expect(screen.getByText('Nome deve ter pelo menos 3 caracteres')).toBeInTheDocument();
            });
        });
    });

    describe('Success Scenarios', () => {
        it('resets form and shows success message on successful submission', async () => {
            render(<Contact />);

            // Fill form
            await userEvent.type(screen.getByLabelText(/nome completo/i), 'John Doe');
            await userEvent.type(screen.getByLabelText(/e-mail/i), 'john@example.com');
            await userEvent.type(screen.getByLabelText(/telefone/i), '5533998601427');
            await userEvent.type(screen.getByLabelText(/mensagem/i), 'Test message with sufficient length');
            await userEvent.click(screen.getByLabelText(/consent/i));

            // Submit form
            const submitButton = screen.getByRole('button', { name: /enviar mensagem/i });
            await userEvent.click(submitButton);

            // Should show success toast
            await waitFor(() => {
                expect(mockToast.toast).toHaveBeenCalledWith({
                    title: expect.any(String),
                    description: expect.any(String),
                    duration: 5000
                });
            });

            // Form should be reset
            expect(screen.getByLabelText(/nome completo/i)).toHaveValue('');
            expect(screen.getByLabelText(/e-mail/i)).toHaveValue('');
            expect(screen.getByLabelText(/telefone/i)).toHaveValue('');
            expect(screen.getByLabelText(/mensagem/i)).toHaveValue('');
            expect(screen.getByLabelText(/consent/i)).not.toBeChecked();
        });
    });

    describe('reCAPTCHA Integration', () => {
        it('handles reCAPTCHA errors gracefully', async () => {
            mockRecaptcha.execute.mockResolvedValue(null); // No token
            getUserFriendlyError.mockReturnValue({
                userMessage: 'Falha na verificação reCAPTCHA',
                severity: 'medium',
                type: 'recaptcha',
                recovery: 'Tente novamente'
            });

            render(<Contact />);

            // Fill form
            await userEvent.type(screen.getByLabelText(/nome completo/i), 'John Doe');
            await userEvent.type(screen.getByLabelText(/e-mail/i), 'john@example.com');
            await userEvent.type(screen.getByLabelText(/telefone/i), '5533998601427');
            await userEvent.type(screen.getByLabelText(/mensagem/i), 'Test message with sufficient length');
            await userEvent.click(screen.getByLabelText(/consent/i));

            // Submit form
            const submitButton = screen.getByRole('button', { name: /enviar mensagem/i });
            await userEvent.click(submitButton);

            // Should show reCAPTCHA error
            await waitFor(() => {
                expect(screen.getByText('Falha na verificação reCAPTCHA')).toBeInTheDocument();
            });
        });

        it('shows reCAPTCHA status', () => {
            mockRecaptcha.ready = false;

            render(<Contact />);

            expect(screen.getByText('Verificação de segurança indisponível. Tente novamente.')).toBeInTheDocument();
            expect(screen.getByText('Certifique-se de que está conectado à internet e recarregue a página.')).toBeInTheDocument();
        });
    });
});

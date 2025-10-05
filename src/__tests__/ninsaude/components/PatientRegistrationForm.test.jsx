/**
 * PatientRegistrationForm Component Tests (TDD)
 * Tests for the Ninsaúde patient registration form component
 *
 * Expected: These tests will FAIL initially until the component is created
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PatientRegistrationForm from '@/components/ninsaude/PatientRegistrationForm';

describe('PatientRegistrationForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Form Rendering', () => {
        it('renders all required fields', () => {
            render(<PatientRegistrationForm />);

            // Patient info fields
            expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/cpf/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/data de nascimento/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/telefone/i)).toBeInTheDocument();

            // LGPD consent checkbox
            expect(screen.getByLabelText(/concordo com o tratamento dos meus dados/i)).toBeInTheDocument();

            // Submit button
            expect(screen.getByRole('button', { name: /cadastrar/i })).toBeInTheDocument();
        });

        it('displays LGPD consent text', () => {
            render(<PatientRegistrationForm />);

            expect(screen.getByText(/lei geral de proteção de dados/i)).toBeInTheDocument();
            expect(screen.getByText(/privacidade/i)).toBeInTheDocument();
        });
    });

    describe('CPF Validation', () => {
        it('validates CPF format (Brazilian format with 11 digits)', async () => {
            render(<PatientRegistrationForm />);

            const cpfInput = screen.getByLabelText(/cpf/i);

            // Invalid CPF - too short
            await userEvent.type(cpfInput, '123.456.789');
            fireEvent.blur(cpfInput);

            await waitFor(() => {
                expect(screen.getByText(/cpf inválido/i)).toBeInTheDocument();
            });
        });

        it('validates CPF check digits', async () => {
            render(<PatientRegistrationForm />);

            const cpfInput = screen.getByLabelText(/cpf/i);

            // Invalid CPF - wrong check digits
            await userEvent.type(cpfInput, '123.456.789-00');
            fireEvent.blur(cpfInput);

            await waitFor(() => {
                expect(screen.getByText(/cpf inválido/i)).toBeInTheDocument();
            });
        });

        it('accepts valid CPF', async () => {
            render(<PatientRegistrationForm />);

            const cpfInput = screen.getByLabelText(/cpf/i);

            // Valid CPF format
            await userEvent.type(cpfInput, '123.456.789-09');
            fireEvent.blur(cpfInput);

            await waitFor(() => {
                expect(screen.queryByText(/cpf inválido/i)).not.toBeInTheDocument();
            });
        });

        it('auto-formats CPF input with dots and dash', async () => {
            render(<PatientRegistrationForm />);

            const cpfInput = screen.getByLabelText(/cpf/i);

            await userEvent.type(cpfInput, '12345678909');

            await waitFor(() => {
                expect(cpfInput).toHaveValue('123.456.789-09');
            });
        });
    });

    describe('Required Field Validation', () => {
        it('validates all required fields on submit', async () => {
            render(<PatientRegistrationForm />);

            const submitButton = screen.getByRole('button', { name: /cadastrar/i });
            await userEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument();
                expect(screen.getByText(/cpf é obrigatório/i)).toBeInTheDocument();
                expect(screen.getByText(/e-mail é obrigatório/i)).toBeInTheDocument();
                expect(screen.getByText(/telefone é obrigatório/i)).toBeInTheDocument();
            });
        });

        it('validates name minimum length', async () => {
            render(<PatientRegistrationForm />);

            const nameInput = screen.getByLabelText(/nome completo/i);
            await userEvent.type(nameInput, 'Jo');
            fireEvent.blur(nameInput);

            await waitFor(() => {
                expect(screen.getByText(/nome deve ter pelo menos 3 caracteres/i)).toBeInTheDocument();
            });
        });

        it('validates email format', async () => {
            render(<PatientRegistrationForm />);

            const emailInput = screen.getByLabelText(/e-mail/i);
            await userEvent.type(emailInput, 'invalid-email');
            fireEvent.blur(emailInput);

            await waitFor(() => {
                expect(screen.getByText(/e-mail inválido/i)).toBeInTheDocument();
            });
        });

        it('validates phone format', async () => {
            render(<PatientRegistrationForm />);

            const phoneInput = screen.getByLabelText(/telefone/i);
            await userEvent.type(phoneInput, '999');
            fireEvent.blur(phoneInput);

            await waitFor(() => {
                expect(screen.getByText(/telefone inválido/i)).toBeInTheDocument();
            });
        });

        it('validates birthdate is in the past', async () => {
            render(<PatientRegistrationForm />);

            const birthdateInput = screen.getByLabelText(/data de nascimento/i);
            const futureDate = new Date();
            futureDate.setFullYear(futureDate.getFullYear() + 1);

            await userEvent.type(birthdateInput, futureDate.toISOString().split('T')[0]);
            fireEvent.blur(birthdateInput);

            await waitFor(() => {
                expect(screen.getByText(/data de nascimento deve estar no passado/i)).toBeInTheDocument();
            });
        });
    });

    describe('LGPD Consent Requirement', () => {
        it('requires LGPD consent checkbox to be checked before submit', async () => {
            const mockOnSubmit = vi.fn();
            render(<PatientRegistrationForm onSubmit={mockOnSubmit} />);

            // Fill all required fields
            await userEvent.type(screen.getByLabelText(/nome completo/i), 'João Silva');
            await userEvent.type(screen.getByLabelText(/cpf/i), '123.456.789-09');
            await userEvent.type(screen.getByLabelText(/e-mail/i), 'joao@example.com');
            await userEvent.type(screen.getByLabelText(/telefone/i), '(33) 99999-9999');

            const submitButton = screen.getByRole('button', { name: /cadastrar/i });
            await userEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/você deve concordar com os termos de privacidade/i)).toBeInTheDocument();
            });

            expect(mockOnSubmit).not.toHaveBeenCalled();
        });

        it('allows submit when LGPD consent is checked', async () => {
            const mockOnSubmit = vi.fn();
            render(<PatientRegistrationForm onSubmit={mockOnSubmit} />);

            // Fill all required fields
            await userEvent.type(screen.getByLabelText(/nome completo/i), 'João Silva');
            await userEvent.type(screen.getByLabelText(/cpf/i), '123.456.789-09');
            await userEvent.type(screen.getByLabelText(/e-mail/i), 'joao@example.com');
            await userEvent.type(screen.getByLabelText(/telefone/i), '(33) 99999-9999');

            // Check LGPD consent
            const consentCheckbox = screen.getByLabelText(/concordo com o tratamento dos meus dados/i);
            await userEvent.click(consentCheckbox);

            const submitButton = screen.getByRole('button', { name: /cadastrar/i });
            await userEvent.click(submitButton);

            await waitFor(() => {
                expect(mockOnSubmit).toHaveBeenCalledWith(
                    expect.objectContaining({
                        name: 'João Silva',
                        cpf: '123.456.789-09',
                        email: 'joao@example.com',
                        phone: '(33) 99999-9999',
                        lgpdConsent: true
                    })
                );
            });
        });
    });

    describe('Form Submission', () => {
        it('submits form with valid data', async () => {
            const mockOnSubmit = vi.fn();
            render(<PatientRegistrationForm onSubmit={mockOnSubmit} />);

            // Fill all fields
            await userEvent.type(screen.getByLabelText(/nome completo/i), 'João Silva');
            await userEvent.type(screen.getByLabelText(/cpf/i), '123.456.789-09');
            await userEvent.type(screen.getByLabelText(/data de nascimento/i), '1990-01-15');
            await userEvent.type(screen.getByLabelText(/e-mail/i), 'joao@example.com');
            await userEvent.type(screen.getByLabelText(/telefone/i), '(33) 99999-9999');
            await userEvent.click(screen.getByLabelText(/concordo com o tratamento dos meus dados/i));

            const submitButton = screen.getByRole('button', { name: /cadastrar/i });
            await userEvent.click(submitButton);

            await waitFor(() => {
                expect(mockOnSubmit).toHaveBeenCalledWith({
                    name: 'João Silva',
                    cpf: '123.456.789-09',
                    birthdate: '1990-01-15',
                    email: 'joao@example.com',
                    phone: '(33) 99999-9999',
                    lgpdConsent: true
                });
            });
        });

        it('disables submit button while submitting', async () => {
            const mockOnSubmit = vi.fn(() => new Promise(resolve => setTimeout(resolve, 1000)));
            render(<PatientRegistrationForm onSubmit={mockOnSubmit} />);

            // Fill form
            await userEvent.type(screen.getByLabelText(/nome completo/i), 'João Silva');
            await userEvent.type(screen.getByLabelText(/cpf/i), '123.456.789-09');
            await userEvent.type(screen.getByLabelText(/e-mail/i), 'joao@example.com');
            await userEvent.type(screen.getByLabelText(/telefone/i), '(33) 99999-9999');
            await userEvent.click(screen.getByLabelText(/concordo com o tratamento dos meus dados/i));

            const submitButton = screen.getByRole('button', { name: /cadastrar/i });
            await userEvent.click(submitButton);

            expect(submitButton).toBeDisabled();
            expect(screen.getByText(/cadastrando/i)).toBeInTheDocument();
        });

        it('shows error message on submission failure', async () => {
            const mockOnSubmit = vi.fn().mockRejectedValue(new Error('Network error'));
            render(<PatientRegistrationForm onSubmit={mockOnSubmit} />);

            // Fill and submit form
            await userEvent.type(screen.getByLabelText(/nome completo/i), 'João Silva');
            await userEvent.type(screen.getByLabelText(/cpf/i), '123.456.789-09');
            await userEvent.type(screen.getByLabelText(/e-mail/i), 'joao@example.com');
            await userEvent.type(screen.getByLabelText(/telefone/i), '(33) 99999-9999');
            await userEvent.click(screen.getByLabelText(/concordo com o tratamento dos meus dados/i));

            const submitButton = screen.getByRole('button', { name: /cadastrar/i });
            await userEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/erro ao cadastrar paciente/i)).toBeInTheDocument();
            });
        });

        it('resets form after successful submission', async () => {
            const mockOnSubmit = vi.fn().mockResolvedValue({ success: true });
            render(<PatientRegistrationForm onSubmit={mockOnSubmit} />);

            // Fill and submit form
            await userEvent.type(screen.getByLabelText(/nome completo/i), 'João Silva');
            await userEvent.type(screen.getByLabelText(/cpf/i), '123.456.789-09');
            await userEvent.type(screen.getByLabelText(/e-mail/i), 'joao@example.com');
            await userEvent.type(screen.getByLabelText(/telefone/i), '(33) 99999-9999');
            await userEvent.click(screen.getByLabelText(/concordo com o tratamento dos meus dados/i));

            const submitButton = screen.getByRole('button', { name: /cadastrar/i });
            await userEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByLabelText(/nome completo/i)).toHaveValue('');
                expect(screen.getByLabelText(/cpf/i)).toHaveValue('');
                expect(screen.getByLabelText(/e-mail/i)).toHaveValue('');
            });
        });
    });
});

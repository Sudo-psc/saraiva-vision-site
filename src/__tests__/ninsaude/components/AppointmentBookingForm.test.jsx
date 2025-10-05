/**
 * AppointmentBookingForm Component Tests (TDD)
 * Tests for the multi-step Ninsaúde appointment booking wizard
 *
 * Expected: These tests will FAIL initially until the component is created
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AppointmentBookingForm from '@/components/ninsaude/AppointmentBookingForm';

describe('AppointmentBookingForm', () => {
    const mockSlots = {
        '2024-10-15': [
            { time: '09:00', available: true, professional: 'Dr. Philipe Saraiva' },
            { time: '09:30', available: true, professional: 'Dr. Philipe Saraiva' }
        ]
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Multi-step Wizard Flow', () => {
        it('renders step 1 (slot selection) initially', () => {
            render(<AppointmentBookingForm slots={mockSlots} />);

            expect(screen.getByText(/passo 1 de 3/i)).toBeInTheDocument();
            expect(screen.getByText(/selecione data e horário/i)).toBeInTheDocument();
        });

        it('displays step indicator with all steps', () => {
            render(<AppointmentBookingForm slots={mockSlots} />);

            expect(screen.getByText(/1.*data e horário/i)).toBeInTheDocument();
            expect(screen.getByText(/2.*dados pessoais/i)).toBeInTheDocument();
            expect(screen.getByText(/3.*confirmação/i)).toBeInTheDocument();
        });

        it('progresses to step 2 after selecting slot', async () => {
            render(<AppointmentBookingForm slots={mockSlots} />);

            // Select date and time slot (assuming SlotPicker is rendered)
            const nextButton = screen.getByRole('button', { name: /próximo/i });

            // Initially disabled
            expect(nextButton).toBeDisabled();

            // Mock slot selection
            fireEvent.click(screen.getByText('09:00'));

            await waitFor(() => {
                expect(nextButton).not.toBeDisabled();
            });

            await userEvent.click(nextButton);

            await waitFor(() => {
                expect(screen.getByText(/passo 2 de 3/i)).toBeInTheDocument();
                expect(screen.getByText(/dados pessoais/i)).toBeInTheDocument();
            });
        });

        it('progresses to step 3 after filling patient data', async () => {
            render(<AppointmentBookingForm slots={mockSlots} />);

            // Navigate to step 2
            fireEvent.click(screen.getByText('09:00'));
            await userEvent.click(screen.getByRole('button', { name: /próximo/i }));

            await waitFor(() => {
                expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
            });

            // Fill patient data
            await userEvent.type(screen.getByLabelText(/nome completo/i), 'João Silva');
            await userEvent.type(screen.getByLabelText(/cpf/i), '123.456.789-09');
            await userEvent.type(screen.getByLabelText(/e-mail/i), 'joao@example.com');
            await userEvent.type(screen.getByLabelText(/telefone/i), '(33) 99999-9999');
            await userEvent.click(screen.getByLabelText(/concordo com o tratamento dos meus dados/i));

            await userEvent.click(screen.getByRole('button', { name: /próximo/i }));

            await waitFor(() => {
                expect(screen.getByText(/passo 3 de 3/i)).toBeInTheDocument();
                expect(screen.getByText(/confirmação/i)).toBeInTheDocument();
            });
        });

        it('shows all steps in order', async () => {
            render(<AppointmentBookingForm slots={mockSlots} />);

            // Step 1
            expect(screen.getByText(/passo 1 de 3/i)).toBeInTheDocument();

            // Navigate to step 2
            fireEvent.click(screen.getByText('09:00'));
            await userEvent.click(screen.getByRole('button', { name: /próximo/i }));

            await waitFor(() => {
                expect(screen.getByText(/passo 2 de 3/i)).toBeInTheDocument();
            });

            // Fill and navigate to step 3
            await userEvent.type(screen.getByLabelText(/nome completo/i), 'João Silva');
            await userEvent.type(screen.getByLabelText(/cpf/i), '123.456.789-09');
            await userEvent.type(screen.getByLabelText(/e-mail/i), 'joao@example.com');
            await userEvent.type(screen.getByLabelText(/telefone/i), '(33) 99999-9999');
            await userEvent.click(screen.getByLabelText(/concordo com o tratamento dos meus dados/i));
            await userEvent.click(screen.getByRole('button', { name: /próximo/i }));

            await waitFor(() => {
                expect(screen.getByText(/passo 3 de 3/i)).toBeInTheDocument();
            });
        });
    });

    describe('Step Validation Before Progression', () => {
        it('prevents progression from step 1 without slot selection', async () => {
            render(<AppointmentBookingForm slots={mockSlots} />);

            const nextButton = screen.getByRole('button', { name: /próximo/i });
            expect(nextButton).toBeDisabled();
        });

        it('prevents progression from step 2 with invalid patient data', async () => {
            render(<AppointmentBookingForm slots={mockSlots} />);

            // Navigate to step 2
            fireEvent.click(screen.getByText('09:00'));
            await userEvent.click(screen.getByRole('button', { name: /próximo/i }));

            await waitFor(() => {
                expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
            });

            // Fill incomplete data
            await userEvent.type(screen.getByLabelText(/nome completo/i), 'Jo'); // Too short

            const nextButton = screen.getByRole('button', { name: /próximo/i });
            await userEvent.click(nextButton);

            await waitFor(() => {
                expect(screen.getByText(/nome deve ter pelo menos 3 caracteres/i)).toBeInTheDocument();
                // Should still be on step 2
                expect(screen.getByText(/passo 2 de 3/i)).toBeInTheDocument();
            });
        });

        it('requires LGPD consent before progression from step 2', async () => {
            render(<AppointmentBookingForm slots={mockSlots} />);

            // Navigate to step 2
            fireEvent.click(screen.getByText('09:00'));
            await userEvent.click(screen.getByRole('button', { name: /próximo/i }));

            await waitFor(() => {
                expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
            });

            // Fill all data except consent
            await userEvent.type(screen.getByLabelText(/nome completo/i), 'João Silva');
            await userEvent.type(screen.getByLabelText(/cpf/i), '123.456.789-09');
            await userEvent.type(screen.getByLabelText(/e-mail/i), 'joao@example.com');
            await userEvent.type(screen.getByLabelText(/telefone/i), '(33) 99999-9999');

            const nextButton = screen.getByRole('button', { name: /próximo/i });
            await userEvent.click(nextButton);

            await waitFor(() => {
                expect(screen.getByText(/você deve concordar com os termos de privacidade/i)).toBeInTheDocument();
            });
        });

        it('validates all required fields before allowing progression', async () => {
            render(<AppointmentBookingForm slots={mockSlots} />);

            // Navigate to step 2
            fireEvent.click(screen.getByText('09:00'));
            await userEvent.click(screen.getByRole('button', { name: /próximo/i }));

            await waitFor(() => {
                expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
            });

            // Try to proceed without filling anything
            const nextButton = screen.getByRole('button', { name: /próximo/i });
            await userEvent.click(nextButton);

            await waitFor(() => {
                expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument();
                expect(screen.getByText(/cpf é obrigatório/i)).toBeInTheDocument();
                expect(screen.getByText(/e-mail é obrigatório/i)).toBeInTheDocument();
            });
        });
    });

    describe('Data Persistence Between Steps', () => {
        it('preserves slot selection when navigating back from step 2', async () => {
            render(<AppointmentBookingForm slots={mockSlots} />);

            // Select slot
            fireEvent.click(screen.getByText('09:00'));
            await userEvent.click(screen.getByRole('button', { name: /próximo/i }));

            await waitFor(() => {
                expect(screen.getByText(/passo 2 de 3/i)).toBeInTheDocument();
            });

            // Go back
            const backButton = screen.getByRole('button', { name: /voltar/i });
            await userEvent.click(backButton);

            await waitFor(() => {
                expect(screen.getByText(/passo 1 de 3/i)).toBeInTheDocument();
                // Slot should still be selected
                const selectedSlot = screen.getByText('09:00').closest('button');
                expect(selectedSlot).toHaveClass('slot-selected');
            });
        });

        it('preserves patient data when navigating back from step 3', async () => {
            render(<AppointmentBookingForm slots={mockSlots} />);

            // Navigate to step 2
            fireEvent.click(screen.getByText('09:00'));
            await userEvent.click(screen.getByRole('button', { name: /próximo/i }));

            await waitFor(() => {
                expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
            });

            // Fill patient data
            await userEvent.type(screen.getByLabelText(/nome completo/i), 'João Silva');
            await userEvent.type(screen.getByLabelText(/cpf/i), '123.456.789-09');
            await userEvent.type(screen.getByLabelText(/e-mail/i), 'joao@example.com');
            await userEvent.type(screen.getByLabelText(/telefone/i), '(33) 99999-9999');
            await userEvent.click(screen.getByLabelText(/concordo com o tratamento dos meus dados/i));

            // Navigate to step 3
            await userEvent.click(screen.getByRole('button', { name: /próximo/i }));

            await waitFor(() => {
                expect(screen.getByText(/passo 3 de 3/i)).toBeInTheDocument();
            });

            // Go back to step 2
            const backButton = screen.getByRole('button', { name: /voltar/i });
            await userEvent.click(backButton);

            await waitFor(() => {
                expect(screen.getByText(/passo 2 de 3/i)).toBeInTheDocument();
                // Data should be preserved
                expect(screen.getByLabelText(/nome completo/i)).toHaveValue('João Silva');
                expect(screen.getByLabelText(/cpf/i)).toHaveValue('123.456.789-09');
            });
        });

        it('maintains all form state across navigation', async () => {
            render(<AppointmentBookingForm slots={mockSlots} />);

            // Complete step 1
            fireEvent.click(screen.getByText('09:00'));
            await userEvent.click(screen.getByRole('button', { name: /próximo/i }));

            // Complete step 2
            await waitFor(() => {
                expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
            });

            await userEvent.type(screen.getByLabelText(/nome completo/i), 'João Silva');
            await userEvent.type(screen.getByLabelText(/cpf/i), '123.456.789-09');
            await userEvent.type(screen.getByLabelText(/e-mail/i), 'joao@example.com');
            await userEvent.type(screen.getByLabelText(/telefone/i), '(33) 99999-9999');
            await userEvent.click(screen.getByLabelText(/concordo com o tratamento dos meus dados/i));
            await userEvent.click(screen.getByRole('button', { name: /próximo/i }));

            // Navigate back to step 1
            await waitFor(() => {
                expect(screen.getByText(/passo 3 de 3/i)).toBeInTheDocument();
            });

            await userEvent.click(screen.getByRole('button', { name: /voltar/i }));
            await userEvent.click(screen.getByRole('button', { name: /voltar/i }));

            await waitFor(() => {
                expect(screen.getByText(/passo 1 de 3/i)).toBeInTheDocument();
                // Slot selection should be preserved
                const selectedSlot = screen.getByText('09:00').closest('button');
                expect(selectedSlot).toHaveClass('slot-selected');
            });
        });
    });

    describe('Back Navigation', () => {
        it('allows navigating back to previous step', async () => {
            render(<AppointmentBookingForm slots={mockSlots} />);

            // Navigate to step 2
            fireEvent.click(screen.getByText('09:00'));
            await userEvent.click(screen.getByRole('button', { name: /próximo/i }));

            await waitFor(() => {
                expect(screen.getByText(/passo 2 de 3/i)).toBeInTheDocument();
            });

            // Navigate back
            const backButton = screen.getByRole('button', { name: /voltar/i });
            await userEvent.click(backButton);

            await waitFor(() => {
                expect(screen.getByText(/passo 1 de 3/i)).toBeInTheDocument();
            });
        });

        it('hides back button on first step', () => {
            render(<AppointmentBookingForm slots={mockSlots} />);

            expect(screen.queryByRole('button', { name: /voltar/i })).not.toBeInTheDocument();
        });

        it('shows back button on steps 2 and 3', async () => {
            render(<AppointmentBookingForm slots={mockSlots} />);

            // Navigate to step 2
            fireEvent.click(screen.getByText('09:00'));
            await userEvent.click(screen.getByRole('button', { name: /próximo/i }));

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /voltar/i })).toBeInTheDocument();
            });
        });

        it('updates step indicator when navigating back', async () => {
            render(<AppointmentBookingForm slots={mockSlots} />);

            // Navigate forward to step 2
            fireEvent.click(screen.getByText('09:00'));
            await userEvent.click(screen.getByRole('button', { name: /próximo/i }));

            await waitFor(() => {
                expect(screen.getByText(/passo 2 de 3/i)).toBeInTheDocument();
            });

            // Navigate back
            await userEvent.click(screen.getByRole('button', { name: /voltar/i }));

            await waitFor(() => {
                expect(screen.getByText(/passo 1 de 3/i)).toBeInTheDocument();
            });
        });
    });

    describe('Final Confirmation Display', () => {
        it('displays all booking details on step 3', async () => {
            render(<AppointmentBookingForm slots={mockSlots} />);

            // Complete steps 1 and 2
            fireEvent.click(screen.getByText('09:00'));
            await userEvent.click(screen.getByRole('button', { name: /próximo/i }));

            await waitFor(() => {
                expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
            });

            await userEvent.type(screen.getByLabelText(/nome completo/i), 'João Silva');
            await userEvent.type(screen.getByLabelText(/cpf/i), '123.456.789-09');
            await userEvent.type(screen.getByLabelText(/e-mail/i), 'joao@example.com');
            await userEvent.type(screen.getByLabelText(/telefone/i), '(33) 99999-9999');
            await userEvent.click(screen.getByLabelText(/concordo com o tratamento dos meus dados/i));
            await userEvent.click(screen.getByRole('button', { name: /próximo/i }));

            // Step 3 should display all details
            await waitFor(() => {
                expect(screen.getByText(/confirme seus dados/i)).toBeInTheDocument();
                expect(screen.getByText('João Silva')).toBeInTheDocument();
                expect(screen.getByText('123.456.789-09')).toBeInTheDocument();
                expect(screen.getByText('joao@example.com')).toBeInTheDocument();
                expect(screen.getByText('(33) 99999-9999')).toBeInTheDocument();
                expect(screen.getByText('09:00')).toBeInTheDocument();
                expect(screen.getByText('Dr. Philipe Saraiva')).toBeInTheDocument();
            });
        });

        it('shows confirm booking button on step 3', async () => {
            render(<AppointmentBookingForm slots={mockSlots} />);

            // Navigate to step 3
            fireEvent.click(screen.getByText('09:00'));
            await userEvent.click(screen.getByRole('button', { name: /próximo/i }));

            await waitFor(() => {
                expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
            });

            await userEvent.type(screen.getByLabelText(/nome completo/i), 'João Silva');
            await userEvent.type(screen.getByLabelText(/cpf/i), '123.456.789-09');
            await userEvent.type(screen.getByLabelText(/e-mail/i), 'joao@example.com');
            await userEvent.type(screen.getByLabelText(/telefone/i), '(33) 99999-9999');
            await userEvent.click(screen.getByLabelText(/concordo com o tratamento dos meus dados/i));
            await userEvent.click(screen.getByRole('button', { name: /próximo/i }));

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /confirmar agendamento/i })).toBeInTheDocument();
            });
        });

        it('submits booking when confirm button is clicked', async () => {
            const mockOnSubmit = vi.fn().mockResolvedValue({ success: true });
            render(<AppointmentBookingForm slots={mockSlots} onSubmit={mockOnSubmit} />);

            // Complete all steps
            fireEvent.click(screen.getByText('09:00'));
            await userEvent.click(screen.getByRole('button', { name: /próximo/i }));

            await waitFor(() => {
                expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
            });

            await userEvent.type(screen.getByLabelText(/nome completo/i), 'João Silva');
            await userEvent.type(screen.getByLabelText(/cpf/i), '123.456.789-09');
            await userEvent.type(screen.getByLabelText(/e-mail/i), 'joao@example.com');
            await userEvent.type(screen.getByLabelText(/telefone/i), '(33) 99999-9999');
            await userEvent.click(screen.getByLabelText(/concordo com o tratamento dos meus dados/i));
            await userEvent.click(screen.getByRole('button', { name: /próximo/i }));

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /confirmar agendamento/i })).toBeInTheDocument();
            });

            await userEvent.click(screen.getByRole('button', { name: /confirmar agendamento/i }));

            await waitFor(() => {
                expect(mockOnSubmit).toHaveBeenCalledWith({
                    slot: {
                        date: expect.any(String),
                        time: '09:00',
                        professional: 'Dr. Philipe Saraiva'
                    },
                    patient: {
                        name: 'João Silva',
                        cpf: '123.456.789-09',
                        email: 'joao@example.com',
                        phone: '(33) 99999-9999',
                        lgpdConsent: true
                    }
                });
            });
        });

        it('displays success message after successful booking', async () => {
            const mockOnSubmit = vi.fn().mockResolvedValue({ success: true, appointmentId: '123' });
            render(<AppointmentBookingForm slots={mockSlots} onSubmit={mockOnSubmit} />);

            // Complete and submit
            fireEvent.click(screen.getByText('09:00'));
            await userEvent.click(screen.getByRole('button', { name: /próximo/i }));

            await waitFor(() => {
                expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
            });

            await userEvent.type(screen.getByLabelText(/nome completo/i), 'João Silva');
            await userEvent.type(screen.getByLabelText(/cpf/i), '123.456.789-09');
            await userEvent.type(screen.getByLabelText(/e-mail/i), 'joao@example.com');
            await userEvent.type(screen.getByLabelText(/telefone/i), '(33) 99999-9999');
            await userEvent.click(screen.getByLabelText(/concordo com o tratamento dos meus dados/i));
            await userEvent.click(screen.getByRole('button', { name: /próximo/i }));

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /confirmar agendamento/i })).toBeInTheDocument();
            });

            await userEvent.click(screen.getByRole('button', { name: /confirmar agendamento/i }));

            await waitFor(() => {
                expect(screen.getByText(/agendamento confirmado/i)).toBeInTheDocument();
            });
        });
    });
});

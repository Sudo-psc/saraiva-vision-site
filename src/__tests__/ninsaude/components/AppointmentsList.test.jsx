/**
 * AppointmentsList Component Tests (TDD)
 * Tests for the Ninsaúde appointments list and management component
 *
 * Expected: These tests will FAIL initially until the component is created
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AppointmentsList from '@/components/ninsaude/AppointmentsList';

describe('AppointmentsList', () => {
    const mockAppointments = [
        {
            id: 'apt-1',
            patientName: 'João Silva',
            date: '2024-10-15',
            time: '09:00',
            professional: 'Dr. Philipe Saraiva',
            status: 'confirmed',
            type: 'Consulta Oftalmológica'
        },
        {
            id: 'apt-2',
            patientName: 'Maria Santos',
            date: '2024-10-16',
            time: '14:00',
            professional: 'Dr. Philipe Saraiva',
            status: 'pending',
            type: 'Retorno'
        },
        {
            id: 'apt-3',
            patientName: 'Pedro Costa',
            date: '2024-10-10',
            time: '10:00',
            professional: 'Dr. Philipe Saraiva',
            status: 'completed',
            type: 'Exame'
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2024-10-12T10:00:00'));
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    describe('Appointments List Rendering', () => {
        it('renders list of appointments', () => {
            render(<AppointmentsList appointments={mockAppointments} />);

            expect(screen.getByText('João Silva')).toBeInTheDocument();
            expect(screen.getByText('Maria Santos')).toBeInTheDocument();
            expect(screen.getByText('Pedro Costa')).toBeInTheDocument();
        });

        it('displays appointment details', () => {
            render(<AppointmentsList appointments={mockAppointments} />);

            const appointment = screen.getByText('João Silva').closest('li, div[role="listitem"]');

            within(appointment).getByText('09:00');
            within(appointment).getByText('Dr. Philipe Saraiva');
            within(appointment).getByText('Consulta Oftalmológica');
        });

        it('shows appointment status with visual indicator', () => {
            render(<AppointmentsList appointments={mockAppointments} />);

            expect(screen.getByText(/confirmado/i)).toBeInTheDocument();
            expect(screen.getByText(/pendente/i)).toBeInTheDocument();
            expect(screen.getByText(/realizado/i)).toBeInTheDocument();
        });

        it('formats date in Portuguese', () => {
            render(<AppointmentsList appointments={mockAppointments} />);

            // Should show date in Brazilian format
            expect(screen.getByText(/15.*out/i)).toBeInTheDocument();
            expect(screen.getByText(/16.*out/i)).toBeInTheDocument();
        });

        it('groups appointments by date or status', () => {
            render(<AppointmentsList appointments={mockAppointments} groupBy="date" />);

            expect(screen.getByText(/próximas consultas/i)).toBeInTheDocument();
            expect(screen.getByText(/consultas anteriores/i)).toBeInTheDocument();
        });
    });

    describe('Cancel Button Functionality', () => {
        it('displays cancel button for upcoming appointments', () => {
            render(<AppointmentsList appointments={mockAppointments} />);

            const upcomingAppointment = screen.getByText('João Silva').closest('li, div[role="listitem"]');

            expect(within(upcomingAppointment).getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
        });

        it('does not show cancel button for past appointments', () => {
            render(<AppointmentsList appointments={mockAppointments} />);

            const pastAppointment = screen.getByText('Pedro Costa').closest('li, div[role="listitem"]');

            expect(within(pastAppointment).queryByRole('button', { name: /cancelar/i })).not.toBeInTheDocument();
        });

        it('shows confirmation dialog when cancel is clicked', async () => {
            render(<AppointmentsList appointments={mockAppointments} />);

            const cancelButton = screen.getAllByRole('button', { name: /cancelar/i })[0];
            await userEvent.click(cancelButton);

            await waitFor(() => {
                expect(screen.getByText(/tem certeza que deseja cancelar/i)).toBeInTheDocument();
                expect(screen.getByRole('button', { name: /confirmar cancelamento/i })).toBeInTheDocument();
                expect(screen.getByRole('button', { name: /não cancelar/i })).toBeInTheDocument();
            });
        });

        it('cancels appointment when confirmed', async () => {
            const mockOnCancel = vi.fn().mockResolvedValue({ success: true });
            render(<AppointmentsList appointments={mockAppointments} onCancel={mockOnCancel} />);

            const cancelButton = screen.getAllByRole('button', { name: /cancelar/i })[0];
            await userEvent.click(cancelButton);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /confirmar cancelamento/i })).toBeInTheDocument();
            });

            await userEvent.click(screen.getByRole('button', { name: /confirmar cancelamento/i }));

            await waitFor(() => {
                expect(mockOnCancel).toHaveBeenCalledWith('apt-1');
            });
        });

        it('closes dialog without canceling when dismissed', async () => {
            const mockOnCancel = vi.fn();
            render(<AppointmentsList appointments={mockAppointments} onCancel={mockOnCancel} />);

            const cancelButton = screen.getAllByRole('button', { name: /cancelar/i })[0];
            await userEvent.click(cancelButton);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /não cancelar/i })).toBeInTheDocument();
            });

            await userEvent.click(screen.getByRole('button', { name: /não cancelar/i }));

            await waitFor(() => {
                expect(screen.queryByText(/tem certeza que deseja cancelar/i)).not.toBeInTheDocument();
            });

            expect(mockOnCancel).not.toHaveBeenCalled();
        });

        it('shows success message after cancellation', async () => {
            const mockOnCancel = vi.fn().mockResolvedValue({ success: true });
            render(<AppointmentsList appointments={mockAppointments} onCancel={mockOnCancel} />);

            const cancelButton = screen.getAllByRole('button', { name: /cancelar/i })[0];
            await userEvent.click(cancelButton);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /confirmar cancelamento/i })).toBeInTheDocument();
            });

            await userEvent.click(screen.getByRole('button', { name: /confirmar cancelamento/i }));

            await waitFor(() => {
                expect(screen.getByText(/consulta cancelada com sucesso/i)).toBeInTheDocument();
            });
        });

        it('shows error message on cancellation failure', async () => {
            const mockOnCancel = vi.fn().mockRejectedValue(new Error('Network error'));
            render(<AppointmentsList appointments={mockAppointments} onCancel={mockOnCancel} />);

            const cancelButton = screen.getAllByRole('button', { name: /cancelar/i })[0];
            await userEvent.click(cancelButton);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /confirmar cancelamento/i })).toBeInTheDocument();
            });

            await userEvent.click(screen.getByRole('button', { name: /confirmar cancelamento/i }));

            await waitFor(() => {
                expect(screen.getByText(/erro ao cancelar consulta/i)).toBeInTheDocument();
            });
        });
    });

    describe('Reschedule Button Functionality', () => {
        it('displays reschedule button for upcoming appointments', () => {
            render(<AppointmentsList appointments={mockAppointments} />);

            const upcomingAppointment = screen.getByText('João Silva').closest('li, div[role="listitem"]');

            expect(within(upcomingAppointment).getByRole('button', { name: /reagendar/i })).toBeInTheDocument();
        });

        it('does not show reschedule button for past appointments', () => {
            render(<AppointmentsList appointments={mockAppointments} />);

            const pastAppointment = screen.getByText('Pedro Costa').closest('li, div[role="listitem"]');

            expect(within(pastAppointment).queryByRole('button', { name: /reagendar/i })).not.toBeInTheDocument();
        });

        it('calls onReschedule with appointment id when clicked', async () => {
            const mockOnReschedule = vi.fn();
            render(<AppointmentsList appointments={mockAppointments} onReschedule={mockOnReschedule} />);

            const rescheduleButton = screen.getAllByRole('button', { name: /reagendar/i })[0];
            await userEvent.click(rescheduleButton);

            expect(mockOnReschedule).toHaveBeenCalledWith('apt-1');
        });

        it('opens reschedule modal with current appointment details', async () => {
            render(<AppointmentsList appointments={mockAppointments} />);

            const rescheduleButton = screen.getAllByRole('button', { name: /reagendar/i })[0];
            await userEvent.click(rescheduleButton);

            await waitFor(() => {
                expect(screen.getByText(/reagendar consulta/i)).toBeInTheDocument();
                expect(screen.getByText(/João Silva/i)).toBeInTheDocument();
                expect(screen.getByText(/09:00/i)).toBeInTheDocument();
            });
        });
    });

    describe('Empty State Display', () => {
        it('displays empty state when no appointments', () => {
            render(<AppointmentsList appointments={[]} />);

            expect(screen.getByText(/nenhuma consulta agendada/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /agendar consulta/i })).toBeInTheDocument();
        });

        it('shows appropriate message for different empty states', () => {
            render(<AppointmentsList appointments={[]} filter="upcoming" />);

            expect(screen.getByText(/nenhuma consulta futura/i)).toBeInTheDocument();
        });

        it('calls onNewAppointment when button clicked in empty state', async () => {
            const mockOnNewAppointment = vi.fn();
            render(<AppointmentsList appointments={[]} onNewAppointment={mockOnNewAppointment} />);

            const newAppointmentButton = screen.getByRole('button', { name: /agendar consulta/i });
            await userEvent.click(newAppointmentButton);

            expect(mockOnNewAppointment).toHaveBeenCalled();
        });
    });

    describe('Loading States', () => {
        it('displays loading skeleton while fetching appointments', () => {
            render(<AppointmentsList loading={true} />);

            expect(screen.getByRole('progressbar')).toBeInTheDocument();
            expect(screen.getByText(/carregando consultas/i)).toBeInTheDocument();
        });

        it('shows loading state for individual appointment actions', async () => {
            const mockOnCancel = vi.fn(() => new Promise(resolve => setTimeout(resolve, 1000)));
            render(<AppointmentsList appointments={mockAppointments} onCancel={mockOnCancel} />);

            const cancelButton = screen.getAllByRole('button', { name: /cancelar/i })[0];
            await userEvent.click(cancelButton);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /confirmar cancelamento/i })).toBeInTheDocument();
            });

            await userEvent.click(screen.getByRole('button', { name: /confirmar cancelamento/i }));

            expect(screen.getByText(/cancelando/i)).toBeInTheDocument();
        });
    });

    describe('Filtering and Sorting', () => {
        it('filters appointments by status', () => {
            render(<AppointmentsList appointments={mockAppointments} filter="confirmed" />);

            expect(screen.getByText('João Silva')).toBeInTheDocument();
            expect(screen.queryByText('Maria Santos')).not.toBeInTheDocument();
        });

        it('filters appointments by date range', () => {
            render(<AppointmentsList appointments={mockAppointments} filter="upcoming" />);

            // Should show only future appointments
            expect(screen.getByText('João Silva')).toBeInTheDocument();
            expect(screen.getByText('Maria Santos')).toBeInTheDocument();
            expect(screen.queryByText('Pedro Costa')).not.toBeInTheDocument();
        });

        it('sorts appointments by date', () => {
            render(<AppointmentsList appointments={mockAppointments} sortBy="date" />);

            const appointmentItems = screen.getAllByRole('listitem');

            // Should be sorted with soonest first
            expect(within(appointmentItems[0]).getByText('João Silva')).toBeInTheDocument();
            expect(within(appointmentItems[1]).getByText('Maria Santos')).toBeInTheDocument();
        });

        it('allows toggling sort order', async () => {
            render(<AppointmentsList appointments={mockAppointments} />);

            const sortButton = screen.getByRole('button', { name: /ordenar/i });
            await userEvent.click(sortButton);

            // Should reverse order
            const appointmentItems = screen.getAllByRole('listitem');
            expect(within(appointmentItems[0]).getByText('Pedro Costa')).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('has proper ARIA labels for list items', () => {
            render(<AppointmentsList appointments={mockAppointments} />);

            const list = screen.getByRole('list');
            expect(list).toHaveAttribute('aria-label', expect.stringMatching(/consultas/i));
        });

        it('announces appointment actions to screen readers', async () => {
            render(<AppointmentsList appointments={mockAppointments} />);

            const cancelButton = screen.getAllByRole('button', { name: /cancelar/i })[0];

            expect(cancelButton).toHaveAttribute('aria-label', expect.stringMatching(/cancelar consulta.*João Silva/i));
        });

        it('supports keyboard navigation', () => {
            render(<AppointmentsList appointments={mockAppointments} />);

            const firstCancelButton = screen.getAllByRole('button', { name: /cancelar/i })[0];

            firstCancelButton.focus();
            expect(document.activeElement).toBe(firstCancelButton);
        });
    });

    describe('Error Handling', () => {
        it('displays error message when appointments fail to load', () => {
            const error = 'Failed to load appointments';
            render(<AppointmentsList error={error} />);

            expect(screen.getByText(/erro ao carregar consultas/i)).toBeInTheDocument();
            expect(screen.getByText(error)).toBeInTheDocument();
        });

        it('allows retrying after error', async () => {
            const mockOnRetry = vi.fn();
            render(<AppointmentsList error="Network error" onRetry={mockOnRetry} />);

            const retryButton = screen.getByRole('button', { name: /tentar novamente/i });
            await userEvent.click(retryButton);

            expect(mockOnRetry).toHaveBeenCalled();
        });
    });
});

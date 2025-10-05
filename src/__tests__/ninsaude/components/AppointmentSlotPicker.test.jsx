/**
 * AppointmentSlotPicker Component Tests (TDD)
 * Tests for the Ninsaúde appointment slot selection component
 *
 * Expected: These tests will FAIL initially until the component is created
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AppointmentSlotPicker from '@/components/ninsaude/AppointmentSlotPicker';

describe('AppointmentSlotPicker', () => {
    const mockSlots = {
        '2024-10-15': [
            { time: '09:00', available: true, professional: 'Dr. Philipe Saraiva' },
            { time: '09:30', available: true, professional: 'Dr. Philipe Saraiva' },
            { time: '10:00', available: false, professional: 'Dr. Philipe Saraiva' },
            { time: '14:00', available: true, professional: 'Dr. Philipe Saraiva' }
        ],
        '2024-10-16': [
            { time: '09:00', available: true, professional: 'Dr. Philipe Saraiva' },
            { time: '14:00', available: false, professional: 'Dr. Philipe Saraiva' }
        ]
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Mock current date for testing
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2024-10-05T10:00:00'));
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    describe('Calendar/Slot Rendering', () => {
        it('renders calendar view', () => {
            render(<AppointmentSlotPicker slots={mockSlots} />);

            expect(screen.getByText(/selecione data e horário/i)).toBeInTheDocument();
            expect(screen.getByRole('grid')).toBeInTheDocument(); // Calendar grid
        });

        it('displays available time slots for selected date', async () => {
            const mockOnSelect = vi.fn();
            render(<AppointmentSlotPicker slots={mockSlots} onSelect={mockOnSelect} />);

            // Calendar should show available dates
            const calendar = screen.getByRole('grid');
            const dateButton = within(calendar).getByText('15');

            await userEvent.click(dateButton);

            await waitFor(() => {
                expect(screen.getByText('09:00')).toBeInTheDocument();
                expect(screen.getByText('09:30')).toBeInTheDocument();
                expect(screen.getByText('14:00')).toBeInTheDocument();
            });
        });

        it('shows available slot count for each date', () => {
            render(<AppointmentSlotPicker slots={mockSlots} />);

            // Should show how many slots are available per day
            expect(screen.getByText(/3 horários disponíveis/i)).toBeInTheDocument();
        });

        it('renders empty state when no slots available', () => {
            render(<AppointmentSlotPicker slots={{}} />);

            expect(screen.getByText(/nenhum horário disponível/i)).toBeInTheDocument();
        });
    });

    describe('Date Selection', () => {
        it('allows selecting a date from calendar', async () => {
            const mockOnSelect = vi.fn();
            render(<AppointmentSlotPicker slots={mockSlots} onSelect={mockOnSelect} />);

            const calendar = screen.getByRole('grid');
            const dateButton = within(calendar).getByText('15');

            await userEvent.click(dateButton);

            await waitFor(() => {
                expect(dateButton).toHaveAttribute('aria-selected', 'true');
            });
        });

        it('highlights selected date', async () => {
            render(<AppointmentSlotPicker slots={mockSlots} />);

            const calendar = screen.getByRole('grid');
            const dateButton = within(calendar).getByText('15');

            await userEvent.click(dateButton);

            await waitFor(() => {
                expect(dateButton).toHaveClass('selected');
            });
        });

        it('shows time slots when date is selected', async () => {
            render(<AppointmentSlotPicker slots={mockSlots} />);

            const calendar = screen.getByRole('grid');
            const dateButton = within(calendar).getByText('15');

            await userEvent.click(dateButton);

            await waitFor(() => {
                expect(screen.getByText(/horários disponíveis para/i)).toBeInTheDocument();
                expect(screen.getByText('09:00')).toBeInTheDocument();
            });
        });

        it('clears time slot selection when changing date', async () => {
            const mockOnSelect = vi.fn();
            render(<AppointmentSlotPicker slots={mockSlots} onSelect={mockOnSelect} />);

            const calendar = screen.getByRole('grid');

            // Select first date and slot
            await userEvent.click(within(calendar).getByText('15'));
            await waitFor(() => expect(screen.getByText('09:00')).toBeInTheDocument());
            await userEvent.click(screen.getByText('09:00'));

            // Change date
            await userEvent.click(within(calendar).getByText('16'));

            await waitFor(() => {
                // Should clear previous slot selection
                expect(mockOnSelect).toHaveBeenCalledWith({
                    date: '2024-10-16',
                    time: null,
                    professional: null
                });
            });
        });
    });

    describe('Time Slot Selection', () => {
        it('allows selecting an available time slot', async () => {
            const mockOnSelect = vi.fn();
            render(<AppointmentSlotPicker slots={mockSlots} onSelect={mockOnSelect} />);

            const calendar = screen.getByRole('grid');
            await userEvent.click(within(calendar).getByText('15'));

            await waitFor(() => expect(screen.getByText('09:00')).toBeInTheDocument());

            const slotButton = screen.getByText('09:00');
            await userEvent.click(slotButton);

            expect(mockOnSelect).toHaveBeenCalledWith({
                date: '2024-10-15',
                time: '09:00',
                professional: 'Dr. Philipe Saraiva'
            });
        });

        it('disables unavailable time slots', async () => {
            render(<AppointmentSlotPicker slots={mockSlots} />);

            const calendar = screen.getByRole('grid');
            await userEvent.click(within(calendar).getByText('15'));

            await waitFor(() => {
                const unavailableSlot = screen.getByText('10:00').closest('button');
                expect(unavailableSlot).toBeDisabled();
            });
        });

        it('shows visual indicator for unavailable slots', async () => {
            render(<AppointmentSlotPicker slots={mockSlots} />);

            const calendar = screen.getByRole('grid');
            await userEvent.click(within(calendar).getByText('15'));

            await waitFor(() => {
                const unavailableSlot = screen.getByText('10:00').closest('button');
                expect(unavailableSlot).toHaveClass('slot-unavailable');
            });
        });

        it('highlights selected time slot', async () => {
            render(<AppointmentSlotPicker slots={mockSlots} />);

            const calendar = screen.getByRole('grid');
            await userEvent.click(within(calendar).getByText('15'));

            await waitFor(() => expect(screen.getByText('09:00')).toBeInTheDocument());

            const slotButton = screen.getByText('09:00');
            await userEvent.click(slotButton);

            expect(slotButton).toHaveClass('slot-selected');
        });
    });

    describe('Professional Filtering', () => {
        const multiProfessionalSlots = {
            '2024-10-15': [
                { time: '09:00', available: true, professional: 'Dr. Philipe Saraiva' },
                { time: '09:30', available: true, professional: 'Dr. Maria Silva' },
                { time: '10:00', available: true, professional: 'Dr. Philipe Saraiva' },
                { time: '14:00', available: true, professional: 'Dr. Maria Silva' }
            ]
        };

        it('displays professional filter when multiple professionals available', () => {
            render(<AppointmentSlotPicker slots={multiProfessionalSlots} />);

            expect(screen.getByLabelText(/profissional/i)).toBeInTheDocument();
            expect(screen.getByText('Dr. Philipe Saraiva')).toBeInTheDocument();
            expect(screen.getByText('Dr. Maria Silva')).toBeInTheDocument();
        });

        it('filters slots by selected professional', async () => {
            render(<AppointmentSlotPicker slots={multiProfessionalSlots} />);

            const calendar = screen.getByRole('grid');
            await userEvent.click(within(calendar).getByText('15'));

            // Select professional filter
            const professionalSelect = screen.getByLabelText(/profissional/i);
            await userEvent.selectOptions(professionalSelect, 'Dr. Philipe Saraiva');

            await waitFor(() => {
                expect(screen.getByText('09:00')).toBeInTheDocument();
                expect(screen.getByText('10:00')).toBeInTheDocument();
                // Should not show Dr. Maria Silva's slots
                expect(screen.queryByText('09:30')).not.toBeInTheDocument();
            });
        });

        it('shows all slots when no professional filter selected', async () => {
            render(<AppointmentSlotPicker slots={multiProfessionalSlots} />);

            const calendar = screen.getByRole('grid');
            await userEvent.click(within(calendar).getByText('15'));

            await waitFor(() => {
                expect(screen.getByText('09:00')).toBeInTheDocument();
                expect(screen.getByText('09:30')).toBeInTheDocument();
                expect(screen.getByText('10:00')).toBeInTheDocument();
                expect(screen.getByText('14:00')).toBeInTheDocument();
            });
        });
    });

    describe('Disabled Past Dates', () => {
        it('disables dates in the past', () => {
            render(<AppointmentSlotPicker slots={mockSlots} />);

            const calendar = screen.getByRole('grid');
            const pastDateButton = within(calendar).getByText('3'); // Oct 3, before current date Oct 5

            expect(pastDateButton).toBeDisabled();
        });

        it('prevents selecting past dates', async () => {
            const mockOnSelect = vi.fn();
            render(<AppointmentSlotPicker slots={mockSlots} onSelect={mockOnSelect} />);

            const calendar = screen.getByRole('grid');
            const pastDateButton = within(calendar).getByText('3');

            await userEvent.click(pastDateButton);

            expect(mockOnSelect).not.toHaveBeenCalled();
        });

        it('allows selecting current date and future dates', async () => {
            const mockOnSelect = vi.fn();
            render(<AppointmentSlotPicker slots={mockSlots} onSelect={mockOnSelect} />);

            const calendar = screen.getByRole('grid');

            // Current date (Oct 5) should be selectable
            const currentDateButton = within(calendar).getByText('5');
            expect(currentDateButton).not.toBeDisabled();

            // Future date should be selectable
            const futureDateButton = within(calendar).getByText('15');
            expect(futureDateButton).not.toBeDisabled();
        });

        it('shows tooltip on past dates explaining they cannot be selected', async () => {
            render(<AppointmentSlotPicker slots={mockSlots} />);

            const calendar = screen.getByRole('grid');
            const pastDateButton = within(calendar).getByText('3');

            await userEvent.hover(pastDateButton);

            await waitFor(() => {
                expect(screen.getByText(/data já passou/i)).toBeInTheDocument();
            });
        });
    });

    describe('Loading and Error States', () => {
        it('displays loading state while fetching slots', () => {
            render(<AppointmentSlotPicker loading={true} />);

            expect(screen.getByText(/carregando horários/i)).toBeInTheDocument();
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('displays error message when slot loading fails', () => {
            const error = 'Failed to load appointments';
            render(<AppointmentSlotPicker error={error} />);

            expect(screen.getByText(/erro ao carregar horários/i)).toBeInTheDocument();
            expect(screen.getByText(error)).toBeInTheDocument();
        });

        it('allows retrying after error', async () => {
            const mockOnRetry = vi.fn();
            render(<AppointmentSlotPicker error="Network error" onRetry={mockOnRetry} />);

            const retryButton = screen.getByRole('button', { name: /tentar novamente/i });
            await userEvent.click(retryButton);

            expect(mockOnRetry).toHaveBeenCalled();
        });
    });

    describe('Accessibility', () => {
        it('has proper ARIA labels for calendar navigation', () => {
            render(<AppointmentSlotPicker slots={mockSlots} />);

            const calendar = screen.getByRole('grid');
            expect(calendar).toHaveAttribute('aria-label', expect.stringMatching(/calendário/i));
        });

        it('announces selected date and time to screen readers', async () => {
            render(<AppointmentSlotPicker slots={mockSlots} />);

            const calendar = screen.getByRole('grid');
            await userEvent.click(within(calendar).getByText('15'));
            await waitFor(() => expect(screen.getByText('09:00')).toBeInTheDocument());
            await userEvent.click(screen.getByText('09:00'));

            const announcement = screen.getByRole('status');
            expect(announcement).toHaveTextContent(/15.*09:00/i);
        });

        it('supports keyboard navigation', async () => {
            render(<AppointmentSlotPicker slots={mockSlots} />);

            const calendar = screen.getByRole('grid');
            const firstDateButton = within(calendar).getAllByRole('button')[0];

            firstDateButton.focus();
            fireEvent.keyDown(firstDateButton, { key: 'ArrowRight' });

            // Should focus next date
            expect(document.activeElement).not.toBe(firstDateButton);
        });
    });
});

/**
 * @file slotConflict.test.jsx
 * @description Integration test for Scenario 7: Slot Availability Conflict (Race Condition)
 * @status TDD - Expected to FAIL until components are implemented
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Components that WILL BE CREATED - tests should fail for now
import BookingForm from '@/components/ninsaude/BookingForm';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';

/**
 * MSW Server Setup
 * Mocks Ninsaúde API endpoints according to quickstart.md Scenario 7
 */
const server = setupServer(
  // CPF Verification - Existing Patient
  http.post('/api/ninsaude/patients', async ({ request }) => {
    const body = await request.json();

    return HttpResponse.json({
      success: true,
      isNewPatient: false,
      patient: {
        id: 'test-patient-uuid',
        cpf: body.cpf,
        name: 'Maria da Silva'
      }
    });
  }),

  // Available Slots with one unavailable slot
  http.get('/api/ninsaude/availability', () => {
    return HttpResponse.json({
      success: true,
      slots: [
        {
          id: 'slot-conflict',
          professionalId: 'prof-uuid-maria',
          professionalName: 'Dra. Maria Santos',
          specialty: 'Optometria',
          dateTime: '2025-10-07T14:00:00',
          available: true // Shows as available initially
        },
        {
          id: 'slot-alternative',
          professionalId: 'prof-uuid-maria',
          professionalName: 'Dra. Maria Santos',
          specialty: 'Optometria',
          dateTime: '2025-10-07T16:00:00',
          available: true
        }
      ]
    });
  }),

  // Slot Availability Check - Simulates race condition
  http.post('/api/ninsaude/availability/check', async ({ request }) => {
    const body = await request.json();

    // Simulate slot becoming unavailable (another user booked it)
    if (body.dateTime === '2025-10-07T14:00:00') {
      return HttpResponse.json({
        available: false
      }, { status: 409 }); // 409 Conflict
    }

    return HttpResponse.json({
      available: true
    });
  }),

  // Create Appointment - Should not be called for unavailable slot
  http.post('/api/ninsaude/appointments', async ({ request }) => {
    const body = await request.json();

    // If trying to book the conflicting slot, return error
    if (body.dateTime === '2025-10-07T14:00:00') {
      return HttpResponse.json({
        success: false,
        error: 'Horário não está mais disponível'
      }, { status: 409 });
    }

    return HttpResponse.json({
      success: true,
      appointment: {
        id: 'appt-uuid-success',
        patientId: body.patientId,
        professionalId: body.professionalId,
        dateTime: body.dateTime,
        status: 'pending'
      }
    });
  })
);

beforeEach(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
  server.close();
});

/**
 * Helper function to render components with required providers
 */
const renderWithProviders = (component) => {
  return render(
    <HelmetProvider>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </HelmetProvider>
  );
};

describe('Scenario 7: Slot Availability Conflict (Race Condition)', () => {
  /**
   * Test Scenario 7 from quickstart.md
   * User Story: As a user, I want clear error handling when my selected slot becomes unavailable
   *
   * Expected Flow:
   * 1. User selects slot "07/10/2025 14:00"
   * 2. Another user books the same slot simultaneously
   * 3. User attempts to confirm booking
   * 4. System detects slot is now unavailable
   * 5. System prevents booking and shows error
   * 6. User is returned to slot selection
   */
  it('handles slot conflict with clear error messaging', async () => {
    const user = userEvent.setup();

    // GIVEN: User has completed patient verification and is selecting a slot
    renderWithProviders(<BookingForm />);

    // Complete CPF verification first
    const cpfInput = await screen.findByLabelText(/cpf/i);
    await user.type(cpfInput, '123.456.789-00');
    await user.click(screen.getByRole('button', { name: /verificar/i }));

    await waitFor(() => {
      expect(screen.getByText(/bem-vindo/i)).toBeInTheDocument();
    });

    // WHEN: User selects the slot that will become unavailable
    await waitFor(() => {
      expect(screen.getByText(/horários disponíveis/i)).toBeInTheDocument();
    });

    const conflictSlotButton = screen.getByRole('button', { name: /07\/10\/2025.*14:00/i });
    await user.click(conflictSlotButton);

    // WHEN: User attempts to confirm booking
    const confirmButton = screen.getByRole('button', { name: /confirmar agendamento/i });
    await user.click(confirmButton);

    // THEN: System shows error message
    await waitFor(() => {
      expect(screen.getByText(/horário não está mais disponível/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/selecione outro horário/i)).toBeInTheDocument();

    // THEN: User is returned to slot selection screen
    expect(screen.getByText(/horários disponíveis/i)).toBeInTheDocument();
  }, 15000);

  /**
   * Test that booking is not created when slot becomes unavailable
   */
  it('prevents booking creation when slot is unavailable', async () => {
    const user = userEvent.setup();

    let appointmentCreated = false;
    server.use(
      http.post('/api/ninsaude/appointments', () => {
        appointmentCreated = true;
        return HttpResponse.json({
          success: false,
          error: 'Should not create appointment'
        }, { status: 409 });
      })
    );

    renderWithProviders(<BookingForm />);

    // Complete verification
    const cpfInput = await screen.findByLabelText(/cpf/i);
    await user.type(cpfInput, '123.456.789-00');
    await user.click(screen.getByRole('button', { name: /verificar/i }));

    await waitFor(() => {
      expect(screen.getByText(/bem-vindo/i)).toBeInTheDocument();
    });

    // Select conflicting slot
    await waitFor(() => {
      expect(screen.getByText(/horários disponíveis/i)).toBeInTheDocument();
    });

    const conflictSlotButton = screen.getByRole('button', { name: /07\/10\/2025.*14:00/i });
    await user.click(conflictSlotButton);

    // Attempt to confirm
    const confirmButton = screen.getByRole('button', { name: /confirmar agendamento/i });
    await user.click(confirmButton);

    // Wait for error
    await waitFor(() => {
      expect(screen.getByText(/horário não está mais disponível/i)).toBeInTheDocument();
    });

    // Appointment should NOT be created
    expect(appointmentCreated).toBe(false);
  }, 15000);

  /**
   * Test that patient data is preserved after slot conflict
   */
  it('preserves patient data after slot conflict', async () => {
    const user = userEvent.setup();

    renderWithProviders(<BookingForm />);

    // Enter patient CPF
    const cpfInput = await screen.findByLabelText(/cpf/i);
    await user.type(cpfInput, '987.654.321-00');
    await user.click(screen.getByRole('button', { name: /verificar/i }));

    await waitFor(() => {
      expect(screen.getByText(/maria da silva/i)).toBeInTheDocument();
    });

    // Select conflicting slot
    await waitFor(() => {
      expect(screen.getByText(/horários disponíveis/i)).toBeInTheDocument();
    });

    const conflictSlotButton = screen.getByRole('button', { name: /07\/10\/2025.*14:00/i });
    await user.click(conflictSlotButton);

    // Attempt to confirm
    const confirmButton = screen.getByRole('button', { name: /confirmar agendamento/i });
    await user.click(confirmButton);

    // After conflict error
    await waitFor(() => {
      expect(screen.getByText(/horário não está mais disponível/i)).toBeInTheDocument();
    });

    // Patient data should still be displayed
    expect(screen.getByText(/maria da silva/i)).toBeInTheDocument();
  }, 15000);

  /**
   * Test that new available slots are fetched after conflict
   */
  it('refreshes available slots after conflict', async () => {
    const user = userEvent.setup();

    renderWithProviders(<BookingForm />);

    // Complete verification
    const cpfInput = await screen.findByLabelText(/cpf/i);
    await user.type(cpfInput, '123.456.789-00');
    await user.click(screen.getByRole('button', { name: /verificar/i }));

    await waitFor(() => {
      expect(screen.getByText(/bem-vindo/i)).toBeInTheDocument();
    });

    // Initial slots should be visible
    await waitFor(() => {
      expect(screen.getByText(/horários disponíveis/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /07\/10\/2025.*14:00/i })).toBeInTheDocument();

    // Select conflicting slot
    const conflictSlotButton = screen.getByRole('button', { name: /07\/10\/2025.*14:00/i });
    await user.click(conflictSlotButton);

    // Attempt to confirm
    const confirmButton = screen.getByRole('button', { name: /confirmar agendamento/i });
    await user.click(confirmButton);

    // After conflict
    await waitFor(() => {
      expect(screen.getByText(/horário não está mais disponível/i)).toBeInTheDocument();
    });

    // Alternative slot should still be available
    expect(screen.getByRole('button', { name: /07\/10\/2025.*16:00/i })).toBeInTheDocument();
  }, 15000);

  /**
   * Test user can successfully book alternative slot after conflict
   */
  it('allows booking alternative slot after conflict', async () => {
    const user = userEvent.setup();

    renderWithProviders(<BookingForm />);

    // Complete verification
    const cpfInput = await screen.findByLabelText(/cpf/i);
    await user.type(cpfInput, '123.456.789-00');
    await user.click(screen.getByRole('button', { name: /verificar/i }));

    await waitFor(() => {
      expect(screen.getByText(/bem-vindo/i)).toBeInTheDocument();
    });

    // Select conflicting slot
    await waitFor(() => {
      expect(screen.getByText(/horários disponíveis/i)).toBeInTheDocument();
    });

    const conflictSlotButton = screen.getByRole('button', { name: /07\/10\/2025.*14:00/i });
    await user.click(conflictSlotButton);

    const confirmButton = screen.getByRole('button', { name: /confirmar agendamento/i });
    await user.click(confirmButton);

    // Handle conflict
    await waitFor(() => {
      expect(screen.getByText(/horário não está mais disponível/i)).toBeInTheDocument();
    });

    // Select alternative slot
    const alternativeSlotButton = screen.getByRole('button', { name: /07\/10\/2025.*16:00/i });
    await user.click(alternativeSlotButton);

    // Confirm alternative booking
    const confirmButtonRetry = screen.getByRole('button', { name: /confirmar agendamento/i });
    await user.click(confirmButtonRetry);

    // Should succeed
    await waitFor(() => {
      expect(screen.getByText(/agendamento confirmado/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/16:00/i)).toBeInTheDocument();
  }, 20000);
});

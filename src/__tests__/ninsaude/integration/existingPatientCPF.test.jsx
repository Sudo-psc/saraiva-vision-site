/**
 * @file existingPatientCPF.test.jsx
 * @description Integration test for Scenario 2: Existing Patient CPF Lookup
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
 * Mocks Ninsaúde API endpoints according to quickstart.md Scenario 2
 */
const server = setupServer(
  // Step 1: CPF Verification - Existing Patient
  http.post('/api/ninsaude/patients', async ({ request }) => {
    const body = await request.json();

    if (body.cpf === '987.654.321-00') {
      return HttpResponse.json({
        success: true,
        isNewPatient: false,
        patient: {
          id: 'existing-uuid-67890',
          cpf: '987.654.321-00',
          name: 'Carlos Roberto Souza',
          birthDate: '1985-03-15',
          phone: '(33) 97777-8888',
          email: 'carlos.souza@example.com'
        }
      });
    }

    return HttpResponse.json({
      success: false,
      error: 'CPF não encontrado'
    }, { status: 404 });
  }),

  // Available Slots Lookup (same as Scenario 1)
  http.get('/api/ninsaude/availability', ({ request }) => {
    const url = new URL(request.url);

    return HttpResponse.json({
      success: true,
      slots: [
        {
          id: 'slot-1',
          professionalId: 'prof-uuid-1',
          professionalName: 'Dr. João Silva',
          specialty: 'Oftalmologia',
          dateTime: '2025-10-06T10:00:00',
          available: true
        },
        {
          id: 'slot-2',
          professionalId: 'prof-uuid-2',
          professionalName: 'Dra. Maria Santos',
          specialty: 'Optometria',
          dateTime: '2025-10-06T14:00:00',
          available: true
        }
      ]
    });
  }),

  // Slot Availability Check
  http.post('/api/ninsaude/availability/check', async ({ request }) => {
    return HttpResponse.json({
      available: true
    });
  }),

  // Create Appointment
  http.post('/api/ninsaude/appointments', async ({ request }) => {
    const body = await request.json();

    return HttpResponse.json({
      success: true,
      appointment: {
        id: 'appt-uuid-existing-123',
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

describe('Scenario 2: Existing Patient CPF Lookup', () => {
  /**
   * Test Scenario 2 from quickstart.md
   * User Story: As a returning patient, I want to skip registration using my CPF
   *
   * Expected Flow:
   * 1. User enters existing CPF "987.654.321-00"
   * 2. System retrieves patient data
   * 3. System displays welcome message
   * 4. System skips registration form
   * 5. User proceeds directly to slot selection
   */
  it('auto-detects existing patient and skips registration', async () => {
    const user = userEvent.setup();

    // GIVEN: User on /agendamento page with existing CPF
    renderWithProviders(<BookingForm />);

    // WHEN: User enters CPF "987.654.321-00"
    const cpfInput = await screen.findByLabelText(/cpf/i);
    await user.type(cpfInput, '987.654.321-00');

    const verifyButton = screen.getByRole('button', { name: /verificar/i });
    await user.click(verifyButton);

    // THEN: System displays welcome message with patient name
    await waitFor(() => {
      expect(screen.getByText(/bem-vindo de volta.*carlos roberto souza/i)).toBeInTheDocument();
    });

    // THEN: Registration form is NOT shown
    expect(screen.queryByLabelText(/nome completo/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/data de nascimento/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/telefone/i)).not.toBeInTheDocument();

    // THEN: System proceeds directly to slot selection
    expect(await screen.findByText(/selecione um horário/i)).toBeInTheDocument();
    expect(screen.getByText(/horários disponíveis/i)).toBeInTheDocument();
  }, 10000);

  /**
   * Test that patient data is correctly retrieved and displayed
   */
  it('retrieves and displays existing patient data correctly', async () => {
    const user = userEvent.setup();

    renderWithProviders(<BookingForm />);

    const cpfInput = await screen.findByLabelText(/cpf/i);
    await user.type(cpfInput, '987.654.321-00');
    await user.click(screen.getByRole('button', { name: /verificar/i }));

    // Verify patient name is displayed
    await waitFor(() => {
      expect(screen.getByText(/carlos roberto souza/i)).toBeInTheDocument();
    });

    // Verify we can see available slots
    expect(await screen.findByText(/dr\. joão silva/i)).toBeInTheDocument();
  }, 10000);

  /**
   * Test that existing patient can book appointment without re-registering
   */
  it('allows existing patient to book appointment directly', async () => {
    const user = userEvent.setup();

    renderWithProviders(<BookingForm />);

    // Enter CPF
    const cpfInput = await screen.findByLabelText(/cpf/i);
    await user.type(cpfInput, '987.654.321-00');
    await user.click(screen.getByRole('button', { name: /verificar/i }));

    // Wait for patient recognition
    await waitFor(() => {
      expect(screen.getByText(/bem-vindo de volta/i)).toBeInTheDocument();
    });

    // Select available slot
    await waitFor(() => {
      expect(screen.getByText(/selecione um horário/i)).toBeInTheDocument();
    });

    const slotButton = screen.getByRole('button', { name: /06\/10\/2025.*10:00/i });
    await user.click(slotButton);

    // Confirm booking
    const confirmButton = screen.getByRole('button', { name: /confirmar agendamento/i });
    await user.click(confirmButton);

    // Verify confirmation
    await waitFor(() => {
      expect(screen.getByText(/agendamento confirmado/i)).toBeInTheDocument();
    });
  }, 15000);

  /**
   * Test that no duplicate patient record is created
   */
  it('does not create duplicate patient record for existing patient', async () => {
    const user = userEvent.setup();

    let patientCreateCalled = false;
    server.use(
      http.post('/api/ninsaude/patients/register', () => {
        patientCreateCalled = true;
        return HttpResponse.json({
          success: false,
          error: 'Should not create new patient'
        }, { status: 400 });
      })
    );

    renderWithProviders(<BookingForm />);

    // Enter existing patient CPF
    const cpfInput = await screen.findByLabelText(/cpf/i);
    await user.type(cpfInput, '987.654.321-00');
    await user.click(screen.getByRole('button', { name: /verificar/i }));

    // Wait for patient recognition
    await waitFor(() => {
      expect(screen.getByText(/bem-vindo de volta/i)).toBeInTheDocument();
    });

    // Select slot and confirm
    await waitFor(() => {
      expect(screen.getByText(/selecione um horário/i)).toBeInTheDocument();
    });

    const slotButton = screen.getByRole('button', { name: /06\/10\/2025.*10:00/i });
    await user.click(slotButton);

    const confirmButton = screen.getByRole('button', { name: /confirmar agendamento/i });
    await user.click(confirmButton);

    // Wait for completion
    await waitFor(() => {
      expect(screen.getByText(/agendamento confirmado/i)).toBeInTheDocument();
    });

    // Verify patient registration endpoint was NOT called
    expect(patientCreateCalled).toBe(false);
  }, 15000);

  /**
   * Test CPF validation for existing patient
   */
  it('validates CPF format before lookup', async () => {
    const user = userEvent.setup();

    renderWithProviders(<BookingForm />);

    // Enter invalid CPF format
    const cpfInput = await screen.findByLabelText(/cpf/i);
    await user.type(cpfInput, '123.456'); // Invalid format

    const verifyButton = screen.getByRole('button', { name: /verificar/i });

    // Button should be disabled or show validation error
    expect(verifyButton).toBeDisabled();
  }, 5000);

  /**
   * Test transition from CPF lookup to slot selection
   */
  it('smoothly transitions from CPF lookup to slot selection', async () => {
    const user = userEvent.setup();

    renderWithProviders(<BookingForm />);

    // Enter CPF
    const cpfInput = await screen.findByLabelText(/cpf/i);
    await user.type(cpfInput, '987.654.321-00');
    await user.click(screen.getByRole('button', { name: /verificar/i }));

    // Verify smooth transition
    await waitFor(() => {
      expect(screen.getByText(/bem-vindo de volta/i)).toBeInTheDocument();
    });

    // Slot selection should be immediately available
    expect(await screen.findByText(/horários disponíveis/i)).toBeInTheDocument();

    // Multiple professionals should be available
    expect(screen.getByText(/dr\. joão silva/i)).toBeInTheDocument();
    expect(screen.getByText(/dra\. maria santos/i)).toBeInTheDocument();
  }, 10000);
});

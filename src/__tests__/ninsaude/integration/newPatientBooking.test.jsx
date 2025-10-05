/**
 * @file newPatientBooking.test.jsx
 * @description Integration test for Scenario 1: New Patient Appointment Booking
 * @status TDD - Expected to FAIL until components are implemented
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Components that WILL BE CREATED - tests should fail for now
import BookingForm from '@/components/ninsaude/BookingForm';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';

/**
 * MSW Server Setup
 * Mocks Ninsaúde API endpoints according to quickstart.md Scenario 1
 */
const server = setupServer(
  // Step 1: CPF Verification - New Patient
  http.post('/api/ninsaude/patients', async ({ request }) => {
    const body = await request.json();

    if (body.cpf === '111.222.333-44') {
      return HttpResponse.json({
        success: true,
        isNewPatient: true
      });
    }

    return HttpResponse.json({
      success: false,
      error: 'CPF inválido'
    }, { status: 400 });
  }),

  // Step 3: Patient Registration
  http.post('/api/ninsaude/patients/register', async ({ request }) => {
    const body = await request.json();

    return HttpResponse.json({
      success: true,
      patient: {
        id: 'new-uuid-12345',
        cpf: body.cpf,
        name: body.name,
        birthDate: body.birthDate,
        phone: body.phone,
        email: body.email
      }
    });
  }),

  // Step 4: Available Slots Lookup
  http.get('/api/ninsaude/availability', ({ request }) => {
    const url = new URL(request.url);
    const professionalId = url.searchParams.get('professionalId');
    const startDate = url.searchParams.get('startDate');

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
          professionalId: 'prof-uuid-1',
          professionalName: 'Dr. João Silva',
          specialty: 'Oftalmologia',
          dateTime: '2025-10-06T14:00:00',
          available: true
        }
      ]
    });
  }),

  // Step 6: Slot Availability Check
  http.post('/api/ninsaude/availability/check', async ({ request }) => {
    const body = await request.json();

    return HttpResponse.json({
      available: true
    });
  }),

  // Step 6: Create Appointment
  http.post('/api/ninsaude/appointments', async ({ request }) => {
    const body = await request.json();

    return HttpResponse.json({
      success: true,
      appointment: {
        id: 'appt-uuid-78910',
        patientId: body.patientId,
        professionalId: body.professionalId,
        dateTime: body.dateTime,
        status: 'pending'
      }
    });
  }),

  // Step 7: Send Notifications
  http.post('/api/ninsaude/notifications/send', async ({ request }) => {
    const body = await request.json();

    return HttpResponse.json({
      success: true,
      emailSent: true,
      whatsappSent: true
    });
  })
);

beforeEach(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
});

afterEach(() => {
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

describe('Scenario 1: New Patient Appointment Booking', () => {
  /**
   * Test Scenario 1 from quickstart.md
   * User Story: As a first-time visitor, I want to register and book an appointment in one flow
   *
   * Expected Flow:
   * 1. User enters CPF "111.222.333-44"
   * 2. System detects new patient
   * 3. User fills registration form
   * 4. User selects available slot
   * 5. User confirms booking
   * 6. System sends notifications
   */
  it('completes new patient booking flow end-to-end', async () => {
    const user = userEvent.setup();

    // GIVEN: User on /agendamento page
    renderWithProviders(<BookingForm />);

    // WHEN: Step 1 - User enters CPF and clicks "Verificar"
    const cpfInput = await screen.findByLabelText(/cpf/i);
    await user.type(cpfInput, '111.222.333-44');

    const verifyButton = screen.getByRole('button', { name: /verificar/i });
    await user.click(verifyButton);

    // THEN: System shows registration form for new patient
    expect(await screen.findByText(/novo paciente/i)).toBeInTheDocument();

    // WHEN: Step 2-3 - User fills registration form
    const nameInput = screen.getByLabelText(/nome completo/i);
    const birthDateInput = screen.getByLabelText(/data de nascimento/i);
    const phoneInput = screen.getByLabelText(/telefone/i);
    const emailInput = screen.getByLabelText(/e-mail/i);
    const lgpdConsent = screen.getByRole('checkbox', { name: /aceito.*lgpd/i });

    await user.type(nameInput, 'Ana Paula Costa');
    await user.type(birthDateInput, '1992-08-10');
    await user.type(phoneInput, '(33) 98888-7777');
    await user.type(emailInput, 'ana.costa@example.com');
    await user.click(lgpdConsent);

    // WHEN: User clicks "Continuar para Agendamento"
    const continueButton = screen.getByRole('button', { name: /continuar.*agendamento/i });
    await user.click(continueButton);

    // THEN: System shows available slots
    expect(await screen.findByText(/horários disponíveis/i)).toBeInTheDocument();
    expect(await screen.findByText(/dr\. joão silva/i)).toBeInTheDocument();

    // WHEN: Step 5 - User selects slot "06/10/2025 10:00"
    const slotButton = screen.getByRole('button', { name: /06\/10\/2025.*10:00/i });
    await user.click(slotButton);

    // WHEN: Step 6 - User reviews and confirms booking
    const confirmButton = screen.getByRole('button', { name: /confirmar agendamento/i });
    await user.click(confirmButton);

    // THEN: System displays confirmation
    await waitFor(() => {
      expect(screen.getByText(/agendamento confirmado/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/dr\. joão silva/i)).toBeInTheDocument();
    expect(screen.getByText(/06\/10\/2025.*10:00/i)).toBeInTheDocument();
  }, 15000);

  /**
   * Test patient registration API integration
   */
  it('successfully registers new patient with API', async () => {
    const user = userEvent.setup();

    renderWithProviders(<BookingForm />);

    // Enter CPF
    const cpfInput = await screen.findByLabelText(/cpf/i);
    await user.type(cpfInput, '111.222.333-44');

    const verifyButton = screen.getByRole('button', { name: /verificar/i });
    await user.click(verifyButton);

    // Fill registration form
    await waitFor(() => {
      expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/nome completo/i);
    const birthDateInput = screen.getByLabelText(/data de nascimento/i);
    const phoneInput = screen.getByLabelText(/telefone/i);
    const emailInput = screen.getByLabelText(/e-mail/i);
    const lgpdConsent = screen.getByRole('checkbox', { name: /aceito.*lgpd/i });

    await user.type(nameInput, 'Ana Paula Costa');
    await user.type(birthDateInput, '1992-08-10');
    await user.type(phoneInput, '(33) 98888-7777');
    await user.type(emailInput, 'ana.costa@example.com');
    await user.click(lgpdConsent);

    const continueButton = screen.getByRole('button', { name: /continuar.*agendamento/i });
    await user.click(continueButton);

    // Verify API call succeeded and slots are displayed
    await waitFor(() => {
      expect(screen.getByText(/horários disponíveis/i)).toBeInTheDocument();
    });
  }, 10000);

  /**
   * Test LGPD consent requirement
   */
  it('requires LGPD consent before allowing registration', async () => {
    const user = userEvent.setup();

    renderWithProviders(<BookingForm />);

    // Enter CPF
    const cpfInput = await screen.findByLabelText(/cpf/i);
    await user.type(cpfInput, '111.222.333-44');

    const verifyButton = screen.getByRole('button', { name: /verificar/i });
    await user.click(verifyButton);

    // Fill form WITHOUT LGPD consent
    await waitFor(() => {
      expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/nome completo/i);
    const emailInput = screen.getByLabelText(/e-mail/i);

    await user.type(nameInput, 'Ana Paula Costa');
    await user.type(emailInput, 'ana.costa@example.com');

    // Try to continue without LGPD consent
    const continueButton = screen.getByRole('button', { name: /continuar.*agendamento/i });

    // Button should be disabled or show error
    expect(continueButton).toBeDisabled();
  }, 10000);

  /**
   * Test complete notification flow
   */
  it('sends email and WhatsApp notifications after booking', async () => {
    const user = userEvent.setup();

    // Mock console to track notification calls
    const notificationSpy = vi.fn();
    server.use(
      http.post('/api/ninsaude/notifications/send', async ({ request }) => {
        const body = await request.json();
        notificationSpy(body);
        return HttpResponse.json({
          success: true,
          emailSent: true,
          whatsappSent: true
        });
      })
    );

    renderWithProviders(<BookingForm />);

    // Complete full booking flow
    const cpfInput = await screen.findByLabelText(/cpf/i);
    await user.type(cpfInput, '111.222.333-44');
    await user.click(screen.getByRole('button', { name: /verificar/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/nome completo/i), 'Ana Paula Costa');
    await user.type(screen.getByLabelText(/data de nascimento/i), '1992-08-10');
    await user.type(screen.getByLabelText(/telefone/i), '(33) 98888-7777');
    await user.type(screen.getByLabelText(/e-mail/i), 'ana.costa@example.com');
    await user.click(screen.getByRole('checkbox', { name: /aceito.*lgpd/i }));
    await user.click(screen.getByRole('button', { name: /continuar.*agendamento/i }));

    await waitFor(() => {
      expect(screen.getByText(/horários disponíveis/i)).toBeInTheDocument();
    });

    const slotButton = screen.getByRole('button', { name: /06\/10\/2025.*10:00/i });
    await user.click(slotButton);

    const confirmButton = screen.getByRole('button', { name: /confirmar agendamento/i });
    await user.click(confirmButton);

    // Verify notifications were sent
    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'booking_confirmation'
        })
      );
    });
  }, 20000);
});

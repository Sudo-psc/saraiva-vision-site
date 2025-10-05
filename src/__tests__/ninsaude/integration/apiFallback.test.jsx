/**
 * @file apiFallback.test.jsx
 * @description Integration test for Scenario 8: API Unavailability with Queue Fallback
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
 * Mocks Ninsaúde API endpoints according to quickstart.md Scenario 8
 */
let appointmentAttempts = 0;

const server = setupServer(
  // CPF Verification - Success
  http.post('/api/ninsaude/patients', async ({ request }) => {
    return HttpResponse.json({
      success: true,
      isNewPatient: false,
      patient: {
        id: 'test-patient-uuid',
        cpf: '123.456.789-00',
        name: 'João Silva'
      }
    });
  }),

  // Available Slots - Success
  http.get('/api/ninsaude/availability', () => {
    return HttpResponse.json({
      success: true,
      slots: [
        {
          id: 'slot-1',
          professionalId: 'prof-uuid-1',
          professionalName: 'Dr. João Silva',
          specialty: 'Oftalmologia',
          dateTime: '2025-10-08T11:00:00',
          available: true
        }
      ]
    });
  }),

  // Slot Availability Check - Success
  http.post('/api/ninsaude/availability/check', async ({ request }) => {
    return HttpResponse.json({
      available: true
    });
  }),

  // Create Appointment - Simulates 503 Service Unavailable with retry logic
  http.post('/api/ninsaude/appointments', async ({ request }) => {
    appointmentAttempts++;

    // Simulate 3 failed attempts with exponential backoff
    if (appointmentAttempts <= 3) {
      return HttpResponse.json({
        error: 'Service Unavailable',
        message: 'Ninsaúde API is temporarily unavailable'
      }, { status: 503 });
    }

    // After 3 retries, queue the request
    return HttpResponse.json({
      success: false,
      queued: true,
      queueId: 'queue-uuid-123456',
      estimatedProcessingTime: '5-10 minutes',
      message: 'Request queued for processing'
    }, { status: 202 }); // 202 Accepted
  })
);

beforeEach(() => {
  appointmentAttempts = 0; // Reset counter before each test
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

describe('Scenario 8: API Unavailability - Hybrid Fallback', () => {
  /**
   * Test Scenario 8 from quickstart.md
   * User Story: As a user, I want my booking request to be processed even if the system is temporarily down
   *
   * Expected Flow:
   * 1. User completes booking form
   * 2. Ninsaúde API is unavailable (503)
   * 3. System retries with exponential backoff (1s, 2s, 4s)
   * 4. After 3 failed retries, system queues request in Redis
   * 5. System displays fallback message with queue ID
   * 6. Background worker processes queue later
   */
  it('retries API call with exponential backoff before queuing', async () => {
    const user = userEvent.setup();

    // GIVEN: User has completed patient verification and slot selection
    renderWithProviders(<BookingForm />);

    // Complete verification
    const cpfInput = await screen.findByLabelText(/cpf/i);
    await user.type(cpfInput, '123.456.789-00');
    await user.click(screen.getByRole('button', { name: /verificar/i }));

    await waitFor(() => {
      expect(screen.getByText(/joão silva/i)).toBeInTheDocument();
    });

    // Select slot
    await waitFor(() => {
      expect(screen.getByText(/horários disponíveis/i)).toBeInTheDocument();
    });

    const slotButton = screen.getByRole('button', { name: /08\/10\/2025.*11:00/i });
    await user.click(slotButton);

    // WHEN: User confirms booking (API will fail 3 times then queue)
    const confirmButton = screen.getByRole('button', { name: /confirmar agendamento/i });

    const startTime = Date.now();
    await user.click(confirmButton);

    // THEN: System should retry 3 times with exponential backoff
    // Total expected delay: ~7 seconds (1s + 2s + 4s)
    await waitFor(() => {
      expect(screen.getByText(/dificuldades técnicas/i)).toBeInTheDocument();
    }, { timeout: 15000 });

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // Verify retries happened (should take at least 5 seconds for 3 retries)
    expect(totalTime).toBeGreaterThan(5000);
  }, 20000);

  /**
   * Test queue fallback message display
   */
  it('displays fallback message when API is unavailable', async () => {
    const user = userEvent.setup();

    renderWithProviders(<BookingForm />);

    // Complete booking flow
    const cpfInput = await screen.findByLabelText(/cpf/i);
    await user.type(cpfInput, '123.456.789-00');
    await user.click(screen.getByRole('button', { name: /verificar/i }));

    await waitFor(() => {
      expect(screen.getByText(/joão silva/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/horários disponíveis/i)).toBeInTheDocument();
    });

    const slotButton = screen.getByRole('button', { name: /08\/10\/2025.*11:00/i });
    await user.click(slotButton);

    const confirmButton = screen.getByRole('button', { name: /confirmar agendamento/i });
    await user.click(confirmButton);

    // THEN: Fallback message should be displayed
    await waitFor(() => {
      expect(screen.getByText(/dificuldades técnicas/i)).toBeInTheDocument();
    }, { timeout: 15000 });

    expect(screen.getByText(/entraremos em contato/i)).toBeInTheDocument();
  }, 20000);

  /**
   * Test queue ID is displayed to user
   */
  it('provides queue tracking ID to user', async () => {
    const user = userEvent.setup();

    renderWithProviders(<BookingForm />);

    // Complete booking flow
    const cpfInput = await screen.findByLabelText(/cpf/i);
    await user.type(cpfInput, '123.456.789-00');
    await user.click(screen.getByRole('button', { name: /verificar/i }));

    await waitFor(() => {
      expect(screen.getByText(/joão silva/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/horários disponíveis/i)).toBeInTheDocument();
    });

    const slotButton = screen.getByRole('button', { name: /08\/10\/2025.*11:00/i });
    await user.click(slotButton);

    const confirmButton = screen.getByRole('button', { name: /confirmar agendamento/i });
    await user.click(confirmButton);

    // THEN: Queue ID should be displayed
    await waitFor(() => {
      expect(screen.getByText(/código de acompanhamento/i)).toBeInTheDocument();
    }, { timeout: 15000 });

    expect(screen.getByText(/queue-uuid-123456/i)).toBeInTheDocument();
  }, 20000);

  /**
   * Test estimated processing time is shown
   */
  it('displays estimated processing time for queued request', async () => {
    const user = userEvent.setup();

    renderWithProviders(<BookingForm />);

    // Complete booking flow
    const cpfInput = await screen.findByLabelText(/cpf/i);
    await user.type(cpfInput, '123.456.789-00');
    await user.click(screen.getByRole('button', { name: /verificar/i }));

    await waitFor(() => {
      expect(screen.getByText(/joão silva/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/horários disponíveis/i)).toBeInTheDocument();
    });

    const slotButton = screen.getByRole('button', { name: /08\/10\/2025.*11:00/i });
    await user.click(slotButton);

    const confirmButton = screen.getByRole('button', { name: /confirmar agendamento/i });
    await user.click(confirmButton);

    // THEN: Estimated time should be displayed
    await waitFor(() => {
      expect(screen.getByText(/5-10 minutes/i)).toBeInTheDocument();
    }, { timeout: 15000 });
  }, 20000);

  /**
   * Test retry mechanism respects exponential backoff timing
   */
  it('implements correct exponential backoff delays', async () => {
    const user = userEvent.setup();

    const retryDelays = [];
    let lastRetryTime = null;

    server.use(
      http.post('/api/ninsaude/appointments', async ({ request }) => {
        const currentTime = Date.now();
        if (lastRetryTime) {
          retryDelays.push(currentTime - lastRetryTime);
        }
        lastRetryTime = currentTime;

        appointmentAttempts++;

        if (appointmentAttempts <= 3) {
          return HttpResponse.json({
            error: 'Service Unavailable'
          }, { status: 503 });
        }

        return HttpResponse.json({
          success: false,
          queued: true,
          queueId: 'queue-uuid-123456'
        }, { status: 202 });
      })
    );

    renderWithProviders(<BookingForm />);

    // Complete booking flow
    const cpfInput = await screen.findByLabelText(/cpf/i);
    await user.type(cpfInput, '123.456.789-00');
    await user.click(screen.getByRole('button', { name: /verificar/i }));

    await waitFor(() => {
      expect(screen.getByText(/joão silva/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/horários disponíveis/i)).toBeInTheDocument();
    });

    const slotButton = screen.getByRole('button', { name: /08\/10\/2025.*11:00/i });
    await user.click(slotButton);

    const confirmButton = screen.getByRole('button', { name: /confirmar agendamento/i });
    await user.click(confirmButton);

    // Wait for queue message
    await waitFor(() => {
      expect(screen.getByText(/dificuldades técnicas/i)).toBeInTheDocument();
    }, { timeout: 15000 });

    // Verify exponential backoff: ~1000ms, ~2000ms, ~4000ms (with tolerance)
    expect(retryDelays[0]).toBeGreaterThan(800);
    expect(retryDelays[0]).toBeLessThan(1500);
    expect(retryDelays[1]).toBeGreaterThan(1800);
    expect(retryDelays[1]).toBeLessThan(2500);
    expect(retryDelays[2]).toBeGreaterThan(3800);
  }, 25000);
});

/**
 * @file cpfAutoDetection.test.jsx
 * @description Integration test for Scenario 9: CPF Auto-Detection on Blur
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
 * Mocks Ninsaúde API endpoints according to quickstart.md Scenario 9
 */
const server = setupServer(
  // CPF Verification with debounced lookup
  http.post('/api/ninsaude/patients', async ({ request }) => {
    const body = await request.json();

    if (body.cpf === '555.666.777-88') {
      return HttpResponse.json({
        success: true,
        isNewPatient: false,
        patient: {
          id: 'fernanda-uuid-123',
          cpf: '555.666.777-88',
          name: 'Fernanda Lima',
          birthDate: '1988-11-20',
          phone: '(33) 96666-5555',
          email: 'fernanda.lima@example.com'
        }
      });
    }

    // For new patients
    return HttpResponse.json({
      success: true,
      isNewPatient: true
    });
  }),

  // Available Slots
  http.get('/api/ninsaude/availability', () => {
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
        }
      ]
    });
  })
);

beforeEach(() => {
  server.listen({ onUnhandledRequest: 'error' });
  vi.useFakeTimers();
});

afterEach(() => {
  server.resetHandlers();
  server.close();
  vi.useRealTimers();
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

describe('Scenario 9: CPF Auto-Detection on Blur', () => {
  /**
   * Test Scenario 9 from quickstart.md
   * User Story: As a returning patient, I want instant recognition after entering my CPF
   *
   * Expected Flow:
   * 1. User types CPF "555.666.777-88" in CPF field
   * 2. User tabs out or clicks away (onBlur event)
   * 3. After 500ms debounce, API call is triggered
   * 4. Patient name is displayed inline below CPF field
   * 5. "Continuar" button becomes active immediately
   */
  it('triggers CPF lookup on blur event', async () => {
    const user = userEvent.setup({ delay: null });

    // GIVEN: User on registration page
    renderWithProviders(<BookingForm />);

    // WHEN: User types CPF in CPF field
    const cpfInput = await screen.findByLabelText(/cpf/i);
    await user.type(cpfInput, '555.666.777-88');

    // WHEN: User tabs away (trigger onBlur)
    await user.tab();

    // Fast-forward debounce delay (500ms)
    vi.advanceTimersByTime(500);

    // THEN: Patient name should be displayed within 1 second
    await waitFor(() => {
      expect(screen.getByText(/paciente encontrado.*fernanda lima/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  }, 10000);

  /**
   * Test debounced API call timing
   */
  it('debounces CPF lookup with 500ms delay', async () => {
    const user = userEvent.setup({ delay: null });

    let apiCallCount = 0;
    server.use(
      http.post('/api/ninsaude/patients', async ({ request }) => {
        apiCallCount++;
        const body = await request.json();

        return HttpResponse.json({
          success: true,
          isNewPatient: false,
          patient: {
            id: 'fernanda-uuid-123',
            name: 'Fernanda Lima'
          }
        });
      })
    );

    renderWithProviders(<BookingForm />);

    const cpfInput = await screen.findByLabelText(/cpf/i);

    // Type CPF character by character
    await user.type(cpfInput, '555.666.777-88');

    // Trigger blur
    await user.tab();

    // Immediately after blur, API should not have been called yet
    expect(apiCallCount).toBe(0);

    // Fast-forward by 400ms (still within debounce window)
    vi.advanceTimersByTime(400);
    expect(apiCallCount).toBe(0);

    // Fast-forward remaining 100ms to complete 500ms debounce
    vi.advanceTimersByTime(100);

    // Now API should be called exactly once
    await waitFor(() => {
      expect(apiCallCount).toBe(1);
    });
  }, 10000);

  /**
   * Test inline patient name display
   */
  it('displays patient name inline below CPF field', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<BookingForm />);

    const cpfInput = await screen.findByLabelText(/cpf/i);
    await user.type(cpfInput, '555.666.777-88');
    await user.tab();

    // Fast-forward debounce
    vi.advanceTimersByTime(500);

    // Patient name should appear as inline feedback
    await waitFor(() => {
      const patientFoundMessage = screen.getByText(/paciente encontrado/i);
      expect(patientFoundMessage).toBeInTheDocument();

      // Name should be in the same element or nearby
      expect(screen.getByText(/fernanda lima/i)).toBeInTheDocument();
    });

    // Should have checkmark or success indicator
    expect(screen.getByText(/✓/)).toBeInTheDocument();
  }, 10000);

  /**
   * Test "Continuar" button activation
   */
  it('enables "Continuar" button immediately after patient detection', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<BookingForm />);

    const cpfInput = await screen.findByLabelText(/cpf/i);
    await user.type(cpfInput, '555.666.777-88');
    await user.tab();

    // Fast-forward debounce
    vi.advanceTimersByTime(500);

    // Wait for patient detection
    await waitFor(() => {
      expect(screen.getByText(/fernanda lima/i)).toBeInTheDocument();
    });

    // "Continuar" button should be enabled
    const continueButton = screen.getByRole('button', { name: /continuar/i });
    expect(continueButton).not.toBeDisabled();
  }, 10000);

  /**
   * Test no registration form is required for existing patient
   */
  it('skips registration form for auto-detected patient', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<BookingForm />);

    const cpfInput = await screen.findByLabelText(/cpf/i);
    await user.type(cpfInput, '555.666.777-88');
    await user.tab();

    // Fast-forward debounce
    vi.advanceTimersByTime(500);

    // Wait for patient detection
    await waitFor(() => {
      expect(screen.getByText(/fernanda lima/i)).toBeInTheDocument();
    });

    // Click "Continuar" button
    const continueButton = screen.getByRole('button', { name: /continuar/i });
    await user.click(continueButton);

    // Should proceed directly to booking (no registration form)
    await waitFor(() => {
      expect(screen.getByText(/horários disponíveis/i)).toBeInTheDocument();
    });

    // Verify registration form fields are NOT shown
    expect(screen.queryByLabelText(/nome completo/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/data de nascimento/i)).not.toBeInTheDocument();
  }, 15000);

  /**
   * Test multiple rapid CPF changes (debounce cancellation)
   */
  it('cancels previous debounce when CPF changes', async () => {
    const user = userEvent.setup({ delay: null });

    let apiCallCount = 0;
    server.use(
      http.post('/api/ninsaude/patients', async ({ request }) => {
        apiCallCount++;
        return HttpResponse.json({
          success: true,
          isNewPatient: false,
          patient: { name: 'Test Patient' }
        });
      })
    );

    renderWithProviders(<BookingForm />);

    const cpfInput = await screen.findByLabelText(/cpf/i);

    // Type CPF
    await user.type(cpfInput, '555.666.777-88');
    await user.tab();

    // Wait 200ms
    vi.advanceTimersByTime(200);

    // Clear and type different CPF
    await user.clear(cpfInput);
    await user.type(cpfInput, '111.222.333-44');
    await user.tab();

    // Wait 200ms
    vi.advanceTimersByTime(200);

    // API should not have been called yet (debounce restarted)
    expect(apiCallCount).toBe(0);

    // Complete the debounce
    vi.advanceTimersByTime(300);

    // Should only call API once with final CPF
    await waitFor(() => {
      expect(apiCallCount).toBe(1);
    });
  }, 10000);

  /**
   * Test loading state during CPF lookup
   */
  it('shows loading indicator during debounced lookup', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<BookingForm />);

    const cpfInput = await screen.findByLabelText(/cpf/i);
    await user.type(cpfInput, '555.666.777-88');
    await user.tab();

    // Fast-forward debounce
    vi.advanceTimersByTime(500);

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText(/verificando/i) || screen.getByTestId('cpf-loading')).toBeTruthy();
    });

    // Then show result
    await waitFor(() => {
      expect(screen.getByText(/fernanda lima/i)).toBeInTheDocument();
    });
  }, 10000);
});

/**
 * Medical Workflow Integration Tests
 * Tests critical patient journeys for LGPD compliance and medical safety
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { medicalApiFetch } from '../../src/utils/circuitBreaker.js';

// Test utilities for medical compliance
import {
  setupTestEnvironment,
  createTestPatient,
  mockLGPDCompliance,
  verifyAuditTrail,
  cleanupTestData
} from '../utils/medical-test-utils.js';

// Mock components for testing
import App from '../../src/App.jsx';
import { PostHogProvider } from '../../src/contexts/PostHogContext';
import { WidgetProvider } from '../../src/utils/widgetManager.jsx';

// Medical test data
const testPatientData = {
  name: 'João Silva Teste',
  cpf: '123.456.789-00',
  email: 'joao.teste@example.com',
  phone: '(11) 99999-9999',
  birthDate: '1985-05-15',
  address: 'Rua Teste, 123 - São Paulo, SP'
};

const emergencyContactData = {
  name: 'Maria Silva',
  relationship: 'Esposa',
  phone: '(11) 88888-8888'
};

describe('Medical Workflow Integration Tests', () => {
  let testEnvironment;
  let user;

  beforeAll(async () => {
    testEnvironment = await setupTestEnvironment();
    user = userEvent.setup();
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  beforeEach(() => {
    // Reset any mocks and state
    vi.clearAllMocks();
    mockLGPDCompliance.reset();
  });

  describe('LGPD Compliance Workflows', () => {
    it('should require explicit consent before collecting medical data', async () => {
      // Test REQ-LGPD-001: Explicit Consent for Medical Data

      render(
        <BrowserRouter>
          <PostHogProvider>
            <WidgetProvider>
              <App />
            </WidgetProvider>
          </PostHogProvider>
        </BrowserRouter>
      );

      // Navigate to appointment booking
      const appointmentLink = screen.getByText(/agendar consulta/i);
      await user.click(appointmentLink);

      // Verify consent form appears before data collection
      await waitFor(() => {
        const consentForm = screen.getByTestId('lgpd-consent-form');
        expect(consentForm).toBeInTheDocument();
      });

      // Verify consent text is in Portuguese and readable
      const consentText = screen.getByTestId('consent-text');
      expect(consentText).toBeInTheDocument();
      expect(consentText.textContent.length).toBeLessThanOrEqual(500 * 5); // ~500 words

      // Verify checkbox is not pre-checked
      const consentCheckbox = screen.getByRole('checkbox', { name: /aceito os termos/i });
      expect(consentCheckbox).not.toBeChecked();

      // Verify cannot proceed without consent
      const continueButton = screen.getByRole('button', { name: /continuar/i });
      expect(continueButton).toBeDisabled();

      // Check consent and verify form becomes available
      await user.click(consentCheckbox);
      expect(continueButton).toBeEnabled();

      // Verify consent recording
      await user.click(continueButton);

      await waitFor(() => {
        expect(mockLGPDCompliance.getConsentRecord()).toMatchObject({
          timestamp: expect.any(String),
          ipAddress: expect.any(String),
          userAgent: expect.any(String),
          consentGiven: true
        });
      });
    });

    it('should provide granular consent options', async () => {
      // Test REQ-LGPD-002: Granular Consent Options

      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      // Navigate to consent preferences
      const userMenu = screen.getByTestId('user-menu');
      await user.click(userMenu);

      const privacySettings = screen.getByText(/configurações de privacidade/i);
      await user.click(privacySettings);

      await waitFor(() => {
        // Verify separate consent categories
        expect(screen.getByLabelText(/dados médicos essenciais/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/comunicações de marketing/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/análise e melhorias/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/pesquisa médica/i)).toBeInTheDocument();
      });

      // Test selective consent
      const marketingConsent = screen.getByLabelText(/comunicações de marketing/i);
      const researchConsent = screen.getByLabelText(/pesquisa médica/i);

      await user.click(marketingConsent); // Accept marketing
      // Don't click research consent (refuse)

      const saveButton = screen.getByRole('button', { name: /salvar preferências/i });
      await user.click(saveButton);

      // Verify consent granularity is recorded
      await waitFor(() => {
        const consentRecord = mockLGPDCompliance.getConsentRecord();
        expect(consentRecord.categories).toMatchObject({
          essential_medical: true,
          marketing: true,
          analytics: false,
          research: false
        });
      });
    });

    it('should handle data deletion requests within 30 days', async () => {
      // Test REQ-LGPD-007: Right of Erasure Implementation

      const testPatient = await createTestPatient(testPatientData);

      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      // Login as test patient
      await user.type(screen.getByLabelText(/email/i), testPatientData.email);
      await user.type(screen.getByLabelText(/senha/i), 'testpassword');
      await user.click(screen.getByRole('button', { name: /entrar/i }));

      // Navigate to data deletion
      await waitFor(() => {
        const accountSettings = screen.getByText(/configurações da conta/i);
        user.click(accountSettings);
      });

      const deleteDataButton = screen.getByText(/excluir meus dados/i);
      await user.click(deleteDataButton);

      // Verify deletion confirmation dialog
      await waitFor(() => {
        const confirmationDialog = screen.getByRole('dialog');
        expect(confirmationDialog).toBeInTheDocument();

        const warningText = within(confirmationDialog).getByText(/esta ação não pode ser desfeita/i);
        expect(warningText).toBeInTheDocument();
      });

      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: /confirmar exclusão/i });
      await user.click(confirmButton);

      // Verify deletion request is processed
      await waitFor(() => {
        expect(screen.getByText(/solicitação de exclusão enviada/i)).toBeInTheDocument();
      });

      // Verify audit trail
      const auditTrail = await verifyAuditTrail(testPatient.id);
      expect(auditTrail).toContainEqual(
        expect.objectContaining({
          action: 'data_deletion_requested',
          timestamp: expect.any(String),
          patientId: testPatient.id
        })
      );
    });
  });

  describe('Critical Patient Journey Workflows', () => {
    it('should complete appointment booking to confirmation workflow', async () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      // Step 1: Navigate to appointment booking
      const bookAppointmentButton = screen.getByText(/agendar consulta/i);
      await user.click(bookAppointmentButton);

      // Step 2: Accept LGPD consent
      await waitFor(() => {
        const consentCheckbox = screen.getByRole('checkbox', { name: /aceito/i });
        user.click(consentCheckbox);
      });

      const continueButton = screen.getByRole('button', { name: /continuar/i });
      await user.click(continueButton);

      // Step 3: Fill patient information
      await waitFor(() => {
        const nameField = screen.getByLabelText(/nome completo/i);
        expect(nameField).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/nome completo/i), testPatientData.name);
      await user.type(screen.getByLabelText(/cpf/i), testPatientData.cpf);
      await user.type(screen.getByLabelText(/email/i), testPatientData.email);
      await user.type(screen.getByLabelText(/telefone/i), testPatientData.phone);

      // Step 4: Select appointment type and date
      const specialtySelect = screen.getByLabelText(/especialidade/i);
      await user.selectOptions(specialtySelect, 'oftalmologia-geral');

      // Verify availability check within 15 seconds
      const availabilityStart = Date.now();
      await waitFor(() => {
        const availableSlots = screen.getByTestId('available-slots');
        expect(availableSlots).toBeInTheDocument();
      }, { timeout: 15000 });

      const availabilityEnd = Date.now();
      expect(availabilityEnd - availabilityStart).toBeLessThan(15000);

      // Step 5: Select appointment slot
      const availableSlot = screen.getByTestId('slot-2025-01-20-14:00');
      await user.click(availableSlot);

      // Step 6: Confirm appointment
      const confirmAppointmentButton = screen.getByRole('button', { name: /confirmar agendamento/i });
      await user.click(confirmAppointmentButton);

      // Step 7: Verify confirmation
      await waitFor(() => {
        expect(screen.getByText(/agendamento confirmado/i)).toBeInTheDocument();
        expect(screen.getByText(/confirmação enviada por email/i)).toBeInTheDocument();
      });

      // Verify email confirmation is sent within 30 seconds
      const emailStart = Date.now();
      await waitFor(() => {
        expect(mockLGPDCompliance.getEmailLog()).toContainEqual(
          expect.objectContaining({
            to: testPatientData.email,
            type: 'appointment_confirmation'
          })
        );
      }, { timeout: 30000 });

      const emailEnd = Date.now();
      expect(emailEnd - emailStart).toBeLessThan(30000);
    });

    it('should handle emergency contact workflow', async () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      // Navigate to emergency contact form
      const emergencyButton = screen.getByText(/contato de emergência/i);
      await user.click(emergencyButton);

      // Fill emergency form
      await user.type(screen.getByLabelText(/nome/i), emergencyContactData.name);
      await user.type(screen.getByLabelText(/telefone/i), emergencyContactData.phone);
      await user.selectOptions(screen.getByLabelText(/tipo de emergência/i), 'urgencia-oftalmologica');
      await user.type(screen.getByLabelText(/descrição/i), 'Dor intensa no olho direito');

      const submitButton = screen.getByRole('button', { name: /enviar/i });
      await user.click(submitButton);

      // Verify emergency response
      await waitFor(() => {
        expect(screen.getByText(/emergência registrada/i)).toBeInTheDocument();
        expect(screen.getByText(/entraremos em contato em breve/i)).toBeInTheDocument();
      });

      // Verify emergency alert is triggered
      expect(mockLGPDCompliance.getEmergencyAlerts()).toContainEqual(
        expect.objectContaining({
          type: 'urgencia-oftalmologica',
          status: 'active',
          timestamp: expect.any(String)
        })
      );
    });
  });

  describe('System Resilience and Circuit Breaker Tests', () => {
    it('should gracefully handle API failures with medical fallbacks', async () => {
      // Mock API failure
      vi.mocked(medicalApiFetch).mockRejectedValue(new Error('API Unavailable'));

      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      // Try to access appointment history
      const appointmentHistoryButton = screen.getByText(/histórico de consultas/i);
      await user.click(appointmentHistoryButton);

      // Verify fallback behavior
      await waitFor(() => {
        expect(screen.getByText(/usando dados salvos localmente/i)).toBeInTheDocument();
        expect(screen.getByText(/contate a clínica para atualizações/i)).toBeInTheDocument();
      });

      // Verify circuit breaker status
      const circuitBreakerStatus = await medicalApiFetch.getStatus();
      expect(circuitBreakerStatus.state).toBe('OPEN');
    });

    it('should maintain critical functions during system degradation', async () => {
      // Simulate partial system failure
      vi.mocked(medicalApiFetch).mockImplementation((endpoint) => {
        if (endpoint.includes('/appointments')) {
          throw new Error('Service Unavailable');
        }
        return Promise.resolve({ data: 'OK' });
      });

      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      // Verify emergency contact still works
      const emergencyButton = screen.getByText(/contato de emergência/i);
      await user.click(emergencyButton);

      await waitFor(() => {
        expect(screen.getByText(/para emergências, ligue:/i)).toBeInTheDocument();
        expect(screen.getByText(/(11) 99999-9999/i)).toBeInTheDocument();
      });

      // Verify critical information is accessible
      const clinicInfoButton = screen.getByText(/informações da clínica/i);
      await user.click(clinicInfoButton);

      await waitFor(() => {
        expect(screen.getByText(/endereço:/i)).toBeInTheDocument();
        expect(screen.getByText(/telefone:/i)).toBeInTheDocument();
      });
    });
  });

  describe('Performance and Load Testing', () => {
    it('should handle appointment rush hour load', async () => {
      // Simulate 50 concurrent appointment requests
      const concurrentRequests = Array(50).fill().map(async (_, index) => {
        const testData = {
          ...testPatientData,
          email: `patient${index}@test.com`,
          cpf: `123.456.789-${String(index).padStart(2, '0')}`
        };

        return medicalApiFetch('/api/appointments', {
          method: 'POST',
          body: JSON.stringify({
            patient: testData,
            specialty: 'oftalmologia-geral',
            preferredDate: '2025-01-20'
          })
        });
      });

      const startTime = Date.now();
      const results = await Promise.allSettled(concurrentRequests);
      const endTime = Date.now();

      // Verify response time under load
      const averageResponseTime = (endTime - startTime) / concurrentRequests.length;
      expect(averageResponseTime).toBeLessThan(2000); // <2s requirement

      // Verify success rate
      const successfulRequests = results.filter(r => r.status === 'fulfilled');
      const successRate = successfulRequests.length / results.length;
      expect(successRate).toBeGreaterThan(0.95); // >95% success rate
    });

    it('should maintain performance during data export requests', async () => {
      const testPatient = await createTestPatient(testPatientData);

      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      // Request data export
      const exportButton = screen.getByText(/exportar meus dados/i);
      await user.click(exportButton);

      // Verify export completes within reasonable time
      const startTime = Date.now();
      await waitFor(() => {
        expect(screen.getByText(/download iniciado/i)).toBeInTheDocument();
      }, { timeout: 10000 });

      const exportTime = Date.now() - startTime;
      expect(exportTime).toBeLessThan(10000); // <10s for export initiation

      // Verify system remains responsive during export
      const navigationButton = screen.getByText(/início/i);
      await user.click(navigationButton);

      await waitFor(() => {
        expect(screen.getByText(/bem-vindo/i)).toBeInTheDocument();
      }, { timeout: 3000 }); // Navigation should remain fast
    });
  });

  describe('Audit Trail and Compliance Verification', () => {
    it('should log all patient data access for audit', async () => {
      const testPatient = await createTestPatient(testPatientData);

      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      // Access patient data
      const patientDataButton = screen.getByText(/meus dados/i);
      await user.click(patientDataButton);

      // Verify audit trail entry
      await waitFor(async () => {
        const auditTrail = await verifyAuditTrail(testPatient.id);
        expect(auditTrail).toContainEqual(
          expect.objectContaining({
            action: 'data_access',
            timestamp: expect.any(String),
            patientId: testPatient.id,
            accessedBy: testPatient.id,
            purpose: 'patient_self_access'
          })
        );
      });
    });

    it('should track consent changes with full audit trail', async () => {
      const testPatient = await createTestPatient(testPatientData);

      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      // Change consent preferences
      const consentButton = screen.getByText(/preferências de consentimento/i);
      await user.click(consentButton);

      const marketingConsent = screen.getByLabelText(/marketing/i);
      await user.click(marketingConsent); // Change consent

      const saveButton = screen.getByRole('button', { name: /salvar/i });
      await user.click(saveButton);

      // Verify consent change is audited
      await waitFor(async () => {
        const auditTrail = await verifyAuditTrail(testPatient.id);
        expect(auditTrail).toContainEqual(
          expect.objectContaining({
            action: 'consent_modified',
            timestamp: expect.any(String),
            patientId: testPatient.id,
            changes: expect.objectContaining({
              marketing: expect.any(Boolean)
            })
          })
        );
      });
    });
  });
});
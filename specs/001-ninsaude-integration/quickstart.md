# Quickstart: Ninsaúde Integration Test Scenarios

**Date**: 2025-10-05
**Feature**: 001-ninsaude-integration
**Purpose**: Integration test scenarios derived from user stories (spec.md acceptance scenarios)

---

## Overview

This document provides step-by-step integration test scenarios to validate the Ninsaúde appointment booking system. Each scenario maps to acceptance criteria from spec.md and can be executed manually or automated via Vitest.

**Test Environment Setup**:
```bash
# Backend
cd api
npm install
NINSAUDE_CLIENT_ID=test_id NINSAUDE_CLIENT_SECRET=test_secret npm run dev

# Frontend
cd ..
npm run dev

# Access: http://localhost:3002/agendamento
```

---

## Scenario 1: New Patient Appointment Booking

**User Story**: As a first-time visitor, I want to register and book an appointment in one flow

**Prerequisites**:
- CPF not in Ninsaúde system: `111.222.333-44`
- Available professional: Dr. João Silva (Oftalmologista)
- Available slot: Tomorrow 10:00 AM

**Steps**:

### Given
```
User on /agendamento page
No existing patient record for CPF 111.222.333-44
Available slot exists: 2025-10-06T10:00:00
```

### When
```
Step 1: User enters CPF "111.222.333-44" and clicks "Verificar"
  → API call: POST /api/ninsaude/patients { "cpf": "111.222.333-44" }
  → Response: { "success": true, "isNewPatient": true }

Step 2: System shows registration form
  User fills:
    - Name: "Ana Paula Costa"
    - Birth Date: "1992-08-10"
    - Phone: "(33) 98888-7777"
    - Email: "ana.costa@example.com"
    - Address: (complete address fields)
    - LGPD Consent: checked

Step 3: User clicks "Continuar para Agendamento"
  → API call: POST /api/ninsaude/patients { ...fullPatientData }
  → Response: { "success": true, "patient": { "id": "new-uuid" } }

Step 4: System shows available slots
  → API call: GET /api/ninsaude/availability?professionalId=X&startDate=2025-10-06&endDate=2025-10-13

Step 5: User selects "Dr. João Silva - 06/10/2025 10:00"

Step 6: User reviews and confirms booking
  → API call: POST /api/ninsaude/availability/check { professionalId, dateTime }
  → Response: { "available": true }
  → API call: POST /api/ninsaude/appointments { patientId, professionalId, dateTime, ... }
  → Response: { "success": true, "appointment": { "id": "appt-uuid" } }

Step 7: System sends notifications
  → API call: POST /api/ninsaude/notifications/send { appointmentId, email, phone, event: "booking_confirmation" }
  → Email sent via Resend API
  → WhatsApp sent via Evolution API
```

### Then
```
✓ Patient record created in Ninsaúde
✓ Appointment confirmed with status "pending"
✓ Confirmation displayed: "Agendamento confirmado! Dr. João Silva - 06/10/2025 às 10:00"
✓ Confirmation email received
✓ WhatsApp message received
✓ Appointment visible in Ninsaúde dashboard
```

**Validation Checks**:
```javascript
// Frontend test (Vitest)
test('Scenario 1: New patient booking flow', async () => {
  const { user } = renderBookingForm();

  // Step 1: CPF verification
  await user.type(screen.getByLabelText('CPF'), '111.222.333-44');
  await user.click(screen.getByText('Verificar'));
  expect(await screen.findByText(/novo paciente/i)).toBeInTheDocument();

  // Step 2-3: Registration
  await user.type(screen.getByLabelText('Nome completo'), 'Ana Paula Costa');
  // ... fill other fields
  await user.click(screen.getByLabelText('Aceito termos LGPD'));
  await user.click(screen.getByText('Continuar'));

  // Step 4-5: Slot selection
  expect(await screen.findByText(/horários disponíveis/i)).toBeInTheDocument();
  await user.click(screen.getByText('10:00'));

  // Step 6: Confirmation
  await user.click(screen.getByText('Confirmar Agendamento'));
  expect(await screen.findByText(/agendamento confirmado/i)).toBeInTheDocument();
});
```

---

## Scenario 2: Existing Patient CPF Lookup

**User Story**: As a returning patient, I want to skip registration using my CPF

**Prerequisites**:
- CPF exists in Ninsaúde: `987.654.321-00`
- Linked to patient: "Carlos Roberto Souza"

**Steps**:

### Given
```
User on /agendamento page
Existing patient: CPF 987.654.321-00, Name "Carlos Roberto Souza"
```

### When
```
Step 1: User enters CPF "987.654.321-00"
  → API call: POST /api/ninsaude/patients { "cpf": "987.654.321-00" }
  → Response: {
      "success": true,
      "isNewPatient": false,
      "patient": { "id": "existing-uuid", "name": "Carlos Roberto Souza", ... }
    }

Step 2: System displays welcome message
  "Bem-vindo de volta, Carlos Roberto Souza!"

Step 3: System skips registration form

Step 4: System proceeds directly to available slots
  → API call: GET /api/ninsaude/availability?...
```

### Then
```
✓ Patient name displayed for confirmation
✓ Registration form NOT shown
✓ User proceeds directly to slot selection
✓ No duplicate patient record created
```

**Validation Checks**:
```javascript
test('Scenario 2: Existing patient auto-detection', async () => {
  const { user } = renderBookingForm();

  await user.type(screen.getByLabelText('CPF'), '987.654.321-00');
  await user.click(screen.getByText('Verificar'));

  expect(await screen.findByText(/bem-vindo de volta, carlos roberto souza/i)).toBeInTheDocument();
  expect(screen.queryByLabelText('Nome completo')).not.toBeInTheDocument();
  expect(await screen.findByText(/selecione um horário/i)).toBeInTheDocument();
});
```

---

## Scenario 7: Slot Availability Conflict (Race Condition)

**User Story**: As a user, I want clear error handling when my selected slot becomes unavailable

**Prerequisites**:
- Two users simultaneously selecting same slot
- Slot: Dr. Maria - 2025-10-07 14:00

**Steps**:

### Given
```
User A on confirmation screen for slot 2025-10-07T14:00:00
User B has just booked the same slot
Slot is now unavailable in Ninsaúde
```

### When
```
Step 1: User A clicks "Confirmar Agendamento"
  → API call: POST /api/ninsaude/availability/check { professionalId, dateTime: "2025-10-07T14:00:00" }
  → Response: { "available": false }

Step 2: System prevents booking attempt
  → No POST /api/ninsaude/appointments call made

Step 3: System shows error modal
  "Este horário não está mais disponível. Por favor, selecione outro horário."
```

### Then
```
✓ Booking NOT created
✓ Error message displayed
✓ User returned to slot selection screen
✓ Patient data preserved (no need to re-enter)
✓ New available slots fetched
```

**Validation Checks**:
```javascript
test('Scenario 7: Slot conflict handling', async () => {
  const { user } = renderBookingForm();

  // Mock slot becoming unavailable
  server.use(
    http.post('/api/ninsaude/availability/check', () => {
      return HttpResponse.json({ available: false }, { status: 409 });
    })
  );

  // Simulate user completing form and attempting booking
  // ... (fill patient data, select slot)
  await user.click(screen.getByText('Confirmar Agendamento'));

  expect(await screen.findByText(/horário não está mais disponível/i)).toBeInTheDocument();
  expect(await screen.findByText(/selecione outro horário/i)).toBeInTheDocument();

  // Verify patient data still present
  expect(screen.getByDisplayValue('Ana Paula Costa')).toBeInTheDocument();
});
```

---

## Scenario 8: API Unavailability - Hybrid Fallback

**User Story**: As a user, I want my booking request to be processed even if the system is temporarily down

**Prerequisites**:
- Ninsaúde API returning 503 errors
- User attempting to book appointment

**Steps**:

### Given
```
Ninsaúde API is temporarily unavailable (503 Service Unavailable)
User has completed patient registration and slot selection
```

### When
```
Step 1: User clicks "Confirmar Agendamento"
  → API call: POST /api/ninsaude/appointments { ... }
  → Retry attempt 1: Delay 1s → 503 error
  → Retry attempt 2: Delay 2s → 503 error
  → Retry attempt 3: Delay 4s → 503 error

Step 2: All retries exhausted
  → System queues request in Redis
  → API call: Internal queue storage
  → Response: {
      "success": false,
      "queued": true,
      "queueId": "queue-uuid-123",
      "estimatedProcessingTime": "5-10 minutes"
    }

Step 3: System displays fallback message
  "No momento, estamos com dificuldades técnicas. Sua solicitação foi registrada e será processada em breve. Entraremos em contato para confirmar seu agendamento."

Step 4: Background worker processes queue every 5 minutes
  → Retry from queue → Success
  → Notification sent: "Seu agendamento foi confirmado: Dr. João - 08/10/2025 11:00"
```

### Then
```
✓ Request queued with 24h TTL
✓ User notified of queue status
✓ User receives queueId for tracking
✓ Background worker retries automatically
✓ Upon success: confirmation notification sent
✓ If 24h passes without success: escalate to manual processing form
```

**Validation Checks**:
```javascript
test('Scenario 8: API fallback with queue', async () => {
  const { user } = renderBookingForm();

  // Mock Ninsaúde API failure
  server.use(
    http.post('/api/ninsaude/appointments', () => {
      return HttpResponse.json({ error: 'Service Unavailable' }, { status: 503 });
    })
  );

  // Complete booking flow
  // ... (fill data, select slot)
  await user.click(screen.getByText('Confirmar'));

  // Verify queue fallback message
  expect(await screen.findByText(/dificuldades técnicas/i)).toBeInTheDocument();
  expect(await screen.findByText(/entraremos em contato/i)).toBeInTheDocument();

  // Verify queue ID displayed
  expect(await screen.findByText(/código de acompanhamento/i)).toBeInTheDocument();
});
```

---

## Scenario 9: Existing Patient CPF Auto-Detection

**User Story**: As a returning patient, I want instant recognition after entering my CPF

**Prerequisites**:
- Patient exists: Fernanda Lima, CPF 555.666.777-88

**Steps**:

### Given
```
User on registration page
CPF 555.666.777-88 exists in Ninsaúde
```

### When
```
Step 1: User types CPF "555.666.777-88" in CPF field

Step 2: onBlur event triggers CPF lookup (debounced 500ms)
  → API call: POST /api/ninsaude/patients { "cpf": "555.666.777-88" }
  → Response: { "isNewPatient": false, "patient": { "name": "Fernanda Lima" } }

Step 3: System displays inline message below CPF field
  "✓ Paciente encontrado: Fernanda Lima"

Step 4: System auto-fills or hides registration fields

Step 5: "Continuar" button becomes active immediately
```

### Then
```
✓ CPF lookup triggered on field blur
✓ Patient name displayed within 1 second
✓ No full registration form required
✓ User can immediately proceed to booking
```

**Validation Checks**:
```javascript
test('Scenario 9: CPF auto-detection on blur', async () => {
  const { user } = renderBookingForm();

  const cpfInput = screen.getByLabelText('CPF');
  await user.type(cpfInput, '555.666.777-88');
  await user.tab(); // Trigger onBlur

  // Wait for debounced API call
  await waitFor(() => {
    expect(screen.getByText(/paciente encontrado: fernanda lima/i)).toBeInTheDocument();
  }, { timeout: 1000 });

  // Verify "Continuar" button is enabled
  expect(screen.getByText('Continuar')).not.toBeDisabled();
});
```

---

## Automated Test Execution

### Backend Contract Tests
```bash
cd api
npm run test:ninsaude

# Expected output:
# ✓ POST /api/ninsaude/patients creates new patient
# ✓ POST /api/ninsaude/patients retrieves existing patient by CPF
# ✓ POST /api/ninsaude/appointments creates appointment
# ✓ DELETE /api/ninsaude/appointments/:id cancels appointment
# ✓ PATCH /api/ninsaude/appointments/:id reschedules appointment
# ✓ GET /api/ninsaude/availability returns available slots
# ✓ POST /api/ninsaude/notifications/send dispatches email + WhatsApp
```

### Frontend Integration Tests
```bash
npm run test:ninsaude

# Expected output:
# ✓ Scenario 1: New patient booking flow
# ✓ Scenario 2: Existing patient CPF lookup
# ✓ Scenario 7: Slot conflict handling
# ✓ Scenario 8: API fallback with queue
# ✓ Scenario 9: CPF auto-detection
```

### End-to-End Test (Manual)
```bash
# 1. Start services
docker-compose up redis
npm run dev (backend + frontend)

# 2. Open browser
http://localhost:3002/agendamento

# 3. Execute Scenario 1 manually
# 4. Verify in Ninsaúde dashboard
# 5. Check email inbox and WhatsApp
```

---

## Test Data

### Test Patients
```javascript
const testPatients = {
  newPatient: {
    cpf: '111.222.333-44',
    name: 'Ana Paula Costa',
    birthDate: '1992-08-10',
    phone: '(33) 98888-7777',
    email: 'ana.costa+test@example.com'
  },
  existingPatient: {
    cpf: '987.654.321-00',
    name: 'Carlos Roberto Souza',
    id: 'existing-patient-uuid'
  },
  returningPatient: {
    cpf: '555.666.777-88',
    name: 'Fernanda Lima',
    id: 'fernanda-uuid'
  }
};
```

### Test Professionals
```javascript
const testProfessionals = {
  oftalmologista: {
    id: 'prof-uuid-1',
    name: 'Dr. João Silva',
    specialty: 'Oftalmologia',
    crm: '12345-MG'
  },
  optometrista: {
    id: 'prof-uuid-2',
    name: 'Dra. Maria Santos',
    specialty: 'Optometria'
  }
};
```

### Test Slots
```javascript
const testSlots = [
  { dateTime: '2025-10-06T10:00:00', available: true },
  { dateTime: '2025-10-06T14:00:00', available: true },
  { dateTime: '2025-10-07T10:00:00', available: false }, // Conflict test
  { dateTime: '2025-10-07T14:00:00', available: true }
];
```

---

## Coverage Requirements

### Minimum Test Coverage
- **Backend API Routes**: 80% line coverage
- **Frontend Components**: 80% line coverage
- **Integration Scenarios**: 100% (all 5 scenarios must pass)

### Critical Paths to Test
1. ✓ OAuth2 token acquisition and refresh
2. ✓ Patient CPF validation and duplicate detection
3. ✓ Slot availability race condition prevention
4. ✓ Retry mechanism with exponential backoff
5. ✓ Dual notification dispatch (email + WhatsApp)
6. ✓ LGPD consent capture and audit logging
7. ✓ Queue fallback for API failures

---

## Performance Validation

### Response Time Targets
```javascript
test('Performance: Patient registration < 2s', async () => {
  const start = Date.now();
  await POST('/api/ninsaude/patients', newPatientData);
  const duration = Date.now() - start;
  expect(duration).toBeLessThan(2000);
});

test('Performance: Slot lookup < 3s', async () => {
  const start = Date.now();
  await GET('/api/ninsaude/availability?professionalId=X&startDate=2025-10-06');
  const duration = Date.now() - start;
  expect(duration).toBeLessThan(3000);
});

test('Performance: Token refresh < 1s', async () => {
  const start = Date.now();
  await refreshOAuthToken();
  const duration = Date.now() - start;
  expect(duration).toBeLessThan(1000);
});
```

---

**Quickstart Complete**: All integration test scenarios defined with Given/When/Then steps, automation examples, and performance validation

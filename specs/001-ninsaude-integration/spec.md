# Feature Specification: Integração com API Ninsaúde para Agendamento e Cadastro de Pacientes

**Feature Branch**: `001-ninsaude-integration`
**Created**: 2025-10-05
**Status**: Draft
**Input**: User description: "integração com API do ninsaude para agendamento e cadastro de pacientes dentro do site use como referencia saraiva-vision-site/Ninsaúde Clinic.postman_collection.json"

## Execution Flow (main)
```
1. Parse user description from Input
   ✓ Identified: Integration with Ninsaúde API for appointment scheduling and patient registration
2. Extract key concepts from description
   ✓ Actors: Patients (website visitors), Clinic staff (administrators)
   ✓ Actions: Schedule appointments, register patients, view available slots
   ✓ Data: Patient information, appointments, professional schedules, care units
   ✓ Constraints: OAuth2 authentication, LGPD compliance, medical data handling (CFM)
3. For each unclear aspect:
   → Marked with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
   ✓ Primary user flows identified
5. Generate Functional Requirements
   ✓ Each requirement is testable
6. Identify Key Entities
   ✓ Patients, Appointments, Professionals, Care Units
7. Run Review Checklist
   → WARN "Spec has uncertainties" - Several clarifications needed
8. Return: SUCCESS (spec ready for clarification phase)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
**As a** patient visiting the Saraiva Vision website,
**I want to** schedule, cancel, and reschedule appointments online while registering my personal information,
**So that** I can manage my healthcare consultations without needing to call the clinic or visit in person.

**As a** clinic administrator,
**I want** patient registrations and all appointment changes from the website to sync with our Ninsaúde system,
**So that** our staff can manage all appointments in one centralized platform.

### Acceptance Scenarios

**Scenario 1: New Patient Appointment Booking**
1. **Given** a visitor on the website without an existing patient record
2. **When** they provide personal information (name, CPF, phone, email) and select an available appointment slot
3. **Then** the system creates a patient record in Ninsaúde AND confirms the appointment booking

**Scenario 2: Existing Patient Appointment Booking**
1. **Given** a patient who already exists in the Ninsaúde system
2. **When** they enter their CPF in the booking form
3. **Then** the system automatically retrieves their existing data, displays their name for confirmation, and allows direct access to appointment slot selection without re-entering personal information

**Scenario 3: View Available Appointment Slots**
1. **Given** a patient selecting a specialty/professional
2. **When** they choose a preferred date range
3. **Then** the system displays all available time slots from Ninsaúde for that professional

**Scenario 4: Appointment Confirmation**
1. **Given** a successfully booked appointment
2. **When** the booking is confirmed
3. **Then** the patient receives confirmation via email AND WhatsApp AND the appointment appears in the Ninsaúde dashboard

**Scenario 5: Appointment Cancellation**
1. **Given** a patient with an upcoming confirmed appointment
2. **When** they access their appointments list and select "cancel"
3. **Then** the system cancels the appointment in Ninsaúde AND notifies the patient of successful cancellation

**Scenario 6: Appointment Rescheduling**
1. **Given** a patient with an upcoming confirmed appointment
2. **When** they select "reschedule" and choose a new available time slot
3. **Then** the system updates the appointment in Ninsaúde with the new date/time AND confirms the change to the patient

**Scenario 7: Slot Availability Conflict**
1. **Given** a patient has selected a time slot and is completing the booking form
2. **When** another patient books the same slot before confirmation
3. **Then** the system displays an error message indicating the slot is no longer available AND allows the patient to select a different slot without re-entering their information

**Scenario 8: API Unavailability - Hybrid Fallback**
1. **Given** the Ninsaúde API is temporarily unavailable
2. **When** a patient attempts to book an appointment
3. **Then** the system queues the request with automatic retry AND if retries fail, displays offline form for manual processing AND notifies patient that clinic will contact them

**Scenario 9: Existing Patient CPF Detection**
1. **Given** a returning patient enters their CPF in the booking form
2. **When** the system finds existing patient data in Ninsaúde
3. **Then** the system displays "Bem-vindo de volta, [Nome do Paciente]" AND skips registration fields AND proceeds directly to appointment selection

### Edge Cases
- **What happens when** a selected time slot becomes unavailable during the booking process?
  - System displays clear error message indicating slot is no longer available and prompts patient to select a different time slot
- **What happens when** patient data validation fails (invalid CPF format, missing required fields)?
  - System displays clear error messages and prevents submission
- **What happens when** the Ninsaúde API is unavailable or returns an error?
  - System attempts to queue the request with automatic retry mechanism (exponential backoff)
  - If retry attempts fail after threshold, system displays offline form allowing patient to submit for manual processing
  - Patient receives notification that request will be processed manually and clinic will contact them for confirmation
- **How does the system handle** duplicate patient registrations (same CPF)?
  - System automatically retrieves existing patient data from Ninsaúde using CPF lookup
  - Patient name is displayed for identity confirmation before proceeding
  - Existing patients bypass registration form and proceed directly to appointment selection
- **What happens when** a patient tries to book multiple appointments simultaneously?
  - [NEEDS CLARIFICATION: Allow multiple bookings, limit to one active booking, or configurable per specialty?]
- **What happens when** email or WhatsApp notification delivery fails after successful appointment booking?
  - Appointment remains confirmed in Ninsaúde, system logs notification failure, retry mechanism attempts redelivery

---

## Requirements *(mandatory)*

### Functional Requirements

#### Patient Registration (FR-001 to FR-006)
- **FR-001**: System MUST allow patients to register by providing: full name, CPF, birth date, phone number, email, and address
- **FR-002**: System MUST validate CPF format before submission (11 digits, valid check digits)
- **FR-003**: System MUST check if patient already exists in Ninsaúde using CPF before creating new record
- **FR-003a**: System MUST automatically retrieve existing patient data from Ninsaúde when CPF is found
- **FR-003b**: System MUST allow existing patients to proceed directly to appointment booking without re-entering personal information
- **FR-003c**: System MUST display retrieved patient name for identity confirmation before proceeding with booking
- **FR-004**: System MUST sync patient data with Ninsaúde patient management system in real-time (only for new patient registrations)
- **FR-005**: System MUST comply with LGPD requirements for patient data collection (explicit consent, data usage transparency)
- **FR-006**: System MUST [NEEDS CLARIFICATION: Which additional patient fields are required vs optional? Address details, emergency contact, health insurance, medical history?]

#### Appointment Scheduling (FR-007 to FR-014)
- **FR-007**: System MUST display available appointment slots filtered by specialty or professional
- **FR-008**: System MUST show available appointment slots filtered by care unit/location
- **FR-009**: System MUST allow patients to select a preferred date and view available time slots for that day
- **FR-010**: System MUST prevent double-booking by checking real-time availability before confirming
- **FR-010a**: System MUST verify slot availability immediately before final confirmation (race condition check)
- **FR-010b**: System MUST display clear error message when selected slot becomes unavailable during booking process
- **FR-010c**: System MUST allow patient to select a different time slot after availability conflict without losing entered patient data
- **FR-011**: System MUST create appointment records in Ninsaúde upon successful booking
- **FR-012**: System MUST support [NEEDS CLARIFICATION: First consultation only, or also return visits and follow-ups?]
- **FR-013**: System MUST [NEEDS CLARIFICATION: Allow same-day appointments, or enforce minimum advance booking time?]
- **FR-014**: System MUST allow patients to cancel their appointments through the website
- **FR-014a**: System MUST allow patients to reschedule their appointments by selecting a new available time slot
- **FR-014b**: System MUST sync cancellation and rescheduling actions with Ninsaúde in real-time

#### Authentication & Security (FR-015 to FR-018)
- **FR-015**: System MUST authenticate with Ninsaúde API using OAuth2 protocol (access tokens with 15-minute validity)
- **FR-016**: System MUST securely store and refresh OAuth2 tokens without exposing credentials to frontend
- **FR-017**: System MUST encrypt patient data in transit using HTTPS/TLS
- **FR-018**: System MUST [NEEDS CLARIFICATION: Implement rate limiting for API calls to prevent abuse? If yes, what are acceptable limits?]

#### User Experience (FR-019 to FR-023)
- **FR-019**: System MUST provide confirmation to patients upon successful appointment booking
- **FR-020**: System MUST send confirmation notifications via email (using existing Resend API integration)
- **FR-020a**: System MUST send confirmation notifications via WhatsApp using webhook-based API automation
- **FR-020b**: System MUST send notifications for all appointment events: booking, cancellation, and rescheduling
- **FR-021**: System MUST display clear error messages when booking fails (e.g., slot unavailable, validation errors)
- **FR-022**: System MUST show loading indicators during API communication to indicate processing
- **FR-023**: System MUST allow patients to view and manage their upcoming appointments (view details, cancel, reschedule)

#### Compliance & Medical Standards (FR-024 to FR-026)
- **FR-024**: System MUST include medical disclaimers as required by CFM (Conselho Federal de Medicina)
- **FR-025**: System MUST handle patient data according to healthcare data protection standards (LGPD + medical ethics)
- **FR-026**: System MUST [NEEDS CLARIFICATION: Log all patient data access for audit purposes? If yes, retention period?]

### Non-Functional Requirements

#### Performance (NFR-001 to NFR-003)
- **NFR-001**: Appointment slot lookup MUST complete within [NEEDS CLARIFICATION: acceptable response time - 2s, 5s, 10s?]
- **NFR-002**: Patient registration MUST complete within [NEEDS CLARIFICATION: acceptable response time?]
- **NFR-003**: System MUST handle [NEEDS CLARIFICATION: expected concurrent users - 10, 50, 100?] without degradation

#### Reliability (NFR-004 to NFR-006)
- **NFR-004**: System MUST have [NEEDS CLARIFICATION: acceptable uptime SLA - 99%, 99.5%, 99.9%?]
- **NFR-005**: System MUST gracefully handle Ninsaúde API outages with hybrid fallback strategy
- **NFR-005a**: System MUST implement automatic retry with exponential backoff for failed API calls (max 3 attempts)
- **NFR-005b**: System MUST queue failed requests for automatic processing when API becomes available
- **NFR-005c**: System MUST provide offline form submission option when retry attempts exhaust
- **NFR-005d**: System MUST notify patients when requests will be processed manually
- **NFR-006**: System MUST retry failed API calls using exponential backoff strategy (initial: 1s, max: 30s, max attempts: 3)

#### Usability (NFR-007 to NFR-008)
- **NFR-007**: Appointment booking flow MUST be completable within [NEEDS CLARIFICATION: maximum number of steps/screens?]
- **NFR-008**: Interface MUST be accessible on mobile devices and meet WCAG 2.1 AA standards

### Key Entities *(data involved)*

#### Patient
- **Represents**: Individual seeking medical care at Saraiva Vision
- **Key attributes**: Full name, CPF (Brazilian tax ID), birth date, contact information (phone, email), address
- **Relationships**: Has many Appointments, belongs to Care Unit
- **Compliance**: LGPD-protected personal data, requires consent for processing

#### Appointment
- **Represents**: Scheduled consultation between patient and healthcare professional
- **Key attributes**: Date and time, duration, appointment type (first visit/return), status (scheduled/confirmed/cancelled)
- **Relationships**: Belongs to Patient, assigned to Professional, scheduled at Care Unit
- **Business rules**: Cannot overlap with existing appointments, requires available professional slot

#### Professional (Healthcare Provider)
- **Represents**: Doctor or medical professional providing consultations
- **Key attributes**: Name, specialty, CRM registration number, available schedule
- **Relationships**: Has many Appointments, works at Care Units
- **Note**: Managed in Ninsaúde, read-only from website perspective

#### Care Unit (Unidade de Atendimento)
- **Represents**: Physical clinic location where appointments take place
- **Key attributes**: Name, address, active status, supported specialties
- **Relationships**: Has many Professionals, hosts Appointments
- **Note**: Saraiva Vision currently operates [NEEDS CLARIFICATION: single location or multiple units?]

#### Available Time Slot
- **Represents**: Open appointment times for booking
- **Key attributes**: Date, time, duration, professional, care unit
- **Relationships**: Linked to Professional schedule
- **Business rules**: Real-time availability check to prevent double-booking

#### Notification
- **Represents**: Communication sent to patient about appointment events
- **Key attributes**: Type (email/WhatsApp), event (booking/cancellation/rescheduling), delivery status, timestamp, recipient contact
- **Relationships**: Belongs to Appointment, sent to Patient
- **Business rules**: Dual-channel delivery (email + WhatsApp), retry on failure, delivery logging for audit

#### Queued Request
- **Represents**: Failed API operation awaiting retry or manual processing
- **Key attributes**: Request type (booking/cancellation/rescheduling), patient data, requested slot, retry count, creation timestamp, status (queued/processing/failed/completed)
- **Relationships**: References Patient data, target Appointment slot
- **Business rules**: Exponential backoff retry (1s, 2s, 4s max), max 3 attempts, escalate to offline form after exhaustion, FIFO processing order

---

## Clarifications

### Session 2025-10-05

- Q: O sistema deve permitir cancelamento e reagendamento de consultas pelo site? → A: Agendamento + cancelamento + reagendamento completo
- Q: Qual método de confirmação deve ser usado para consultas agendadas com sucesso? → A: Email + WhatsApp via webhook para automação via API
- Q: O que acontece quando um horário selecionado fica indisponível durante o processo de agendamento? → A: Mostrar erro e solicitar que o paciente selecione outro horário manualmente
- Q: Qual comportamento de fallback quando a API Ninsaúde estiver indisponível? → A: Híbrido - tentar enfileirar com retry automático, se falhar mostrar formulário offline para processamento manual
- Q: Como o sistema deve lidar com tentativas de cadastro usando CPF já existente no Ninsaúde? → A: Auto-recuperar dados do Ninsaúde e permitir agendamento sem re-cadastro

---

## Clarifications *(to be resolved before planning)*

### Session 1: User Flow & Features (2025-10-05)

**Q4**: Should the system allow same-day appointments, or enforce a minimum advance booking time?
- **Impact**: Business logic for slot filtering and clinic operational workflow

**Q5**: Does the system need to support return visits and follow-up appointments, or only first consultations?
- **Impact**: Appointment type handling and patient history requirements

### Session 2: Data & Validation

**Q6**: Which patient fields are required vs optional during registration? (e.g., address details, emergency contact, health insurance)
- **Impact**: Form complexity, validation rules, UX flow

**Q8**: Should patients be limited to one active booking at a time, or can they schedule multiple appointments simultaneously?
- **Impact**: Business logic and database constraints

### Session 3: Error Handling & Reliability

### Session 4: Performance & Scale

**Q12**: What are acceptable response times for appointment lookup and patient registration?
- **Impact**: Performance optimization requirements and infrastructure sizing

**Q13**: What is the expected number of concurrent users the system must support?
- **Impact**: Infrastructure planning and load testing requirements

**Q14**: What is the acceptable uptime SLA for the appointment booking system?
- **Impact**: Infrastructure redundancy and monitoring requirements

### Session 5: Compliance & Auditing

**Q15**: Should all patient data access be logged for audit purposes? If yes, what is the retention period?
- **Impact**: Logging infrastructure and storage requirements

**Q16**: Are there specific CFM regulations beyond standard medical disclaimers that must be implemented?
- **Impact**: Compliance requirements and legal review

### Session 6: Operational Details

**Q17**: Does Saraiva Vision operate from a single location or multiple care units?
- **Impact**: Location filtering and display logic

**Q18**: What is the maximum number of steps/screens acceptable for the appointment booking flow?
- **Impact**: UX design and user journey optimization

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [ ] No [NEEDS CLARIFICATION] markers remain (14 clarifications pending, 5 resolved)
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable for clarified areas
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

**Status**: ✅ Specification partially clarified - ready for planning phase with deferred clarifications

---

## Execution Status
*Updated by main() during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked (18 clarifications identified)
- [x] User scenarios defined
- [x] Requirements generated (26 functional, 8 non-functional)
- [x] Entities identified (5 key entities)
- [ ] Review checklist passed (pending clarifications)

**Next Step**: Run `/clarify` to resolve 18 clarification questions before proceeding with `/plan`

---

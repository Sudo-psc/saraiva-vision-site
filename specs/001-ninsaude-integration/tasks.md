# Implementation Tasks: Ninsaúde API Integration

**Branch**: `001-ninsaude-integration` | **Date**: 2025-10-05
**Feature**: Patient appointment booking system with Ninsaúde API
**Spec**: [spec.md](./spec.md) | [Plan](./plan.md) | [Data Model](./data-model.md)

---

## Execution Overview

**Total Tasks**: 58
**Estimated Duration**: 8-10 days (with parallel execution)
**Critical Path**: Setup → TDD Tests → Backend Core → Frontend → Integration
**Parallelization Potential**: ~40% of tasks can run concurrently

### Success Criteria
- ✅ All 58 tasks completed and verified
- ✅ 80% minimum test coverage (frontend + backend)
- ✅ All 5 quickstart scenarios passing
- ✅ LGPD + CFM compliance validated
- ✅ Performance targets met (<3s slots, <2s registration, <1s token refresh)

---

## Phase 3.1: Project Setup & Configuration

### T001: Initialize Ninsaúde Feature Structure
**Priority**: Critical | **Estimated Time**: 30 minutes | **Parallelizable**: No

**Description**: Create directory structure for Ninsaúde integration following Saraiva Vision patterns

**Files to Create**:
```
src/components/ninsaude/
src/hooks/
src/lib/
src/data/ninsaudeConfig.js
src/__tests__/ninsaude/
api/ninsaude/
api/ninsaude/middleware/
api/utils/
api/__tests__/ninsaude/
api/__tests__/ninsaude/integration/
api/types/
```

**Acceptance Criteria**:
- All directories created with proper permissions
- Each directory has a `.gitkeep` or placeholder file
- Structure matches plan.md specifications

**Commands**:
```bash
mkdir -p src/components/ninsaude src/__tests__/ninsaude
mkdir -p api/ninsaude/middleware api/__tests__/ninsaude/integration
mkdir -p api/types api/utils
```

---

### T002 [P]: Install Backend Dependencies
**Priority**: Critical | **Estimated Time**: 15 minutes | **Parallelizable**: Yes

**Description**: Add required npm packages for backend Ninsaúde integration

**Package Additions** (`api/package.json`):
```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "redis": "^4.6.0",
    "zod": "^3.22.0"
  }
}
```

**Acceptance Criteria**:
- Dependencies installed without conflicts
- `package-lock.json` updated
- No security vulnerabilities reported

**Commands**:
```bash
cd api
npm install axios@^1.6.0 redis@^4.6.0 zod@^3.22.0
npm audit
```

---

### T003 [P]: Install Frontend Dependencies
**Priority**: Critical | **Estimated Time**: 15 minutes | **Parallelizable**: Yes

**Description**: Add required npm packages for frontend form management and validation

**Package Additions** (root `package.json`):
```json
{
  "dependencies": {
    "react-hook-form": "^7.49.0",
    "@hookform/resolvers": "^3.3.0",
    "zod": "^3.22.0",
    "date-fns": "^3.0.0"
  }
}
```

**Acceptance Criteria**:
- Dependencies installed without conflicts
- Bundle size increase < 50KB gzipped
- No peer dependency warnings

**Commands**:
```bash
npm install react-hook-form@^7.49.0 @hookform/resolvers@^3.3.0 zod@^3.22.0 date-fns@^3.0.0
npm run build -- --stats
```

---

### T004 [P]: Configure Environment Variables
**Priority**: Critical | **Estimated Time**: 20 minutes | **Parallelizable**: Yes

**Description**: Document and configure required environment variables for Ninsaúde integration

**Files**:
- `/home/saraiva-vision-site/api/.env.example`
- `/home/saraiva-vision-site/api/.env` (local only, not committed)

**Environment Variables**:
```bash
# Ninsaúde API Credentials
NINSAUDE_CLIENT_ID=your_client_id_here
NINSAUDE_CLIENT_SECRET=your_client_secret_here
NINSAUDE_API_URL=https://api.ninsaude.com/v1

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# Evolution API (WhatsApp)
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=

# Resend API (existing)
RESEND_API_KEY=re_existing_key
```

**Acceptance Criteria**:
- `.env.example` updated with all variables
- Local `.env` configured for development
- Variables validated on server startup

---

### T005 [P]: Update TypeScript Configuration
**Priority**: Medium | **Estimated Time**: 15 minutes | **Parallelizable**: Yes

**Description**: Add type paths for Ninsaúde types to TypeScript config

**Files**: `/home/saraiva-vision-site/tsconfig.json`, `/home/saraiva-vision-site/api/tsconfig.json`

**Updates**:
```json
{
  "compilerOptions": {
    "paths": {
      "@/types/*": ["./api/types/*"],
      "@/ninsaude/*": ["./src/components/ninsaude/*"]
    }
  }
}
```

**Acceptance Criteria**:
- TypeScript compilation succeeds
- IDE autocomplete working for new paths
- No circular dependency errors

---

## Phase 3.2: Tests First - TDD Approach

**CRITICAL RULE**: All tests in this phase MUST be written and MUST FAIL before implementation begins. This is non-negotiable TDD practice.

---

### T006 [P]: Contract Test - Patient Endpoints
**Priority**: Critical | **Estimated Time**: 45 minutes | **Parallelizable**: Yes
**TDD**: Test FIRST, implementation LATER

**Description**: Write failing contract tests for `POST /api/ninsaude/patients` endpoint

**File**: `/home/saraiva-vision-site/api/__tests__/ninsaude/patients.contract.test.js`

**Test Cases**:
1. ✓ POST with new patient data returns 201 with patient ID
2. ✓ POST with existing CPF returns 200 with patient data
3. ✓ POST with invalid CPF format returns 400
4. ✓ POST without required fields returns 422
5. ✓ POST without LGPD consent (new patient) returns 400
6. ✓ Response matches OpenAPI schema from `contracts/patients.openapi.yaml`
7. ✓ LGPD audit log created with hashed CPF

**Acceptance Criteria**:
- All 7 test cases written
- Tests currently FAIL (no implementation yet)
- Tests use Vitest + MSW for API mocking
- Contract validation against OpenAPI spec

**Commands**:
```bash
npx vitest run api/__tests__/ninsaude/patients.contract.test.js
# Expected: 7 tests, 7 failures
```

---

### T007 [P]: Contract Test - Appointment Endpoints
**Priority**: Critical | **Estimated Time**: 60 minutes | **Parallelizable**: Yes
**TDD**: Test FIRST, implementation LATER

**Description**: Write failing contract tests for appointment booking, cancellation, and rescheduling

**File**: `/home/saraiva-vision-site/api/__tests__/ninsaude/appointments.contract.test.js`

**Test Cases**:
1. ✓ POST /appointments creates appointment with valid data (201)
2. ✓ POST /appointments with unavailable slot returns 409
3. ✓ POST /appointments without required fields returns 422
4. ✓ DELETE /appointments/:id cancels appointment (200)
5. ✓ DELETE /appointments/:id with invalid ID returns 404
6. ✓ PATCH /appointments/:id reschedules to new datetime (200)
7. ✓ PATCH /appointments/:id with conflicting slot returns 409
8. ✓ Response matches OpenAPI schema from `contracts/appointments.openapi.yaml`

**Acceptance Criteria**:
- All 8 test cases written
- Tests currently FAIL (no implementation yet)
- Tests verify state transitions (pending → confirmed → cancelled)
- Mocks Ninsaúde API responses

---

### T008 [P]: Contract Test - Availability Endpoint
**Priority**: Critical | **Estimated Time**: 30 minutes | **Parallelizable**: Yes
**TDD**: Test FIRST, implementation LATER

**Description**: Write failing contract tests for slot availability lookup

**File**: `/home/saraiva-vision-site/api/__tests__/ninsaude/availability.contract.test.js`

**Test Cases**:
1. ✓ GET /availability returns slots for valid professional/date (200)
2. ✓ GET /availability with invalid professionalId returns 400
3. ✓ GET /availability with past date returns 400
4. ✓ GET /availability returns empty array if no slots available
5. ✓ Response matches OpenAPI schema from `contracts/availability.openapi.yaml`

**Acceptance Criteria**:
- All 5 test cases written
- Tests currently FAIL (no implementation yet)
- Tests validate date range (7 days default, 30 days max)

---

### T009 [P]: Contract Test - Notification Endpoints
**Priority**: Critical | **Estimated Time**: 40 minutes | **Parallelizable**: Yes
**TDD**: Test FIRST, implementation LATER

**Description**: Write failing contract tests for email + WhatsApp notification dispatch

**File**: `/home/saraiva-vision-site/api/__tests__/ninsaude/notifications.contract.test.js`

**Test Cases**:
1. ✓ POST /notifications/send dispatches email via Resend (200)
2. ✓ POST /notifications/send dispatches WhatsApp via Evolution API (200)
3. ✓ POST /notifications with invalid email returns 400
4. ✓ POST /notifications with invalid phone returns 400
5. ✓ Notification retry on failure (max 3 attempts)
6. ✓ Response matches OpenAPI schema from `contracts/notifications.openapi.yaml`

**Acceptance Criteria**:
- All 6 test cases written
- Tests currently FAIL (no implementation yet)
- Mocks Resend and Evolution API calls

---

### T010 [P]: Integration Test - Scenario 1 (New Patient Booking)
**Priority**: Critical | **Estimated Time**: 60 minutes | **Parallelizable**: Yes
**TDD**: Test FIRST, implementation LATER

**Description**: Write failing end-to-end test for new patient booking flow (Scenario 1 from quickstart.md)

**File**: `/home/saraiva-vision-site/api/__tests__/ninsaude/integration/booking-new-patient.test.js`

**Test Flow**:
```javascript
// Given: CPF 111.222.333-44 not in system
// When: User enters CPF → fills registration → selects slot → confirms
// Then: Patient created → Appointment confirmed → Notifications sent
```

**Acceptance Criteria**:
- Full scenario automation (7 steps from quickstart.md)
- Tests currently FAIL (no implementation yet)
- Validates LGPD consent capture
- Verifies dual notifications (email + WhatsApp)

---

### T011 [P]: Integration Test - Scenario 2 (Existing Patient CPF Lookup)
**Priority**: Critical | **Estimated Time**: 30 minutes | **Parallelizable**: Yes
**TDD**: Test FIRST, implementation LATER

**Description**: Write failing test for existing patient auto-detection (Scenario 2 from quickstart.md)

**File**: `/home/saraiva-vision-site/api/__tests__/ninsaude/integration/cpf-lookup.test.js`

**Test Flow**:
```javascript
// Given: CPF 987.654.321-00 exists in Ninsaúde
// When: User enters CPF → system auto-detects
// Then: Registration skipped → Welcome message shown → Proceed to slots
```

**Acceptance Criteria**:
- Tests currently FAIL (no implementation yet)
- Validates no duplicate patient creation
- Verifies registration form NOT shown

---

### T012 [P]: Integration Test - Scenario 7 (Slot Conflict)
**Priority**: Critical | **Estimated Time**: 40 minutes | **Parallelizable**: Yes
**TDD**: Test FIRST, implementation LATER

**Description**: Write failing test for race condition handling (Scenario 7 from quickstart.md)

**File**: `/home/saraiva-vision-site/api/__tests__/ninsaude/integration/slot-conflict.test.js`

**Test Flow**:
```javascript
// Given: User selects slot 2025-10-07T14:00:00
// When: Slot becomes unavailable (race condition)
// Then: Booking prevented → Error shown → User returned to slot selection
```

**Acceptance Criteria**:
- Tests currently FAIL (no implementation yet)
- Simulates concurrent booking scenario
- Validates availability re-check before final booking

---

### T013 [P]: Integration Test - Scenario 8 (API Fallback)
**Priority**: Critical | **Estimated Time**: 50 minutes | **Parallelizable**: Yes
**TDD**: Test FIRST, implementation LATER

**Description**: Write failing test for API unavailability with queue fallback (Scenario 8 from quickstart.md)

**File**: `/home/saraiva-vision-site/api/__tests__/ninsaude/integration/api-fallback.test.js`

**Test Flow**:
```javascript
// Given: Ninsaúde API returns 503 errors
// When: User attempts booking → retries exhausted
// Then: Request queued in Redis → User notified → Background worker processes
```

**Acceptance Criteria**:
- Tests currently FAIL (no implementation yet)
- Validates retry with exponential backoff (1s, 2s, 4s)
- Verifies Redis queue persistence
- Tests background worker queue processing

---

### T014 [P]: Integration Test - Scenario 9 (CPF Auto-Detect)
**Priority**: Critical | **Estimated Time**: 30 minutes | **Parallelizable**: Yes
**TDD**: Test FIRST, implementation LATER

**Description**: Write failing test for CPF auto-detection on blur (Scenario 9 from quickstart.md)

**File**: `/home/saraiva-vision-site/api/__tests__/ninsaude/integration/cpf-auto-detect.test.js`

**Test Flow**:
```javascript
// Given: CPF field receives input
// When: User tabs out (onBlur event)
// Then: Debounced API call (500ms) → Patient lookup → Auto-fill or hide form
```

**Acceptance Criteria**:
- Tests currently FAIL (no implementation yet)
- Validates debounced API call timing
- Verifies patient name displayed within 1 second

---

### T015 [P]: Test - AppointmentBookingForm Component
**Priority**: Critical | **Estimated Time**: 60 minutes | **Parallelizable**: Yes
**TDD**: Test FIRST, implementation LATER

**Description**: Write failing tests for multi-step booking form component

**File**: `/home/saraiva-vision-site/src/__tests__/ninsaude/AppointmentBookingForm.test.jsx`

**Test Cases**:
1. ✓ Renders CPF input as first step
2. ✓ Shows validation errors for invalid CPF format
3. ✓ Progresses to registration form after CPF verification
4. ✓ Shows slot picker after patient data submitted
5. ✓ Displays confirmation screen with appointment details
6. ✓ Handles booking failure with error message
7. ✓ Preserves patient data on step back navigation

**Acceptance Criteria**:
- All 7 test cases written
- Tests currently FAIL (component doesn't exist yet)
- Uses React Testing Library + Vitest

---

### T016 [P]: Test - PatientRegistrationForm Component
**Priority**: Critical | **Estimated Time**: 50 minutes | **Parallelizable**: Yes
**TDD**: Test FIRST, implementation LATER

**Description**: Write failing tests for patient registration form

**File**: `/home/saraiva-vision-site/src/__tests__/ninsaude/PatientRegistrationForm.test.jsx`

**Test Cases**:
1. ✓ Renders all required fields (name, CPF, phone, email, address)
2. ✓ Validates Brazilian phone format
3. ✓ Validates email format
4. ✓ Shows LGPD consent checkbox (required)
5. ✓ Disables submit without consent
6. ✓ Auto-fills CEP lookup results (deferred - basic implementation)
7. ✓ Handles API submission errors gracefully

**Acceptance Criteria**:
- All 7 test cases written
- Tests currently FAIL (component doesn't exist yet)
- Tests use React Hook Form validation

---

### T017 [P]: Test - AppointmentSlotPicker Component
**Priority**: Critical | **Estimated Time**: 45 minutes | **Parallelizable**: Yes
**TDD**: Test FIRST, implementation LATER

**Description**: Write failing tests for slot selection calendar component

**File**: `/home/saraiva-vision-site/src/__tests__/ninsaude/AppointmentSlotPicker.test.jsx`

**Test Cases**:
1. ✓ Renders calendar view with 7 days ahead
2. ✓ Displays available slots with professional names
3. ✓ Highlights selected slot
4. ✓ Shows loading state during slot fetch
5. ✓ Shows empty state when no slots available
6. ✓ Filters by professional if multiple available

**Acceptance Criteria**:
- All 6 test cases written
- Tests currently FAIL (component doesn't exist yet)
- Tests use date-fns for date manipulation

---

### T018 [P]: Test - AppointmentsList Component
**Priority**: Medium | **Estimated Time**: 40 minutes | **Parallelizable**: Yes
**TDD**: Test FIRST, implementation LATER

**Description**: Write failing tests for patient appointments management list

**File**: `/home/saraiva-vision-site/src/__tests__/ninsaude/AppointmentsList.test.jsx`

**Test Cases**:
1. ✓ Renders list of patient appointments
2. ✓ Shows cancel button for pending appointments
3. ✓ Shows reschedule button for confirmed appointments
4. ✓ Hides actions for completed appointments
5. ✓ Displays appointment status badges correctly
6. ✓ Handles cancel confirmation modal

**Acceptance Criteria**:
- All 6 test cases written
- Tests currently FAIL (component doesn't exist yet)
- Tests validate state transitions

---

### T019 [P]: Test - useNinsaude Hook
**Priority**: Critical | **Estimated Time**: 50 minutes | **Parallelizable**: Yes
**TDD**: Test FIRST, implementation LATER

**Description**: Write failing tests for Ninsaúde API integration hook

**File**: `/home/saraiva-vision-site/src/__tests__/ninsaude/useNinsaude.test.js`

**Test Cases**:
1. ✓ Fetches available slots for date range
2. ✓ Creates new patient with validation
3. ✓ Retrieves existing patient by CPF
4. ✓ Books appointment with slot verification
5. ✓ Cancels appointment
6. ✓ Handles API errors with retry logic
7. ✓ Caches slot data to prevent duplicate calls

**Acceptance Criteria**:
- All 7 test cases written
- Tests currently FAIL (hook doesn't exist yet)
- Uses React Testing Library hooks testing

---

### T020 [P]: Test - usePatientRegistration Hook
**Priority**: Medium | **Estimated Time**: 35 minutes | **Parallelizable**: Yes
**TDD**: Test FIRST, implementation LATER

**Description**: Write failing tests for patient registration workflow hook

**File**: `/home/saraiva-vision-site/src/__tests__/ninsaude/usePatientRegistration.test.js`

**Test Cases**:
1. ✓ Validates CPF format before API call
2. ✓ Detects existing patient and skips registration
3. ✓ Submits new patient data with LGPD consent
4. ✓ Returns patient ID on successful registration
5. ✓ Handles duplicate CPF gracefully

**Acceptance Criteria**:
- All 5 test cases written
- Tests currently FAIL (hook doesn't exist yet)
- Uses React Hook Form integration

---

### T021 [P]: Test - CPF Validator Utility
**Priority**: Critical | **Estimated Time**: 30 minutes | **Parallelizable**: Yes
**TDD**: Test FIRST, implementation LATER

**Description**: Write failing tests for Brazilian CPF validation algorithm

**File**: `/home/saraiva-vision-site/src/__tests__/utils/cpfValidator.test.js`

**Test Cases**:
1. ✓ Validates correct CPF: 123.456.789-09
2. ✓ Rejects invalid CPF: 123.456.789-00
3. ✓ Rejects all-same-digit CPF: 111.111.111-11
4. ✓ Rejects CPF with wrong length
5. ✓ Formats CPF correctly (000.000.000-00)
6. ✓ Handles unformatted CPF (00000000000)

**Acceptance Criteria**:
- All 6 test cases written
- Tests currently FAIL (utility doesn't exist yet)
- Tests use checksum validation algorithm

---

### T022 [P]: Test - Retry With Backoff Utility
**Priority**: Critical | **Estimated Time**: 40 minutes | **Parallelizable**: Yes
**TDD**: Test FIRST, implementation LATER

**Description**: Write failing tests for exponential backoff retry mechanism

**File**: `/home/saraiva-vision-site/api/__tests__/utils/retryWithBackoff.test.js`

**Test Cases**:
1. ✓ Retries failed function 3 times with delays (1s, 2s, 4s)
2. ✓ Returns result on first success (no retries)
3. ✓ Adds jitter to prevent thundering herd
4. ✓ Doubles delay for 429 rate limit errors
5. ✓ Throws error after max attempts exhausted

**Acceptance Criteria**:
- All 5 test cases written
- Tests currently FAIL (utility doesn't exist yet)
- Tests use fake timers for delay verification

---

### T023 [P]: Test - Redis Client Utility
**Priority**: Critical | **Estimated Time**: 40 minutes | **Parallelizable**: Yes
**TDD**: Test FIRST, implementation LATER

**Description**: Write failing tests for Redis token caching and queue management

**File**: `/home/saraiva-vision-site/api/__tests__/utils/redisClient.test.js`

**Test Cases**:
1. ✓ Caches OAuth token with 14-minute TTL
2. ✓ Retrieves cached token before expiry
3. ✓ Returns null for expired token
4. ✓ Stores queued request with 24h TTL
5. ✓ Retrieves all queued requests for processing

**Acceptance Criteria**:
- All 5 test cases written
- Tests currently FAIL (utility doesn't exist yet)
- Uses redis-mock for testing

---

### T024 [P]: Test - LGPD Audit Middleware
**Priority**: Critical | **Estimated Time**: 45 minutes | **Parallelizable**: Yes
**TDD**: Test FIRST, implementation LATER

**Description**: Write failing tests for LGPD compliance audit logging middleware

**File**: `/home/saraiva-vision-site/api/__tests__/middleware/lgpdAudit.test.js`

**Test Cases**:
1. ✓ Logs API call with hashed CPF (SHA-256)
2. ✓ Logs timestamp, endpoint, method, status
3. ✓ Hashes IP address in logs
4. ✓ Does not log full PII in plaintext
5. ✓ Creates audit log entry on response finish

**Acceptance Criteria**:
- All 5 test cases written
- Tests currently FAIL (middleware doesn't exist yet)
- Validates SHA-256 hashing of sensitive data

---

### T025 [P]: Test - Rate Limiter Middleware
**Priority**: Medium | **Estimated Time**: 35 minutes | **Parallelizable**: Yes
**TDD**: Test FIRST, implementation LATER

**Description**: Write failing tests for rate limiting middleware (30 req/min to Ninsaúde)

**File**: `/home/saraiva-vision-site/api/__tests__/middleware/rateLimiter.test.js`

**Test Cases**:
1. ✓ Allows requests within rate limit
2. ✓ Blocks requests exceeding 30/min
3. ✓ Returns 429 status with Retry-After header
4. ✓ Resets counter after 1 minute
5. ✓ Applies only to Ninsaúde API routes

**Acceptance Criteria**:
- All 5 test cases written
- Tests currently FAIL (middleware doesn't exist yet)
- Uses in-memory counter for rate tracking

---

## Phase 3.3: Backend Core Implementation

**IMPORTANT**: Only begin this phase AFTER all tests in Phase 3.2 are written and failing.

---

### T026 [P]: TypeScript Interface - Patient
**Priority**: Critical | **Estimated Time**: 30 minutes | **Parallelizable**: Yes
**Dependencies**: T002 (backend deps installed)

**Description**: Create TypeScript interface and Zod schema for Patient entity

**File**: `/home/saraiva-vision-site/api/types/Patient.ts`

**Implementation**:
- Interface from data-model.md Section 1
- Zod schema with CPF, email, phone validation
- Shared between frontend and backend

**Acceptance Criteria**:
- TypeScript compilation succeeds
- Zod validation works for test cases
- Some T006 tests now pass (schema validation)

---

### T027 [P]: TypeScript Interface - Appointment
**Priority**: Critical | **Estimated Time**: 35 minutes | **Parallelizable**: Yes
**Dependencies**: T002

**Description**: Create TypeScript interface and Zod schema for Appointment entity

**File**: `/home/saraiva-vision-site/api/types/Appointment.ts`

**Implementation**:
- Interface from data-model.md Section 2
- Zod schema with datetime, duration validation
- State machine type (AppointmentStatus enum)

**Acceptance Criteria**:
- TypeScript compilation succeeds
- State transitions validated
- Some T007 tests now pass

---

### T028 [P]: TypeScript Interface - Notification
**Priority**: Medium | **Estimated Time**: 25 minutes | **Parallelizable**: Yes
**Dependencies**: T002

**Description**: Create TypeScript interface and Zod schema for Notification entity

**File**: `/home/saraiva-vision-site/api/types/Notification.ts`

**Implementation**:
- Interface from data-model.md Section 6
- Zod schema with email/phone validation
- NotificationType and NotificationStatus enums

**Acceptance Criteria**:
- TypeScript compilation succeeds
- Some T009 tests now pass

---

### T029 [P]: TypeScript Interface - QueuedRequest
**Priority**: Medium | **Estimated Time**: 25 minutes | **Parallelizable**: Yes
**Dependencies**: T002

**Description**: Create TypeScript interface and Zod schema for queued API requests

**File**: `/home/saraiva-vision-site/api/types/QueuedRequest.ts`

**Implementation**:
- Interface from data-model.md Section 7
- Zod schema with retry count validation
- QueuedRequestType and QueuedRequestStatus enums

**Acceptance Criteria**:
- TypeScript compilation succeeds
- Some T013 tests now pass (queue scenarios)

---

### T030 [P]: Implement CPF Validator
**Priority**: Critical | **Estimated Time**: 40 minutes | **Parallelizable**: Yes
**Dependencies**: None

**Description**: Implement Brazilian CPF validation algorithm with checksum verification

**File**: `/home/saraiva-vision-site/src/lib/cpfValidator.js`

**Implementation**:
- `validateCPF(cpf: string): boolean` - Checksum validation
- `formatCPF(cpf: string): string` - Format to 000.000.000-00
- Algorithm from research.md Section 5

**Acceptance Criteria**:
- ALL T021 tests pass
- Shared utility (works in frontend and backend)
- Zero external dependencies

**Commands**:
```bash
npx vitest run src/__tests__/utils/cpfValidator.test.js
# Expected: 6 tests, 6 passed
```

---

### T031 [P]: Implement Retry With Backoff
**Priority**: Critical | **Estimated Time**: 50 minutes | **Parallelizable**: Yes
**Dependencies**: None

**Description**: Implement exponential backoff retry mechanism for API calls

**File**: `/home/saraiva-vision-site/api/utils/retryWithBackoff.js`

**Implementation**:
- `retryWithBackoff(fn, maxAttempts): Promise` - Retry logic
- Delays: 1s, 2s, 4s with random jitter
- Double delay for 429 rate limit errors
- Algorithm from research.md Section 3

**Acceptance Criteria**:
- ALL T022 tests pass
- Works with async functions
- Handles all HTTP error codes

**Commands**:
```bash
npx vitest run api/__tests__/utils/retryWithBackoff.test.js
# Expected: 5 tests, 5 passed
```

---

### T032: Implement Redis Client
**Priority**: Critical | **Estimated Time**: 60 minutes | **Parallelizable**: No
**Dependencies**: T002 (Redis package installed)

**Description**: Implement Redis client wrapper for token caching and request queue

**File**: `/home/saraiva-vision-site/api/utils/redisClient.js`

**Implementation**:
- OAuth token caching with 14-minute TTL
- Queue management with 24h TTL
- Connection pooling and error handling
- Pattern from research.md Section 4

**Acceptance Criteria**:
- ALL T023 tests pass
- Redis connection established on app start
- Graceful degradation if Redis unavailable

**Commands**:
```bash
# Start Redis if not running
docker run -d -p 6379:6379 redis:7-alpine
npx vitest run api/__tests__/utils/redisClient.test.js
# Expected: 5 tests, 5 passed
```

---

### T033: Implement Ninsaúde API Base Client
**Priority**: Critical | **Estimated Time**: 70 minutes | **Parallelizable**: No
**Dependencies**: T002 (axios), T032 (Redis client)

**Description**: Create base HTTP client for Ninsaúde API with authentication

**File**: `/home/saraiva-vision-site/api/utils/ninsaudeApiClient.js`

**Implementation**:
- Axios instance with base URL configuration
- Request interceptor: Add OAuth token to headers
- Response interceptor: Handle 401 (token refresh), 429 (rate limit)
- Uses T032 Redis client for token caching

**Acceptance Criteria**:
- Automatic token injection on every request
- Token refresh on 401 responses
- Rate limit handling with backoff

**Commands**:
```bash
# Manual test with mock Ninsaúde endpoint
node api/utils/ninsaudeApiClient.test.manual.js
```

---

### T034: Implement OAuth2 Token Middleware
**Priority**: Critical | **Estimated Time**: 60 minutes | **Parallelizable**: No
**Dependencies**: T032 (Redis), T033 (API client)

**Description**: Middleware to validate and refresh OAuth2 tokens before Ninsaúde API calls

**File**: `/home/saraiva-vision-site/api/ninsaude/middleware/validateToken.js`

**Implementation**:
- Check Redis cache for valid token
- Refresh token if within 60s of expiry
- Cache refreshed token with 14-minute TTL
- Pattern from research.md Section 1

**Acceptance Criteria**:
- Tokens refreshed automatically before expiry
- No duplicate refresh calls (race condition safe)
- Backend-only (never exposed to frontend)

---

### T035 [P]: Implement Rate Limiter Middleware
**Priority**: Medium | **Estimated Time**: 45 minutes | **Parallelizable**: Yes
**Dependencies**: None

**Description**: Rate limiting middleware to prevent exceeding 30 req/min to Ninsaúde

**File**: `/home/saraiva-vision-site/api/ninsaude/middleware/rateLimiter.js`

**Implementation**:
- In-memory sliding window counter
- 30 requests per 60 seconds limit
- Returns 429 with Retry-After header
- Applies only to `/api/ninsaude/*` routes

**Acceptance Criteria**:
- ALL T025 tests pass
- Integrates with Express middleware chain
- Counter resets after 60 seconds

---

### T036 [P]: Implement LGPD Audit Middleware
**Priority**: Critical | **Estimated Time**: 50 minutes | **Parallelizable**: Yes
**Dependencies**: None

**Description**: LGPD compliance middleware for audit logging with PII hashing

**File**: `/home/saraiva-vision-site/api/ninsaude/middleware/lgpdAudit.js`

**Implementation**:
- Log timestamp, endpoint, method, status, duration
- Hash CPF, email, phone, IP with SHA-256
- Never log plaintext PII
- 5-year log retention (file rotation)
- Pattern from research.md Section 6

**Acceptance Criteria**:
- ALL T024 tests pass
- Audit logs written to `logs/lgpd-audit.log`
- Log rotation configured (daily, 5-year retention)

---

### T037 [P]: Implement Error Handler Middleware
**Priority**: Medium | **Estimated Time**: 40 minutes | **Parallelizable**: Yes
**Dependencies**: None

**Description**: Centralized error handling middleware for Ninsaúde routes

**File**: `/home/saraiva-vision-site/api/ninsaude/middleware/errorHandler.js`

**Implementation**:
- Catch all errors from Ninsaúde routes
- Format error responses consistently
- Log errors with stack traces (development only)
- Return user-friendly messages (production)

**Acceptance Criteria**:
- Handles Axios errors (network, timeout, HTTP)
- Returns appropriate status codes (400, 404, 500, 503)
- Never exposes internal error details to frontend

---

### T038: Implement OAuth2 Auth Route
**Priority**: Critical | **Estimated Time**: 50 minutes | **Parallelizable**: No
**Dependencies**: T034 (token middleware), T032 (Redis)

**Description**: OAuth2 token acquisition and refresh route

**File**: `/home/saraiva-vision-site/api/ninsaude/auth.js`

**Implementation**:
- `POST /api/ninsaude/auth/token` - Acquire access token
- Client credentials flow (grant_type=client_credentials)
- Cache token in Redis with 14-minute TTL
- Pattern from research.md Section 1

**Acceptance Criteria**:
- Token acquired from Ninsaúde API
- Token cached successfully
- Token refresh works before expiry

**Test**:
```bash
curl -X POST http://localhost:3002/api/ninsaude/auth/token
# Expected: { "access_token": "...", "expires_in": 900 }
```

---

### T039: Implement Patients Routes
**Priority**: Critical | **Estimated Time**: 90 minutes | **Parallelizable**: No
**Dependencies**: T026 (Patient types), T034 (token middleware), T038 (auth)

**Description**: Patient registration and CPF lookup endpoints

**File**: `/home/saraiva-vision-site/api/ninsaude/patients.js`

**Routes**:
- `POST /api/ninsaude/patients` - Create or retrieve patient by CPF

**Implementation**:
- Validate request with PatientSchema (T026)
- Check Ninsaúde for existing patient by CPF
- If exists: return patient data (200)
- If new: create patient in Ninsaúde (201)
- LGPD: require consent for new patients

**Acceptance Criteria**:
- ALL T006 contract tests pass
- Duplicate CPF detection works
- LGPD consent validated

**Test**:
```bash
npx vitest run api/__tests__/ninsaude/patients.contract.test.js
# Expected: 7 tests, 7 passed
```

---

### T040: Implement Availability Route
**Priority**: Critical | **Estimated Time**: 70 minutes | **Parallelizable**: No
**Dependencies**: T034 (token middleware)

**Description**: Appointment slot availability lookup endpoint

**File**: `/home/saraiva-vision-site/api/ninsaude/availability.js`

**Routes**:
- `GET /api/ninsaude/availability` - Query params: professionalId, startDate, endDate
- `POST /api/ninsaude/availability/check` - Verify specific slot availability

**Implementation**:
- Query Ninsaúde for available slots in date range
- Default: 7 days ahead, max 30 days
- Real-time lookup (no caching)
- Race condition check endpoint

**Acceptance Criteria**:
- ALL T008 contract tests pass
- Returns empty array if no slots
- Validates date range constraints

**Test**:
```bash
npx vitest run api/__tests__/ninsaude/availability.contract.test.js
# Expected: 5 tests, 5 passed
```

---

### T041: Implement Appointments Routes
**Priority**: Critical | **Estimated Time**: 100 minutes | **Parallelizable**: No
**Dependencies**: T027 (Appointment types), T034 (token middleware), T040 (availability)

**Description**: Appointment booking, cancellation, and rescheduling endpoints

**File**: `/home/saraiva-vision-site/api/ninsaude/appointments.js`

**Routes**:
- `POST /api/ninsaude/appointments` - Create appointment
- `DELETE /api/ninsaude/appointments/:id` - Cancel appointment
- `PATCH /api/ninsaude/appointments/:id` - Reschedule appointment

**Implementation**:
- Validate request with AppointmentSchema (T027)
- Pre-flight slot availability check (T040)
- Race condition prevention (re-verify before booking)
- State machine validation (pending → confirmed → cancelled)

**Acceptance Criteria**:
- ALL T007 contract tests pass
- Slot conflict returns 409 status
- State transitions enforced

**Test**:
```bash
npx vitest run api/__tests__/ninsaude/appointments.contract.test.js
# Expected: 8 tests, 8 passed
```

---

### T042: Implement Notifications Route
**Priority**: Critical | **Estimated Time**: 80 minutes | **Parallelizable**: No
**Dependencies**: T028 (Notification types), T034 (token middleware)

**Description**: Email and WhatsApp notification dispatch endpoint

**File**: `/home/saraiva-vision-site/api/ninsaude/notifications.js`

**Routes**:
- `POST /api/ninsaude/notifications/send` - Dispatch dual notifications

**Implementation**:
- Send email via Resend API (existing integration)
- Send WhatsApp via Evolution API (new)
- Retry on failure (max 3 attempts, T031)
- Log delivery status in audit trail

**Acceptance Criteria**:
- ALL T009 contract tests pass
- Dual delivery (email + WhatsApp)
- Retry logic works

**Test**:
```bash
npx vitest run api/__tests__/ninsaude/notifications.contract.test.js
# Expected: 6 tests, 6 passed
```

---

## Phase 3.4: Frontend Implementation

**IMPORTANT**: Only begin this phase AFTER backend routes (T038-T042) are working.

---

### T043: Implement useNinsaude Hook
**Priority**: Critical | **Estimated Time**: 90 minutes | **Parallelizable**: No
**Dependencies**: T039, T040, T041 (backend routes)

**Description**: Core React hook for Ninsaúde API integration

**File**: `/home/saraiva-vision-site/src/hooks/useNinsaude.js`

**API Methods**:
- `fetchAvailableSlots(professionalId, dateRange)` - Get slots
- `createPatient(patientData)` - Register new patient
- `getPatientByCPF(cpf)` - Lookup existing patient
- `bookAppointment(appointmentData)` - Create appointment
- `cancelAppointment(appointmentId)` - Cancel appointment

**Acceptance Criteria**:
- ALL T019 tests pass
- Error handling with user-friendly messages
- Loading states managed

**Test**:
```bash
npx vitest run src/__tests__/ninsaude/useNinsaude.test.js
# Expected: 7 tests, 7 passed
```

---

### T044: Implement usePatientRegistration Hook
**Priority**: Medium | **Estimated Time**: 60 minutes | **Parallelizable**: No
**Dependencies**: T043 (useNinsaude hook)

**Description**: Patient registration workflow hook with CPF validation

**File**: `/home/saraiva-vision-site/src/hooks/usePatientRegistration.js`

**Features**:
- CPF validation before API call (T030)
- Existing patient detection
- LGPD consent tracking
- Form state management

**Acceptance Criteria**:
- ALL T020 tests pass
- Integrates with React Hook Form
- Skips registration for existing patients

**Test**:
```bash
npx vitest run src/__tests__/ninsaude/usePatientRegistration.test.js
# Expected: 5 tests, 5 passed
```

---

### T045: Implement useAppointmentBooking Hook
**Priority**: Medium | **Estimated Time**: 70 minutes | **Parallelizable**: No
**Dependencies**: T043 (useNinsaude hook)

**Description**: Appointment booking workflow hook with slot verification

**File**: `/home/saraiva-vision-site/src/hooks/useAppointmentBooking.js`

**Features**:
- Slot availability verification
- Race condition prevention (pre-flight check)
- Booking confirmation flow
- Error handling with fallback queue

**Acceptance Criteria**:
- Integrates with useNinsaude
- Handles slot conflicts gracefully
- Triggers notifications on success

---

### T046: Implement PatientRegistrationForm Component
**Priority**: Critical | **Estimated Time**: 100 minutes | **Parallelizable**: No
**Dependencies**: T044 (usePatientRegistration), T030 (CPF validator), T003 (frontend deps)

**Description**: Patient registration form with React Hook Form and Zod validation

**File**: `/home/saraiva-vision-site/src/components/ninsaude/PatientRegistrationForm.jsx`

**Features**:
- All required fields from data-model.md
- Brazilian format masks (CPF, phone, CEP)
- LGPD consent checkbox
- Real-time validation with Zod

**Acceptance Criteria**:
- ALL T016 tests pass
- Responsive design with Tailwind CSS
- Accessibility (ARIA labels, keyboard navigation)

**Test**:
```bash
npx vitest run src/__tests__/ninsaude/PatientRegistrationForm.test.jsx
# Expected: 7 tests, 7 passed
```

---

### T047: Implement AppointmentSlotPicker Component
**Priority**: Critical | **Estimated Time**: 120 minutes | **Parallelizable**: No
**Dependencies**: T045 (useAppointmentBooking), T003 (date-fns)

**Description**: Calendar view for selecting available appointment slots

**File**: `/home/saraiva-vision-site/src/components/ninsaude/AppointmentSlotPicker.jsx`

**Features**:
- 7-day calendar view (default)
- Professional filter dropdown
- Slot grouping by date and time
- Loading skeleton during fetch
- Empty state messaging

**Acceptance Criteria**:
- ALL T017 tests pass
- Uses date-fns for Brazilian date formatting
- Responsive grid layout

**Test**:
```bash
npx vitest run src/__tests__/ninsaude/AppointmentSlotPicker.test.jsx
# Expected: 6 tests, 6 passed
```

---

### T048: Implement AppointmentBookingForm Component
**Priority**: Critical | **Estimated Time**: 140 minutes | **Parallelizable**: No
**Dependencies**: T046 (PatientRegistrationForm), T047 (AppointmentSlotPicker)

**Description**: Multi-step booking wizard component

**File**: `/home/saraiva-vision-site/src/components/ninsaude/AppointmentBookingForm.jsx`

**Steps**:
1. CPF verification
2. Patient registration (if new) or skip (if existing)
3. Slot selection
4. Booking confirmation
5. Success/error feedback

**Acceptance Criteria**:
- ALL T015 tests pass
- Step navigation (back/next)
- Progress indicator
- Preserves data across steps

**Test**:
```bash
npx vitest run src/__tests__/ninsaude/AppointmentBookingForm.test.jsx
# Expected: 7 tests, 7 passed
```

---

### T049: Implement AppointmentsList Component
**Priority**: Medium | **Estimated Time**: 90 minutes | **Parallelizable**: No
**Dependencies**: T043 (useNinsaude)

**Description**: Patient appointments management list with cancel/reschedule actions

**File**: `/home/saraiva-vision-site/src/components/ninsaude/AppointmentsList.jsx`

**Features**:
- List patient appointments
- Status badges (pending, confirmed, completed, cancelled)
- Cancel button with confirmation modal
- Reschedule button (opens booking flow)

**Acceptance Criteria**:
- ALL T018 tests pass
- State-based action visibility
- Confirmation dialogs

**Test**:
```bash
npx vitest run src/__tests__/ninsaude/AppointmentsList.test.jsx
# Expected: 6 tests, 6 passed
```

---

### T050 [P]: Implement NinsaudeCompliance Component
**Priority**: Critical | **Estimated Time**: 60 minutes | **Parallelizable**: Yes
**Dependencies**: None

**Description**: CFM/LGPD compliance disclaimers and notices

**File**: `/home/saraiva-vision-site/src/components/ninsaude/NinsaudeCompliance.jsx`

**Features**:
- Medical disclaimer (CFM requirements)
- LGPD data usage notice
- Consent checkbox text
- Privacy policy link

**Acceptance Criteria**:
- CFM medical disclaimer visible
- LGPD compliance text accurate
- Accessible (screen reader friendly)

---

### T051: Implement AgendamentoPage
**Priority**: Critical | **Estimated Time**: 80 minutes | **Parallelizable**: No
**Dependencies**: T048 (AppointmentBookingForm), T050 (NinsaudeCompliance)

**Description**: Main appointment booking page

**File**: `/home/saraiva-vision-site/src/pages/AgendamentoPage.jsx`

**Features**:
- Page layout with hero section
- AppointmentBookingForm integration
- NinsaudeCompliance footer
- SEO metadata

**Acceptance Criteria**:
- Route `/agendamento` works
- Page responsive on mobile/desktop
- SEO tags present (title, description)

**Test**:
```bash
npm run dev
# Navigate to http://localhost:3002/agendamento
```

---

## Phase 3.5: Integration & Polish

---

### T052: Configure API Routes in Express
**Priority**: Critical | **Estimated Time**: 40 minutes | **Parallelizable**: No
**Dependencies**: T038-T042 (all API routes)

**Description**: Register all Ninsaúde routes in main Express app with middleware chain

**File**: `/home/saraiva-vision-site/api/server.js` (or main entry point)

**Implementation**:
```javascript
import { validateToken } from './ninsaude/middleware/validateToken.js';
import { rateLimiter } from './ninsaude/middleware/rateLimiter.js';
import { lgpdAudit } from './ninsaude/middleware/lgpdAudit.js';
import { errorHandler } from './ninsaude/middleware/errorHandler.js';
import authRoutes from './ninsaude/auth.js';
import patientRoutes from './ninsaude/patients.js';
import appointmentRoutes from './ninsaude/appointments.js';
import availabilityRoutes from './ninsaude/availability.js';
import notificationRoutes from './ninsaude/notifications.js';

app.use('/api/ninsaude', lgpdAudit);
app.use('/api/ninsaude', rateLimiter);
app.use('/api/ninsaude/auth', authRoutes);
app.use('/api/ninsaude', validateToken);
app.use('/api/ninsaude/patients', patientRoutes);
app.use('/api/ninsaude/appointments', appointmentRoutes);
app.use('/api/ninsaude/availability', availabilityRoutes);
app.use('/api/ninsaude/notifications', notificationRoutes);
app.use('/api/ninsaude', errorHandler);
```

**Acceptance Criteria**:
- All routes accessible
- Middleware chain executes in order
- Server starts without errors

---

### T053: Environment Variables Documentation
**Priority**: Medium | **Estimated Time**: 30 minutes | **Parallelizable**: Yes (with T052)
**Dependencies**: T004

**Description**: Create comprehensive documentation for required environment variables

**File**: `/home/saraiva-vision-site/specs/001-ninsaude-integration/ENV.md`

**Content**:
- List of all environment variables (backend + frontend)
- Purpose of each variable
- Where to obtain credentials (Ninsaúde dashboard, Evolution API setup)
- Development vs production values
- Security best practices

**Acceptance Criteria**:
- Documentation complete and accurate
- Includes setup instructions for Evolution API
- Links to external documentation

---

### T054: Run Comprehensive Test Suite
**Priority**: Critical | **Estimated Time**: 60 minutes | **Parallelizable**: No
**Dependencies**: All implementation tasks (T026-T051)

**Description**: Execute full test suite and verify 80% minimum coverage

**Commands**:
```bash
# Backend tests
cd api
npm run test:ninsaude
npm run test:coverage

# Frontend tests
cd ..
npm run test:ninsaude
npm run test:coverage

# Combined coverage report
npm run test:comprehensive
```

**Acceptance Criteria**:
- ALL tests pass (frontend + backend)
- Coverage ≥ 80% line coverage
- No flaky tests
- Test execution < 5 minutes

**Coverage Targets**:
- Backend API routes: ≥ 85%
- Frontend components: ≥ 80%
- Utility functions: ≥ 90%
- Integration scenarios: 100% (all 5 scenarios)

---

### T055: Performance Validation
**Priority**: Critical | **Estimated Time**: 45 minutes | **Parallelizable**: No
**Dependencies**: T054 (all tests passing)

**Description**: Validate performance targets from plan.md

**Performance Tests**:
```javascript
// api/__tests__/ninsaude/performance.test.js
test('Patient registration < 2s', async () => {
  const start = Date.now();
  await POST('/api/ninsaude/patients', newPatientData);
  expect(Date.now() - start).toBeLessThan(2000);
});

test('Slot lookup < 3s', async () => {
  const start = Date.now();
  await GET('/api/ninsaude/availability?professionalId=X');
  expect(Date.now() - start).toBeLessThan(3000);
});

test('Token refresh < 1s', async () => {
  const start = Date.now();
  await POST('/api/ninsaude/auth/token');
  expect(Date.now() - start).toBeLessThan(1000);
});
```

**Acceptance Criteria**:
- Patient registration: < 2 seconds
- Slot lookup: < 3 seconds
- Token refresh: < 1 second
- All performance tests pass

---

### T056: Execute Quickstart Manual Scenarios
**Priority**: Critical | **Estimated Time**: 90 minutes | **Parallelizable**: No
**Dependencies**: T054 (all tests passing), T055 (performance validated)

**Description**: Manually execute all 5 scenarios from quickstart.md

**Scenarios to Execute**:
1. ✓ Scenario 1: New patient booking flow (7 steps)
2. ✓ Scenario 2: Existing patient CPF lookup (4 steps)
3. ✓ Scenario 7: Slot conflict handling (3 steps)
4. ✓ Scenario 8: API fallback with queue (4 steps)
5. ✓ Scenario 9: CPF auto-detection (5 steps)

**Acceptance Criteria**:
- All 5 scenarios execute successfully
- UI/UX matches design expectations
- Error messages user-friendly
- Notifications received (email + WhatsApp)

**Validation Checklist**:
```markdown
- [ ] CPF validation works
- [ ] Existing patient auto-detected
- [ ] Slot conflict shows error gracefully
- [ ] API fallback queues request
- [ ] Dual notifications sent
- [ ] LGPD consent captured
- [ ] Audit logs created with hashed PII
```

---

### T057: LGPD Compliance Audit
**Priority**: Critical | **Estimated Time**: 60 minutes | **Parallelizable**: No
**Dependencies**: T056 (manual scenarios complete)

**Description**: Validate full LGPD compliance implementation

**Audit Checklist**:
```markdown
- [ ] SHA-256 hashing of CPF in audit logs
- [ ] No plaintext PII in application logs
- [ ] LGPD consent checkbox on registration
- [ ] Consent stored in Ninsaúde (not locally)
- [ ] Data minimization (only required fields)
- [ ] Redis cache TTL ≤ 24 hours
- [ ] Audit logs retention = 5 years
- [ ] Patient data never stored locally (Ninsaúde is source of truth)
```

**Acceptance Criteria**:
- All 8 checklist items verified
- LGPD audit log contains hashed identifiers
- No LGPD violations found

**Commands**:
```bash
# Verify audit logs
tail -f api/logs/lgpd-audit.log
# Verify no plaintext PII
grep -r "CPF.*[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}" api/logs/
# Expected: No matches (only hashed)
```

---

### T058: CFM Compliance Validation
**Priority**: Critical | **Estimated Time**: 45 minutes | **Parallelizable**: Yes (with T057)
**Dependencies**: T056 (manual scenarios complete)

**Description**: Validate CFM medical compliance implementation

**Compliance Checklist**:
```markdown
- [ ] Medical disclaimer visible on booking page
- [ ] PII detection in patient forms
- [ ] No medical diagnoses collected (scope limited to appointments)
- [ ] Professional CRM numbers displayed (if available)
- [ ] Appointment records auditable
- [ ] Medical disclaimers meet Resolução CFM 1821/2007
```

**Acceptance Criteria**:
- All 6 checklist items verified
- CFM disclaimers present and accurate
- No CFM violations found

---

## Dependency Graph

### Critical Path (Sequential)
```
T001 (Setup)
  → T002 (Backend deps)
    → T032 (Redis client)
      → T033 (API client)
        → T034 (Token middleware)
          → T038 (Auth route)
            → T039, T040, T041, T042 (API routes)
              → T043 (useNinsaude hook)
                → T044, T045 (Workflow hooks)
                  → T046, T047 (Form components)
                    → T048 (Booking wizard)
                      → T051 (Agendamento page)
                        → T052 (Express routing)
                          → T054 (Full test suite)
                            → T055 (Performance)
                              → T056 (Manual scenarios)
                                → T057, T058 (Compliance audits)
```

### Parallel Execution Groups

**Group 1: Initial Setup** (Run in parallel after T001)
- T002 [P] - Backend deps
- T003 [P] - Frontend deps
- T004 [P] - Environment variables
- T005 [P] - TypeScript config

**Group 2: TDD Tests** (Run in parallel after Group 1)
- T006 [P] - Patient contract tests
- T007 [P] - Appointment contract tests
- T008 [P] - Availability contract tests
- T009 [P] - Notification contract tests
- T010 [P] - Integration scenario 1
- T011 [P] - Integration scenario 2
- T012 [P] - Integration scenario 7
- T013 [P] - Integration scenario 8
- T014 [P] - Integration scenario 9
- T015 [P] - AppointmentBookingForm tests
- T016 [P] - PatientRegistrationForm tests
- T017 [P] - AppointmentSlotPicker tests
- T018 [P] - AppointmentsList tests
- T019 [P] - useNinsaude tests
- T020 [P] - usePatientRegistration tests
- T021 [P] - CPF validator tests
- T022 [P] - Retry backoff tests
- T023 [P] - Redis client tests
- T024 [P] - LGPD audit tests
- T025 [P] - Rate limiter tests

**Group 3: TypeScript Interfaces** (Run in parallel after T002)
- T026 [P] - Patient interface
- T027 [P] - Appointment interface
- T028 [P] - Notification interface
- T029 [P] - QueuedRequest interface

**Group 4: Utilities** (Run in parallel, independent)
- T030 [P] - CPF validator
- T031 [P] - Retry backoff

**Group 5: Middleware** (Run in parallel after T034)
- T035 [P] - Rate limiter
- T036 [P] - LGPD audit
- T037 [P] - Error handler

**Group 6: Final Compliance** (Run in parallel after T056)
- T057 - LGPD audit
- T058 [P] - CFM validation

---

## Parallel Execution Commands

### Using Task Agent (Recommended)
```bash
# Execute Group 1 in parallel
/task "Execute tasks T002, T003, T004, T005 in parallel"

# Execute Group 2 TDD tests in parallel (all 20 test tasks)
/task "Execute tasks T006-T025 in parallel - write ALL failing tests"

# Execute Group 3 TypeScript interfaces in parallel
/task "Execute tasks T026, T027, T028, T029 in parallel"

# Execute Group 4 utilities in parallel
/task "Execute tasks T030, T031 in parallel"
```

### Using Shell Scripts
```bash
# Group 2: Run all test file creations concurrently
(cd api && npm run create-test -- patients.contract.test.js) &
(cd api && npm run create-test -- appointments.contract.test.js) &
(cd api && npm run create-test -- availability.contract.test.js) &
# ... etc
wait

# Verify all tests fail
npm run test:ninsaude
# Expected: Many failures (tests written, implementations missing)
```

---

## Task Summary by Phase

### Phase 3.1: Setup (5 tasks)
- T001 - T005
- Total Time: ~2 hours
- Parallelization: 80% (4/5 tasks)

### Phase 3.2: TDD Tests (20 tasks)
- T006 - T025
- Total Time: ~15 hours (3 hours with parallelization)
- Parallelization: 100% (all tasks)

### Phase 3.3: Backend Implementation (17 tasks)
- T026 - T042
- Total Time: ~18 hours (8 hours with parallelization)
- Parallelization: ~30% (some dependencies)

### Phase 3.4: Frontend Implementation (9 tasks)
- T043 - T051
- Total Time: ~13 hours (mostly sequential)
- Parallelization: ~10% (T050 only)

### Phase 3.5: Integration & Polish (7 tasks)
- T052 - T058
- Total Time: ~7 hours
- Parallelization: ~30% (T053, T058)

---

## Estimated Timeline

**With Sequential Execution**: ~55 hours (7-8 working days)
**With Parallel Execution**: ~25-30 hours (4-5 working days)
**Recommended**: 5-6 days with 2 developers working in parallel

### Daily Breakdown (Optimized)

**Day 1**: Setup + TDD Tests
- Morning: T001-T005 (Setup)
- Afternoon: T006-T025 (ALL TDD tests in parallel)
- Output: Full test suite failing, ready for implementation

**Day 2**: Backend Core
- Morning: T026-T029 (TypeScript interfaces) + T030-T031 (Utilities)
- Afternoon: T032-T034 (Redis, API client, token middleware)
- Output: Backend foundation ready

**Day 3**: Backend Routes
- Morning: T035-T037 (Middleware) + T038 (Auth route)
- Afternoon: T039-T042 (API routes)
- Output: Backend complete, contract tests passing

**Day 4**: Frontend Components
- Morning: T043-T045 (Hooks)
- Afternoon: T046-T047 (Forms + Slot picker)
- Output: Core frontend components ready

**Day 5**: Frontend Integration
- Morning: T048-T051 (Booking wizard + Page)
- Afternoon: T052-T053 (Express routing + Documentation)
- Output: Full stack integration complete

**Day 6**: Testing & Compliance
- Morning: T054-T055 (Full test suite + Performance)
- Afternoon: T056-T058 (Manual scenarios + Compliance audits)
- Output: Production-ready feature

---

## Success Metrics

### Code Quality
- ✅ 80% minimum test coverage (frontend + backend)
- ✅ Zero ESLint errors
- ✅ Zero TypeScript compilation errors
- ✅ All 58 tasks completed and verified

### Functional Requirements
- ✅ All 5 quickstart scenarios passing
- ✅ Patient registration with CPF validation
- ✅ Appointment booking with slot verification
- ✅ Dual notifications (email + WhatsApp)
- ✅ API fallback with queue mechanism

### Performance Requirements
- ✅ Patient registration: < 2 seconds
- ✅ Slot lookup: < 3 seconds
- ✅ Token refresh: < 1 second
- ✅ Bundle size increase: < 50KB gzipped

### Compliance Requirements
- ✅ LGPD: SHA-256 hashed PII in logs
- ✅ LGPD: 5-year audit log retention
- ✅ LGPD: Data minimization enforced
- ✅ CFM: Medical disclaimers present
- ✅ CFM: No unauthorized medical data collection

---

**Tasks Document Complete**: 58 tasks, dependency-ordered, with parallelization strategy and comprehensive acceptance criteria. Ready for execution.

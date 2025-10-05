# Implementation Plan: Integração com API Ninsaúde

**Branch**: `001-ninsaude-integration` | **Date**: 2025-10-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/home/saraiva-vision-site/specs/001-ninsaude-integration/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

This plan implements a complete patient appointment booking system integrated with the Ninsaúde API. The system enables patients to register, schedule, cancel, and reschedule appointments online while maintaining full synchronization with the clinic's Ninsaúde management platform. The implementation follows a TDD approach with comprehensive LGPD/CFM compliance, OAuth2 authentication, and dual-channel notifications (email + WhatsApp).

**Key Features**:
- Patient registration with CPF validation and duplicate detection
- Real-time appointment slot availability lookup
- Online booking, cancellation, and rescheduling
- OAuth2 token management (15-minute access tokens with automatic refresh)
- Dual notification system (Resend email + WhatsApp webhook API)
- Retry mechanisms with exponential backoff for API failures
- LGPD-compliant audit logging and data handling
- CFM medical disclaimers and compliance validation

## Technical Context
**Language/Version**: TypeScript 5.x (frontend), Node.js 22+ (backend), React 18
**Primary Dependencies**: Express.js, Axios (Ninsaúde API client), Resend API (email), WhatsApp webhook API, Redis (cache), Zod (validation)
**Storage**: Redis for caching OAuth tokens and retry queue, Ninsaúde API as source of truth (no local database)
**Testing**: Vitest + React Testing Library, jsdom for DOM testing, 80% minimum coverage requirement
**Target Platform**: VPS Linux production (31.97.129.78), localhost:3002 development
**Project Type**: web (React/Vite frontend + Node.js/Express backend)
**Performance Goals**: <3 seconds appointment lookup, <2 seconds patient registration, <1 second token refresh
**Constraints**: LGPD compliance (audit logging, data minimization), CFM medical disclaimers, OAuth2 15-minute token expiry, rate limiting 30 req/min
**Scale/Scope**: ~100 concurrent users, medical-grade data handling, dual-channel notifications (email + WhatsApp)

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Development Standards (from Saraiva Vision Constitution)
✅ **TDD Mandatory**: All functional code must have tests written FIRST
✅ **TypeScript Strict**: Type safety for all data structures and API contracts
✅ **LGPD + CFM Compliance**: Medical data handling, audit logging, consent management
✅ **Existing Patterns**: React functional components, hooks in `src/hooks/`, API routes in `api/`
✅ **No New Frameworks**: Using existing stack (React, Express, Vite, Vitest)
✅ **80% Coverage Minimum**: Comprehensive test coverage for all new code
✅ **Tailwind CSS Only**: No additional CSS frameworks
✅ **ESLint + Prettier**: Code quality and formatting standards
✅ **Environment Variables**: Prefixed with `VITE_` for frontend, secure for backend
✅ **Performance Targets**: Lazy loading, code splitting, chunks <250KB

### Feature-Specific Compliance
✅ **OAuth2 Security**: Backend-only token storage, automatic refresh before expiry
✅ **LGPD Audit Trail**: SHA-256 hashed cache keys, timestamped logs, data anonymization
✅ **CFM Medical Standards**: Automated validation, PII detection, medical disclaimers
✅ **Rate Limiting**: 30 req/min to Ninsaúde API, backoff on 429 responses
✅ **Error Handling**: Retry with exponential backoff (1s, 2s, 4s max 3 attempts)

### Deviations Requiring Justification
**None** - This feature follows all constitutional requirements without exceptions

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
src/                                    # Frontend React/Vite
├── components/
│   └── ninsaude/                      # NEW: Ninsaúde integration UI
│       ├── AppointmentBookingForm.jsx # Multi-step booking wizard
│       ├── AppointmentSlotPicker.jsx  # Available slots calendar view
│       ├── PatientRegistrationForm.jsx # Patient info collection
│       ├── AppointmentsList.jsx       # Patient's appointments management
│       └── NinsaudeCompliance.jsx     # CFM/LGPD disclaimers
├── pages/
│   └── AgendamentoPage.jsx            # NEW: Main appointment booking page
├── hooks/
│   ├── useNinsaude.js                 # NEW: Ninsaúde API integration hook
│   ├── usePatientRegistration.js      # NEW: Patient registration logic
│   └── useAppointmentBooking.js       # NEW: Booking workflow hook
├── lib/
│   ├── ninsaudeClient.js              # NEW: Axios client wrapper
│   ├── cpfValidator.js                # NEW: Brazilian CPF validation
│   └── appointmentUtils.js            # NEW: Slot formatting, time utils
├── data/
│   └── ninsaudeConfig.js              # NEW: API endpoints, constants
└── __tests__/
    └── ninsaude/                      # NEW: Frontend integration tests
        ├── AppointmentBooking.test.jsx
        ├── PatientRegistration.test.jsx
        └── useNinsaude.test.js

api/                                    # Backend Node.js/Express
├── ninsaude/                          # NEW: Ninsaúde API routes
│   ├── auth.js                        # OAuth2 token management
│   ├── patients.js                    # Patient CRUD operations
│   ├── appointments.js                # Appointment booking/management
│   ├── availability.js                # Slot availability lookup
│   ├── notifications.js               # Email + WhatsApp dispatch
│   └── middleware/
│       ├── validateToken.js           # Token refresh middleware
│       ├── rateLimiter.js             # Rate limiting (30 req/min)
│       ├── lgpdAudit.js               # LGPD audit logging
│       └── errorHandler.js            # Centralized error handling
├── __tests__/
│   └── ninsaude/                      # NEW: API contract tests
│       ├── auth.test.js               # OAuth2 flow tests
│       ├── patients.test.js           # Patient operations tests
│       ├── appointments.test.js       # Booking operations tests
│       └── notifications.test.js      # Notification delivery tests
└── utils/
    ├── ninsaudeApiClient.js           # NEW: Base Ninsaúde HTTP client
    ├── retryWithBackoff.js            # NEW: Exponential backoff logic
    └── redisClient.js                 # NEW: Redis token cache

specs/001-ninsaude-integration/        # This planning work
├── plan.md                            # This file
├── research.md                        # Phase 0 output
├── data-model.md                      # Phase 1 output
├── quickstart.md                      # Phase 1 output
├── contracts/                         # Phase 1 output
│   ├── patients.openapi.yaml
│   ├── appointments.openapi.yaml
│   ├── availability.openapi.yaml
│   └── notifications.openapi.yaml
└── tasks.md                           # Phase 2 output (/tasks command)
```

**Structure Decision**: Web application pattern with existing Saraiva Vision structure. Frontend components in `src/components/ninsaude/`, backend API routes in `api/ninsaude/`, following established patterns from `api/google-reviews.js` and `src/components/GoogleReviewsWidget.jsx`. No database - Ninsaúde API is source of truth, Redis for caching only

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh claude`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
1. **Contract Tests First** (TDD): Generate failing contract tests from OpenAPI specs
   - `/api/ninsaude/patients` contract tests [P]
   - `/api/ninsaude/appointments` contract tests [P]
   - `/api/ninsaude/availability` contract tests [P]
   - `/api/ninsaude/notifications` contract tests [P]

2. **Backend Implementation**: OAuth2, API routes, middleware
   - OAuth2 token management (auth.js + Redis cache) [dependency: none]
   - Rate limiter middleware [P]
   - LGPD audit middleware [P]
   - Patient CRUD endpoints (to pass contract tests)
   - Appointment endpoints (to pass contract tests)
   - Availability lookup endpoint
   - Notification dispatch (email + WhatsApp)
   - Retry with backoff utility [P]

3. **Frontend Implementation**: React components, hooks, pages
   - CPF validator utility [P]
   - Ninsaúde API client hook (useNinsaude.js)
   - Patient registration form + tests
   - Appointment slot picker + tests
   - Booking workflow component + tests
   - Appointments list/management + tests
   - Main appointment page integration

4. **Integration Tests**: End-to-end scenarios from quickstart.md
   - Scenario 1: New patient booking flow
   - Scenario 2: Existing patient CPF lookup
   - Scenario 7: Slot conflict handling
   - Scenario 8: API fallback behavior
   - Scenario 9: CPF auto-detection

**Ordering Strategy**:
- **TDD Flow**: Contract tests → failing integration tests → implementation → tests pass
- **Dependency Chain**: Auth → Patients → Appointments → Notifications → UI
- **Parallelization**: Independent utilities, middleware, and tests marked [P]
- **Critical Path**: OAuth2 token management must complete before any API calls

**Estimated Output**: 35-45 numbered, dependency-ordered tasks in tasks.md

**Parallelization Opportunities**:
- Contract tests for all endpoints (independent files)
- Middleware development (rate limiter, audit logger, error handler)
- Utility functions (CPF validator, date formatters, retry logic)
- Frontend components (can develop in parallel with mocked API)

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command) - research.md created
- [x] Phase 1: Design complete (/plan command) - data-model.md, contracts/, quickstart.md created
- [x] Phase 2: Task planning complete (/plan command - approach described, ready for /tasks)
- [ ] Phase 3: Tasks generated (/tasks command) - Next step: Run /tasks to generate tasks.md
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved (deferred questions documented in spec.md)
- [x] Complexity deviations documented (none required)

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*

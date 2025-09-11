````markdown
# Implementation Plan: Resend Email Integration for Contact Form

**Branch**: `002-resend-contact-form` | **Date**: 2025-09-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-resend-contact-form/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → Loaded successfully
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Project Type: web (frontend+backend)
   → Structure Decision: Option 2 (Web application)
3. Evaluate Constitution Check section below
   → All principles followed: simplicity, library-first, test-first
   → Progress Tracking: Initial Constitution Check ✓
4. Execute Phase 0 → research.md
   → All technical unknowns resolved
5. Execute Phase 1 → contracts, data-model.md, quickstart.md, .github/copilot-instructions.md
6. Re-evaluate Constitution Check section
   → No violations after design
7. Plan Phase 2 → Task generation approach described
8. STOP - Ready for /tasks command
```

## Summary
Integrate Resend API with existing contact form to deliver patient inquiries directly to Dr. Philipe's email (philipe_cruz@outlook.com). Technical approach: create secure API endpoint with rate limiting, maintain existing form UX, implement professional email template with LGPD compliance.

## Technical Context
**Language/Version**: JavaScript ES2022, Node.js 20.x
**Primary Dependencies**: React 18, Resend API SDK, Express.js, Zod validation
**Storage**: No persistent storage (direct email only)
**Testing**: Vitest, React Testing Library, Supertest for API
**Target Platform**: Web application (Vite + Node.js backend)
**Project Type**: web - determines source structure (frontend + backend)
**Performance Goals**: <3s form submission response, 99.9% email delivery rate
**Constraints**: LGPD compliance, 5 submissions/IP/hour rate limit, <200ms p95 API response
**Scale/Scope**: Medical clinic contact form, ~50 submissions/month, single email recipient

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:
- Projects: 2 (api endpoint, email service library)
- Using framework directly? Yes (Express.js, Resend SDK directly)
- Single data model? Yes (ContactSubmission interface)
- Avoiding patterns? Yes (direct API calls, no repository pattern)

**Architecture**:
- EVERY feature as library? Yes (email service as standalone library)
- Libraries listed: email-service (Resend integration), contact-validator (form validation)
- CLI per library: email-service --send --template, contact-validator --validate --format json
- Library docs: llms.txt format planned for both libraries

**Testing (NON-NEGOTIABLE)**:
- RED-GREEN-Refactor cycle enforced? Yes (tests written first, fail, then implement)
- Git commits show tests before implementation? Enforced in workflow
- Order: Contract→Integration→E2E→Unit strictly followed? ✓
- Real dependencies used? Yes (actual Resend API in integration tests)
- Integration tests for: API endpoint, email delivery, form validation, rate limiting
- FORBIDDEN: Implementation before test, skipping RED phase ✓

**Observability**:
- Structured logging included? Yes (winston with email delivery tracking)
- Frontend logs → backend? Yes (form errors logged to API)
- Error context sufficient? Yes (sanitized logging without PII)

**Versioning**:
- Version number assigned? 1.0.0 (new feature)
- BUILD increments on every change? Yes
- Breaking changes handled? N/A (new feature)

## Project Structure

### Documentation (this feature)
```
specs/002-resend-contact-form/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Option 2: Web application (frontend + backend detected)
api/
├── contact.js           # Contact form endpoint
├── lib/
│   ├── email-service.js # Resend integration library
│   ├── validator.js     # Form validation library
│   └── rate-limiter.js  # Rate limiting middleware
└── __tests__/
    ├── contract/        # API contract tests
    ├── integration/     # Email delivery tests
    └── unit/           # Library unit tests

src/
├── components/
│   └── Contact.jsx      # Updated contact form
├── services/
│   └── api.js          # Frontend API client
└── __tests__/
    ├── components/     # Form component tests
    └── integration/    # E2E form submission tests
```

**Structure Decision**: Option 2 (Web application) - frontend form + backend API endpoint

## Phase 0: Outline & Research

### Research Tasks
1. **Resend API Integration Patterns**
   - Best practices for Node.js SDK integration
   - Rate limiting and error handling strategies
   - Email template systems and responsive design

2. **Medical Email Compliance**
   - Healthcare communication standards for Brazil
   - LGPD requirements for patient contact forms
   - Professional email formatting for medical practices

3. **Form Security Patterns**
   - Input sanitization for medical forms
   - Rate limiting strategies for contact forms
   - XSS prevention in email templates

4. **Error Handling Strategies**
   - Graceful degradation for API failures
   - User-friendly error messages
   - Retry mechanisms for email delivery

**Output**: research.md with comprehensive technical decisions

## Phase 1: Design & Contracts

### Data Model (data-model.md)
```typescript
interface ContactSubmission {
  name: string;           // Patient name (required, 2-100 chars)
  email: string;          // Patient email (required, valid format)
  phone?: string;         // Patient phone (optional, Brazilian format)
  message: string;        // Inquiry message (required, 10-1000 chars)
  consent: boolean;       // LGPD consent (required, must be true)
  timestamp: string;      // Submission time (ISO string)
  userAgent: string;      // Client info for logging
  ipAddress: string;      // Rate limiting (hashed for privacy)
}

interface EmailTemplate {
  to: string;             // Dr. Philipe's email
  subject: string;        // Professional subject line
  html: string;           // Responsive HTML template
  text: string;           // Plain text fallback
}

interface APIResponse {
  success: boolean;       // Operation status
  message: string;        // User-friendly message
  error?: string;         // Error details (sanitized)
  submissionId?: string;  // Tracking ID for support
}
```

### API Contracts (contracts/)
```yaml
# /api/contact POST endpoint
paths:
  /api/contact:
    post:
      summary: Submit patient contact form
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ContactSubmission'
      responses:
        200:
          description: Email sent successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SuccessResponse'
        400:
          description: Validation error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ValidationError'
        429:
          description: Rate limit exceeded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RateLimitError'
        500:
          description: Server error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ServerError'
```

### Library CLIs
```bash
# email-service CLI
email-service --send --to="philipe_cruz@outlook.com" --template="contact" --data='{"name":"John"}'
email-service --validate-template --template="contact"
email-service --test-connection

# contact-validator CLI
contact-validator --validate --data='{"name":"John","email":"test@example.com"}' --format=json
contact-validator --sanitize --input="<script>alert('xss')</script>"
```

### Integration Tests
```javascript
// Contract tests (fail first, then implement)
describe('POST /api/contact', () => {
  it('should send email with valid contact data', async () => {
    // This test MUST fail initially
    const response = await request(app)
      .post('/api/contact')
      .send(validContactData)
      .expect(200);

    expect(response.body.success).toBe(true);
    // Verify email was sent to Dr. Philipe
  });

  it('should reject invalid email format', async () => {
    // This test MUST fail initially
    const response = await request(app)
      .post('/api/contact')
      .send({ ...validContactData, email: 'invalid-email' })
      .expect(400);

    expect(response.body.error).toContain('Invalid email format');
  });
});
```

**Output**: data-model.md, /contracts/api.yaml, failing contract tests, quickstart.md

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
1. Load `/templates/tasks-template.md` as base template
2. Generate from Phase 1 design docs:
   - Each API endpoint → contract test task [P]
   - Each library (email-service, validator) → unit test tasks [P]
   - Each data model → validation test task [P]
   - Integration tests for email delivery workflow
   - Frontend form update tasks
   - Environment configuration tasks

**Ordering Strategy**:
1. **TDD Foundation**: All tests before implementation
2. **Backend First**: API libraries before frontend integration
3. **Dependency Order**:
   - Libraries (email-service, validator) [P]
   - API endpoint (depends on libraries)
   - Frontend integration (depends on API)
   - E2E tests (depends on full stack)

**Parallel Execution Markers**:
- Library development tasks marked [P] (independent files)
- Test creation tasks marked [P] (different test files)
- Configuration tasks marked [P] (different config files)

**Estimated Output**: 20-25 numbered, ordered tasks in tasks.md following TDD principles

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation following RED-GREEN-REFACTOR cycle
**Phase 5**: Validation (email delivery tests, form UX testing, security validation)

## Complexity Tracking
*No constitutional violations - this section intentionally left empty*

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none)

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
````

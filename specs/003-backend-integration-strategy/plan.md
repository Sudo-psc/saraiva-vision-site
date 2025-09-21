
# Implementation Plan: Backend Integration Strategy

**Branch**: `003-backend-integration-strategy` | **Date**: 2025-09-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-backend-integration-strategy/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
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
[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context
**Language/Version**: Node.js 18+, TypeScript 5.x, React 18
**Primary Dependencies**: Vercel Functions, Next.js 14, Prisma/Drizzle ORM, WordPress Headless/Supabase, Resend API, Spotify Web API, WhatsApp Business API
**Storage**: PostgreSQL/MySQL for primary data, Redis for caching, WordPress MySQL (if headless), Supabase (if chosen)
**Testing**: Vitest, Playwright for E2E, Jest for API testing
**Target Platform**: Vercel Edge Functions, Linux VPS (31.97.129.78), CDN distribution
**Project Type**: web - hybrid frontend (Vercel) + backend (VPS + Serverless)
**Performance Goals**: <200ms API response times, 99.9% uptime, efficient caching
**Constraints**: Vercel function limits, Spotify API rate limits, healthcare data compliance, backward compatibility
**Scale/Scope**: Medical clinic website, ~1k daily users, podcast integration, CMS, analytics dashboard, WhatsApp chatbot

**User Requirements Integration**:
- CMS (WordPress headless ou Supabase)
- Podcast page sincronizada com Spotify
- Formulário de contato com integração por e-mail via Resend API e banco de dados
- Dashboard de funcionalidades e status do sistema
- Analytics
- Widget para WhatsApp e chatbot integrado

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Backend Integration Principles**:
- [ ] **API-First Design**: All backend services expose well-documented REST/GraphQL APIs
- [ ] **Test-Driven Development**: Contract tests before implementation, integration tests for external APIs
- [ ] **Security by Design**: Healthcare data compliance, API authentication, input validation
- [ ] **Observability**: Health checks, structured logging, performance monitoring
- [ ] **Hybrid Architecture Compatibility**: Must integrate with existing VPS services while leveraging Vercel

**Technical Standards**:
- [ ] **Database Consistency**: Single source of truth for data, proper migrations
- [ ] **API Versioning**: Backward compatibility during transitions
- [ ] **Error Handling**: Graceful degradation, proper HTTP status codes
- [ ] **Performance Targets**: <200ms response times, efficient caching strategies
- [ ] **External API Resilience**: Rate limiting, retry logic, fallback mechanisms

**Integration Constraints**:
- [ ] **Vercel Limitations**: Function timeout limits, payload size restrictions
- [ ] **Legacy System Compatibility**: WordPress/VPS integration maintained
- [ ] **Third-Party Dependencies**: Spotify, WhatsApp, Resend API error handling
- [ ] **Data Privacy**: GDPR compliance, healthcare data protection

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
# Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: Option 2 (Web application) - frontend (Vercel React) + backend (VPS + Serverless)

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
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Priority-based task ordering: Database → API → Integration → Frontend → Testing

**Core Task Categories**:

1. **Database Setup Tasks** [P]
   - Supabase schema migration
   - Row-level security policies
   - Database indexes and constraints
   - Seed data creation

2. **API Implementation Tasks**
   - Contact form API endpoints (based on contact-api.yaml)
   - Podcast sync API endpoints (based on podcast-api.yaml)
   - WhatsApp webhook handlers (based on whatsapp-api.yaml)
   - Dashboard API endpoints for admin interface

3. **External Integration Tasks**
   - Spotify Web API client and sync service
   - Resend email service integration
   - WhatsApp Business API webhook setup
   - Sentry error tracking configuration

4. **Frontend Integration Tasks**
   - Contact form component with API integration
   - Podcast page with episode display
   - WhatsApp widget implementation
   - Admin dashboard interface

5. **Testing & Validation Tasks**
   - Contract tests for each API endpoint
   - Integration tests for external services
   - E2E tests for critical user journeys
   - Performance and security testing

**Ordering Strategy**:
- **Phase 2A**: Database schema → API contracts → Basic services
- **Phase 2B**: External integrations → Webhook handlers → Email templates
- **Phase 2C**: Frontend components → Admin dashboard → Analytics
- **Phase 2D**: Testing → Documentation → Deployment configuration

**Parallel Execution Opportunities** [P]:
- Database setup can run parallel with basic API structure
- External service integrations can be developed simultaneously
- Frontend components can be built in parallel with backend APIs
- Testing can be written alongside implementation

**Estimated Output**: 35-40 numbered, prioritized tasks in tasks.md

**Task Dependencies**:
- API tests require database schema completion
- Frontend integration requires API endpoints ready
- Webhook testing requires external service setup
- Dashboard requires authentication and API completion

**Success Criteria for Phase 2**:
- All API contracts have corresponding implementation tasks
- Each external integration has setup and testing tasks
- TDD approach maintained with test tasks preceding implementation
- Clear dependency chains established for execution order

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
- [x] Phase 0: Research complete (/plan command) - ✅ 2025-09-21
- [x] Phase 1: Design complete (/plan command) - ✅ 2025-09-21
- [x] Phase 2: Task planning complete (/plan command - describe approach only) - ✅ 2025-09-21
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS - ✅ Backend integration principles defined
- [x] Post-Design Constitution Check: PASS - ✅ Architecture aligns with hybrid deployment
- [x] All NEEDS CLARIFICATION resolved - ✅ Technology stack confirmed
- [x] Complexity deviations documented - ✅ No violations identified

**Deliverables Created**:
- [x] research.md - Technology decisions and integration strategies
- [x] data-model.md - Complete database schema with security policies
- [x] contracts/contact-api.yaml - Contact form API specification
- [x] contracts/podcast-api.yaml - Podcast integration API specification
- [x] contracts/whatsapp-api.yaml - WhatsApp Business API specification
- [x] quickstart.md - Development and deployment guide
- [x] CLAUDE.md - Updated agent context file

**Key Decisions Made**:
- ✅ CMS: Supabase (already installed, modern stack)
- ✅ Email: Resend API (already installed, high deliverability)
- ✅ Podcast: Spotify Web API with polling strategy
- ✅ WhatsApp: Business API via BSP with compliance framework
- ✅ Analytics: Vercel Analytics + custom events
- ✅ Monitoring: Sentry (already installed) + custom health checks

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*

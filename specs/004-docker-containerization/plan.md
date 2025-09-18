# Implementation Plan: Complete Docker Containerization

**Branch**: `004-docker-containerization` | **Date**: 2025-09-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-docker-containerization/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
4. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
5. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, or `GEMINI.md` for Gemini CLI).
6. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
7. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
8. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Containerize the complete Saraiva Vision medical website stack (React frontend, Node.js API, WordPress CMS, Nginx reverse proxy) using Docker to eliminate environment conflicts, improve deployment consistency, and enable easy development setup. Technical approach uses multi-stage Docker builds, Docker Compose for orchestration, and maintains current production architecture patterns.

## Technical Context
**Language/Version**: Node.js 18+ (API), React 18 (Frontend), PHP 8.1+ (WordPress), Nginx 1.20+
**Primary Dependencies**: Docker 20.10+, Docker Compose 2.0+, Vite 7.1.3, React Router, WordPress 6.0+
**Storage**: SQLite (WordPress), Static files, SSL certificates, uploads, logs
**Testing**: Vitest, React Testing Library, Playwright for E2E, container health checks
**Target Platform**: Ubuntu 20.04+ server, Docker containers, development on localhost
**Project Type**: web - determines source structure (frontend + backend + cms + proxy)
**Performance Goals**: <3s page load, <200ms API response, <30s dev startup, <10s prod startup
**Constraints**: Single server deployment, 2GB memory limit, maintain 99.9% uptime, preserve SSL workflow
**Scale/Scope**: Medical clinic website, 4 services, current production traffic, zero-downtime deployment

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:
- Projects: 4 (frontend container, api container, wordpress container, nginx container) - **VIOLATION: >3**
- Using framework directly? YES - Docker, Docker Compose, Nginx, React, WordPress
- Single data model? YES - each service maintains its own data model
- Avoiding patterns? YES - no unnecessary abstraction layers, direct containerization

**Architecture**:
- EVERY feature as library? N/A - Infrastructure containerization, not feature development
- Libraries listed: N/A - Infrastructure project
- CLI per library: N/A - Container orchestration via docker-compose commands
- Library docs: N/A - Documentation will be in CLAUDE.md and README updates

**Testing (NON-NEGOTIABLE)**:
- RED-GREEN-Refactor cycle enforced? YES - health check tests, integration tests first
- Git commits show tests before implementation? YES - container health checks before Dockerfile implementation
- Order: Contract→Integration→E2E→Unit strictly followed? YES - Service contracts → container integration → full E2E
- Real dependencies used? YES - Real database, real SSL certificates, real services
- Integration tests for: YES - Container-to-container communication, service discovery, health checks
- FORBIDDEN: Implementation before test, skipping RED phase - ENFORCED

**Observability**:
- Structured logging included? YES - Docker logging drivers, aggregated container logs
- Frontend logs → backend? YES - Maintain current logging flow through containers
- Error context sufficient? YES - Container health checks, service monitoring

**Versioning**:
- Version number assigned? YES - 2.0.0 → 2.1.0 (MINOR increment for new containerization)
- BUILD increments on every change? YES - Docker image tags with commit SHA
- Breaking changes handled? YES - Parallel development environment, rollback strategy

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
# Current Structure (Web application with containerization)
# Docker files will be added to existing structure

# Frontend (React)
src/
├── components/
├── pages/
├── hooks/
├── utils/
└── lib/

# Backend API (Node.js)
server.js
api/
├── reviews.js
├── contact.js
└── web-vitals.js

# WordPress CMS
wordpress-local/
├── wp-content/
├── wp-config.php
└── [WordPress files]

# Nginx Configuration
nginx.conf
nginx-configs/
└── [various config files]

# New Docker Structure (to be added)
Dockerfile.frontend
Dockerfile.api
Dockerfile.wordpress
Dockerfile.nginx
docker-compose.dev.yml
docker-compose.prod.yml
.dockerignore

# Tests
tests/
├── contract/        # Container health checks
├── integration/     # Service-to-service communication
└── unit/           # Individual service tests
```

**Structure Decision**: Web application (Option 2) - Frontend + Backend + CMS + Proxy containers

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
   - Run `/scripts/update-agent-context.sh [claude|gemini|copilot]` for your AI assistant
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Docker service contracts → container health test tasks [P]
- Container entities → Dockerfile creation tasks [P]
- Docker Compose contracts → composition test tasks
- Quickstart scenarios → integration test tasks
- Implementation tasks to make tests pass (TDD approach)

**Container-Specific Task Categories**:
1. **Contract Test Tasks** [P]: Health check endpoint tests for each service
2. **Dockerfile Tasks** [P]: Create Dockerfiles following security contracts
3. **Compose Configuration Tasks**: Development and production compositions
4. **Integration Test Tasks**: Service-to-service communication tests
5. **Volume & Network Tasks**: Data persistence and network isolation
6. **Security Hardening Tasks**: Non-root users, resource limits, read-only filesystems
7. **Documentation Tasks**: Update development and deployment guides

**Ordering Strategy**:
- TDD order: Health check tests → Dockerfiles → Compose files → Integration tests
- Dependency order: Base containers → Service containers → Nginx proxy → Full integration
- Security: Security hardening integrated throughout, not as afterthought
- Mark [P] for parallel execution (independent container implementations)

**Docker-Specific Considerations**:
- Each container can be developed in parallel after health check contracts
- Integration tests require all containers to be functional
- Production optimization tasks depend on development environment success
- Security hardening runs throughout, not at the end

**Estimated Output**: 30-35 numbered, ordered tasks in tasks.md
- 8 contract test tasks (health checks) [P]
- 8 Dockerfile implementation tasks [P]
- 4 Docker Compose configuration tasks
- 6 integration test tasks
- 4 security hardening tasks
- 3 volume/persistence tasks
- 4 documentation and deployment tasks

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
| 4 containers (>3 limit) | Medical website requires separate concerns: React frontend, Node.js API, WordPress CMS, Nginx reverse proxy | 3-container setup would force combining incompatible technologies (PHP+Node.js) or lose current architecture benefits (SSL termination, caching, security headers) |


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
- [x] Initial Constitution Check: PASS (with documented violation)
- [x] Post-Design Constitution Check: PASS (no new violations)
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
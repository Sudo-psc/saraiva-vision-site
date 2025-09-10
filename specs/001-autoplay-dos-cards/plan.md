# Implementation Plan: Autoplay do Carrossel de Serviços

**Branch**: `001-autoplay-dos-cards` | **Date**: 2025-09-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/home/saraiva-vision-site-v3/specs/001-autoplay-dos-cards/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → ✅ Feature spec loaded successfully
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → ✅ Project Type: web (React frontend application)
   → ✅ Structure Decision: Option 2 (Web application with frontend focus)
3. Evaluate Constitution Check section below
   → ✅ Violations: None - follows React best practices
   → ✅ Update Progress Tracking: Initial Constitution Check
4. Execute Phase 0 → research.md
   → ✅ Research autoplay timing, accessibility patterns, reduced motion
5. Execute Phase 1 → contracts, data-model.md, quickstart.md, .github/copilot-instructions.md
6. Re-evaluate Constitution Check section
   → ✅ Update Progress Tracking: Post-Design Constitution Check
7. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
8. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Implementar autoplay inteligente no carrossel de serviços da homepage com controles de usuário completos, acessibilidade WCAG 2.1 AA e experiência suave que não interfere na usabilidade. O sistema atual já possui autoplay básico, mas precisa de melhorias para pausar adequadamente no hover, respeitar preferências de movimento reduzido e fornecer controles mais intuitivos.

## Technical Context
**Language/Version**: JavaScript ES2022, React 18.2.0
**Primary Dependencies**: React, Framer Motion 10.16.4, React Router DOM 6.16.0, Tailwind CSS 3.3.3
**Storage**: N/A (interface apenas, sem persistência)
**Testing**: Vitest, React Testing Library, existing test suite compatibility
**Target Platform**: Navegadores modernos (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
**Project Type**: web - React frontend application
**Performance Goals**: 60fps animações, transições < 300ms, sem layout shift
**Constraints**: WCAG 2.1 AA compliance, prefers-reduced-motion support, mobile-first design
**Scale/Scope**: Single component enhancement, 12 service cards, touch/mouse/keyboard support

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:
- Projects: 1 (frontend React component enhancement)
- Using framework directly? ✅ (React hooks, Framer Motion APIs directly)
- Single data model? ✅ (carousel state only)
- Avoiding patterns? ✅ (no Repository/UoW, direct component state)

**Architecture**:
- EVERY feature as library? ✅ (useAutoplayCarousel hook as reusable library)
- Libraries listed: useAutoplayCarousel (carousel autoplay logic)
- CLI per library: N/A (React component library)
- Library docs: Component API documentation planned

**Testing (NON-NEGOTIIBLE)**:
- RED-GREEN-Refactor cycle enforced? ✅ (tests fail first, then implement)
- Git commits show tests before implementation? ✅ (will be verified)
- Order: Contract→Integration→E2E→Unit strictly followed? ✅
- Real dependencies used? ✅ (real DOM, real timers in integration tests)
- Integration tests for: hover behavior, timing changes, accessibility
- FORBIDDEN: Implementation before test, skipping RED phase

**Observability**:
- Structured logging included? ✅ (console debugging for autoplay states)
- Frontend logs → backend? N/A (component-only feature)
- Error context sufficient? ✅ (autoplay state logging)

**Versioning**:
- Version number assigned? 2.1.0 (minor feature addition)
- BUILD increments on every change? ✅ (package.json version)
- Breaking changes handled? N/A (backward-compatible enhancement)

## Project Structure

### Documentation (this feature)
```
specs/001-autoplay-dos-cards/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Option 2: Web application (React frontend detected)
src/
├── components/
│   ├── Services.jsx         # Main component to enhance
│   └── ui/                  # Shared UI components
├── hooks/
│   └── useAutoplayCarousel.js # New autoplay logic hook
├── utils/
│   ├── scrollUtils.js       # Existing scroll utilities
│   └── accessibility.js    # Accessibility helpers
└── __tests__/
    ├── Services.test.jsx    # Component integration tests
    └── useAutoplayCarousel.test.js # Hook unit tests

tests/
├── integration/
│   └── autoplay-carousel.test.js # E2E autoplay scenarios
└── accessibility/
    └── reduced-motion.test.js     # Accessibility compliance tests
```

**Structure Decision**: Option 2 - Web application (React component enhancement in existing frontend structure)

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context**:
   - Timing intervals for autoplay (specified as NEEDS CLARIFICATION in spec)
   - Browser compatibility for `prefers-reduced-motion`
   - Performance impact of continuous autoplay
   - Accessibility best practices for carousel autoplay

2. **Generate and dispatch research agents**:
   ```
   Task: "Research optimal autoplay timing intervals for medical website carousels"
   Task: "Find best practices for accessible carousel autoplay with React and Framer Motion"
   Task: "Research prefers-reduced-motion browser support and implementation patterns"
   Task: "Evaluate performance impact of requestAnimationFrame vs setInterval for autoplay"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: Timing intervals and interaction patterns
   - Rationale: User experience and accessibility considerations
   - Alternatives considered: Different autoplay approaches

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - AutoplayState: isPlaying, currentIndex, timingConfig
   - CarouselController: play, pause, reset, configure
   - InteractionTracker: hover, manual navigation, touch events

2. **Generate API contracts** from functional requirements:
   - useAutoplayCarousel hook interface
   - CarouselConfig object schema
   - Event handlers specifications
   - Output hook API contracts to `/contracts/`

3. **Generate contract tests** from contracts:
   - Hook interface validation tests
   - Configuration option tests
   - Event handler contract tests
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - User hovers over card → autoplay pauses
   - User navigates manually → autoplay resets with delay
   - Reduced motion preference → autoplay disabled
   - Tab becomes inactive → autoplay pauses

5. **Update agent file incrementally**:
   - Run update script for GitHub Copilot instructions
   - Add React carousel autoplay patterns
   - Include accessibility considerations
   - Update with current feature context

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, .github/copilot-instructions.md

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Hook contract → contract test task [P]
- Component state model → state management task [P]
- User story scenarios → integration test tasks
- Accessibility compliance → a11y test tasks
- Implementation tasks to make tests pass

**Ordering Strategy**:
- TDD order: Tests before implementation
- Dependency order: Hook → Component → Integration
- Mark [P] for parallel execution (independent files)
- Accessibility tests run in parallel with functionality tests

**Estimated Output**: 15-20 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation (execute tasks.md following TDD principles)
**Phase 5**: Validation (run tests, execute quickstart.md, accessibility validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

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
- [x] Complexity deviations documented (none needed)

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*

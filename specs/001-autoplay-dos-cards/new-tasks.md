# Tasks: Autoplay do Carrossel de Serviços

**Input**: Design documents from `/home/saraiva-vision-site-v3/specs/001-autoplay-dos-cards/`
**Prerequisites**: plan.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

## Execution Flow (main)
```
1. Load plan.md from feature directory ✅
   → React 18.2.0 + Framer Motion frontend application
   → Structure: src/hooks/, src/components/, src/utils/
2. Load design documents ✅:
   → data-model.md: 5 entities (AutoplayState, AutoplayConfig, etc.)
   → contracts/: useAutoplayCarousel.md, Services-component.md
   → research.md: 4.5s intervals, prefers-reduced-motion support
   → quickstart.md: 6 validation scenarios
3. Generate tasks by category ✅:
   → Setup: dependencies, structure, linting
   → Tests: contract tests, integration tests (TDD)
   → Core: hooks, utilities, component enhancement
   → Integration: Services component integration, accessibility
   → Polish: unit tests, performance validation, docs
4. Apply task rules ✅:
   → Different files = [P] for parallel execution
   → Tests before implementation (TDD enforced)
   → Hook → Component → Integration order
5. Tasks numbered T001-T025 ✅
6. Dependencies mapped ✅
7. Parallel execution examples provided ✅
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Exact file paths included for all tasks

## Phase 3.1: Setup & Dependencies

### T001 Setup autoplay feature development environment
**Files**: Project structure initialization
**Dependencies**: None
**Description**: Create directory structure for autoplay hooks and utilities. Ensure branch `001-autoplay-dos-cards` is active and development server can run.
```bash
mkdir -p src/hooks src/utils/__tests__ src/components/__tests__
git status # verify on correct branch
npm install # ensure dependencies
npm run dev # verify server starts
```

### T002 [P] Configure TypeScript types for autoplay interfaces
**Files**: `src/types/autoplay.ts`
**Dependencies**: None
**Description**: Create TypeScript interface definitions for AutoplayState, AutoplayConfig, CarouselController and related types from data-model.md. This enables proper type checking during development.

### T003 [P] Setup test utilities for carousel testing
**Files**: `src/utils/__tests__/testUtils.js`
**Dependencies**: None
**Description**: Create shared test utilities including mock timers setup, media query mocking for prefers-reduced-motion, and viewport simulation helpers for carousel testing.

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### T004 [P] Contract test for useAutoplayCarousel hook interface
**Files**: `src/hooks/__tests__/useAutoplayCarousel.contract.test.js`
**Dependencies**: T003 (test utilities)
**Description**: Write failing contract tests based on `contracts/useAutoplayCarousel.md`. Test hook initialization, state management, navigation, event handlers, configuration, accessibility, and error handling contracts.

### T005 [P] Contract test for enhanced Services component API
**Files**: `src/components/__tests__/Services.contract.test.js`
**Dependencies**: T003 (test utilities)
**Description**: Write failing contract tests based on `contracts/Services-component.md`. Test backward compatibility, autoplay integration, configuration override, event handling, accessibility, responsive behavior, touch gestures, and reduced motion contracts.

### T006 [P] Integration test for basic autoplay functionality scenario
**Files**: `src/components/__tests__/Services.autoplay.integration.test.js`
**Dependencies**: T003 (test utilities)
**Description**: Test Scenario 1 from quickstart.md - autoplay starts automatically, advances every 4.5 seconds, smooth transitions, wraps around, with progress indicators. Must fail initially.

### T007 [P] Integration test for hover pause interaction scenario
**Files**: `src/components/__tests__/Services.hover.integration.test.js`
**Dependencies**: T003 (test utilities)
**Description**: Test Scenario 2 from quickstart.md - autoplay pauses on hover, no transitions while hovering, resumes after mouse leaves with proper timing reset. Must fail initially.

### T008 [P] Integration test for manual navigation override scenario
**Files**: `src/components/__tests__/Services.navigation.integration.test.js`
**Dependencies**: T003 (test utilities)
**Description**: Test Scenario 3 from quickstart.md - manual navigation works instantly, autoplay pauses during interaction, timer resets, keyboard navigation support. Must fail initially.

### T009 [P] Integration test for accessibility compliance scenario
**Files**: `src/components/__tests__/Services.accessibility.integration.test.js`
**Dependencies**: T003 (test utilities)
**Description**: Test Scenario 4 from quickstart.md - screen reader announcements, tab navigation, ARIA labels, prefers-reduced-motion support, focus management. Must fail initially.

### T010 [P] Integration test for mobile touch gestures scenario
**Files**: `src/components/__tests__/Services.touch.integration.test.js`
**Dependencies**: T003 (test utilities)
**Description**: Test Scenario 5 from quickstart.md - swipe gestures, touch pause behavior, proper touch targets, mobile responsiveness. Must fail initially.

### T011 [P] Integration test for performance validation scenario
**Files**: `src/components/__tests__/Services.performance.integration.test.js`
**Dependencies**: T003 (test utilities)
**Description**: Test Scenario 6 from quickstart.md - memory leak detection, 60fps consistency, no layout thrashing, minimal CPU usage, no console errors. Must fail initially.

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### T012 [P] Create useReducedMotion accessibility hook
**Files**: `src/hooks/useReducedMotion.js`
**Dependencies**: T004-T011 (all tests failing)
**Description**: Implement accessibility hook to detect `prefers-reduced-motion` media query changes. Based on research.md findings for 96%+ browser support with graceful fallback.

### T013 [P] Create usePageVisibility hook for tab state detection
**Files**: `src/hooks/usePageVisibility.js`
**Dependencies**: T004-T011 (all tests failing)
**Description**: Implement hook to detect tab visibility changes using Page Visibility API. Supports autoplay pause when tab becomes inactive per research.md recommendations.

### T014 [P] Create AutoplayTimer utility class
**Files**: `src/utils/autoplayTimer.js`
**Dependencies**: T004-T011 (all tests failing)
**Description**: Implement precise timer management with pause/resume capability using setTimeout + requestAnimationFrame hybrid approach from research.md performance analysis.

### T015 [P] Create InteractionTracker utility class
**Files**: `src/utils/interactionTracker.js`
**Dependencies**: T004-T011 (all tests failing)
**Description**: Implement user interaction tracking (hover, focus, touch, drag) with timestamps and state queries. Manages when autoplay should pause based on user activity.

### T016 Create useAutoplayCarousel main hook
**Files**: `src/hooks/useAutoplayCarousel.js`
**Dependencies**: T012, T013, T014, T015 (supporting utilities)
**Description**: Implement core autoplay carousel hook using useReducer for state management. Integrate all utilities, provide complete API interface, handle all state transitions from data-model.md.

### T017 Add autoplay state reducer logic
**Files**: `src/hooks/useAutoplayCarousel.js` (continued)
**Dependencies**: T016 (hook structure exists)
**Description**: Implement autoplay state reducer with all transitions: IDLE→PLAYING→PAUSED→DISABLED. Handle user interactions, timer events, configuration changes, and accessibility state updates.

### T018 Add autoplay event handlers and controls
**Files**: `src/hooks/useAutoplayCarousel.js` (continued)
**Dependencies**: T017 (reducer implemented)
**Description**: Implement navigation controls (play, pause, next, previous, goTo), event handlers for DOM binding (mouse, touch, keyboard), and progress tracking functionality.

### T019 Enhance Services component with autoplay integration
**Files**: `src/components/Services.jsx`
**Dependencies**: T016, T017, T018 (complete hook)
**Description**: Integrate useAutoplayCarousel hook into existing Services component maintaining backward compatibility. Add new props (autoplay, autoplayConfig, onSlideChange) while preserving all existing functionality.

### T020 Add autoplay UI controls and indicators to Services
**Files**: `src/components/Services.jsx` (continued)
**Dependencies**: T019 (basic integration)
**Description**: Add visual autoplay controls (play/pause button if needed), progress indicators, accessibility attributes (aria-live, labels), and proper data attributes for testing.

### T021 Add touch and keyboard navigation support
**Files**: `src/components/Services.jsx` (continued)
**Dependencies**: T020 (UI controls added)
**Description**: Implement touch gesture support using Framer Motion drag handlers, keyboard navigation (Arrow keys, Tab, Space), and proper focus management with accessibility considerations.

## Phase 3.4: Integration & Accessibility

### T022 Add i18n translation keys for autoplay controls
**Files**: `public/locales/pt/common.json`, `public/locales/en/common.json`
**Dependencies**: T019, T020, T021 (component complete)
**Description**: Add translation keys for autoplay controls, accessibility announcements, screen reader labels, error messages. Support both Portuguese (primary) and English (secondary) as per project requirements.

### T023 Integrate autoplay with existing scroll utilities
**Files**: `src/components/Services.jsx` (integration)
**Dependencies**: T021 (navigation implemented), T022 (i18n ready)
**Description**: Ensure autoplay works harmoniously with existing scrollUtils.js smooth scrolling, maintains proper scroll position during transitions, and handles edge cases with manual scrolling.

### T024 Add comprehensive error boundaries and logging
**Files**: `src/components/Services.jsx` (error handling)
**Dependencies**: T023 (scroll integration)
**Description**: Add error boundary around autoplay functionality, structured logging for state changes and user interactions, graceful degradation when autoplay fails, proper error reporting without sensitive data exposure.

## Phase 3.5: Polish & Validation

### T025 [P] Add unit tests for autoplay utilities
**Files**: `src/utils/__tests__/autoplayTimer.test.js`, `src/utils/__tests__/interactionTracker.test.js`
**Dependencies**: T014, T015 (utilities implemented)
**Description**: Comprehensive unit tests for AutoplayTimer and InteractionTracker classes. Test edge cases, timing precision, memory cleanup, error conditions, and boundary values.

## Dependencies

### Critical Path (must be sequential)
1. **Setup** (T001-T003) → **Tests** (T004-T011) → **Implementation** (T012-T024) → **Polish** (T025)
2. **Hook Dependencies**: T012,T013,T014,T015 → T016 → T017 → T018 → T019 → T020 → T021
3. **Integration Dependencies**: T019,T020,T021 → T022 → T023 → T024

### Parallel Opportunities
- **Setup Phase**: T002 ∥ T003
- **Test Phase**: T004 ∥ T005 ∥ T006 ∥ T007 ∥ T008 ∥ T009 ∥ T010 ∥ T011
- **Utility Phase**: T012 ∥ T013 ∥ T014 ∥ T015

## Parallel Execution Examples

### Phase 3.2: All contract and integration tests together
```bash
# Launch T004-T011 in parallel (all different files):
Task: "Contract test for useAutoplayCarousel hook interface in src/hooks/__tests__/useAutoplayCarousel.contract.test.js"
Task: "Contract test for enhanced Services component API in src/components/__tests__/Services.contract.test.js"
Task: "Integration test for basic autoplay functionality in src/components/__tests__/Services.autoplay.integration.test.js"
Task: "Integration test for hover pause interaction in src/components/__tests__/Services.hover.integration.test.js"
Task: "Integration test for manual navigation override in src/components/__tests__/Services.navigation.integration.test.js"
Task: "Integration test for accessibility compliance in src/components/__tests__/Services.accessibility.integration.test.js"
Task: "Integration test for mobile touch gestures in src/components/__tests__/Services.touch.integration.test.js"
Task: "Integration test for performance validation in src/components/__tests__/Services.performance.integration.test.js"
```

### Phase 3.3: Utility classes in parallel
```bash
# Launch T012-T015 in parallel (all different files):
Task: "Create useReducedMotion accessibility hook in src/hooks/useReducedMotion.js"
Task: "Create usePageVisibility hook in src/hooks/usePageVisibility.js"
Task: "Create AutoplayTimer utility class in src/utils/autoplayTimer.js"
Task: "Create InteractionTracker utility class in src/utils/interactionTracker.js"
```

## Task Validation Checklist
*GATE: All items verified before task execution*

✅ **All contracts have corresponding tests**: T004 (useAutoplayCarousel), T005 (Services component)
✅ **All entities have implementation tasks**: AutoplayState/Config (T016-T018), Timer (T014), Tracker (T015)
✅ **All tests come before implementation**: T004-T011 before T012-T024
✅ **Parallel tasks are truly independent**: Different files, no shared state
✅ **Each task specifies exact file path**: All tasks include full file paths
✅ **No task modifies same file as another [P] task**: Verified no conflicts
✅ **TDD cycle enforced**: Tests must fail before implementation
✅ **All quickstart scenarios covered**: 6 scenarios = 6 integration tests (T006-T011)

## Notes
- **TDD CRITICAL**: All tests T004-T011 MUST fail before starting T012
- **Performance Target**: <5KB bundle increase, 60fps animations, <300ms transitions
- **Accessibility**: WCAG 2.1 AA compliance enforced in T009, T022, T024
- **Browser Support**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ (per plan.md)
- **Commit Strategy**: Commit after each task completion for atomic changes

## Success Criteria
1. All 25 tasks completed successfully
2. All tests passing (red → green → refactor cycle followed)
3. Manual validation scenarios pass in multiple browsers
4. Performance targets met (60fps, <5KB bundle, <300ms transitions)
5. Accessibility audit passes WCAG 2.1 AA
6. Backward compatibility maintained with existing Services component
7. Feature works seamlessly with prefers-reduced-motion
8. Touch gestures work on mobile devices
9. No console errors or memory leaks detected
10. Documentation updated and quickstart.md validated

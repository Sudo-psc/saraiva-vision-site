# Tasks: Next.js Migration with Dynamic SEO

**Input**: Design documents from `/specs/005-nextjs-migration-dynamic-seo/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/, quickstart.md

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Extract: Next.js 14, TypeScript, Tailwind CSS, WordPress integration
2. Load design documents:
   → data-model.md: Extract entities (PageMetadata, ServicePage, BlogPost, SEOConfig)
   → contracts/api.yaml: Extract endpoints (posts, services, pages, SEO)
   → research.md: Extract decisions (Next.js 14, App Router, SEO strategy)
   → quickstart.md: Extract implementation patterns
3. Generate tasks by category:
   → Setup: Next.js project, dependencies, configuration
   → Tests: contract tests, integration tests, E2E tests
   → Core: WordPress client, SEO components, data models
   → Integration: API routes, pages, layout components
   → Polish: performance, accessibility, testing
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Web application**: `frontend/src/`, `backend/` (from plan.md structure)
- **Next.js App Router**: `frontend/src/app/`, `frontend/src/components/`
- **WordPress integration**: `frontend/src/lib/wordpress/`
- **Tests**: `frontend/tests/contract/`, `frontend/tests/integration/`

## Phase 3.1: Infrastructure Setup
- [ ] T001 Create Next.js project with TypeScript and Tailwind CSS
- [ ] T002 [P] Install dependencies (next-sitemap, schema-dts, @heroicons/react)
- [ ] T003 [P] Configure Next.js (images, rewrites, headers, environment)
- [ ] T004 [P] Setup Tailwind CSS with medical theme colors and fonts
- [ ] T005 [P] Configure TypeScript and ESLint for Next.js project

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T006 [P] Contract test GET /api/posts in tests/contract/test_posts_api.py
- [ ] T007 [P] Contract test GET /api/posts/{slug} in tests/contract/test_post_detail.py
- [ ] T008 [P] Contract test GET /api/services in tests/contract/test_services_api.py
- [ ] T009 [P] Contract test GET /api/services/{slug} in tests/contract/test_service_detail.py
- [ ] T010 [P] Contract test GET /api/pages in tests/contract/test_pages_api.py
- [ ] T011 [P] Contract test GET /api/seo/metadata in tests/contract/test_seo_metadata.py
- [ ] T012 [P] Integration test WordPress client connectivity in tests/integration/test_wordpress_client.py
- [ ] T013 [P] Integration test SEO metadata generation in tests/integration/test_seo_generation.py
- [ ] T014 [P] Integration test sitemap generation in tests/integration/test_sitemap.py

## Phase 3.3: Data Layer Implementation (ONLY after tests are failing)
- [ ] T015 [P] WordPress client class in frontend/src/lib/wordpress/client.ts
- [ ] T016 [P] TypeScript interfaces in frontend/src/types/index.ts
- [ ] T017 [P] Page metadata utilities in frontend/src/lib/seo/metadata.ts
- [ ] T018 [P] SEO configuration utilities in frontend/src/lib/seo/config.ts
- [ ] T019 [P] Structured data components in frontend/src/components/seo/StructuredData.tsx
- [ ] T020 [P] WordPress API data transformers in frontend/src/lib/wordpress/transformers.ts

## Phase 3.4: SEO Core Implementation
- [ ] T021 [P] SEO metadata component in frontend/src/components/seo/Metadata.tsx
- [ ] T022 [P] Generate SEO metadata function in frontend/src/lib/seo/generateMetadata.ts
- [ ] T023 [P] Dynamic sitemap configuration in next-sitemap.config.js
- [ ] T024 [P] Robots.txt generation in frontend/src/lib/seo/robots.ts
- [ ] T025 [P] Open Graph and Twitter Card components in frontend/src/components/seo/SocialTags.tsx
- [ ] T026 [P] Canonical URL management in frontend/src/lib/seo/canonical.ts

## Phase 3.5: Layout Components
- [ ] T027 [P] Root layout component in frontend/src/app/layout.tsx
- [ ] T028 [P] Header component with navigation in frontend/src/components/layout/Header.tsx
- [ ] T029 [P] Footer component in frontend/src/components/layout/Footer.tsx
- [ ] T030 [P] Navigation menu component in frontend/src/components/layout/Navigation.tsx
- [ ] T031 [P] SEO head component in frontend/src/components/seo/SEOHead.tsx

## Phase 3.6: Page Implementation
- [ ] T032 [P] Home page in frontend/src/app/(pages)/page.tsx
- [ ] T033 [P] Services listing page in frontend/src/app/(pages)/servicos/page.tsx
- [ ] T034 [P] Service detail page in frontend/src/app/(pages)/servicos/[slug]/page.tsx
- [ ] T035 [P] Blog listing page in frontend/src/app/(pages)/blog/page.tsx
- [ ] T036 [P] Blog post detail page in frontend/src/app/(pages)/blog/[slug]/page.tsx
- [ ] T037 [P] About page in frontend/src/app/(pages)/sobre/page.tsx
- [ ] T038 [P] Contact page in frontend/src/app/(pages)/contato/page.tsx

## Phase 3.7: API Routes Implementation
- [ ] T039 [P] Posts API proxy in frontend/src/app/api/posts/route.ts
- [ ] T040 [P] Single post API proxy in frontend/src/app/api/posts/[slug]/route.ts
- [ ] T041 [P] Services API proxy in frontend/src/app/api/services/route.ts
- [ ] T042 [P] Single service API proxy in frontend/src/app/api/services/[slug]/route.ts
- [ ] T043 [P] Pages API proxy in frontend/src/app/api/pages/route.ts
- [ ] T044 [P] SEO metadata API in frontend/src/app/api/seo/metadata/route.ts
- [ ] T045 [P] Health check API in frontend/src/app/api/health/route.ts

## Phase 3.8: Integration and Polish
- [ ] T046 [P] Unit tests for SEO components in frontend/tests/unit/test_seo_components.py
- [ ] T047 [P] Unit tests for WordPress client in frontend/tests/unit/test_wordpress_client.py
- [ ] T048 [P] E2E tests for page navigation in frontend/tests/e2e/test_navigation.py
- [ ] T049 [P] Performance tests (<2s page load) in frontend/tests/performance/test_load_time.py
- [ ] T050 [P] Accessibility tests (WCAG 2.1) in frontend/tests/accessibility/test_wcag.py
- [ ] T051 [P] SEO validation tests in frontend/tests/seo/test_metadata_validation.py

## Dependencies
- Tests (T006-T014) before implementation (T015-T051)
- Data layer (T015-T020) blocks SEO core (T021-T026)
- Layout (T027-T031) blocks pages (T032-T038)
- SEO core (T021-T026) blocks page implementation (T032-T038)
- All implementation before polish (T046-T051)

## Parallel Example: Contract Tests (Phase 3.2)
```
# Launch T006-T014 together (all different files, no dependencies):
Task: "Contract test GET /api/posts in tests/contract/test_posts_api.py"
Task: "Contract test GET /api/posts/{slug} in tests/contract/test_post_detail.py"
Task: "Contract test GET /api/services in tests/contract/test_services_api.py"
Task: "Contract test GET /api/services/{slug} in tests/contract/test_service_detail.py"
Task: "Contract test GET /api/pages in tests/contract/test_pages_api.py"
Task: "Contract test GET /api/seo/metadata in tests/contract/test_seo_metadata.py"
Task: "Integration test WordPress client connectivity in tests/integration/test_wordpress_client.py"
Task: "Integration test SEO metadata generation in tests/integration/test_seo_generation.py"
Task: "Integration test sitemap generation in tests/integration/test_sitemap.py"
```

## Parallel Example: Data Layer (Phase 3.3)
```
# Launch T015-T020 together (all different files, no dependencies):
Task: "WordPress client class in frontend/src/lib/wordpress/client.ts"
Task: "TypeScript interfaces in frontend/src/types/index.ts"
Task: "Page metadata utilities in frontend/src/lib/seo/metadata.ts"
Task: "SEO configuration utilities in frontend/src/lib/seo/config.ts"
Task: "Structured data components in frontend/src/components/seo/StructuredData.tsx"
Task: "WordPress API data transformers in frontend/src/lib/wordpress/transformers.ts"
```

## Parallel Example: SEO Core (Phase 3.4)
```
# Launch T021-T026 together (all different files, no dependencies):
Task: "SEO metadata component in frontend/src/components/seo/Metadata.tsx"
Task: "Generate SEO metadata function in frontend/src/lib/seo/generateMetadata.ts"
Task: "Dynamic sitemap configuration in next-sitemap.config.js"
Task: "Robots.txt generation in frontend/src/lib/seo/robots.ts"
Task: "Open Graph and Twitter Card components in frontend/src/components/seo/SocialTags.tsx"
Task: "Canonical URL management in frontend/src/lib/seo/canonical.ts"
```

## Critical Path
**Must be sequential (no [P] marking)**:
1. T001 (project creation) → T002-T005 (configuration)
2. T006-T014 (tests) → T015-T051 (implementation)
3. T027 (root layout) → T028-T031 (other layout components)
4. T021-T026 (SEO core) → T032-T038 (page implementation)

## Task Generation Rules Applied

### From Contracts (api.yaml):
- Each endpoint → contract test task [P] (T006-T011)
- Each API schema → implementation task (T039-T045)

### From Data Model:
- Each entity → model creation task [P] (T016-T018)
- Each structured data type → component task [P] (T019)

### From User Stories:
- Each user story → integration test [P] (T012-T014)
- Quickstart scenarios → validation tasks (T049-T051)

### From Research/Quickstart:
- Technical decisions → setup tasks (T001-T005)
- Implementation patterns → component tasks (T021-T038)

## Validation Checklist
- [x] All contracts have corresponding tests (T006-T011)
- [x] All entities have model tasks (T016-T018)
- [x] All tests come before implementation
- [x] Parallel tasks truly independent
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task

## Implementation Notes

### WordPress Integration
- Use Application Passwords for authentication
- Handle CORS properly with Next.js rewrites
- Cache API responses for performance
- Handle WordPress-specific field mappings

### SEO Implementation
- Prioritize Next.js built-in SEO features
- Implement dynamic metadata generation
- Use JSON-LD for structured data
- Generate sitemaps automatically
- Support Portuguese content primarily

### Performance Targets
- Page load time: <2 seconds
- Lighthouse SEO score: 90+
- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- Mobile-first optimization required

### Success Criteria
- All tests pass (contract, integration, E2E)
- SEO metadata generates correctly
- Sitemap includes all pages
- Structured data validates with Google tool
- Performance benchmarks met

## Quality Gates
- All contract tests must fail before implementation
- TypeScript must have no errors
- ESLint must pass with no warnings
- Accessibility tests must pass WCAG 2.1 AA
- SEO validation must pass all checks
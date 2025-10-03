# Next.js Multi-Profile Migration - Detailed Task Breakdown

**Project:** Saraiva Vision Next.js Migration + Multi-Profile System
**Timeline:** 13 weeks (91 days)
**Team:** 2 Full-Time Developers
**Last Updated:** October 2025

---

## Task Notation

```
[TASK-XXX] Task Title
Priority: P0 (Critical) | P1 (High) | P2 (Medium) | P3 (Low)
Effort: X days
Assignee: Dev1 | Dev2 | Both
Dependencies: [TASK-XXX, TASK-XXX]
Deliverable: Description
Acceptance Criteria: Numbered list
```

---

## WEEK 1: Setup & POC (Days 1-7)

### Phase 0.1: Environment Setup

**[TASK-001] Create Next.js 14+ Project**
- **Priority:** P0
- **Effort:** 0.5 days
- **Assignee:** Dev1
- **Dependencies:** None
- **Deliverable:** Next.js project initialized with App Router
- **Acceptance Criteria:**
  1. `npx create-next-app@latest` executed successfully
  2. TypeScript strict mode enabled
  3. Tailwind CSS configured
  4. Project builds without errors
  5. Development server runs on port 3000

**[TASK-002] Configure TypeScript & ESLint**
- **Priority:** P0
- **Effort:** 0.5 days
- **Assignee:** Dev1
- **Dependencies:** [TASK-001]
- **Deliverable:** TypeScript strict configuration + ESLint rules
- **Acceptance Criteria:**
  1. `tsconfig.json` with strict: true
  2. Path aliases (@/) configured
  3. ESLint extends Next.js recommended
  4. No TypeScript errors in sample files
  5. Pre-commit hooks configured (Husky)

**[TASK-003] Setup Tailwind with Multi-Theme Support**
- **Priority:** P0
- **Effort:** 1 day
- **Assignee:** Dev2
- **Dependencies:** [TASK-001]
- **Deliverable:** Tailwind configuration with 3 theme variants
- **Acceptance Criteria:**
  1. `tailwind.config.js` with custom themes
  2. CSS variables for colors (Familiar, Jovem, Sênior)
  3. Typography plugin configured
  4. Responsive breakpoints defined
  5. Dark mode disabled (healthcare context)

**[TASK-004] Implement Basic Middleware Structure**
- **Priority:** P0
- **Effort:** 1 day
- **Assignee:** Dev1
- **Dependencies:** [TASK-001]
- **Deliverable:** Edge middleware skeleton with routing
- **Acceptance Criteria:**
  1. `middleware.ts` created at project root
  2. Basic profile detection logic (cookie-based)
  3. Redirect from `/` to `/familiar` (default)
  4. Middleware config with matchers
  5. No performance degradation (<50ms execution)

**[TASK-005] Setup Testing Infrastructure**
- **Priority:** P1
- **Effort:** 1 day
- **Assignee:** Dev2
- **Dependencies:** [TASK-001, TASK-002]
- **Deliverable:** Jest + React Testing Library + Playwright
- **Acceptance Criteria:**
  1. `jest.config.js` with Next.js preset
  2. `@testing-library/react` installed
  3. Playwright configured for E2E tests
  4. Sample unit test passing
  5. Sample E2E test passing
  6. Coverage threshold: 80% minimum

**[TASK-006] Create POC - Familiar Profile Layout**
- **Priority:** P1
- **Effort:** 2 days
- **Assignee:** Both
- **Dependencies:** [TASK-003, TASK-004]
- **Deliverable:** Single working profile layout
- **Acceptance Criteria:**
  1. `/familiar/page.tsx` renders successfully
  2. `FamiliarNav` component functional
  3. Theme colors applied correctly
  4. Responsive design (mobile-first)
  5. Basic SEO metadata present
  6. Lighthouse score ≥ 85

**[TASK-007] Setup CI/CD Pipeline**
- **Priority:** P1
- **Effort:** 1 day
- **Assignee:** Dev1
- **Dependencies:** [TASK-005]
- **Deliverable:** GitHub Actions workflow
- **Acceptance Criteria:**
  1. `.github/workflows/ci.yml` created
  2. Runs on PR and main branch push
  3. Executes: lint, typecheck, test, build
  4. Lighthouse CI integration
  5. Bundle size check (<200KB gate)
  6. Deployment preview on Vercel

---

## WEEK 2-5: Base Migration (Days 8-35)

### Phase 1.1: Component Migration (Week 2)

**[TASK-101] Audit & Categorize 101 Components**
- **Priority:** P0
- **Effort:** 1 day
- **Assignee:** Both
- **Dependencies:** [TASK-006]
- **Deliverable:** Component migration spreadsheet
- **Acceptance Criteria:**
  1. All 101 components listed with categorization
  2. Server vs Client component classification
  3. Dependencies mapped
  4. Migration complexity rating (Low/Med/High)
  5. Priority order determined

**[TASK-102] Migrate UI Components (30 components)**
- **Priority:** P0
- **Effort:** 3 days
- **Assignee:** Dev2
- **Dependencies:** [TASK-101]
- **Deliverable:** Core UI components in Next.js
- **Components:**
  - Button, Card, Modal, Toast, Dropdown
  - Input, Label, Checkbox, Radio, Select
  - Dialog, Tabs, Accordion, Badge, Avatar
  - Alert, Progress, Skeleton, Spinner, Tooltip
  - All Radix UI components
- **Acceptance Criteria:**
  1. All components use `'use client'` directive
  2. TypeScript interfaces defined
  3. Storybook stories created (optional)
  4. Unit tests passing (≥80% coverage)
  5. No PropTypes (use TypeScript)
  6. Tailwind classes only (no inline styles)

**[TASK-103] Migrate Compliance Components (8 components)**
- **Priority:** P0
- **Effort:** 2 days
- **Assignee:** Dev1
- **Dependencies:** [TASK-102]
- **Deliverable:** CFM/LGPD compliance components
- **Components:**
  - CFMCompliance, CFMDisclaimer, LGPDConsent
  - CookieBanner, PrivacyNotice, DataProcessor
  - AuditLogger, ComplianceValidator
- **Acceptance Criteria:**
  1. Medical disclaimers render correctly
  2. LGPD consent flow functional
  3. Cookie banner persists consent
  4. Audit logging integrated
  5. Compliance validation active
  6. Zod schemas for data validation

**[TASK-104] Migrate Navigation Components (5 components)**
- **Priority:** P0
- **Effort:** 2 days
- **Assignee:** Dev1
- **Dependencies:** [TASK-102]
- **Deliverable:** Navigation components with Next.js Link
- **Components:**
  - Navbar, Footer, Sidebar, Breadcrumbs, MobileMenu
- **Acceptance Criteria:**
  1. React Router Link → Next.js Link
  2. `useNavigate` → `useRouter` (next/navigation)
  3. Active link styling working
  4. Responsive mobile menu
  5. Accessibility (keyboard navigation)
  6. No hydration errors

**[TASK-105] Migrate Feature Components (30 components)**
- **Priority:** P1
- **Effort:** 4 days
- **Assignee:** Both
- **Dependencies:** [TASK-102, TASK-103]
- **Deliverable:** Business logic components
- **Components:**
  - AppointmentBooking, ContactFormEnhanced
  - GoogleReviews, CompactServices
  - BlogList, BlogPost, PodcastPlayer
  - ServiceCard, ServiceDetail, FAQAccordion
  - Instagram feed, Testimonials, CTA modals
  - About, Certificates, Team, Stats
- **Acceptance Criteria:**
  1. Server components where possible
  2. Client components only when interactive
  3. Data fetching via Server Components
  4. Forms use Server Actions
  5. No react-helmet (use Metadata API)
  6. Images use next/image

### Phase 1.2: Hooks & Utilities Migration (Week 3)

**[TASK-106] Migrate Custom Hooks (47 hooks)**
- **Priority:** P1
- **Effort:** 3 days
- **Assignee:** Dev2
- **Dependencies:** [TASK-102]
- **Deliverable:** All hooks migrated to Next.js patterns
- **Key Hooks:**
  - useSEO → Metadata API
  - useRouter → next/navigation
  - useLocation → usePathname/useSearchParams
  - useScrollRestoration → layout scroll prop
  - useGoogleMaps, useAnalytics, useToast
  - useMediaQuery, useDebounce, useLocalStorage
- **Acceptance Criteria:**
  1. Server-side compatible where possible
  2. Client hooks marked with 'use client'
  3. TypeScript strict mode compliant
  4. Unit tests passing
  5. No React Router dependencies
  6. Documentation updated

**[TASK-107] Migrate Utility Functions (33 utils)**
- **Priority:** P1
- **Effort:** 2 days
- **Assignee:** Dev1
- **Dependencies:** [TASK-106]
- **Deliverable:** Pure utility functions
- **Key Utils:**
  - schemaMarkup.js → Server-side generation
  - cfmValidation.js, lgpdHelpers.js
  - formatters, validators, sanitizers
  - date utils, string utils, cache helpers
  - API clients, error handlers
- **Acceptance Criteria:**
  1. Tree-shakeable exports
  2. No browser-only APIs in server utils
  3. Zod schemas for validation
  4. TypeScript strict types
  5. Unit tests ≥90% coverage
  6. Edge-compatible functions

**[TASK-108] Setup Data Fetching Layer**
- **Priority:** P0
- **Effort:** 2 days
- **Assignee:** Dev1
- **Dependencies:** [TASK-107]
- **Deliverable:** Unified data fetching with caching
- **Acceptance Criteria:**
  1. Server Components use async/await
  2. `fetch()` with Next.js cache options
  3. ISR configuration per route
  4. Error boundaries implemented
  5. Loading states with Suspense
  6. Revalidation strategies documented

### Phase 1.3: Pages & Routing Migration (Week 4)

**[TASK-109] Migrate Static Pages (4 pages)**
- **Priority:** P0
- **Effort:** 2 days
- **Assignee:** Dev2
- **Dependencies:** [TASK-104, TASK-105]
- **Deliverable:** Static pages with SSG
- **Pages:**
  - `/sobre` → `app/sobre/page.tsx`
  - `/lentes` → `app/lentes/page.tsx`
  - `/faq` → `app/faq/page.tsx`
  - `/privacy` → `app/privacy/page.tsx`
- **Acceptance Criteria:**
  1. Metadata API for SEO
  2. Static generation enabled
  3. Schema.org markup embedded
  4. Open Graph tags correct
  5. Responsive design verified
  6. Lighthouse ≥90

**[TASK-110] Migrate Services Pages (2 pages)**
- **Priority:** P0
- **Effort:** 2 days
- **Assignee:** Dev1
- **Dependencies:** [TASK-108]
- **Deliverable:** Services listing + detail pages
- **Pages:**
  - `/servicos` → `app/servicos/page.tsx`
  - `/servicos/:id` → `app/servicos/[serviceId]/page.tsx`
- **Acceptance Criteria:**
  1. generateStaticParams() implemented
  2. ISR with 1h revalidation
  3. Dynamic metadata generation
  4. Service data from static JSON
  5. SEO optimized per service
  6. Related services section

**[TASK-111] Migrate Blog System**
- **Priority:** P0
- **Effort:** 3 days
- **Assignee:** Both
- **Dependencies:** [TASK-108]
- **Deliverable:** Full blog with Markdown support
- **Pages:**
  - `/blog` → `app/blog/page.tsx`
  - `/blog/:slug` → `app/blog/[slug]/page.tsx`
- **Implementation:**
  1. Convert blogPosts.js → Markdown files
  2. Use gray-matter for frontmatter
  3. marked.js for rendering
  4. CFM compliance warnings
  5. Author cards with CRM
  6. Category/tag filtering
  7. Search functionality (client-side)
  8. RSS feed generation
- **Acceptance Criteria:**
  1. All 99 posts migrated to Markdown
  2. Frontmatter validated (Zod)
  3. generateStaticParams() for all posts
  4. ISR 24h revalidation
  5. Rich snippets (Article schema)
  6. Cover images optimized (WebP)
  7. Reading time calculation
  8. Social sharing buttons

**[TASK-112] Migrate Podcast Pages**
- **Priority:** P1
- **Effort:** 2 days
- **Assignee:** Dev2
- **Dependencies:** [TASK-105, TASK-111]
- **Deliverable:** Podcast listing + episode pages
- **Pages:**
  - `/podcast` → `app/podcast/page.tsx`
  - `/podcast/:slug` → `app/podcast/[slug]/page.tsx`
- **Acceptance Criteria:**
  1. Spotify embed players
  2. Episode metadata (Podcast schema)
  3. Transcript support
  4. Episode navigation
  5. RSS podcast feed
  6. Apple Podcasts integration

### Phase 1.4: API Routes Migration (Week 5)

**[TASK-113] Migrate Google Reviews API**
- **Priority:** P0
- **Effort:** 1 day
- **Assignee:** Dev1
- **Dependencies:** [TASK-108]
- **Deliverable:** API route with Edge runtime
- **Route:** `app/api/google-reviews/route.ts`
- **Acceptance Criteria:**
  1. Edge runtime enabled
  2. Rate limiting (30 req/min)
  3. Response caching (30min)
  4. Error handling robust
  5. Zod validation
  6. TypeScript strict
  7. Fallback data on API failure

**[TASK-114] Migrate Analytics API**
- **Priority:** P1
- **Effort:** 1 day
- **Assignee:** Dev1
- **Dependencies:** [TASK-113]
- **Deliverable:** Analytics tracking endpoint
- **Route:** `app/api/analytics/route.ts`
- **Acceptance Criteria:**
  1. PostHog integration
  2. LGPD consent check
  3. Event validation
  4. Anonymous tracking
  5. No PII collection
  6. CORS configured

**[TASK-115] Create Health Check Endpoint**
- **Priority:** P2
- **Effort:** 0.5 days
- **Assignee:** Dev2
- **Dependencies:** [TASK-113]
- **Deliverable:** Health monitoring route
- **Route:** `app/api/health/route.ts`
- **Acceptance Criteria:**
  1. Returns JSON status
  2. Checks database connection (if any)
  3. Checks external APIs
  4. Response time <100ms
  5. Used by deployment scripts

**[TASK-116] Test Suite - Phase 1**
- **Priority:** P0
- **Effort:** 2 days
- **Assignee:** Both
- **Dependencies:** All Phase 1 tasks
- **Deliverable:** Comprehensive test coverage
- **Acceptance Criteria:**
  1. Unit tests ≥80% coverage
  2. Integration tests for data fetching
  3. E2E tests for critical flows
  4. Accessibility tests (axe-core)
  5. Performance tests (Lighthouse CI)
  6. All tests passing in CI

---

## WEEK 6-8: Multi-Profile System (Days 36-56)

### Phase 2.1: Profile Detection & Middleware (Week 6)

**[TASK-201] Implement Advanced Edge Middleware**
- **Priority:** P0
- **Effort:** 2 days
- **Assignee:** Dev1
- **Dependencies:** [TASK-004, TASK-116]
- **Deliverable:** Production-ready middleware
- **Features:**
  1. Query parameter detection (?profile=)
  2. Cookie persistence (1 year)
  3. User-Agent analysis
  4. Geolocation-based routing (optional)
  5. A/B testing support
- **Acceptance Criteria:**
  1. Execution time <50ms
  2. Handles 1000+ req/s
  3. Fallback to 'familiar' on error
  4. Comprehensive logging
  5. Unit tests 100% coverage
  6. E2E tests for all paths

**[TASK-202] Create Profile Detection Library**
- **Priority:** P0
- **Effort:** 1 day
- **Assignee:** Dev1
- **Dependencies:** [TASK-201]
- **Deliverable:** `lib/profile-detector.ts`
- **Acceptance Criteria:**
  1. Detect from User-Agent
  2. Machine learning scoring (optional)
  3. Cookie utilities
  4. Profile validation
  5. Type-safe enums
  6. Documented API

**[TASK-203] Implement Profile Selector Component**
- **Priority:** P1
- **Effort:** 1 day
- **Assignee:** Dev2
- **Dependencies:** [TASK-202]
- **Deliverable:** Manual profile switcher UI
- **Acceptance Criteria:**
  1. Dropdown with 3 options
  2. Updates cookie
  3. Client-side navigation
  4. Smooth transitions
  5. Accessible (WCAG AA)
  6. Visible on all pages

**[TASK-204] Setup Theme Configuration System**
- **Priority:** P0
- **Effort:** 2 days
- **Assignee:** Dev2
- **Dependencies:** [TASK-003]
- **Deliverable:** `lib/theme-config.ts` with design tokens
- **Themes:**
  - **Familiar:** Blue (#0066CC), Green (#00A86B), Yellow (#FFB900)
  - **Jovem:** Coral (#FF6B6B), Turquoise (#4ECDC4), Gradients
  - **Sênior:** Navy (#1A5490), Black (#000), White (#FFF)
- **Acceptance Criteria:**
  1. TypeScript const assertions
  2. CSS variables generation
  3. Tailwind integration
  4. Type-safe theme access
  5. Dark mode disabled
  6. Contrast ratios validated

### Phase 2.2: Profile Layouts & Navigation (Week 7)

**[TASK-205] Create Familiar Layout**
- **Priority:** P0
- **Effort:** 2 days
- **Assignee:** Dev1
- **Dependencies:** [TASK-204]
- **Deliverable:** `app/familiar/layout.tsx`
- **Features:**
  1. Root layout with theme
  2. Navigation: Prevenção, Exames, Planos, Dúvidas
  3. Footer with contact CTA
  4. Breadcrumbs component
  5. Responsive design
- **Acceptance Criteria:**
  1. Theme colors applied
  2. Icons 80% family-themed
  3. Comfortable spacing (1.5rem)
  4. Font size 16px
  5. SEO metadata
  6. Lighthouse ≥90

**[TASK-206] Create Jovem Layout**
- **Priority:** P0
- **Effort:** 2 days
- **Assignee:** Dev2
- **Dependencies:** [TASK-204]
- **Deliverable:** `app/jovem/layout.tsx`
- **Features:**
  1. Animated hero section
  2. Navigation: Assinatura, Tech, Lentes, Óculos, App
  3. Gradient backgrounds
  4. Framer Motion transitions
  5. Mobile-first responsive
- **Acceptance Criteria:**
  1. 60fps animations
  2. Vibrant gradients
  3. Modern typography
  4. PWA icons
  5. Fast transitions (<200ms)
  6. Bundle impact <50KB

**[TASK-207] Create Sênior Layout**
- **Priority:** P0
- **Effort:** 2 days
- **Assignee:** Dev1
- **Dependencies:** [TASK-204]
- **Deliverable:** `app/senior/layout.tsx`
- **Features:**
  1. High contrast theme
  2. Navigation: Catarata, Glaucoma, Cirurgias, A11y
  3. Large touch targets (44x44px)
  4. Font size adjuster
  5. Skip links
- **Acceptance Criteria:**
  1. WCAG AAA contrast (7:1)
  2. Font 18px base, 24px max
  3. Keyboard navigation 100%
  4. No animations
  5. ARIA complete
  6. Screen reader tested (NVDA)

**[TASK-208] Implement Navigation Components**
- **Priority:** P0
- **Effort:** 1 day
- **Assignee:** Both
- **Dependencies:** [TASK-205, TASK-206, TASK-207]
- **Deliverable:** 3 navigation components
- **Components:**
  - `FamiliarNav.tsx`
  - `JovemNav.tsx`
  - `SeniorNav.tsx`
- **Acceptance Criteria:**
  1. Profile-specific links
  2. Active state styling
  3. Mobile hamburger menu
  4. Keyboard accessible
  5. Logo variants per profile
  6. CTA buttons prominent

### Phase 2.3: Profile-Specific Pages (Week 8)

**[TASK-209] Familiar Profile Pages (4 pages)**
- **Priority:** P0
- **Effort:** 3 days
- **Assignee:** Dev1
- **Dependencies:** [TASK-205]
- **Deliverable:** Complete Familiar experience
- **Pages:**
  1. `/familiar` - Hero: "Saúde Ocular para Toda Família"
  2. `/familiar/prevencao` - Prevention tips, kids exams
  3. `/familiar/exames-rotina` - Exam types, frequency
  4. `/familiar/planos` - Family plans, 30% discount
  5. `/familiar/duvidas` - FAQ accordion
- **Acceptance Criteria:**
  1. Family imagery throughout
  2. Warm, trustworthy tone
  3. Clear CTAs
  4. SEO optimized
  5. Mobile responsive
  6. Forms for booking

**[TASK-210] Jovem Profile Pages (5 pages)**
- **Priority:** P0
- **Effort:** 4 days
- **Assignee:** Dev2
- **Dependencies:** [TASK-206]
- **Deliverable:** Complete Jovem experience
- **Pages:**
  1. `/jovem` - Hero: Animated subscription offer
  2. `/jovem/assinatura` - Subscription plans, pricing
  3. `/jovem/tecnologia` - Interactive tech showcase
  4. `/jovem/lentes-contato` - Contact lens catalog
  5. `/jovem/oculos` - Eyewear gallery with virtual try-on
  6. `/jovem/app-mobile` - App download, features
- **Acceptance Criteria:**
  1. Framer Motion animations
  2. Modern, vibrant design
  3. Video backgrounds
  4. Social proof widgets
  5. Mobile app links
  6. Interactive elements

**[TASK-211] Sênior Profile Pages (4 pages)**
- **Priority:** P0
- **Effort:** 3 days
- **Assignee:** Dev1
- **Dependencies:** [TASK-207]
- **Deliverable:** Complete Sênior experience
- **Pages:**
  1. `/senior` - Hero: "Especialistas em Catarata e Glaucoma"
  2. `/senior/catarata` - Detailed guide, surgery info
  3. `/senior/glaucoma` - Prevention, treatment options
  4. `/senior/cirurgias` - Surgical procedures, recovery
  5. `/senior/acessibilidade` - Accessibility features, support
- **Acceptance Criteria:**
  1. WCAG AAA compliant
  2. Large, readable fonts
  3. No motion by default
  4. Clear headings hierarchy
  5. Print-friendly styling
  6. Phone CTA prominent

**[TASK-212] Cross-Profile Shared Pages**
- **Priority:** P1
- **Effort:** 2 days
- **Assignee:** Both
- **Dependencies:** [TASK-209, TASK-210, TASK-211]
- **Deliverable:** Shared content with theme variants
- **Pages:**
  - `/[profile]/sobre` - About page
  - `/[profile]/contato` - Contact form
  - `/[profile]/blog` - Blog index
  - `/[profile]/podcast` - Podcast index
- **Acceptance Criteria:**
  1. Content adapts to profile
  2. Theme variables applied
  3. CTAs profile-specific
  4. Consistent navigation
  5. SEO per profile variant

---

## WEEK 9-10: Advanced Features & Accessibility (Days 57-70)

### Phase 3.1: Subscription System (Jovem Profile)

**[TASK-301] Design Subscription Database Schema**
- **Priority:** P1
- **Effort:** 1 day
- **Assignee:** Dev1
- **Dependencies:** [TASK-210]
- **Deliverable:** Database schema documentation
- **Schema:**
  ```sql
  - Users (id, email, name, phone)
  - Subscriptions (id, user_id, plan_id, status, start_date)
  - Plans (id, name, price, duration, benefits)
  - Payments (id, subscription_id, amount, status, date)
  ```
- **Acceptance Criteria:**
  1. Normalized schema (3NF)
  2. Indexes defined
  3. Constraints documented
  4. Migration scripts ready
  5. LGPD compliant (PII encrypted)

**[TASK-302] Implement Subscription API Routes**
- **Priority:** P1
- **Effort:** 2 days
- **Assignee:** Dev1
- **Dependencies:** [TASK-301]
- **Deliverable:** Subscription backend
- **Routes:**
  - `POST /api/subscriptions/create`
  - `GET /api/subscriptions/:id`
  - `PATCH /api/subscriptions/:id/cancel`
  - `POST /api/subscriptions/webhook` (payment processor)
- **Acceptance Criteria:**
  1. Zod validation
  2. Rate limiting
  3. Idempotency keys
  4. Error handling
  5. Audit logging
  6. Unit tests ≥90%

**[TASK-303] Build Subscription UI Flow**
- **Priority:** P1
- **Effort:** 2 days
- **Assignee:** Dev2
- **Dependencies:** [TASK-302]
- **Deliverable:** User-facing subscription interface
- **Components:**
  - Plan selection cards
  - Checkout form
  - Payment integration
  - Success/error states
  - Subscription dashboard
- **Acceptance Criteria:**
  1. Stripe/PagSeguro integration
  2. Form validation
  3. Loading states
  4. Error recovery
  5. Mobile optimized
  6. A/B test ready

**[TASK-304] Implement Virtual Try-On (Optional)**
- **Priority:** P3
- **Effort:** 3 days
- **Assignee:** Dev2
- **Dependencies:** [TASK-210]
- **Deliverable:** AR eyewear try-on
- **Acceptance Criteria:**
  1. Camera access (with consent)
  2. Face detection
  3. 3D eyewear overlay
  4. Real-time rendering
  5. Screenshot capture
  6. Fallback for unsupported devices

### Phase 3.2: Accessibility Enhancement (Sênior Profile)

**[TASK-305] WCAG AAA Audit**
- **Priority:** P0
- **Effort:** 1 day
- **Assignee:** Both
- **Dependencies:** [TASK-211]
- **Deliverable:** Accessibility audit report
- **Tools:**
  - axe-core automated scan
  - WAVE browser extension
  - Lighthouse accessibility score
  - Manual WCAG 2.1 checklist
- **Acceptance Criteria:**
  1. All AAA criteria documented
  2. Issues categorized (Blocker/Critical/Major/Minor)
  3. Remediation plan created
  4. Priority order assigned
  5. Timeline estimated

**[TASK-306] Implement Font Size Adjuster**
- **Priority:** P0
- **Effort:** 1 day
- **Assignee:** Dev1
- **Dependencies:** [TASK-305]
- **Deliverable:** Dynamic font sizing control
- **Features:**
  - Toggle: 18px / 21px / 24px
  - Cookie persistence
  - Smooth transitions
  - Layout reflow prevention
- **Acceptance Criteria:**
  1. Visible on all Sênior pages
  2. Keyboard accessible
  3. Screen reader announced
  4. No layout shift (CLS = 0)
  5. Applies to all text
  6. Respects user preference

**[TASK-307] Complete ARIA Implementation**
- **Priority:** P0
- **Effort:** 2 days
- **Assignee:** Dev1
- **Dependencies:** [TASK-305]
- **Deliverable:** Full ARIA markup
- **Implementation:**
  1. Landmark roles (banner, main, navigation)
  2. ARIA labels for all interactive elements
  3. Live regions for dynamic content
  4. ARIA descriptions for complex widgets
  5. Hidden content for screen readers
  6. Focus management in modals
- **Acceptance Criteria:**
  1. NVDA reads all content
  2. JAWS navigates smoothly
  3. VoiceOver (macOS) tested
  4. TalkBack (Android) tested
  5. No redundant announcements
  6. Logical reading order

**[TASK-308] Keyboard Navigation Enhancement**
- **Priority:** P0
- **Effort:** 1 day
- **Assignee:** Dev2
- **Dependencies:** [TASK-305]
- **Deliverable:** 100% keyboard accessible
- **Features:**
  1. Skip to main content link
  2. Visible focus indicators (3px outline)
  3. Logical tab order
  4. Escape key closes modals
  5. Arrow keys in menus
  6. Enter/Space activates buttons
- **Acceptance Criteria:**
  1. All pages navigable with keyboard only
  2. No keyboard traps
  3. Focus visible at all times
  4. Tab order matches visual order
  5. Custom controls accessible
  6. Tested by keyboard-only user

**[TASK-309] Screen Reader Testing & Fixes**
- **Priority:** P0
- **Effort:** 2 days
- **Assignee:** Both
- **Dependencies:** [TASK-307, TASK-308]
- **Deliverable:** Screen reader compatible site
- **Testing:**
  - NVDA (Windows) - all pages
  - JAWS (Windows) - critical flows
  - VoiceOver (macOS) - spot check
  - TalkBack (Android) - mobile pages
- **Acceptance Criteria:**
  1. All content announced correctly
  2. Headings navigable
  3. Forms labeled properly
  4. Errors communicated
  5. Dynamic updates announced
  6. No critical issues remaining

**[TASK-310] Framer Motion Integration (Jovem)**
- **Priority:** P1
- **Effort:** 2 days
- **Assignee:** Dev2
- **Dependencies:** [TASK-210]
- **Deliverable:** 60fps animations
- **Animations:**
  - Hero section parallax
  - Card hover effects
  - Page transitions
  - Scroll-triggered reveals
  - Loading spinners
  - Micro-interactions
- **Acceptance Criteria:**
  1. 60fps on modern devices
  2. Graceful degradation (30fps fallback)
  3. `prefers-reduced-motion` respected
  4. Bundle size <30KB (Framer Motion)
  5. No layout shift
  6. GPU accelerated

---

## WEEK 11-12: Performance & QA (Days 71-84)

### Phase 4.1: Performance Optimization (Week 11)

**[TASK-401] Bundle Size Optimization**
- **Priority:** P0
- **Effort:** 2 days
- **Assignee:** Dev1
- **Dependencies:** All previous tasks
- **Deliverable:** Bundle <200KB (gzipped)
- **Techniques:**
  1. Code splitting by profile
  2. Dynamic imports for heavy components
  3. Tree shaking verification
  4. Remove unused dependencies
  5. Replace heavy libraries
  6. Inline critical CSS
- **Acceptance Criteria:**
  1. Total bundle <200KB
  2. Main chunk <80KB
  3. Profile chunks: Familiar <40KB, Jovem <50KB, Sênior <35KB
  4. Route chunks <30KB each
  5. Webpack Bundle Analyzer report
  6. No duplicate modules

**[TASK-402] Image Optimization**
- **Priority:** P0
- **Effort:** 1 day
- **Assignee:** Dev2
- **Dependencies:** [TASK-401]
- **Deliverable:** Optimized image delivery
- **Implementation:**
  1. Convert all images to WebP/AVIF
  2. Responsive image sizes (6 breakpoints)
  3. Lazy loading below fold
  4. Priority loading for LCP images
  5. Blur placeholders
  6. CDN integration
- **Acceptance Criteria:**
  1. All images use next/image
  2. WebP format with JPEG fallback
  3. Proper width/height attributes
  4. Alt text on all images
  5. Loading strategy defined
  6. LCP <2.5s

**[TASK-403] Implement Advanced Caching**
- **Priority:** P1
- **Effort:** 2 days
- **Assignee:** Dev1
- **Dependencies:** [TASK-401]
- **Deliverable:** Multi-layer caching strategy
- **Layers:**
  1. Next.js fetch() cache
  2. ISR per route
  3. Edge caching (Vercel)
  4. Browser cache headers
  5. Service Worker (PWA)
  6. Redis for API responses
- **Acceptance Criteria:**
  1. Static pages cached indefinitely
  2. ISR revalidation configured
  3. Stale-while-revalidate enabled
  4. Cache-Control headers correct
  5. No over-caching (respect LGPD)
  6. Cache invalidation working

**[TASK-404] Critical Rendering Path Optimization**
- **Priority:** P0
- **Effort:** 1 day
- **Assignee:** Dev2
- **Dependencies:** [TASK-402]
- **Deliverable:** Fast first paint
- **Techniques:**
  1. Inline critical CSS
  2. Preload key resources
  3. Defer non-critical JS
  4. Font optimization (FOUT strategy)
  5. Minimize main thread work
  6. Reduce third-party scripts
- **Acceptance Criteria:**
  1. FCP <1.5s
  2. LCP <2.5s
  3. TBT <300ms
  4. No render-blocking resources
  5. Font swap enabled
  6. Lighthouse Performance ≥90

**[TASK-405] Database Query Optimization (if applicable)**
- **Priority:** P2
- **Effort:** 1 day
- **Assignee:** Dev1
- **Dependencies:** [TASK-302]
- **Deliverable:** Optimized queries
- **Techniques:**
  1. Add missing indexes
  2. Query plan analysis
  3. N+1 query elimination
  4. Connection pooling
  5. Read replicas (if needed)
- **Acceptance Criteria:**
  1. All queries <50ms
  2. Indexes on foreign keys
  3. No full table scans
  4. Connection pool sized correctly
  5. Query monitoring enabled

### Phase 4.2: Quality Assurance (Week 12)

**[TASK-406] Cross-Browser Testing**
- **Priority:** P0
- **Effort:** 2 days
- **Assignee:** Both
- **Deliverable:** Browser compatibility report
- **Browsers:**
  - Chrome (latest 2 versions)
  - Firefox (latest 2 versions)
  - Safari (latest 2 versions)
  - Edge (latest version)
  - Mobile: iOS Safari, Chrome Android
- **Acceptance Criteria:**
  1. All features work on all browsers
  2. Layout consistent
  3. Animations smooth (where supported)
  4. Forms submit correctly
  5. No console errors
  6. Polyfills added where needed

**[TASK-407] E2E Test Suite**
- **Priority:** P0
- **Effort:** 3 days
- **Assignee:** Dev1
- **Dependencies:** All feature tasks
- **Deliverable:** Comprehensive Playwright tests
- **Test Scenarios:**
  1. Profile detection flow
  2. Navigation within each profile
  3. Form submissions
  4. Blog post reading
  5. Subscription flow (Jovem)
  6. Accessibility features (Sênior)
  7. Error handling
  8. Mobile scenarios
- **Acceptance Criteria:**
  1. ≥50 E2E tests
  2. All critical flows covered
  3. Tests pass on CI
  4. Screenshots on failure
  5. Run time <10 minutes
  6. Flake rate <5%

**[TASK-408] Performance Testing on 3G**
- **Priority:** P1
- **Effort:** 1 day
- **Assignee:** Dev2
- **Dependencies:** [TASK-404]
- **Deliverable:** Performance benchmarks
- **Test Conditions:**
  - Network: Fast 3G (750Kbps)
  - CPU: 4x slowdown
  - Device: Mid-range mobile
  - Tool: Lighthouse, WebPageTest
- **Acceptance Criteria:**
  1. TTI <6s on 3G
  2. LCP <5s on 3G
  3. FID <300ms on 3G
  4. Metrics documented
  5. Optimization recommendations

**[TASK-409] Security Audit**
- **Priority:** P0
- **Effort:** 1 day
- **Assignee:** Dev1
- **Dependencies:** All API tasks
- **Deliverable:** Security assessment report
- **Checks:**
  1. OWASP Top 10 vulnerabilities
  2. Dependency vulnerabilities (npm audit)
  3. XSS prevention
  4. CSRF protection
  5. SQL injection (if applicable)
  6. Rate limiting verification
  7. Security headers validation
  8. HTTPS enforcement
- **Acceptance Criteria:**
  1. No critical vulnerabilities
  2. Security headers present
  3. HTTPS only
  4. CORS configured correctly
  5. Input validation on all forms
  6. Secrets not in code

**[TASK-410] CFM/LGPD Compliance Verification**
- **Priority:** P0
- **Effort:** 1 day
- **Assignee:** Both
- **Dependencies:** [TASK-409]
- **Deliverable:** Compliance certification
- **Checks:**
  1. Medical disclaimers on all health content
  2. CRM numbers visible
  3. LGPD consent flow functional
  4. Cookie banner correct
  5. Privacy policy updated
  6. Data anonymization working
  7. Audit logging enabled
  8. No PII in logs/analytics
- **Acceptance Criteria:**
  1. All CFM requirements met
  2. LGPD checklist complete
  3. Legal review approved
  4. Consent records stored
  5. Right to deletion working
  6. Data portability ready

**[TASK-411] Load Testing**
- **Priority:** P1
- **Effort:** 1 day
- **Assignee:** Dev1
- **Dependencies:** [TASK-407]
- **Deliverable:** Load test results
- **Test Scenarios:**
  - 100 concurrent users
  - 1000 req/min sustained
  - Spike to 5000 req/min
  - Profile distribution (33% each)
- **Tools:** k6, Artillery
- **Acceptance Criteria:**
  1. No errors under load
  2. Response time <500ms (p95)
  3. Middleware <50ms
  4. Database handles load
  5. Auto-scaling verified (if cloud)
  6. Performance baseline documented

---

## WEEK 13: Deploy & Monitoring (Days 85-91)

### Phase 5.1: Staging Deployment

**[TASK-501] Setup Vercel Project**
- **Priority:** P0
- **Effort:** 0.5 days
- **Assignee:** Dev1
- **Dependencies:** [TASK-411]
- **Deliverable:** Vercel project configured
- **Acceptance Criteria:**
  1. GitHub repo connected
  2. Environment variables set
  3. Build settings configured
  4. Custom domain linked (staging)
  5. SSL certificate active
  6. Preview deployments enabled

**[TASK-502] Deploy to Staging**
- **Priority:** P0
- **Effort:** 0.5 days
- **Assignee:** Dev1
- **Dependencies:** [TASK-501]
- **Deliverable:** Staging environment live
- **URL:** `staging.saraivavision.com.br`
- **Acceptance Criteria:**
  1. Deployment successful
  2. All routes accessible
  3. Environment variables working
  4. Analytics tracking
  5. Error monitoring (Sentry)
  6. Health check passing

**[TASK-503] Staging QA Round**
- **Priority:** P0
- **Effort:** 2 days
- **Assignee:** Both
- **Dependencies:** [TASK-502]
- **Deliverable:** QA sign-off
- **Testing:**
  1. Manual testing (exploratory)
  2. Stakeholder review
  3. Real device testing
  4. SEO verification (Google Search Console)
  5. Analytics validation
  6. Performance monitoring
- **Acceptance Criteria:**
  1. No critical bugs
  2. Stakeholder approval
  3. Performance targets met
  4. SEO crawlable
  5. Analytics firing
  6. Go-live checklist complete

**[TASK-504] Create Rollback Plan**
- **Priority:** P0
- **Effort:** 0.5 days
- **Assignee:** Dev1
- **Dependencies:** [TASK-503]
- **Deliverable:** Documented rollback procedure
- **Acceptance Criteria:**
  1. Vercel instant rollback tested
  2. DNS rollback steps documented
  3. Database rollback plan (if applicable)
  4. Communication templates ready
  5. Rollback SLA: <5 minutes
  6. Team trained on procedure

### Phase 5.2: Production Deployment

**[TASK-505] Production Deployment (Gradual)**
- **Priority:** P0
- **Effort:** 1 day
- **Assignee:** Dev1
- **Dependencies:** [TASK-504]
- **Deliverable:** Live production site
- **Rollout:**
  - 10% traffic → 2 hours monitoring
  - 50% traffic → 4 hours monitoring
  - 100% traffic → Full cutover
- **Acceptance Criteria:**
  1. Zero downtime
  2. DNS updated correctly
  3. SSL certificate valid
  4. All routes working
  5. Error rate <0.1%
  6. Performance within targets

**[TASK-506] Setup Monitoring & Alerting**
- **Priority:** P0
- **Effort:** 1 day
- **Assignee:** Dev2
- **Dependencies:** [TASK-505]
- **Deliverable:** 24/7 monitoring active
- **Tools:**
  - Vercel Analytics (Core Web Vitals)
  - Sentry (errors)
  - LogRocket (session replay)
  - UptimeRobot (uptime)
  - Google Analytics 4
- **Alerts:**
  1. Error rate >1% → Slack
  2. Response time >1s (p95) → Email
  3. Downtime → SMS + Slack
  4. Budget threshold → Email
  5. Core Web Vitals degradation → Slack
- **Acceptance Criteria:**
  1. All tools integrated
  2. Dashboards created
  3. Alerts tested
  4. On-call rotation defined
  5. Runbooks documented
  6. First 24h monitored continuously

**[TASK-507] Post-Launch Optimization**
- **Priority:** P1
- **Effort:** 2 days
- **Assignee:** Both
- **Dependencies:** [TASK-506]
- **Deliverable:** Optimization report
- **Activities:**
  1. Analyze real user metrics
  2. Identify performance bottlenecks
  3. Fix critical issues
  4. A/B test variations
  5. Collect user feedback
  6. Plan iteration roadmap
- **Acceptance Criteria:**
  1. All P0 issues resolved
  2. Performance improvements shipped
  3. User feedback collected (≥50 responses)
  4. Analytics dashboard shared with stakeholders
  5. Lessons learned documented
  6. Next iteration planned

**[TASK-508] Documentation & Handoff**
- **Priority:** P1
- **Effort:** 1 day
- **Assignee:** Both
- **Dependencies:** [TASK-507]
- **Deliverable:** Complete project documentation
- **Documents:**
  1. Architecture diagram (updated)
  2. Deployment guide
  3. Troubleshooting runbook
  4. API documentation
  5. Component library guide
  6. Performance benchmarks
  7. Maintenance procedures
  8. Future roadmap
- **Acceptance Criteria:**
  1. All docs in `/docs/` folder
  2. README.md updated
  3. CHANGELOG.md created
  4. Team trained on architecture
  5. Support team onboarded
  6. Knowledge transfer complete

---

## Summary Statistics

### Total Tasks: 508
- **P0 (Critical):** 145 tasks
- **P1 (High):** 38 tasks
- **P2 (Medium):** 4 tasks
- **P3 (Low):** 1 task

### Total Effort: 182 developer-days
- **Dev1:** 91 days
- **Dev2:** 91 days
- **Both:** 28 tasks (collaborative)

### Phase Breakdown:
- **Phase 0 (Week 1):** 7 tasks, 6.5 days
- **Phase 1 (Weeks 2-5):** 16 tasks, 54 days
- **Phase 2 (Weeks 6-8):** 12 tasks, 30 days
- **Phase 3 (Weeks 9-10):** 10 tasks, 24 days
- **Phase 4 (Weeks 11-12):** 11 tasks, 23 days
- **Phase 5 (Week 13):** 8 tasks, 8.5 days

### Key Milestones:
1. **Day 7:** POC complete, CI/CD working
2. **Day 35:** React app fully migrated to Next.js
3. **Day 56:** Multi-profile system functional
4. **Day 70:** WCAG AAA certified, all features complete
5. **Day 84:** QA complete, production-ready
6. **Day 91:** Live in production, monitoring active

---

**Last Updated:** October 2025
**Status:** Ready for Execution
**Next Action:** Review with team, assign tasks in Linear/Jira

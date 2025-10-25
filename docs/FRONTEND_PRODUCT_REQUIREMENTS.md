# Frontend Product Requirements - Saraiva Vision

## Document Information
- **Owner**: Product & Frontend Team (Dr. Philipe Saraiva Cruz as executive sponsor)
- **Last Updated**: 2025-10-27
- **Status**: ✅ Production-aligned requirements baseline
- **Scope**: React/Vite SPA served via VPS, covering patient-facing experience, content surfaces, and conversion funnels.

## 1. Product Overview
Saraiva Vision is a medical-grade ophthalmology platform serving patients in Caratinga, Minas Gerais, and surrounding regions. The frontend must deliver a localized, compliant, and high-conversion digital journey spanning appointment scheduling, subscription plans, and educational content while aligning with CFM and LGPD regulations.【F:docs/PROJECT_DOCUMENTATION.md†L19-L38】

## 2. Business Objectives
1. **Grow qualified appointments** by guiding users toward the online booking flow and direct contact CTAs.
2. **Increase recurring revenue** via contact lens subscription plans (presential, online, and flex offerings).
3. **Position Saraiva Vision as the trusted ophthalmology authority** through blog, podcast, testimonials, and Google reviews.
4. **Maintain regulatory trust** by enforcing LGPD consent controls, CFM disclosures, and WCAG 2.1 AA accessibility across all journeys.【F:docs/PROJECT_DOCUMENTATION.md†L31-L38】

## 3. Primary Personas & Needs
- **Local Patients (Caratinga region)** – Seek quick appointment booking, trusted medical credentials, and clear directions to the clinic.【F:src/components/UnifiedCTA.jsx†L1-L48】【F:docs/PROJECT_DOCUMENTATION.md†L25-L38】
- **Contact Lens Subscribers** – Compare plans, understand benefits, and complete payment flows with minimal friction.【F:src/modules/payments/pages/PlansPage.jsx†L12-L190】
- **Information Seekers** – Consume blog and podcast content to evaluate expertise and stay informed about treatments.【F:src/views/HomePage.jsx†L78-L90】【F:src/modules/blog/pages/BlogPage.jsx†L12-L198】

## 4. Core User Journeys
1. **Homepage discovery → Booking**: Landing on `/`, consuming hero messaging, reviews, and FAQs, then converting via unified CTA or booking page.【F:src/views/HomePage.jsx†L78-L94】【F:src/components/UnifiedCTA.jsx†L19-L48】
2. **Plan comparison → Checkout**: Navigating to `/planos`, evaluating plan cards, and proceeding to payment-specific routes with Stripe-hosted flows.【F:src/modules/payments/pages/PlansPage.jsx†L93-L186】
3. **Content engagement → Trust reinforcement**: Exploring blog articles/podcast episodes, leveraging search, filters, and structured metadata to deepen trust and trigger CTA interactions.【F:src/modules/blog/pages/BlogPage.jsx†L50-L198】
4. **Scheduling flow**: Accessing `/agendamento`, reviewing instructions, interacting with embedded Nin Saúde iframe, and receiving guidance via support tips.【F:src/views/AgendamentoPage.jsx†L12-L103】

## 5. Functional Requirements

### 5.1 Global Shell & Navigation
- **Routing**: Maintain lazy-loaded routes for all primary experiences (home, services, plans, payments, blog, podcast, scheduling, consent pages). Redirect legacy `/servico/:id` to canonical `/servicos/:id` to preserve SEO equity.【F:src/App.jsx†L7-L113】
- **Layout**: Persist `Navbar`, `ScrollToTop`, `ErrorBoundary`, and `DeferredWidgets` wrapper to safeguard navigation, error handling, and widget orchestration across pages.【F:src/App.jsx†L37-L117】
- **Language**: Default document `lang` to `pt-BR` to respect localization needs.【F:src/App.jsx†L51-L53】

### 5.2 Home Experience
- **SEO & schema**: Use `SEOHead` and organization schema injection to maintain structured data coverage.【F:src/views/HomePage.jsx†L3-L18】【F:src/views/HomePage.jsx†L71-L75】
- **Hero**: Present animated hero with localized translations, hero CTA, services scroll shortcut, and patient proof points with >5k indicator.【F:src/components/Hero.jsx†L10-L134】
- **Trust Content**: Surface services carousel, about snippet, Google reviews (min. 3), local SEO section, FAQs, latest podcast episodes, latest blog posts, and contact module in the home layout.【F:src/views/HomePage.jsx†L78-L90】

### 5.3 Services & Service Detail
- **Service catalog**: Ensure `/servicos` highlights core treatments with scroll anchors accessible via hero CTA.
- **Service detail**: Provide deep dives at `/servicos/:serviceId` with medical credentials, procedure info, and direct CTAs (leveraging existing lazy-loaded pages).【F:src/App.jsx†L74-L83】

### 5.4 Plans & Payments
- **Plan catalog**: `/planos` must showcase Basic, Padrão, and Premium cards with badges, pricing, benefits, and dual CTA (learn more, sign up). Highlight `Plano Padrão` as recommended and maintain geographic coverage notice and clinic location context.【F:src/modules/payments/pages/PlansPage.jsx†L12-L200】
- **Payment routes**: For each plan, provide dedicated `/pagamento*` pages to host Stripe checkout via canonical `PLAN_PAYMENT_LINKS`. Include legal disclaimers and ensure fallback navigation is present for plan comparison.【F:src/modules/payments/pages/PlansPage.jsx†L20-L186】【F:src/App.jsx†L80-L93】
- **Plan variations**: Maintain parity for online and flex plan routes (`/planosonline`, `/planosflex`) with consistent CTA patterns and SEO metadata to support segmented marketing campaigns.【F:src/App.jsx†L84-L85】

### 5.5 Blog & Content
- **Dual mode**: Support listing and single post views under `/blog`, switching automatically when `:slug` is present.【F:src/modules/blog/pages/BlogPage.jsx†L50-L198】【F:src/App.jsx†L98-L99】
- **Content discovery**: Provide category filter, debounced search, pagination, related posts, table of contents, share widgets, and audio embeds to maximize dwell time.【F:src/modules/blog/pages/BlogPage.jsx†L54-L198】
- **Analytics**: Emit page view, filter, and search events for attribution tracking.【F:src/modules/blog/pages/BlogPage.jsx†L100-L123】

### 5.6 Podcast Experience
- **Consolidated page**: `/podcast` and `/podcast/:slug` reuse the consolidated component, ensuring episodes load via the same layout and track engagement metrics.【F:src/App.jsx†L96-L99】

### 5.7 Scheduling & Waitlist
- **Online booking**: `/agendamento` must embed Nin Saúde iframe, provide responsive layout, pre-appointment tips, and contact fallback for support.【F:src/views/AgendamentoPage.jsx†L21-L103】
- **Assine & Waitlist**: Preserve subscription lead capture flows on `/assine` and `/waitlist`, ensuring they tie back into analytics and CTA systems.【F:src/App.jsx†L102-L103】

### 5.8 Contact & Local Presence
- **Unified CTA**: Centralize booking, call, WhatsApp, and map links through `UnifiedCTA`, validating scheduling URLs and providing safe fallbacks.【F:src/components/UnifiedCTA.jsx†L1-L48】
- **Google reviews**: Continue showcasing fetched testimonials on home and dedicated test route for QA validation.【F:src/views/HomePage.jsx†L78-L90】【F:src/App.jsx†L104-L105】

### 5.9 Widget & Support Systems
- **Widget orchestration**: Use `WidgetProvider` to coordinate floating widgets (accessibility tool, WhatsApp, consent) with controlled z-index and responsive positioning.【F:src/utils/widgetManager.jsx†L1-L127】
- **Analytics fallback**: Keep `AnalyticsProxy` and `AnalyticsFallback` mounted globally to mitigate blockers and ensure measurement continuity.【F:src/App.jsx†L42-L120】

## 6. UI/UX & Content Standards
- **Design system**: Tailwind utility classes, gradient treatments, and framer-motion animations across hero and plan cards must stay consistent to preserve premium feel.【F:src/components/Hero.jsx†L21-L176】【F:src/modules/payments/pages/PlansPage.jsx†L93-L190】
- **Localization**: Default copy in Brazilian Portuguese, leveraging i18n translations for hero and other dynamic strings.【F:src/components/Hero.jsx†L10-L66】
- **Content freshness**: Latest podcast/blog sections should automatically surface newest entries from static data sources with a minimum of three items when available.【F:src/views/HomePage.jsx†L78-L90】
- **Navigation aids**: Skip links, focus management, and accessible IDs must remain active across header and footer to fulfill WCAG obligations.【F:docs/accessibility/proptypes-and-skiplinks.md†L13-L105】

## 7. Compliance & Accessibility Requirements
- **LGPD**: Enforce explicit consent gating for medical data, granular consent toggles, and documented data minimization per LGPD requirements. Frontend flows that collect data (booking, waitlist, newsletter) must prompt and record consent in line with REQ-LGPD-001 to REQ-LGPD-004.【F:docs/LGPD_COMPLIANCE_REQUIREMENTS.md†L1-L111】
- **Accessibility**: Adhere to WCAG 2.1 AA through keyboard navigation, focus states, semantic landmarks, and accessible CTAs; leverage Radix UI where applicable.【F:docs/accessibility/proptypes-and-skiplinks.md†L17-L105】
- **Medical disclosures**: Surface physician credentials, clinic address, and regulatory statements wherever patients make medical decisions (services, plans, booking).

## 8. Performance & Reliability Targets
- **Core Web Vitals**: Maintain LCP <2.5s, FID <100ms, CLS <0.1, total payload <3MB compressed, and sub-5s load on 3G by enforcing optimized image pipeline and lazy loading strategies.【F:docs/PERFORMANCE_OPTIMIZATION.md†L1-L61】
- **Lazy loading & code splitting**: Continue route-level code splitting and image optimization with `OptimizedImage` to guard first paint times.【F:src/App.jsx†L7-L30】【F:docs/PERFORMANCE_OPTIMIZATION.md†L52-L78】
- **Error isolation**: Wrap primary routes with `ErrorBoundary` and maintain widget isolation to prevent cascading failures across CTAs and analytics.【F:src/App.jsx†L37-L117】【F:src/utils/widgetManager.jsx†L34-L127】

## 9. Analytics & Measurement
- **Consent-aware tracking**: Initialize GA and Meta Pixel only after consent; gracefully handle denials via `trackGA`, `trackMeta`, and conversion helpers.【F:src/utils/analytics.js†L1-L162】
- **Event coverage**: Track CTA clicks, blog interactions, and search usage to inform acquisition strategies.【F:src/views/HomePage.jsx†L25-L33】【F:src/modules/blog/pages/BlogPage.jsx†L99-L123】【F:src/components/UnifiedCTA.jsx†L19-L48】
- **Fallback resilience**: `AnalyticsFallback` must remain active to mitigate ad-block impact and preserve critical signals for medical marketing attribution.【F:src/App.jsx†L42-L121】

## 10. External Integrations & Dependencies
- **Nin Saúde**: Maintain secure iframe embed with sandbox attributes for online scheduling, ensuring responsive height and accessibility guidance.【F:src/views/AgendamentoPage.jsx†L39-L103】
- **Stripe**: Continue to embed pricing table and plan-specific checkout links; ensure CSP allowances and error boundaries for script load states are preserved.【F:src/modules/payments/pages/PlansPage.jsx†L20-L186】
- **Google Reviews & Local SEO**: Display aggregated reviews and structured data via `LocalBusinessSchema` to reinforce trust and visibility.【F:src/views/HomePage.jsx†L78-L87】【F:src/App.jsx†L42-L120】

## 11. Release Criteria & QA Gates
- **Functional verification**: All journeys must pass unit, integration, and e2e suites covering contact, booking, subscription, and content interactions before release.【F:docs/TESTING_STRATEGY.md†L1-L44】
- **Compliance checks**: Validate consent flows, accessibility audits, and localization review ahead of production pushes.
- **Performance audit**: Execute `npm run build:vite` and Web Vitals checks to confirm adherence to Section 8 targets before deployment approvals.

---
**Approval Workflow**: Product owner reviews content accuracy → Compliance validates LGPD/WCAG adherence → Engineering confirms technical feasibility → Release management executes production deployment.

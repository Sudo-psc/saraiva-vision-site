# Next.js Migration - Risk Management & Mitigation Strategies

**Project:** Saraiva Vision Multi-Profile Migration
**Timeline:** 13 weeks (91 days)
**Last Updated:** October 2025

---

## Risk Assessment Framework

### Risk Scoring Matrix

**Probability Scale:**
- **5 - Very High:** >80% chance
- **4 - High:** 60-80% chance
- **3 - Medium:** 40-60% chance
- **2 - Low:** 20-40% chance
- **1 - Very Low:** <20% chance

**Impact Scale:**
- **5 - Critical:** Project failure, >4 weeks delay, >R$50k cost
- **4 - High:** >2 weeks delay, >R$20k cost, major scope reduction
- **3 - Medium:** 1-2 weeks delay, R$10-20k cost, minor scope changes
- **2 - Low:** <1 week delay, <R$10k cost, workarounds available
- **1 - Very Low:** Negligible impact

**Risk Score = Probability × Impact**
- **20-25:** Critical - Immediate escalation
- **15-19:** High - Weekly monitoring
- **10-14:** Medium - Bi-weekly monitoring
- **5-9:** Low - Monthly monitoring
- **1-4:** Very Low - Monitor only

---

## Critical Risks (Score 20-25)

### CR-001: WCAG AAA Compliance Failure (Sênior Profile)
**Category:** Technical Compliance
**Probability:** 3 (Medium) | **Impact:** 5 (Critical) | **Score:** 15

**Description:**
Inability to achieve WCAG 2.1 Level AAA compliance for Sênior profile, blocking launch for 60+ demographic and exposing to legal risks.

**Triggers:**
- Complex interactive components fail AAA criteria
- Contrast ratios <7:1 due to design constraints
- Screen reader compatibility issues
- Keyboard navigation gaps

**Impact:**
- Legal liability (accessibility discrimination)
- Reputational damage
- Loss of 30% target market (60+ users)
- 2-3 week delay for remediation

**Mitigation Strategies:**

**Preventive:**
1. **External Accessibility Consultant** (Week 1)
   - Hire certified WCAG AAA auditor
   - Review design mockups before implementation
   - Cost: R$8,000 (1 week consulting)

2. **Continuous Automated Testing** (Week 2 onwards)
   - Integrate axe-core in CI/CD
   - Daily accessibility reports
   - Block PRs with AAA violations

3. **Early User Testing** (Week 8)
   - Recruit 5 users with disabilities
   - Real screen reader testing (NVDA, JAWS)
   - Iterative feedback loops

**Detective:**
- Weekly accessibility sprints (Fridays)
- Bi-weekly manual testing
- Contrast ratio validation on every component

**Corrective:**
- **Plan A:** Design adjustments (colors, spacing, fonts)
- **Plan B:** Simplify interactions (reduce complexity)
- **Plan C:** Phased rollout (AA first, AAA in v1.1)

**Contingency Budget:** R$15,000 (accessibility improvements)
**Owner:** Dev1 (Accessibility Lead)
**Review Frequency:** Weekly

---

### CR-002: Multi-Profile Middleware Performance Degradation
**Category:** Performance
**Probability:** 3 (Medium) | **Impact:** 5 (Critical) | **Score:** 15

**Description:**
Edge middleware execution time exceeds 50ms, causing slow routing and poor user experience across all profiles.

**Triggers:**
- Complex profile detection logic
- External API calls in middleware (e.g., geolocation)
- Database queries for profile preferences
- Insufficient caching

**Impact:**
- Every page load delayed 50-200ms
- Poor Core Web Vitals (FID, INP)
- User frustration, increased bounce rate
- Vercel cost overruns (Edge function usage)

**Mitigation Strategies:**

**Preventive:**
1. **Early Load Testing** (Week 6)
   - Benchmark middleware with k6
   - Target: <50ms at 1000 req/s
   - Identify bottlenecks early

2. **Simplified Detection Logic**
   - Avoid external API calls in middleware
   - Cookie-based detection (fastest)
   - User-Agent as fallback (parsed locally)

3. **Aggressive Caching**
   - Cache profile detection results (1 year cookie)
   - No database lookups in middleware
   - Static profile rules

**Detective:**
- Real-time monitoring (Vercel Analytics)
- Alert if p95 >50ms
- Daily performance reports

**Corrective:**
- **Plan A:** Optimize middleware code (reduce branching)
- **Plan B:** Move detection to client-side (with SSG fallback)
- **Plan C:** Static routing (remove middleware, manual profile selection only)

**Contingency:** Rollback to client-side profile switching
**Owner:** Dev1
**Review Frequency:** Daily during Week 6-7

---

### CR-003: Bundle Size Exceeds 200KB Target
**Category:** Performance
**Probability:** 4 (High) | **Impact:** 4 (High) | **Score:** 16

**Description:**
Final JavaScript bundle (gzipped) exceeds 200KB target due to multiple profiles, Framer Motion, and third-party libraries.

**Triggers:**
- Framer Motion library (30KB alone)
- Three profile chunks (40+50+35 = 125KB)
- Shared dependencies duplication
- Radix UI components not tree-shaken
- Google Maps SDK (large)

**Impact:**
- Slow load times (especially on 3G)
- Poor Lighthouse scores (<90)
- Increased Vercel bandwidth costs
- User drop-off on slow connections

**Mitigation Strategies:**

**Preventive:**
1. **Webpack Bundle Analyzer** (Week 2 onwards)
   - Analyze bundle after every major change
   - Set up CI gate: fail if >200KB
   - Identify largest modules early

2. **Code Splitting Strategy**
   - Profile-specific chunks loaded on-demand
   - Dynamic imports for heavy components
   - Lazy load Framer Motion (Jovem only)
   - Defer Google Maps until user interaction

3. **Library Alternatives**
   - Replace heavy libraries (consider lightweight alternatives)
   - Custom implementations for simple components
   - Tree-shake Radix UI aggressively

**Detective:**
- Daily bundle size reports
- Compare against baseline (Week 1 POC)
- Alert if >180KB (buffer zone)

**Corrective:**
- **Plan A:** Aggressive code splitting, remove unused code
- **Plan B:** Replace Framer Motion with CSS animations
- **Plan C:** Lazy load entire profiles (click to load)

**Contingency Budget:** 2 days for optimization (Week 11)
**Owner:** Dev1
**Review Frequency:** Daily

---

### CR-004: Blog Migration Data Loss (99 Posts)
**Category:** Data Integrity
**Probability:** 2 (Low) | **Impact:** 5 (Critical) | **Score:** 10

**Description:**
Loss or corruption of blog content during migration from `blogPosts.js` to Markdown files, impacting SEO and user trust.

**Triggers:**
- Automated conversion script errors
- Encoding issues (special characters)
- Frontmatter parsing failures
- Missing images/assets
- Git merge conflicts

**Impact:**
- SEO rankings drop (lost indexed URLs)
- User complaints (404 errors)
- Content re-creation effort (weeks)
- Reputational damage

**Mitigation Strategies:**

**Preventive:**
1. **Comprehensive Backup** (Week 1)
   - Git tag: `pre-migration-backup`
   - Export `blogPosts.js` to separate repo
   - Database backup (if WordPress still in use)
   - Cost: R$0 (time: 1 hour)

2. **Automated Conversion Script** (Week 4)
   - Validate each post conversion
   - Check: title, slug, content, images, metadata
   - Dry-run mode with diff output
   - Manual QA on 10% sample

3. **Data Validation**
   - Zod schema for frontmatter
   - Ensure all 99 posts have:
     - Valid slug (URL-safe)
     - Cover image exists
     - CFM compliance flag (if medical)
     - Publish date

**Detective:**
- Post-migration audit script
- Compare old vs. new URLs
- Check for broken links
- Monitor 404 errors in production

**Corrective:**
- **Plan A:** Rollback to `blogPosts.js` (if caught early)
- **Plan B:** Manual content recovery from backup
- **Plan C:** WordPress XML export import (if available)

**Contingency:** Keep `blogPosts.js` as fallback for 30 days
**Owner:** Both developers
**Review Frequency:** One-time (Week 4)

---

## High Risks (Score 15-19)

### HR-001: TypeScript Strict Mode Adoption Delays
**Category:** Technical Debt
**Probability:** 4 (High) | **Impact:** 3 (Medium) | **Score:** 12

**Description:**
Enabling TypeScript strict mode reveals hundreds of type errors, delaying component migration by 1-2 weeks.

**Triggers:**
- Existing codebase has implicit `any` types
- React component props not typed
- Third-party library type definitions missing
- Complex type inference issues

**Impact:**
- 1-2 week delay (Phase 1)
- Developer frustration
- Potential workarounds with `any` (tech debt)

**Mitigation:**
- **Preventive:** Start with `strict: false`, incrementally enable
- **Detective:** Daily TypeScript error count tracking
- **Corrective:** Allocate 2 days buffer for type fixes
- **Contingency:** Keep strict mode off, enable post-launch

**Owner:** Dev2
**Review:** Weekly

---

### HR-002: Google Reviews API Rate Limiting
**Category:** External Dependency
**Probability:** 3 (Medium) | **Impact:** 3 (Medium) | **Score:** 9

**Description:**
Google Places API rate limits (30 req/min) exceeded, causing review display failures.

**Triggers:**
- High traffic spikes
- Crawler bots
- DDoS attacks
- Inefficient caching

**Impact:**
- Missing reviews on homepage (social proof loss)
- User complaints
- Potential revenue loss

**Mitigation:**
- **Preventive:** Aggressive caching (30min), CDN
- **Detective:** Monitor API usage dashboard
- **Corrective:** Fallback to static reviews JSON
- **Contingency:** Upgrade API plan (if available)

**Owner:** Dev1
**Review:** Daily during Week 5

---

### HR-003: Design Approval Delays (Profile Pages)
**Category:** Stakeholder Management
**Probability:** 3 (Medium) | **Impact:** 3 (Medium) | **Score:** 9

**Description:**
Stakeholder design approval for profile-specific pages takes >5 days, delaying implementation.

**Triggers:**
- Multiple stakeholder reviewers
- Design iterations required
- Brand guideline conflicts
- Marketing team availability

**Impact:**
- 3-5 day delay per profile
- Developer idle time
- Timeline compression

**Mitigation:**
- **Preventive:** Pre-approved design system (Week 1)
- **Detective:** Early mockup reviews (Week 5)
- **Corrective:** Parallel work on other tasks
- **Contingency:** Stakeholder decision deadline (48h)

**Owner:** Project Manager
**Review:** Bi-weekly

---

### HR-004: Subscription Payment Gateway Integration Issues
**Category:** Third-Party Integration
**Probability:** 3 (Medium) | **Impact:** 4 (High) | **Score:** 12

**Description:**
Stripe or PagSeguro integration fails or delays due to account setup, compliance, or technical issues.

**Triggers:**
- Payment processor account verification delays
- Brazil-specific compliance requirements
- Webhook configuration errors
- Test mode vs. production discrepancies

**Impact:**
- Subscription feature delayed or removed
- Revenue loss (500 subscriptions/month target)
- Scope reduction

**Mitigation:**
- **Preventive:** Start payment account setup Week 1
- **Detective:** Test integration in Week 8
- **Corrective:** Use alternative processor (Stripe vs. PagSeguro)
- **Contingency:** Launch without subscriptions (v1.1 feature)

**Owner:** Dev1
**Review:** Weekly from Week 8

---

### HR-005: Legal/Compliance Review Bottleneck
**Category:** Compliance
**Probability:** 3 (Medium) | **Impact:** 4 (High) | **Score:** 12

**Description:**
CFM/LGPD legal review takes >5 days or requires significant changes, delaying production launch.

**Triggers:**
- Legal team availability
- New regulations discovered
- Medical content review depth
- LGPD consent flow changes

**Impact:**
- Launch delay (5-10 days)
- Rework effort
- Stakeholder pressure

**Mitigation:**
- **Preventive:** Schedule legal review in Week 10 (early)
- **Detective:** Pre-review checklist (Week 5)
- **Corrective:** Parallel legal team (external consultant)
- **Contingency:** Staged launch (non-medical first)

**Owner:** Project Manager + Dev1
**Review:** Weekly from Week 10

---

## Medium Risks (Score 10-14)

### MR-001: Hydration Errors (Server/Client Mismatch)
**Probability:** 4 (High) | **Impact:** 2 (Low) | **Score:** 8

**Description:**
React hydration errors due to server-rendered HTML not matching client-side render.

**Mitigation:**
- **Preventive:** Clear Server/Client component boundaries
- **Detective:** Next.js dev warnings
- **Corrective:** Use `'use client'` directive appropriately

**Owner:** Dev2 **Review:** Weekly

---

### MR-002: Third-Party Script Conflicts (Google Maps, Analytics)
**Probability:** 3 (Medium) | **Impact:** 2 (Low) | **Score:** 6

**Description:**
Google Maps, PostHog, or other third-party scripts cause console errors or CSP violations.

**Mitigation:**
- **Preventive:** Test scripts in isolation
- **Detective:** Browser console monitoring
- **Corrective:** Use Next.js Script component

**Owner:** Dev1 **Review:** During integration

---

### MR-003: SEO Ranking Temporary Drop During Migration
**Probability:** 3 (Medium) | **Impact:** 3 (Medium) | **Score:** 9

**Description:**
Google temporarily ranks site lower during/after migration due to URL changes or indexing delays.

**Mitigation:**
- **Preventive:** 301 redirects, sitemap update
- **Detective:** Google Search Console monitoring
- **Corrective:** Re-submit sitemap, request re-crawl

**Owner:** Dev2 **Review:** Weekly post-launch

---

### MR-004: Developer Turnover/Availability
**Probability:** 2 (Low) | **Impact:** 4 (High) | **Score:** 8

**Description:**
One of the two developers becomes unavailable (illness, resignation, etc.).

**Mitigation:**
- **Preventive:** Knowledge sharing, pair programming
- **Detective:** Daily standups
- **Corrective:** Redistribute tasks, extend timeline
- **Contingency:** Hire contractor (R$10-15k/week)

**Owner:** Project Manager **Review:** Weekly

---

### MR-005: Vercel Cost Overruns
**Probability:** 2 (Low) | **Impact:** 2 (Low) | **Score:** 4

**Description:**
Vercel hosting costs exceed budget due to high traffic, Edge function usage, or image optimization.

**Mitigation:**
- **Preventive:** Monitor Vercel usage dashboard
- **Detective:** Set budget alerts
- **Corrective:** Optimize edge functions, reduce image processing
- **Contingency:** Migrate to VPS (as fallback)

**Owner:** Dev1 **Review:** Monthly

---

### MR-006: Image Asset Corruption/Loss
**Probability:** 2 (Low) | **Impact:** 3 (Medium) | **Score:** 6

**Description:**
Blog cover images or other assets corrupted during migration or optimization.

**Mitigation:**
- **Preventive:** Backup all images before optimization
- **Detective:** Visual regression testing
- **Corrective:** Restore from backup

**Owner:** Dev2 **Review:** Week 4

---

### MR-007: Font Loading Performance Issues
**Probability:** 3 (Medium) | **Impact:** 2 (Low) | **Score:** 6

**Description:**
Custom fonts cause FOUT (Flash of Unstyled Text) or slow LCP.

**Mitigation:**
- **Preventive:** Use next/font, preload critical fonts
- **Detective:** Lighthouse font loading audit
- **Corrective:** Font subsetting, WOFF2 format

**Owner:** Dev2 **Review:** Week 11

---

## Low Risks (Score 5-9)

### LR-001: Browser Compatibility Issues (Edge Cases)
**Probability:** 2 (Low) | **Impact:** 2 (Low) | **Score:** 4

**Mitigation:** Polyfills, BrowserStack testing

---

### LR-002: Internationalization Needs (Future)
**Probability:** 1 (Very Low) | **Impact:** 3 (Medium) | **Score:** 3

**Mitigation:** i18n-ready architecture, defer to v1.1

---

### LR-003: Dark Mode Requests (User Feedback)
**Probability:** 2 (Low) | **Impact:** 2 (Low) | **Score:** 4

**Mitigation:** Dark mode disabled (healthcare context), explain in FAQ

---

### LR-004: Mobile App Integration Complexity
**Probability:** 2 (Low) | **Impact:** 2 (Low) | **Score:** 4

**Mitigation:** Defer to v1.1, focus on PWA first

---

### LR-005: Podcast RSS Feed Format Issues
**Probability:** 1 (Very Low) | **Impact:** 2 (Low) | **Score:** 2

**Mitigation:** Validate RSS with Apple Podcasts spec

---

## Risk Register Summary

### By Category
| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| Technical | 2 | 2 | 4 | 2 | 10 |
| Compliance | 1 | 2 | 0 | 0 | 3 |
| Performance | 2 | 0 | 1 | 1 | 4 |
| External Dependency | 0 | 2 | 1 | 0 | 3 |
| Stakeholder | 0 | 1 | 1 | 0 | 2 |
| Resource | 0 | 0 | 1 | 0 | 1 |
| **TOTAL** | **5** | **7** | **8** | **3** | **23** |

### By Phase
| Phase | Risks | High Risk Count |
|-------|-------|-----------------|
| Phase 0 (Week 1) | 3 | 1 |
| Phase 1 (Weeks 2-5) | 8 | 3 |
| Phase 2 (Weeks 6-8) | 4 | 2 |
| Phase 3 (Weeks 9-10) | 3 | 2 |
| Phase 4 (Weeks 11-12) | 3 | 1 |
| Phase 5 (Week 13) | 2 | 1 |

---

## Risk Monitoring Plan

### Daily (During Critical Phases)
**When:** Weeks 6-7 (Middleware), Week 12 (QA)
**What:**
- Bundle size check
- Middleware performance (p95)
- Test coverage
- Build status

**Owner:** Tech Lead (Dev1)

### Weekly (All Phases)
**When:** Every Friday
**What:**
- Risk register review
- New risks identified
- Mitigation effectiveness
- Update risk scores

**Owner:** Project Manager

### Bi-Weekly (Steering Committee)
**When:** Fridays (every 2 weeks)
**What:**
- Top 5 risks to stakeholders
- Budget/timeline impact
- Go/No-Go decisions

**Owner:** Project Manager

### Phase Gates (End of Each Phase)
**When:** Weeks 1, 5, 8, 10, 12, 13
**What:**
- Phase-specific risk audit
- Update contingency plans
- Stakeholder sign-off

**Owner:** Both Developers + Project Manager

---

## Escalation Paths

### Level 1: Team Level (Dev1, Dev2)
**Triggers:**
- Low/Medium risks
- Technical issues
- Daily blockers

**Response Time:** Same day
**Action:** Team discussion, propose solution

### Level 2: Project Manager
**Triggers:**
- High risks (score 15-19)
- Timeline impact >2 days
- Budget variance >5%

**Response Time:** Within 24 hours
**Action:** Stakeholder communication, resource reallocation

### Level 3: Steering Committee
**Triggers:**
- Critical risks (score 20-25)
- Timeline impact >1 week
- Budget variance >10%
- Legal/compliance issues

**Response Time:** Within 48 hours
**Action:** Executive decision, scope change, timeline adjustment

---

## Contingency Budget

### Total Contingency: R$25,000 (19% of total budget)

**Allocation:**
- Accessibility consulting: R$8,000
- Performance optimization: R$5,000
- External contractor (if needed): R$7,000
- Legal review acceleration: R$3,000
- Miscellaneous: R$2,000

**Usage Policy:**
- Requires Project Manager approval
- Tracked weekly
- Replenished if under-utilized

---

## Lessons Learned (To Be Updated Post-Project)

### Week 1:
- TBD

### Week 5:
- TBD

### Week 8:
- TBD

### Week 12:
- TBD

### Week 13 (Final):
- TBD

---

**Last Updated:** October 2025
**Status:** Active Risk Monitoring
**Next Review:** Week 1 (Project Kickoff)

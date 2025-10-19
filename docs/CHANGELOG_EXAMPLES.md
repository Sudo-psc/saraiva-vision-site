# 📚 Conventional Commits Examples for Saraiva Vision

Real-world examples of conventional commits for the Saraiva Vision medical platform.

## Table of Contents

1. [Medical Features](#medical-features)
2. [Blog & Content](#blog--content)
3. [Analytics & Tracking](#analytics--tracking)
4. [Forms & Contact](#forms--contact)
5. [UI/UX Improvements](#uiux-improvements)
6. [Performance Optimization](#performance-optimization)
7. [Bug Fixes](#bug-fixes)
8. [Security & Compliance](#security--compliance)
9. [Breaking Changes](#breaking-changes)
10. [Multi-Commit Features](#multi-commit-features)

## Medical Features

### Adding New Medical Service
```bash
git commit -m "feat(services): add retinopathy screening service

Add comprehensive retinopathy screening service page with:
- Service description and benefits
- Screening process explanation
- Risk factors and prevention
- Appointment booking integration
- Medical disclaimers per CFM guidelines

Closes #234"
```

### Implementing Appointment System
```bash
git commit -m "feat(appointments): implement online scheduling system

Enable patients to schedule appointments directly through the website.
Includes calendar integration, availability checking, and confirmation emails.

Features:
- Real-time availability checking
- Email and SMS confirmations
- Google Calendar integration
- Appointment reminders

Closes #189"
```

### Adding Medical Professional Profile
```bash
git commit -m "feat(team): add ophthalmologist profile page

Add Dr. Saraiva's profile with:
- Professional credentials (CRM, specializations)
- Education and experience
- Areas of expertise
- Patient testimonials
- CFM-compliant medical information

Relates to #156"
```

## Blog & Content

### New Blog Post
```bash
git commit -m "feat(blog): add post about cataract prevention

Publish comprehensive guide on cataract prevention and treatment.
Includes medical information reviewed by Dr. Saraiva.

Content includes:
- Risk factors and symptoms
- Prevention strategies
- Treatment options
- When to seek medical attention
- Medical disclaimers"
```

### Blog Image Optimization
```bash
git commit -m "perf(blog): optimize blog cover images

Convert all blog cover images to WebP format with fallbacks.
Reduces average image size by 60% while maintaining quality.

- Implement lazy loading
- Add responsive image srcset
- Generate WebP with JPEG fallback
- Update image manifest

Closes #301"
```

### Podcast Integration
```bash
git commit -m "feat(blog): integrate podcast episodes

Add podcast player and episode listing to blog.
Includes RSS feed for podcast apps and episode transcripts.

Features:
- Embedded audio player
- Episode listing with descriptions
- Automatic RSS feed generation
- Search and filter capabilities

Closes #278"
```

## Analytics & Tracking

### Google Analytics 4 Integration
```bash
git commit -m "feat(analytics): integrate Google Analytics 4

Replace Universal Analytics with GA4 for better tracking.
Includes custom events and user behavior tracking.

Custom events:
- Contact form submissions
- Appointment bookings
- Service page views
- Blog post engagement

Closes #203"
```

### Fix Tracking Issue
```bash
git commit -m "fix(analytics): resolve duplicate event tracking

Events were being tracked multiple times due to component remounting.
Added proper effect cleanup and event deduplication logic.

- Add effect dependencies
- Implement event deduplication
- Fix component lifecycle issues

Fixes #345"
```

## Forms & Contact

### WhatsApp Integration
```bash
git commit -m "feat(contact): add WhatsApp contact option

Enable direct WhatsApp communication from contact page.
Includes business hours validation and automated messages.

Features:
- One-click WhatsApp messaging
- Pre-filled message templates
- Business hours checking
- Phone number validation

Closes #267"
```

### Form Validation Enhancement
```bash
git commit -m "feat(forms): enhance validation with real-time feedback

Add real-time validation to all forms with helpful error messages.
Improves user experience and reduces submission errors.

Improvements:
- Phone number format validation
- Email verification
- Required field indicators
- Inline error messages
- Accessibility improvements (ARIA labels)

Closes #289"
```

### ReCAPTCHA Integration
```bash
git commit -m "feat(security): add reCAPTCHA to contact forms

Implement Google reCAPTCHA v3 to prevent spam submissions.
Invisible to users with automatic risk analysis.

- reCAPTCHA v3 integration
- Server-side validation
- Fallback for low scores
- Privacy policy updated

Closes #198"
```

## UI/UX Improvements

### Mobile Navigation Enhancement
```bash
git commit -m "feat(ui): improve mobile navigation experience

Redesign mobile navigation with better accessibility and UX.
Includes hamburger menu animation and touch gestures.

Changes:
- Smooth slide-in animation
- Touch-friendly button sizes
- Improved contrast ratios
- Keyboard navigation support

Closes #312"
```

### Accessibility Improvements
```bash
git commit -m "feat(a11y): enhance keyboard navigation and screen reader support

Improve accessibility across the site for WCAG 2.1 AA compliance.

Improvements:
- Keyboard focus indicators
- ARIA labels and roles
- Skip navigation links
- Semantic HTML structure
- Alt text for all images
- Color contrast improvements

Closes #276"
```

### Dark Mode Support
```bash
git commit -m "feat(ui): add dark mode support

Implement dark mode with automatic OS preference detection.
Includes theme toggle and preference persistence.

Features:
- Automatic OS theme detection
- Manual theme toggle
- LocalStorage persistence
- Smooth transitions
- Updated color palette

Closes #334"
```

## Performance Optimization

### Image Lazy Loading
```bash
git commit -m "perf(images): implement lazy loading for all images

Add intersection observer-based lazy loading for images.
Improves initial page load time by 45%.

- Lazy load below-the-fold images
- Placeholder blur effect
- Progressive image loading
- Bandwidth savings

Closes #256"
```

### Code Splitting
```bash
git commit -m "perf(build): implement route-based code splitting

Split code by routes to reduce initial bundle size.
Main bundle reduced from 800KB to 250KB.

Changes:
- React.lazy for route components
- Suspense fallbacks
- Preload critical routes
- Analyze bundle with webpack-bundle-analyzer

Closes #291"
```

### Cache Optimization
```bash
git commit -m "perf(cache): optimize cache headers and service worker

Improve caching strategy for better performance and offline support.

Optimizations:
- Nginx cache headers configuration
- Service worker for offline access
- Cache static assets for 1 year
- Implement stale-while-revalidate
- Cache API responses

Closes #308"
```

## Bug Fixes

### Mobile Layout Fix
```bash
git commit -m "fix(ui): resolve layout overflow on mobile devices

Fix horizontal scroll issue on mobile devices caused by wide images.
Affects all breakpoints below 768px.

- Add max-width constraints
- Fix image container overflow
- Update responsive grid
- Test on iOS and Android

Fixes #345
```

### Form Submission Error
```bash
git commit -m "fix(forms): resolve contact form submission failure

Fix 500 error when submitting contact form with special characters.
Properly escape user input before database insertion.

- Add input sanitization
- Escape special characters
- Add server-side validation
- Update error handling

Fixes #367
Relates to #234"
```

### Google Maps API Error
```bash
git commit -m "fix(maps): resolve Google Maps initialization error

Fix Maps API initialization failure in production environment.
API key was not properly loaded from environment variables.

- Update environment variable loading
- Add error boundary for Maps component
- Implement fallback static map
- Add loading indicators

Fixes #378"
```

## Security & Compliance

### LGPD Compliance
```bash
git commit -m "feat(compliance): implement LGPD cookie consent

Add comprehensive cookie consent system for LGPD compliance.
Includes cookie policy and consent management.

Features:
- Cookie consent banner
- Granular consent options
- Cookie policy page
- Consent persistence
- Analytics opt-out

Closes #199"
```

### Security Headers
```bash
git commit -m "feat(security): add comprehensive security headers

Implement security headers via Nginx for better protection.

Headers added:
- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy

Closes #245"
```

### API Rate Limiting
```bash
git commit -m "feat(security): implement rate limiting on API endpoints

Add rate limiting to prevent abuse and ensure fair usage.

Configuration:
- 100 requests per 15 minutes per IP
- Different limits for authenticated users
- Custom error responses
- IP whitelist for trusted sources

Closes #289"
```

## Breaking Changes

### API Restructure
```bash
git commit -m "feat!: restructure API endpoints for better organization

BREAKING CHANGE: All API endpoints moved from /api to /api/v2

This change improves API organization and allows for better versioning.
Old endpoints will continue to work until v3.0.0 with deprecation warnings.

Migration Guide:
1. Update all fetch calls to use /api/v2 prefix
2. Review response format changes (see docs/API_MIGRATION.md)
3. Update environment variables if using custom API URL

Examples:
- Old: POST /api/contact
- New: POST /api/v2/contact

- Old: GET /api/appointments
- New: GET /api/v2/appointments

Documentation: docs/API_MIGRATION.md

Closes #412"
```

### Form Validation Changes
```bash
git commit -m "refactor!: update form validation schema

BREAKING CHANGE: Phone number validation now requires country code

All phone number fields now require international format with country code.
This ensures proper validation and improves data quality.

Migration:
- Update phone input component to include country code selector
- Update existing phone numbers in database
- Update validation rules in forms

Old format: (11) 99999-9999
New format: +55 11 99999-9999

Script to migrate existing data: scripts/migrate-phone-numbers.js

Closes #456"
```

## Multi-Commit Features

### Feature: Complete Appointment System

```bash
# Step 1: Backend API
git commit -m "feat(api): add appointment booking endpoints

Create RESTful API endpoints for appointment management.

Endpoints:
- POST /api/v2/appointments - Create appointment
- GET /api/v2/appointments/:id - Get appointment details
- PUT /api/v2/appointments/:id - Update appointment
- DELETE /api/v2/appointments/:id - Cancel appointment
- GET /api/v2/availability - Check availability

Closes #401"

# Step 2: Frontend Components
git commit -m "feat(components): add appointment booking components

Create reusable components for appointment booking flow.

Components:
- AppointmentForm
- DatePicker
- TimeSlotSelector
- ConfirmationModal
- AppointmentCard

Relates to #401"

# Step 3: Integration
git commit -m "feat(appointments): integrate booking flow with UI

Connect appointment components with API endpoints.
Includes form validation, error handling, and success messages.

Features:
- Real-time availability checking
- Date and time selection
- Patient information form
- Confirmation screen
- Email notifications

Closes #401"

# Step 4: Tests
git commit -m "test(appointments): add comprehensive test suite

Add unit and integration tests for appointment system.

Test coverage:
- API endpoint tests
- Component unit tests
- Integration tests for booking flow
- Error handling scenarios

Coverage: 95%

Relates to #401"

# Step 5: Documentation
git commit -m "docs(appointments): add appointment system documentation

Document appointment booking system for developers and users.

Documentation includes:
- API endpoint documentation
- Component usage examples
- User guide for patients
- Admin guide for managing appointments

Relates to #401"
```

## Documentation Updates

### API Documentation
```bash
git commit -m "docs(api): update API documentation with new endpoints

Update API documentation to reflect recent changes and additions.

Updated sections:
- Authentication flow
- Contact form endpoints
- Appointment booking API
- Error response formats
- Rate limiting information

Relates to #234, #289, #401"
```

### README Update
```bash
git commit -m "docs: update README with deployment instructions

Add comprehensive deployment guide and troubleshooting section.

New sections:
- VPS deployment steps
- Nginx configuration
- SSL certificate setup
- Environment variables
- Common issues and solutions"
```

## Chores and Maintenance

### Dependency Updates
```bash
git commit -m "build: update npm dependencies to latest versions

Update all npm dependencies to latest stable versions.
Includes security patches and performance improvements.

Major updates:
- React 18.2.0 → 18.3.0
- Vite 4.5.0 → 5.0.0
- Tailwind 3.3.0 → 3.4.0

All tests passing after updates."
```

### Cleanup
```bash
git commit -m "chore: remove unused code and dependencies

Remove deprecated components and unused npm packages.
Reduces bundle size by 150KB.

Removed:
- Old blog layout components
- Unused utility functions
- Deprecated API helpers
- 5 unused npm packages"
```

## Tips for Writing Great Commits

1. **Be Specific**: 
   - ❌ `fix: fix bug`
   - ✅ `fix(forms): resolve email validation error in contact form`

2. **Explain Why**:
   - Include context about why the change was needed
   - Explain the impact on users or the system

3. **Reference Issues**:
   - Always link to related issues
   - Use `Closes #123` for issues that are resolved
   - Use `Relates to #123` for related issues

4. **Use Scopes**:
   - Makes changelog more organized
   - Helps team understand what area changed

5. **Break Up Large Changes**:
   - Multiple focused commits better than one large commit
   - Easier to review and understand
   - Easier to revert if needed

---

For more information, see:
- [Conventional Commits Guide](./CONVENTIONAL_COMMITS_GUIDE.md)
- [Quick Reference](./CONVENTIONAL_COMMITS_QUICKREF.md)
- [Contributing Guidelines](../CONTRIBUTING.md)

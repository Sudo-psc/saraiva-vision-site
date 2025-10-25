# E2E Tests for Saraiva Vision

This directory contains end-to-end tests for the Saraiva Vision medical platform using Playwright.

## Test Suites

### Basic Tests (`basic/`)
- Homepage loading
- Navigation functionality
- Accessibility structure
- Medical content verification

### Performance Tests (`performance/`)
- Core Web Vitals (LCP, FID, CLS)
- Loading performance across devices
- Network performance under different conditions
- Memory and resource management
- Medical image optimization

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e:playwright

# Run specific suite
npx playwright test tests/e2e/basic
npx playwright test tests/e2e/performance

# Run with visible browser
npm run test:e2e:playwright:headed

# Run in UI mode
npm run test:e2e:playwright:ui
```

## Medical Compliance Requirements

All E2E tests must verify:

1. **Medical Content** - CRM credentials, doctor information visible
2. **Accessibility** - WCAG 2.1 AA compliance
3. **Performance** - Core Web Vitals within acceptable ranges
4. **Security** - HTTPS, proper headers, no exposed PII
5. **Privacy** - LGPD compliance, consent mechanisms

## Test Coverage

Current coverage:
- ✅ Homepage loading and accessibility
- ✅ Performance across devices (Desktop, Mobile, Tablet)
- ✅ Network conditions (3G, 4G, WiFi)
- ✅ Medical content prioritization
- ✅ Image optimization
- ✅ Memory management

To be added:
- ⬜ Appointment booking flow
- ⬜ Contact form submission
- ⬜ Blog navigation and reading
- ⬜ Services page navigation
- ⬜ Medical compliance forms

## Adding New Tests

1. Create test file: `tests/e2e/[suite]/[feature].spec.js`
2. Import Playwright test utilities
3. Write test with medical compliance in mind
4. Run test locally
5. Verify in CI/CD pipeline

Example:

```javascript
import { test, expect } from '@playwright/test';

test('should handle appointment booking', async ({ page }) => {
  await page.goto('https://saraivavision.com.br/agendamento');
  
  // Test implementation
});
```

## Reports

After running tests, view the HTML report:

```bash
npm run test:e2e:playwright:report
```

Reports include:
- Test results for all browsers
- Screenshots of failures
- Video recordings
- Network activity
- Console logs

## Documentation

- **Playwright Setup**: `docs/PLAYWRIGHT_SETUP.md`
- **Testing Guide**: `docs/TESTING_GUIDE.md`
- **Playwright Config**: `playwright.config.js`

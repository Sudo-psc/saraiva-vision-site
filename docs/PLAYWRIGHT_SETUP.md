# Playwright Setup Guide for Saraiva Vision

## Installation

### Local Development

```bash
# Install Playwright
npm install --save-dev @playwright/test

# Install browsers (Chromium only for faster setup)
npx playwright install chromium

# Or install all browsers
npx playwright install
```

### CI/CD Environment

In GitHub Actions, browsers are installed with:

```yaml
- name: Install Playwright Browsers
  run: npx playwright install --with-deps chromium
```

The `--with-deps` flag installs system dependencies required by the browsers.

## Configuration

Playwright configuration is in `playwright.config.js`:

```javascript
export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'https://saraivavision.com.br',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

## Running Tests

### Basic Commands

```bash
# Run all E2E tests
npm run test:e2e:playwright

# Run specific test file
npx playwright test tests/e2e/basic/homepage.spec.js

# Run with visible browser (headed mode)
npm run test:e2e:playwright:headed

# Run specific browser
npx playwright test --project=chromium

# Run in UI mode (interactive)
npm run test:e2e:playwright:ui
```

### Debugging Tests

```bash
# Run in debug mode
npx playwright test --debug

# Generate trace
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

## Viewing Reports

After running tests, view the HTML report:

```bash
npm run test:e2e:playwright:report
```

This opens `playwright-report/index.html` in your browser with:
- Test results
- Screenshots of failures
- Videos of failed tests
- Network activity
- Console logs

## Writing Tests

### Basic Test Structure

```javascript
import { test, expect } from '@playwright/test';

test('should load homepage', async ({ page }) => {
  await page.goto('https://saraivavision.com.br');
  
  const title = await page.title();
  expect(title).toBeTruthy();
});
```

### Medical Platform Specific Tests

```javascript
test('should display medical credentials', async ({ page }) => {
  await page.goto('https://saraivavision.com.br');
  
  // Check for CRM credentials
  const crm = page.locator('text=/CRM/i');
  await expect(crm).toBeVisible();
  
  // Check for doctor name
  const doctor = page.locator('text=/Dr.*Philipe/i');
  await expect(doctor).toBeVisible();
});
```

### Accessibility Testing

```javascript
test('should meet accessibility standards', async ({ page }) => {
  await page.goto('https://saraivavision.com.br');
  
  // Check main landmark
  const main = page.locator('main, [role="main"]');
  await expect(main).toHaveCount(1);
  
  // Check navigation
  const nav = page.locator('nav, [role="navigation"]');
  expect(await nav.count()).toBeGreaterThanOrEqual(1);
  
  // Check heading hierarchy
  const h1 = page.locator('h1');
  expect(await h1.count()).toBeGreaterThanOrEqual(1);
});
```

## Test Organization

```
tests/
  e2e/
    basic/           # Basic functionality tests
      homepage.spec.js
    performance/     # Performance tests
      loading-performance.spec.js
    accessibility/   # Accessibility tests (to be added)
    medical/         # Medical compliance tests (to be added)
```

## Best Practices

### 1. Use Data Test IDs

Add `data-testid` attributes to important elements:

```jsx
<button data-testid="appointment-button">Agendar</button>
```

```javascript
await page.click('[data-testid="appointment-button"]');
```

### 2. Wait for Network Idle

For medical content that loads asynchronously:

```javascript
await page.goto('https://saraivavision.com.br', {
  waitUntil: 'networkidle'
});
```

### 3. Use Explicit Waits

```javascript
await page.waitForSelector('[data-testid="medical-content"]');
await page.waitForLoadState('domcontentloaded');
```

### 4. Screenshot on Failure

Already configured in `playwright.config.js`:

```javascript
use: {
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
}
```

## Troubleshooting

### Browser Not Found

**Error:** `Executable doesn't exist at .../chrome-linux/headless_shell`

**Solution:**
```bash
npx playwright install chromium
```

### Timeout Issues

**Error:** `Test timeout of 30000ms exceeded`

**Solution:** Increase timeout or check network:
```javascript
test.setTimeout(60000); // 60 seconds

// Or per action
await page.goto(url, { timeout: 60000 });
```

### Port Already in Use

**Error:** `Error: Port 4173 is already in use`

**Solution:**
```bash
npx kill-port 4173
```

### CI Failures

1. Check uploaded artifacts in GitHub Actions
2. Download `playwright-report.zip`
3. Extract and open `index.html`
4. Review screenshots and traces

## CI/CD Integration

### GitHub Actions Workflow

```yaml
- name: Install Playwright Browsers
  run: npx playwright install --with-deps chromium

- name: Run E2E Tests
  run: npm run test:e2e:playwright

- name: Upload Playwright Report
  uses: actions/upload-artifact@v4
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: 30
```

### Pre-Deploy Validation

The pre-deploy validation script automatically runs Playwright tests:

```bash
npm run validate:pre-deploy
```

This is **mandatory** before production deployment for medical compliance.

## Resources

- **Playwright Documentation**: https://playwright.dev
- **Playwright GitHub**: https://github.com/microsoft/playwright
- **Testing Guide**: `docs/TESTING_GUIDE.md`
- **Best Practices**: https://playwright.dev/docs/best-practices

## Medical Compliance Notes

For medical platforms like Saraiva Vision:

✅ **Test medical content loading** - Ensure CRM, credentials visible  
✅ **Test accessibility** - WCAG 2.1 AA compliance  
✅ **Test performance** - Core Web Vitals for patient experience  
✅ **Test privacy** - PII protection, consent forms  
✅ **Test security** - HTTPS, CSP headers  

All E2E tests should verify compliance with CFM/LGPD regulations.

# Testing Setup Complete - Next.js Multi-Profile Application

**Version**: 1.0.0 | **Date**: October 2025 | **Status**: Complete

---

## Table of Contents

1. [Overview](#overview)
2. [Testing Stack](#testing-stack)
3. [Directory Structure](#directory-structure)
4. [Test Scripts](#test-scripts)
5. [Running Tests](#running-tests)
6. [Writing Tests](#writing-tests)
7. [Testing Profiles](#testing-profiles)
8. [CI/CD Integration](#cicd-integration)
9. [Troubleshooting](#troubleshooting)

---

## Overview

This document describes the comprehensive testing infrastructure for the Saraiva Vision Next.js multi-profile application. The testing setup supports:

- **Unit Testing**: Jest for component and function tests
- **Integration Testing**: Jest for testing component interactions
- **Accessibility Testing**: jest-axe for WCAG compliance
- **E2E Testing**: Playwright for real browser testing
- **Multi-Profile Testing**: Test all three user profiles (familiar, jovem, senior)

---

## Testing Stack

### Core Testing Tools

| Tool | Purpose | Configuration |
|------|---------|---------------|
| **Jest** | Unit and integration testing | `jest.config.js` |
| **React Testing Library** | Component testing | `tests/test-utils.tsx` |
| **Playwright** | E2E browser testing | `playwright.config.ts` |
| **jest-axe** | Accessibility testing (Jest) | `tests/a11y/*.test.tsx` |
| **@axe-core/playwright** | Accessibility testing (E2E) | `tests/e2e/*.a11y.spec.ts` |

### Dependencies Installed

```json
{
  "devDependencies": {
    "@axe-core/playwright": "^4.10.2",
    "@axe-core/react": "^4.10.2",
    "@playwright/test": "^1.55.1",
    "@testing-library/jest-dom": "^6.1.4",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "jest": "^30.2.0",
    "jest-axe": "^9.0.0",
    "jest-environment-jsdom": "^30.2.0",
    "ts-node": "^10.9.2"
  }
}
```

---

## Directory Structure

```
/home/saraiva-vision-site/
├── jest.config.js                 # Jest configuration
├── jest.setup.js                  # Jest setup and global mocks
├── playwright.config.ts           # Playwright E2E configuration
├── __mocks__/                     # Mock files
│   ├── styleMock.js               # CSS import mocks
│   └── fileMock.js                # Static file mocks
├── tests/                         # Test files
│   ├── test-utils.tsx             # Custom testing utilities
│   ├── unit/                      # Unit tests
│   │   └── middleware.test.ts     # Middleware profile detection
│   ├── integration/               # Integration tests
│   ├── a11y/                      # Accessibility tests
│   │   └── senior-wcag.test.tsx   # Senior profile WCAG AAA
│   └── e2e/                       # E2E tests
│       ├── profile-detection.spec.ts      # Profile switching
│       └── accessibility.a11y.spec.ts     # E2E accessibility
└── playwright-report/             # Playwright test reports
```

---

## Test Scripts

### Jest Tests

```bash
# Run all Jest tests
npm test
npm run test:jest

# Run in watch mode
npm run test:jest:watch

# Run with coverage
npm run test:jest:coverage

# Run specific test suites
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:a11y          # Accessibility tests only
```

### Playwright E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug

# View report
npm run test:e2e:report

# Run specific profile tests
npm run test:familiar      # Familiar profile only
npm run test:jovem         # Jovem profile only
npm run test:senior        # Senior profile only

# Run accessibility tests only
npm run test:accessibility

# Run profile detection tests
npm run test:profiles
```

### Comprehensive Testing

```bash
# Run all tests (unit + integration + a11y + e2e)
npm run test:comprehensive
```

### Vitest (Legacy Support)

```bash
# Run Vitest tests (for existing tests)
npm run test:vitest
npm run test:vitest:run
npm run test:vitest:coverage
```

---

## Running Tests

### Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Install Playwright browsers (first time only)
npx playwright install

# 3. Run unit tests
npm test

# 4. Run E2E tests
npm run test:e2e
```

### Development Workflow

**Watch Mode (Jest)**
```bash
npm run test:jest:watch
```

**Interactive E2E (Playwright UI)**
```bash
npm run test:e2e:ui
```

**Debug Specific Test**
```bash
# Jest
npm test -- middleware.test.ts

# Playwright
npx playwright test profile-detection --debug
```

### CI/CD Pipeline

```bash
# Run all tests with coverage
npm run test:comprehensive
```

---

## Writing Tests

### Unit Tests (Jest)

**Location**: `tests/unit/`

**Example**: Testing middleware profile detection

```typescript
// tests/unit/middleware.test.ts
import { describe, it, expect } from '@jest/globals'

describe('Middleware Profile Detection', () => {
  it('should detect familiar profile from cookie', () => {
    const cookie = 'user-profile=familiar'
    const profile = extractProfileFromCookie(cookie)
    expect(profile).toBe('familiar')
  })
})
```

### Accessibility Tests (jest-axe)

**Location**: `tests/a11y/`

**Example**: Testing WCAG AAA compliance

```typescript
// tests/a11y/senior-wcag.test.tsx
import { render } from '../test-utils'
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

it('should have no accessibility violations', async () => {
  const { container } = render(<Component />, { profile: 'senior' })
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

### E2E Tests (Playwright)

**Location**: `tests/e2e/`

**Example**: Testing profile switching

```typescript
// tests/e2e/profile-detection.spec.ts
import { test, expect } from '@playwright/test'

test('should load with familiar profile by default', async ({ page }) => {
  await page.goto('/')
  const html = await page.locator('html')
  await expect(html).toHaveAttribute('data-profile', 'familiar')
})
```

### Custom Test Utils

Use `tests/test-utils.tsx` for custom rendering with providers:

```typescript
import { render } from '../test-utils'

// Render with specific profile
render(<Component />, { profile: 'senior' })

// Helper functions
setProfileCookie('jovem')
checkTouchTargetSize(element, 48)
isKeyboardAccessible(element)
```

---

## Testing Profiles

### Profile Matrix

| Profile | WCAG Level | Font Size | Touch Targets | Focus Outline | Tests |
|---------|------------|-----------|---------------|---------------|-------|
| **Familiar** | AA | 16px | 44×44px | 2px | `test:familiar` |
| **Jovem** | AA | 16px | 44×44px | 2px + animation | `test:jovem` |
| **Senior** | AAA | 20px | 48×48px | 4px high-contrast | `test:senior` |

### Testing Each Profile

**Familiar Profile (WCAG AA)**
```bash
npm run test:familiar
```

Tests:
- 4.5:1 color contrast
- 44px minimum touch targets
- 2px focus outlines
- Standard font size (16px)

**Jovem Profile (WCAG AA + Modern UX)**
```bash
npm run test:jovem
```

Tests:
- Glassmorphism effects
- Animated focus indicators
- `prefers-reduced-motion` support
- Mobile responsiveness

**Senior Profile (WCAG AAA)**
```bash
npm run test:senior
```

Tests:
- 7:1 color contrast (enhanced)
- 48px minimum touch targets
- 20px base font size
- 1.8+ line height
- All links underlined
- High contrast mode toggle

---

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  jest-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
      - run: npm ci
      - run: npm run test:jest:coverage
      - uses: codecov/codecov-action@v3

  playwright-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        profile: [familiar, jovem, senior]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:${{ matrix.profile }}
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report-${{ matrix.profile }}
          path: playwright-report/
```

---

## Coverage Thresholds

### Jest Coverage

Configured in `jest.config.js`:

```javascript
coverageThresholds: {
  global: {
    branches: 70,
    functions: 75,
    lines: 80,
    statements: 80,
  },
}
```

**View Coverage**:
```bash
npm run test:jest:coverage
open coverage/lcov-report/index.html
```

---

## Troubleshooting

### Common Issues

**1. Jest Module Resolution**

Error: `Cannot find module '@/components/...'`

**Solution**: Ensure `jest.config.js` has correct module mapping:
```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
}
```

**2. Playwright Browsers Not Installed**

Error: `Executable doesn't exist at ...`

**Solution**:
```bash
npx playwright install
```

**3. Next.js Import Errors**

Error: `Cannot use import statement outside a module`

**Solution**: Install Next.js Jest config:
```bash
npm install --save-dev next
```

Update `jest.config.js` to use `next/jest`.

**4. Accessibility Test Failures**

Error: `color-contrast violation`

**Solution**: Check profile-specific styles in CSS. Ensure:
- Familiar/Jovem: 4.5:1 ratio (AA)
- Senior: 7:1 ratio (AAA)

**5. E2E Tests Timeout**

Error: `Test timeout of 30000ms exceeded`

**Solution**: Increase timeout in `playwright.config.ts`:
```typescript
timeout: 60 * 1000, // 60 seconds
```

### Debug Mode

**Jest**:
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

**Playwright**:
```bash
npm run test:e2e:debug
```

---

## Best Practices

### Test Organization

1. **Unit tests**: Test individual functions and components in isolation
2. **Integration tests**: Test component interactions and data flow
3. **Accessibility tests**: Test WCAG compliance for each profile
4. **E2E tests**: Test complete user flows across browsers

### Naming Conventions

- Unit test files: `*.test.ts` or `*.test.tsx`
- E2E test files: `*.spec.ts`
- Accessibility E2E: `*.a11y.spec.ts`

### Test Structure

```typescript
describe('Feature Name', () => {
  describe('Specific Behavior', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test'

      // Act
      const result = myFunction(input)

      // Assert
      expect(result).toBe('expected')
    })
  })
})
```

### Accessibility Testing

Always test:
- Color contrast ratios
- Touch target sizes
- Focus indicators
- Keyboard navigation
- Screen reader support (ARIA)
- Heading hierarchy
- Alt text for images

---

## Next Steps

1. **Add More Tests**: Increase coverage for critical components
2. **Performance Tests**: Add Lighthouse CI for Core Web Vitals
3. **Visual Regression**: Consider Percy or Chromatic for visual testing
4. **Load Testing**: Add artillery or k6 for API load testing
5. **Security Tests**: Add OWASP ZAP or Snyk for vulnerability scanning

---

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [jest-axe](https://github.com/nickcolley/jest-axe)
- [Accessibility Testing Guide](../nextjs-performance/ACCESSIBILITY_OPTIMIZATION_PLAN.md)

---

**Last Updated**: October 2025
**Author**: Saraiva Vision Development Team
**Status**: Complete and Ready for Use

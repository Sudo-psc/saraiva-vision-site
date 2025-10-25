# Comprehensive Testing and Pre-Deploy Validation Guide

## Overview

This guide covers the comprehensive testing strategy for Saraiva Vision, a medical platform requiring strict compliance with CFM/LGPD regulations. Given the regulatory weight of the medical domain, all deployments must pass comprehensive validation including E2E tests with Playwright.

## Table of Contents

1. [Testing Strategy](#testing-strategy)
2. [Running Tests](#running-tests)
3. [Pre-Deploy Validation](#pre-deploy-validation)
4. [Playwright E2E Tests](#playwright-e2e-tests)
5. [CI/CD Integration](#cicd-integration)
6. [Viewing Test Reports](#viewing-test-reports)
7. [Medical Compliance Requirements](#medical-compliance-requirements)

---

## Testing Strategy

The testing strategy is organized into multiple layers:

### Test Layers

1. **Unit Tests** - Test individual functions and components
2. **Integration Tests** - Test component interactions
3. **API Tests** - Test backend API endpoints
4. **Frontend Tests** - Test React components
5. **E2E Tests (Playwright)** - Test complete user workflows across browsers

### Coverage Requirements

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: 75%+ coverage
- **E2E Tests**: Critical user paths (medical content, appointments, contact)

---

## Running Tests

### Quick Commands

```bash
# Run all tests (comprehensive)
npm run test:comprehensive

# Run specific test suites
npm run test:unit              # Unit tests only
npm run test:integration       # Integration tests only
npm run test:api              # API tests only
npm run test:frontend         # Frontend tests only
npm run test:e2e:playwright   # Playwright E2E tests

# Interactive modes
npm run test:e2e:playwright:headed  # Run with browser visible
npm run test:e2e:playwright:ui      # Run with Playwright UI
npm run test:watch                  # Watch mode for development

# Coverage
npm run test:coverage          # Generate coverage report
```

### Test Comprehensive Breakdown

The `test:comprehensive` command runs:

1. ✅ Unit tests (Vitest)
2. ✅ Integration tests (Vitest)
3. ✅ API tests (Vitest)
4. ✅ Frontend tests (Vitest)
5. ✅ E2E tests (Playwright)

**Estimated time**: 3-5 minutes

---

## Pre-Deploy Validation

### What is Pre-Deploy Validation?

Pre-deploy validation is a comprehensive check that ensures the application meets all medical compliance requirements before deployment. It is **mandatory** for production deployments.

### Running Pre-Deploy Validation

```bash
# Run complete pre-deploy validation
npm run validate:pre-deploy

# Or run the script directly
bash scripts/pre-deploy-validation.sh
```

### Validation Steps

The pre-deploy validation performs the following checks:

1. **Comprehensive Test Suite** - All unit, integration, API, frontend, and E2E tests
2. **Playwright E2E Tests** - Browser-based end-to-end testing
3. **Medical Compliance** - CFM/LGPD compliance validation
4. **Linting** - Code quality and style checks
5. **API Validation** - Syntax and encoding validation
6. **Production Build** - Successful build verification

### Validation Reports

After running pre-deploy validation, reports are generated in:

- `reports/pre-deploy-validation-YYYYMMDD_HHMMSS.md` - Detailed validation report
- `playwright-report/` - Playwright HTML report

### Viewing Reports

```bash
# View Playwright HTML report
npm run test:e2e:playwright:report

# View validation report
cat reports/pre-deploy-validation-*.md | tail -1
```

---

## Playwright E2E Tests

### What is Playwright?

Playwright is a modern E2E testing framework that tests your application across multiple browsers (Chrome, Firefox, Safari) and devices (Desktop, Mobile, Tablet).

### Test Locations

- `tests/e2e/performance/loading-performance.spec.js` - Performance and Core Web Vitals tests

### Running Playwright Tests

```bash
# Run all Playwright tests
npm run test:e2e:playwright

# Run with browser visible (headed mode)
npm run test:e2e:playwright:headed

# Run with Playwright UI (interactive)
npm run test:e2e:playwright:ui

# View last test report
npm run test:e2e:playwright:report
```

### Playwright Configuration

Configuration is in `playwright.config.js`:

- **Browsers**: Chromium, Firefox, WebKit (Safari)
- **Devices**: Desktop (Chrome, Firefox, Safari), Mobile (Pixel 5, iPhone 13)
- **Reports**: HTML, JSON, JUnit
- **Retries**: 2 retries in CI, 0 locally
- **Timeout**: 30 seconds per test

### Test Coverage

Current E2E tests cover:

- ✅ Homepage loading performance
- ✅ Medical image optimization
- ✅ Bundle splitting and code loading
- ✅ Mobile performance on 3G/4G networks
- ✅ Touch interactions and mobile features
- ✅ Tablet layouts and responsive design
- ✅ Network performance under different conditions
- ✅ Memory and resource management
- ✅ Medical content loading prioritization
- ✅ Accessibility during loading
- ✅ Performance regression detection

---

## CI/CD Integration

### Production Deployment Workflow

The production deployment workflow (`.github/workflows/deploy-production.yml`) includes:

1. **Validation** - Confirm deployment intent
2. **Build** - Install dependencies and Playwright browsers
3. **Lint** - Code quality checks
4. **Test** - Run comprehensive test suite (including Playwright)
5. **Upload Reports** - Save Playwright and test reports as artifacts
6. **Build Production** - Create production bundle
7. **Deploy** - Deploy to production (with manual approval)

### Beta Deployment Workflow

The beta deployment workflow (`.github/workflows/deploy-beta.yml`) includes:

1. **Build & Test** - On pull requests
2. **Lint** - Code quality checks
3. **Test** - Run comprehensive test suite
4. **Upload Reports** - Save Playwright reports
5. **Notify** - Deployment notification

### Viewing CI Reports

After a GitHub Actions run:

1. Go to the Actions tab
2. Select the workflow run
3. Scroll to "Artifacts"
4. Download `playwright-report` or `test-reports`

---

## Viewing Test Reports

### Playwright HTML Report

The Playwright HTML report provides:

- ✅ Test results for each browser/device
- ✅ Screenshots of failures
- ✅ Video recordings of failed tests
- ✅ Performance metrics
- ✅ Network activity
- ✅ Console logs

**To view:**

```bash
npm run test:e2e:playwright:report
```

This opens `playwright-report/index.html` in your browser.

### Validation Report

The pre-deploy validation report is saved in `reports/` directory with detailed information about:

- ✅ Test results for each validation step
- ✅ Build size and statistics
- ✅ Medical compliance status
- ✅ Overall deployment readiness

**To view:**

```bash
# List all validation reports
ls -la reports/pre-deploy-validation-*

# View the latest report
cat reports/pre-deploy-validation-* | tail -1 | less
```

---

## Medical Compliance Requirements

### Why Comprehensive Testing is Mandatory

As a medical platform, Saraiva Vision must comply with:

1. **CFM (Conselho Federal de Medicina)** - Medical content regulations
2. **LGPD (Lei Geral de Proteção de Dados)** - Data protection and privacy
3. **Accessibility (WCAG 2.1 AA)** - Healthcare accessibility standards

### Compliance Validation

The pre-deploy validation includes specific checks for:

- ✅ Medical content accuracy and loading
- ✅ Patient data protection (PII detection)
- ✅ Accessibility compliance (ARIA, semantic HTML)
- ✅ Performance (Core Web Vitals)
- ✅ Security headers and CSP

### Deployment Blocking

If pre-deploy validation fails, deployment is **blocked** with the message:

```
❌ VALIDATION FAILED - DO NOT DEPLOY
⚠️  Medical Compliance Warning: Fix validation errors before deployment
```

This is intentional to prevent non-compliant code from reaching production.

---

## Troubleshooting

### Common Issues

#### 1. Playwright browsers not installed

**Error:** `browserType.launch: Executable doesn't exist`

**Solution:**
```bash
npx playwright install chromium
```

#### 2. Tests timing out

**Error:** `Test timeout of 30000ms exceeded`

**Solution:** Increase timeout in test or check network connectivity

#### 3. Port already in use (local testing)

**Error:** `Error: Port 4173 is already in use`

**Solution:**
```bash
# Kill process on port 4173
npx kill-port 4173

# Or use a different port
PLAYWRIGHT_BASE_URL=http://localhost:3000 npm run test:e2e:playwright
```

#### 4. CI failing on Playwright tests

**Solution:** Check uploaded artifacts for detailed reports and screenshots

---

## Best Practices

### 1. Run Tests Before Every Commit

```bash
# Quick validation
npm run lint && npm run test:run

# Full validation (before PR)
npm run test:comprehensive
```

### 2. Review Playwright Reports

Always review Playwright reports after test runs to:
- Identify performance regressions
- Check for accessibility issues
- Verify medical content loading

### 3. Keep Tests Updated

When adding new features:
- Add unit tests for new functions/components
- Add E2E tests for new user workflows
- Update documentation

### 4. Monitor Test Performance

- Keep test execution time under 5 minutes
- Optimize slow tests
- Use parallel execution when possible

---

## Support and Resources

### Documentation

- **Vitest**: https://vitest.dev
- **Playwright**: https://playwright.dev
- **Testing Library**: https://testing-library.com

### Internal Documentation

- `docs/DEPLOY_GUIDE.md` - Deployment guide
- `README_CI_CD.md` - CI/CD pipeline documentation
- `AGENTS.md` - Agent and build commands

### Getting Help

For issues or questions:
1. Check this documentation
2. Review test reports and logs
3. Check CI/CD workflow logs
4. Consult the development team

---

## Summary

✅ **Always** run `npm run test:comprehensive` before deploying  
✅ **Always** run `npm run validate:pre-deploy` before production deployment  
✅ **Always** review Playwright reports for performance and accessibility  
✅ **Never** deploy if validation fails (medical compliance)  
✅ **Keep** test coverage above 80%  

**Remember:** Given the regulatory weight of the medical domain, comprehensive testing is not optional—it's mandatory for patient safety and legal compliance.

# Testing and Deployment Improvements

This document outlines the improvements made to the testing infrastructure and deployment scripts for the Saraiva Vision site.

## Testing Improvements

### Fixed Issues
- **Dependency Conflicts**: Resolved vitest/html-validate version mismatch
- **Contact Component Test**: Fixed test to handle multiple phone number elements correctly
- **SEOHead Component Test**: Simplified timeout-prone async assertions

### New Test Categories

#### 1. API Integration Tests (`src/components/__tests__/API.test.jsx`)
- **Form Validation**: Email format validation, input sanitization
- **Security Headers**: CSP directives, CORS configuration
- **Performance Thresholds**: Core Web Vitals budgets
- **Medical Compliance**: Healthcare-specific requirements
- **Accessibility Standards**: ARIA attributes validation

#### 2. Component Tests
- Enhanced existing Hero, Contact, and SEOHead tests
- Added proper error handling and accessibility checks
- Improved mock configurations for realistic testing

#### 3. Integration Tests
- Environment variable validation
- API endpoint structure verification
- Medical information compliance checks

### Test Commands Enhanced
```bash
npm run test           # Run tests in watch mode
npm run test:run       # Run all tests once
npm run test:coverage  # Generate coverage report
npm run test:ui        # Run with UI interface
```

## Deployment Script Improvements

### Pre-Deployment Validation
The `deploy.sh` script now includes comprehensive pre-deployment checks:

- **Build Validation**: Ensures dist directory and critical files exist
- **Asset Counting**: Verifies JS and CSS files are generated
- **HTML Structure**: Validates basic HTML structure
- **Dependency Installation**: npm ci with audit flags

### Post-Deployment Health Checks
Enhanced post-deployment verification includes:

- **Site Accessibility**: HTTP status code verification
- **Critical Assets**: File existence and permission checks
- **Nginx Status**: Service health verification
- **Smoke Testing**: Automated smoke test execution
- **Deployment Validation**: Comprehensive site validation

### New Deployment Validation Script
`scripts/validate-deployment.sh` provides:

- **URL Accessibility**: Tests all critical pages
- **Content Verification**: Ensures key content is present
- **GTM Integration**: Verifies analytics integration
- **Performance Testing**: Basic response time measurement
- **Security Checks**: HTTPS and meta tag validation

Usage:
```bash
# Run deployment validation
./scripts/validate-deployment.sh

# With custom URL
SITE_URL=https://example.com ./scripts/validate-deployment.sh
```

## Development Script Enhancements

The `dev.sh` script now provides:

### Enhanced Features
- **Node.js Version Management**: Automatic .nvmrc support
- **Build Verification**: Pre-flight build checks
- **Environment Setup**: Automatic .env file creation
- **Testing Options**: Integrated test running
- **Linting Support**: Code quality checks

### New Development Options
1. **Frontend Only**: Vite development server
2. **Full Stack**: Frontend + API servers
3. **Build & Preview**: Production build testing
4. **Testing**: Various test execution modes
5. **Linting**: Code quality verification

Usage:
```bash
./dev.sh
# Follow interactive prompts for development mode selection
```

## Performance and Security Enhancements

### Security Improvements
- **Input Sanitization**: XSS prevention validation
- **CSP Headers**: Content Security Policy validation
- **CORS Configuration**: Cross-origin request validation
- **Environment Variables**: Secure configuration validation

### Performance Monitoring
- **Core Web Vitals**: LCP, FID, CLS thresholds
- **Build Optimization**: Asset size monitoring
- **Response Time**: Basic performance validation
- **Resource Loading**: Critical asset verification

### Medical Compliance
- **CFM Requirements**: Medical professional information validation
- **LGPD Compliance**: Brazilian data protection compliance
- **Accessibility**: WCAG 2.1 AA compliance checks

## Automated Testing Integration

### CI/CD Ready
The enhanced scripts are designed for CI/CD integration:

- **Exit Codes**: Proper error code handling
- **Dry Run Mode**: Safe testing without changes
- **Environment Variables**: Configurable behavior
- **Logging**: Comprehensive operation logging

### Deployment Pipeline
Recommended deployment flow:

1. **Pre-Deploy**: Run tests and build validation
2. **Deploy**: Atomic deployment with health checks
3. **Post-Deploy**: Comprehensive site validation
4. **Monitoring**: Ongoing health monitoring

### Example CI/CD Integration
```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: npm run test:run

- name: Build Application
  run: npm run build

- name: Deploy Application
  run: sudo ./deploy.sh

- name: Validate Deployment
  run: ./scripts/validate-deployment.sh
```

## Rollback Capabilities

The deployment system supports safe rollbacks:

- **Atomic Deployments**: Symlink-based release switching
- **Release History**: Automatic release preservation
- **Quick Rollback**: `sudo ./rollback.sh` command
- **Health Verification**: Post-rollback validation

## Monitoring and Alerting

### Health Check Endpoints
- Site accessibility monitoring
- Asset availability verification
- Performance threshold monitoring
- Analytics integration verification

### Error Handling
- Graceful failure handling
- Comprehensive error logging
- Automatic cleanup on failure
- Rollback trigger conditions

## Best Practices

### Testing
- Run tests before deployment
- Validate builds before release
- Test accessibility compliance
- Verify security headers

### Deployment
- Use atomic deployment strategy
- Verify health checks pass
- Monitor post-deployment metrics
- Maintain release history

### Development
- Use development script for local testing
- Verify builds work before committing
- Run linting and tests regularly
- Follow security best practices

## Troubleshooting

### Common Issues
1. **Test Failures**: Check dependency conflicts
2. **Build Failures**: Verify Node.js version
3. **Deployment Issues**: Check permissions and nginx status
4. **Performance Issues**: Review Core Web Vitals thresholds

### Debug Commands
```bash
# Test specific components
npm test -- --run src/components/__tests__/Contact.test.jsx

# Dry run deployment
sudo ./deploy.sh --dry-run

# Manual deployment validation
./scripts/validate-deployment.sh

# Check nginx configuration
sudo nginx -t
```

## Future Enhancements

### Planned Improvements
- E2E testing with Playwright
- Automated accessibility testing
- Performance budget enforcement
- Staging environment support
- Automated security scanning

### Monitoring Integration
- Application Performance Monitoring (APM)
- Error tracking and alerting
- Performance regression detection
- Automated health check reporting
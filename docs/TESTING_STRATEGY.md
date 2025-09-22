# Comprehensive Testing Strategy

This document outlines the comprehensive testing strategy implemented for the Saraiva Vision backend modernization project.

## Overview

The testing suite covers all critical components of the hybrid Vercel + VPS architecture, ensuring reliability, performance, and compliance with requirements.

## Test Categories

### 1. Unit Tests

**Location**: `api/__tests__/*.test.js`, `src/__tests__/*.test.js`

**Coverage**:
- API endpoint handlers
- Validation schemas (Zod)
- Business logic functions
- React components
- Utility functions

**Key Test Files**:
- `api/__tests__/contact-api.test.js` - Contact form API endpoint
- `api/__tests__/validation-schemas.test.js` - Zod validation schemas
- `api/__tests__/business-logic.test.js` - Core business logic
- `src/__tests__/Contact.test.jsx` - Contact form component
- `src/__tests__/AppointmentBooking.test.jsx` - Appointment booking component

**Run Command**: `npm run test:unit`

### 2. Integration Tests

**Location**: `src/__tests__/integration/`, `api/contact/__tests__/`

**Coverage**:
- WordPress GraphQL integration
- External service integrations (Resend, Zenvia, Spotify, OpenAI)
- Database operations
- Message outbox system

**Key Test Files**:
- `src/__tests__/integration/wordpress-graphql.test.js` - WordPress headless CMS
- `src/__tests__/integration/external-services.test.js` - Third-party services
- `api/contact/__tests__/outbox-integration.test.js` - Outbox pattern

**Run Command**: `npm run test:integration`

### 3. End-to-End Tests

**Location**: `src/__tests__/e2e/`

**Coverage**:
- Complete user workflows
- Contact form submission flow
- Appointment booking flow
- Appointment confirmation flow
- Multi-step user journeys

**Key Test Files**:
- `src/__tests__/e2e/user-workflows.test.js` - Complete user journeys

**Run Command**: `npm run test:e2e`

### 4. Performance Tests

**Location**: `api/__tests__/performance.test.js`

**Coverage**:
- Appointment availability calculation performance
- Concurrent booking scenarios
- Database query performance
- Memory usage and resource optimization
- High-load scenarios

**Run Command**: `npm run test:performance`

## Test Configuration

### Vitest Configuration

The project uses Vitest with the following key configurations:

- **Environment**: jsdom for React component testing
- **Timeout**: 30s for integration tests, 2-3 minutes for performance tests
- **Coverage**: v8 provider with 80% line coverage threshold
- **Parallel Execution**: Up to 4 threads for faster test execution
- **Workspaces**: Separate configurations for different test types

### Mock Strategy

- **External APIs**: Mocked using Vitest's `vi.mock()`
- **Database**: In-memory mock with realistic delay simulation
- **File System**: Mocked for file operations
- **Network Requests**: Mocked fetch responses

## Coverage Requirements

### Minimum Coverage Thresholds

- **Lines**: 80%
- **Functions**: 75%
- **Branches**: 70%
- **Statements**: 80%

### Coverage Exclusions

- Test files themselves
- Configuration files
- Build artifacts
- Node modules
- Main entry points (main.jsx, App.jsx)

## Running Tests

### Quick Commands

```bash
# Run all tests
npm run test:comprehensive

# Run specific test categories
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:performance

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch

# Run specific test files
npm run test -- contact-api.test.js
npm run test -- --grep "appointment"
```

### Comprehensive Test Runner

The `scripts/run-comprehensive-tests.js` script provides:

- Sequential execution of all test suites
- Detailed reporting and timing
- Coverage report generation
- Failure analysis and summary
- Exit codes for CI/CD integration

## Test Data and Fixtures

### Mock Data Patterns

```javascript
// Contact form data
const mockContactData = {
  name: 'João Silva',
  email: 'joao@example.com',
  phone: '11999999999',
  message: 'Gostaria de agendar uma consulta',
  consent: true
}

// Appointment data
const mockAppointmentData = {
  patientName: 'Maria Santos',
  patientEmail: 'maria@example.com',
  patientPhone: '11888888888',
  appointmentDate: '2024-01-20',
  appointmentTime: '09:00',
  notes: 'Primeira consulta'
}

// WordPress content
const mockWordPressPage = {
  id: 'page1',
  title: 'Sobre Nós',
  content: '<p>Conteúdo da página</p>',
  slug: 'sobre-nos',
  modified: '2024-01-15T10:00:00Z'
}
```

## Continuous Integration

### GitHub Actions Integration

```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
      - run: npm ci
      - run: npm run test:comprehensive
      - uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

### Vercel Integration

Tests run automatically on:
- Pull request creation
- Push to main branch
- Deployment preview generation

## Performance Benchmarks

### Expected Performance Metrics

- **Availability Calculation**: < 50ms for empty schedule
- **Concurrent Bookings**: < 500ms for 5 simultaneous requests
- **Database Queries**: < 100ms for typical operations
- **API Response Times**: < 3s for contact form submission

### Load Testing Scenarios

1. **Normal Load**: 10 concurrent users
2. **Peak Load**: 50 concurrent users
3. **Stress Test**: 100+ concurrent users
4. **Conflict Resolution**: Multiple users booking same slot

## Error Handling Testing

### Error Scenarios Covered

- Network timeouts and failures
- Invalid input data
- Rate limiting
- Service unavailability
- Database connection issues
- Authentication failures
- CORS issues

### Error Response Validation

All error responses are tested for:
- Proper HTTP status codes
- Consistent error message format
- Security (no sensitive data exposure)
- User-friendly messages in Portuguese

## Security Testing

### Security Test Coverage

- Input validation and sanitization
- XSS prevention
- SQL injection prevention (via parameterized queries)
- Rate limiting effectiveness
- CORS configuration
- Authentication token validation
- LGPD compliance

## Accessibility Testing

### A11y Test Coverage

- Screen reader compatibility
- Keyboard navigation
- Color contrast validation
- ARIA labels and roles
- Focus management
- Error announcements

## Maintenance

### Test Maintenance Guidelines

1. **Update tests when requirements change**
2. **Add tests for new features**
3. **Remove obsolete tests**
4. **Keep mock data realistic and up-to-date**
5. **Review and update performance benchmarks**
6. **Maintain test documentation**

### Regular Review Schedule

- **Weekly**: Review failing tests and flaky tests
- **Monthly**: Update test data and scenarios
- **Quarterly**: Review coverage thresholds and performance benchmarks
- **Release**: Full test suite execution and validation

## Troubleshooting

### Common Issues

1. **Timeout Errors**: Increase timeout for slow operations
2. **Mock Issues**: Ensure mocks are properly reset between tests
3. **Async Issues**: Use proper async/await patterns
4. **Memory Leaks**: Check for proper cleanup in afterEach hooks
5. **Flaky Tests**: Identify and fix non-deterministic behavior

### Debug Commands

```bash
# Run tests with debug output
DEBUG=* npm run test

# Run single test file with verbose output
npm run test -- --reporter=verbose contact-api.test.js

# Run tests with coverage and open report
npm run test:coverage && open coverage/index.html
```

## Conclusion

This comprehensive testing strategy ensures the reliability, performance, and maintainability of the Saraiva Vision backend system. The multi-layered approach covers all critical paths and provides confidence for production deployment.

For questions or issues with the testing suite, refer to the individual test files or contact the development team.
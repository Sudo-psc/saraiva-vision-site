# Development Workflow for External WordPress Integration

## Overview

This document defines the development workflow, branch strategy, and code review process for implementing the external WordPress integration feature. The workflow ensures smooth development, code quality, and successful deployment of the feature across the 6-week implementation timeline.

## Branch Strategy

### Main Branches
- **main**: Production-ready code, always stable and deployable
- **develop**: Integration branch for feature coordination, updated weekly

### Feature Branch Structure
```
feature/external-wp-integration/
├── feature/external-wp-phase1-infra     # Database schema, API structure
├── feature/external-wp-phase2-services   # Cache, proxy, health services
├── feature/external-wp-phase3-endpoints   # API endpoints implementation
├── feature/external-wp-phase4-frontend    # React hooks and components
├── feature/external-wp-phase5-testing    # Test suite implementation
└── feature/external-wp-phase6-deployment  # Deployment and monitoring
```

### Hotfix Branch Structure
```
hotfix/external-wp-紧急修复描述/
```

### Release Branch Structure
```
release/external-wp-v1.0.0/
```

## Git Workflow Process

### 1. Feature Development Flow
```bash
# Start from latest develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/external-wp-phase1-infra

# Development work
git add .
git commit -m "feat: implement external WordPress database schema"

# Push to remote
git push origin feature/external-wp-phase1-infra

# Create Pull Request to develop
```

### 2. Integration and Testing Flow
```bash
# After feature completion, merge to develop
git checkout develop
git pull origin develop
git merge --no-ff feature/external-wp-phase1-infra
git push origin develop

# Delete feature branch (optional)
git branch -d feature/external-wp-phase1-infra
git push origin --delete feature/external-wp-phase1-infra
```

### 3. Release Preparation Flow
```bash
# Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/external-wp-v1.0.0

# Final testing and bug fixes
git add .
git commit -m "fix: resolve production issues found in testing"

# Merge to main and develop
git checkout main
git merge --no-ff release/external-wp-v1.0.0
git tag -a v1.0.0 -m "External WordPress Integration v1.0.0"

git checkout develop
git merge --no-ff release/external-wp-v1.0.0

# Push all branches
git push origin main
git push origin develop
git push origin --tags

# Clean up
git branch -d release/external-wp-v1.0.0
git push origin --delete release/external-wp-v1.0.0
```

## Code Review Process

### Review Requirements
- **Minimum Reviewers**: 2 developers for all features
- **Security Review**: Required for authentication, API, and database changes
- **Compliance Review**: Required for CFM/LGPD related code
- **Performance Review**: Required for caching and API optimization code

### Review Checklist

#### **Code Quality (P0)**
- [ ] Code follows ESLint configuration
- [ ] TypeScript types are properly defined
- [ ] Error handling is comprehensive
- [ ] No console.log or debug statements
- [ ] Code is DRY and follows project patterns

#### **Security (P0)**
- [ ] Input validation using Zod schemas
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities in content processing
- [ ] API keys and secrets are properly managed
- [ ] Authentication and authorization are correct

#### **Compliance (P0)**
- [ ] CFM compliance filtering is implemented
- [ ] LGPD data protection is maintained
- [ ] Audit logging is included
- [ ] Medical disclaimers are properly injected
- [ ] PII detection is working

#### **Performance (P1)**
- [ ] Database queries are optimized
- [ ] Redis caching is implemented correctly
- [ ] API response times are acceptable
- [ ] Memory usage is efficient
- [ ] No memory leaks or resource issues

#### **Testing (P1)**
- [ ] Unit tests are included (>80% coverage)
- [ ] Integration tests are implemented
- [ ] Error scenarios are tested
- [ ] Mock data is realistic
- [ ] Tests are independent and reliable

### Pull Request Template

```markdown
# External WordPress Integration - [Phase/Feature Name]

## 📋 Description
Brief description of what this PR implements

## 🔧 Changes Made
- [ ] Database schema changes
- [ ] API endpoints added/modified
- [ ] Frontend components created
- [ ] Service implementations
- [ ] Configuration updates
- [ ] Tests added/updated

## 🧪 Testing
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Manual testing completed
- [ ] Performance testing done
- [ ] Security validation completed

## 📋 Checklist
- [ ] Code follows project conventions
- [ ] TypeScript compilation successful
- [ ] ESLint passing
- [ ] No security vulnerabilities
- [ ] CFM compliance verified
- [ ] Performance acceptable
- [ ] Documentation updated

## 🔍 Related Issues
Links to related tickets or issues

## 🚀 Deployment Notes
Any special deployment instructions or considerations
```

## CI/CD Pipeline

### Automated Checks
```yaml
# .github/workflows/external-wp-integration.yml
name: External WordPress Integration CI

on:
  push:
    branches: [main, develop, feature/external-wp-*]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}

    - name: Install dependencies
      run: npm ci

    - name: Run linting
      run: npm run lint

    - name: Run TypeScript check
      run: npm run type-check

    - name: Run unit tests
      run: npm run test:unit

    - name: Run integration tests
      run: npm run test:integration

    - name: Run API validation
      run: npm run validate:api

    - name: Upload coverage
      uses: codecov/codecov-action@v3

  security:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3

    - name: Run security audit
      run: npm audit --audit-level=moderate

    - name: Check dependencies
      run: npm run check:dependencies

  performance:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3

    - name: Build application
      run: npm run build

    - name: Analyze bundle
      run: npm run analyze:bundle

    - name: Run performance tests
      run: npm run test:performance
```

### Deployment Pipeline
```yaml
# .github/workflows/deploy-external-wp.yml
name: External WordPress Integration Deployment

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
    types: [closed]

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    steps:
    - uses: actions/checkout@v3

    - name: Deploy to staging
      run: |
        npm run build
        npm run deploy:staging

    - name: Run health checks
      run: npm run deploy:health

  deploy-production:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push' && success()

    needs: deploy-staging

    steps:
    - uses: actions/checkout@v3

    - name: Deploy to production
      run: |
        npm run build:production
        npm run deploy:production

    - name: Verify deployment
      run: npm run production:check
```

## Quality Gates

### Pre-commit Hooks
```javascript
// .husky/pre-commit
#!/bin/sh
. "$(dirname -- "$0")/_/husky.sh"

npm run lint
npm run type-check
npm run test:unit
npm run validate:api
```

### Pre-push Hooks
```javascript
// .husky/pre-push
#!/bin/sh
. "$(dirname -- "$0")/_/husky.sh"

npm run test:integration
npm run test:e2e
npm run security:scan
```

### Merge Requirements
- **All automated checks must pass**
- **Minimum 2 approvals required**
- **Security review required for sensitive changes**
- **Performance metrics within acceptable range**
- **Test coverage > 80%**
- **No blocking issues identified**

## Development Environment Setup

### Local Development
```bash
# Clone repository
git clone https://github.com/your-org/saraiva-vision-site.git
cd saraiva-vision-site

# Install dependencies
npm install

# Setup development database
npm run db:setup
npm run db:migrate

# Start development server
npm run dev

# Run tests in watch mode
npm run test:watch
```

### Database Setup
```javascript
// scripts/setup-local-db.js
const { createClient } = require('@supabase/supabase-js');

async function setupLocalDatabase() {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
  );

  // Run database migrations
  const migrations = [
    '001-create-external-wordpress-tables.sql',
    '002-create-cache-tables.sql',
    '003-create-sync-tables.sql'
  ];

  for (const migration of migrations) {
    const sql = await fs.readFile(`database/migrations/${migration}`, 'utf8');
    const { error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      console.error(`Migration ${migration} failed:`, error);
      process.exit(1);
    }
  }

  console.log('Database setup completed successfully');
}

setupLocalDatabase();
```

## Code Standards

### Naming Conventions
- **Database tables**: snake_case (external_wordpress_sources)
- **API endpoints**: kebab-case (/api/external-wordpress/sources)
- **React components**: PascalCase (ExternalWordPressContent)
- **JavaScript functions**: camelCase (fetchExternalContent)
- **Constants**: UPPER_SNAKE_CASE (API_TIMEOUT)

### Code Organization
```
src/
├── components/
│   ├── external-wordpress/     # External WP components
│   ├── ui/                      # Shared UI components
│   └── compliance/             # Compliance components
├── hooks/
│   ├── external-wordpress/     # External WP hooks
│   └── compliance/             # Compliance hooks
├── services/
│   ├── external-wordpress/     # External WP services
│   └── compliance/             # Compliance services
├── lib/
│   ├── external-wordpress/     # External WP utilities
│   └── compliance/             # Compliance utilities
└── types/
    ├── external-wordpress.ts   # External WP types
    └── compliance.ts          # Compliance types
```

### Comment Standards
```javascript
/**
 * External WordPress Service
 * Handles proxy requests to external WordPress installations
 *
 * @class ExternalWordPressService
 * @param {Object} config - Service configuration
 * @property {CacheService} cacheService - Cache management
 * @property {ProxyService} proxyService - Request proxy
 */

export class ExternalWordPressService {
  /**
   * Fetch content from external WordPress source
   *
   * @param {number} sourceId - Source configuration ID
   * @param {string} endpoint - API endpoint to fetch
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Normalized content
   */
  async fetchContent(sourceId, endpoint, options = {}) {
    // Implementation
  }
}
```

## Testing Strategy

### Test Organization
```
tests/
├── unit/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── lib/
├── integration/
│   ├── api/
│   ├── database/
│   └── external-services/
├── e2e/
│   ├── external-wp-flow/
│   └── compliance/
└── performance/
    ├── load-testing/
    └── caching/
```

### Test Naming Convention
```
[unit/integration/e2e]/[component]/[feature].test.js
Example: unit/components/ExternalWordPressContent.test.js
```

## Deployment Strategy

### Staging Environment
- **URL**: staging.saraivavision.com.br
- **Database**: Separate staging database
- **External Sources**: Test WordPress installations
- **Monitoring**: Full observability stack

### Production Deployment
1. **Pre-deployment checklist**:
   - [ ] All tests passing
   - [ ] Security scan completed
   - [ ] Performance benchmarks met
   - [ ] Compliance verification passed
   - [ ] Backup completed
   - [ ] Rollback plan ready

2. **Deployment process**:
   ```bash
   # Deploy to production
   npm run deploy:production

   # Verify deployment
   npm run production:check

   # Monitor health
   npm run deploy:monitor
   ```

3. **Post-deployment**:
   - Monitor error rates
   - Check performance metrics
   - Verify external source connectivity
   - Test compliance filtering
   - Validate cache performance

## Monitoring and Alerting

### Key Metrics
- **API Response Time**: < 500ms for cached content
- **Cache Hit Rate**: > 80%
- **Error Rate**: < 1%
- **Uptime**: > 99.5%
- **External Source Health**: Monitor availability

### Alert Configuration
```yaml
# alerts/external-wordpress.yml
- alert: HighErrorRate
  expr: rate(http_requests_total{status=~"5..", endpoint=~"/api/external-wordpress.*"}[5m]) > 0.01
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "External WordPress API error rate high"

- alert: CacheHitRateLow
  expr: rate(cache_hits_total{service="external-wordpress"}[5m]) / rate(cache_requests_total{service="external-wordpress"}[5m]) < 0.8
  for: 10m
  labels:
    severity: warning
  annotations:
    summary: "External WordPress cache hit rate low"
```

## Rollback Procedure

### Immediate Rollback
```bash
# Rollback to previous version
git checkout main
git reset --hard HEAD~1
git push --force origin main

# Restore database
npm run db:rollback
npm run db:migrate

# Restart services
npm run deploy:restart
```

### Database Rollback
```javascript
// scripts/rollback-external-wp.js
async function rollbackExternalWordPress() {
  const supabase = createClient(/* config */);

  // Disable external sources
  await supabase
    .from('external_wordpress_sources')
    .update({ status: 'inactive' })
    .neq('status', 'error');

  // Clear cache
  await supabase
    .from('external_wordpress_content')
    .delete()
    .neq('source_id', null);

  console.log('External WordPress integration rolled back');
}
```

## Documentation Requirements

### Code Documentation
- **JSDoc comments** for all public functions
- **TypeScript interfaces** for all data structures
- **README files** for complex modules
- **API documentation** for all endpoints

### Process Documentation
- **Development guide** for new team members
- **Deployment procedures** for operations
- **Troubleshooting guide** for common issues
- **Compliance documentation** for auditors

This development workflow ensures systematic, high-quality implementation of the external WordPress integration feature while maintaining code quality, security, and compliance requirements throughout the development lifecycle.
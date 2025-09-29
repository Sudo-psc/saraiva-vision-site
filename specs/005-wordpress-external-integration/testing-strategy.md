# Testing Strategy for External WordPress Integration

## Overview

This document defines the comprehensive testing strategy for implementing external WordPress integration in the Saraiva Vision platform. The strategy ensures quality, reliability, and compliance while maintaining systematic test coverage across all integration components.

## Testing Philosophy

### Quality-First Approach
- **Test-Driven Development**: Write tests before implementation where possible
- **Shift-Left Testing**: Catch issues early in development cycle
- **Comprehensive Coverage**: Test all integration points and edge cases
- **Automation Priority**: Automate all repetitive testing tasks
- **Continuous Validation**: Integrate testing into CI/CD pipeline

### Compliance and Security Focus
- **CFM Compliance Testing**: Validate medical content filtering
- **LGPD Privacy Testing**: Verify data protection and anonymization
- **Security Testing**: Test authentication, authorization, and API security
- **Performance Testing**: Ensure responsive performance under load
- **Accessibility Testing**: WCAG 2.1 AA compliance for all components

## Testing Pyramid Structure

### Test Distribution (60/25/15 Model)
```
                    ┌─────────────────┐
                    │   E2E Tests     │ ← 15%
                    │  (User Flows)   │
                    └─────────────────┘
                           ↑
                    ┌─────────────────┐
                    │ Integration     │ ← 25%
                    │    Tests        │
                    └─────────────────┘
                           ↑
                    ┌─────────────────┐
                    │   Unit Tests    │ ← 60%
                    │ (Components/    │
                    │  Services)      │
                    └─────────────────┘
```

### Coverage Targets
- **Unit Tests**: 80% minimum coverage for critical paths
- **Integration Tests**: 90% API endpoint coverage
- **E2E Tests**: 100% critical user flow coverage
- **Overall**: 75% combined coverage minimum

## Test Organization Structure

### Directory Structure
```
tests/
├── unit/
│   ├── components/
│   │   ├── external-wordpress/
│   │   │   ├── ExternalWordPressContent.test.jsx
│   │   │   ├── ExternalSourceManager.test.jsx
│   │   │   └── ExternalSyncStatus.test.jsx
│   │   ├── compliance/
│   │   │   ├── CFMComplianceFilter.test.jsx
│   │   │   └── LGPDProtection.test.jsx
│   │   └── ui/
│   │       ├── LoadingSpinner.test.jsx
│   │       └── ErrorBoundary.test.jsx
│   ├── hooks/
│   │   ├── external-wordpress/
│   │   │   ├── useExternalWordPress.test.js
│   │   │   ├── useExternalSources.test.js
│   │   │   ├── useExternalCache.test.js
│   │   │   └── useExternalSync.test.js
│   │   └── compliance/
│   │       ├── useCFMCompliance.test.js
│   │       └── useLGPDProtection.test.js
│   ├── services/
│   │   ├── external-wordpress/
│   │   │   ├── ProxyService.test.js
│   │   │   ├── CacheService.test.js
│   │   │   ├── TransformService.test.js
│   │   │   ├── HealthService.test.js
│   │   │   └── SyncService.test.js
│   │   └── compliance/
│   │       ├── CFMValidator.test.js
│   │       └── LGPDAnonymizer.test.js
│   └── lib/
│       ├── external-wordpress/
│       │   ├── request-builder.test.js
│       │   ├── response-normalizer.test.js
│       │   ├── error-handler.test.js
│       │   └── validators.test.js
│       └── compliance/
│           ├── content-filter.test.js
│           └── pii-detector.test.js
├── integration/
│   ├── api/
│   │   ├── external-wordpress/
│   │   │   ├── sources.test.js
│   │   │   ├── posts.test.js
│   │   │   ├── pages.test.js
│   │   │   ├── media.test.js
│   │   │   ├── categories.test.js
│   │   │   ├── tags.test.js
│   │   │   └── sync.test.js
│   │   ├── middleware/
│   │   │   ├── authentication.test.js
│   │   │   ├── rate-limiter.test.js
│   │   │   ├── cache.test.js
│   │   │   ├── validation.test.js
│   │   │   └── compliance.test.js
│   │   └── health/
│   │       ├── health-check.test.js
│   │       └── monitoring.test.js
│   ├── database/
│   │   ├── external-wordpress/
│   │   │   ├── sources.test.js
│   │   │   ├── content.test.js
│   │   │   ├── sync-logs.test.js
│   │   │   └── media.test.js
│   │   └── supabase/
│   │       ├── rls-policies.test.js
│   │       ├── migrations.test.js
│   │       └── views.test.js
│   ├── cache/
│   │   ├── redis.test.js
│   │   ├── database-fallback.test.js
│   │   └── invalidation.test.js
│   └── external-services/
│       ├── wordpress-api.test.js
│       ├── google-business.test.js
│       └── instagram.test.js
├── e2e/
│   ├── external-wp-flow/
│   │   ├── source-setup.spec.js
│   │   ├── content-retrieval.spec.js
│   │   ├── synchronization.spec.js
│   │   └── admin-interface.spec.js
│   ├── compliance/
│   │   ├── cfm-validation.spec.js
│   │   ├── lgpd-protection.spec.js
│   │   └── medical-disclaimer.spec.js
│   └── performance/
│       ├── load-testing.spec.js
│       ├── cache-performance.spec.js
│       └── api-response-time.spec.js
└── performance/
    ├── load-testing/
    │   ├── external-wp-load.test.js
    │   ├── concurrent-users.test.js
    │   └── cache-stress.test.js
    └── optimization/
        ├── bundle-analysis.test.js
        ├── api-performance.test.js
        └── database-query.test.js
```

## Unit Testing Strategy

### Component Testing
```javascript
// tests/unit/components/external-wordpress/ExternalWordPressContent.test.jsx
import { render, screen, waitFor } from '@testing-library/react';
import { ExternalWordPressContent } from '@/components/external-wordpress/ExternalWordPressContent';
import { useExternalWordPress } from '@/hooks/useExternalWordPress';

// Mock the hook
jest.mock('@/hooks/useExternalWordPress');

describe('ExternalWordPressContent', () => {
  const mockFetchContent = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    useExternalWordPress.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      fetchContent: mockFetchContent
    });

    render(<ExternalWordPressContent sourceId={1} contentType="posts" />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  test('renders content when data is loaded', async () => {
    const mockData = [
      {
        id: 1,
        title: 'Test Post',
        content: '<p>Test content</p>',
        excerpt: 'Test excerpt'
      }
    ];

    useExternalWordPress.mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      fetchContent: mockFetchContent
    });

    render(<ExternalWordPressContent sourceId={1} contentType="posts" />);

    await waitFor(() => {
      expect(screen.getByText('Test Post')).toBeInTheDocument();
    });
  });

  test('renders error state when API fails', () => {
    useExternalWordPress.mockReturnValue({
      data: null,
      loading: false,
      error: 'Failed to fetch content',
      fetchContent: mockFetchContent
    });

    render(<ExternalWordPressContent sourceId={1} contentType="posts" />);
    expect(screen.getByText('Failed to fetch content')).toBeInTheDocument();
  });

  test('calls fetchContent on mount', () => {
    useExternalWordPress.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      fetchContent: mockFetchContent
    });

    render(<ExternalWordPressContent sourceId={1} contentType="posts" />);
    expect(mockFetchContent).toHaveBeenCalledWith('posts?per_page=10');
  });
});
```

### Hook Testing
```javascript
// tests/unit/hooks/external-wordpress/useExternalWordPress.test.js
import { renderHook, act } from '@testing-library/react';
import { useExternalWordPress } from '@/hooks/useExternalWordPress';
import { externalWordPressAPI } from '@/services/external-wordpress';

// Mock the API service
jest.mock('@/services/external-wordpress');

describe('useExternalWordPress', () => {
  const mockAPIResponse = {
    data: [{ id: 1, title: 'Test Post' }],
    loading: false,
    error: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
    externalWordPressAPI.fetchContent.mockResolvedValue(mockAPIResponse);
  });

  test('initializes with default state', () => {
    const { result } = renderHook(() => useExternalWordPress(1));

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.fetchContent).toBeInstanceOf(Function);
  });

  test('fetches content successfully', async () => {
    const { result } = renderHook(() => useExternalWordPress(1));

    await act(async () => {
      await result.current.fetchContent('posts');
    });

    expect(externalWordPressAPI.fetchContent).toHaveBeenCalledWith(1, 'posts');
    expect(result.current.data).toEqual(mockAPIResponse.data);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('handles API errors', async () => {
    const errorMessage = 'API Error';
    externalWordPressAPI.fetchContent.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useExternalWordPress(1));

    await act(async () => {
      await result.current.fetchContent('posts');
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.loading).toBe(false);
  });

  test('caches subsequent requests for same endpoint', async () => {
    const { result } = renderHook(() => useExternalWordPress(1));

    // First request
    await act(async () => {
      await result.current.fetchContent('posts');
    });

    // Second request for same endpoint
    await act(async () => {
      await result.current.fetchContent('posts');
    });

    // Should only call API once due to caching
    expect(externalWordPressAPI.fetchContent).toHaveBeenCalledTimes(1);
  });
});
```

### Service Testing
```javascript
// tests/unit/services/external-wordpress/ProxyService.test.js
import { ProxyService } from '@/services/external-wordpress/ProxyService';
import { CacheService } from '@/services/external-wordpress/CacheService';
import { HealthService } from '@/services/external-wordpress/HealthService';

// Mock dependencies
jest.mock('@/services/external-wordpress/CacheService');
jest.mock('@/services/external-wordpress/HealthService');

describe('ProxyService', () => {
  let proxyService;
  let mockCacheService;
  let mockHealthService;

  beforeEach(() => {
    mockCacheService = new CacheService();
    mockHealthService = new HealthService();
    proxyService = new ProxyService(mockCacheService, mockHealthService);
  });

  describe('proxyRequest', () => {
    const mockSourceConfig = {
      id: 1,
      base_url: 'https://external-wp.com',
      api_key: 'test-key',
      cache_ttl: 300
    };

    const mockEndpoint = 'posts';
    const mockOptions = { params: { per_page: 10 } };

    test('returns cached response if available and not expired', async () => {
      const cachedResponse = {
        data: { id: 1, title: 'Cached Post' },
        cached_at: new Date(),
        expires_at: new Date(Date.now() + 300000) // 5 minutes from now
      };

      mockCacheService.get.mockResolvedValue(cachedResponse);

      const result = await proxyService.proxyRequest(mockSourceConfig, mockEndpoint, mockOptions);

      expect(result).toEqual(cachedResponse.data);
      expect(mockCacheService.get).toHaveBeenCalledWith('external_wp_1_posts_{"params":{"per_page":10}}');
      expect(mockHealthService.checkHealth).not.toHaveBeenCalled();
    });

    test('fetches fresh content when cache is empty', async () => {
      const freshResponse = { data: [{ id: 1, title: 'Fresh Post' }] };

      mockCacheService.get.mockResolvedValue(null);
      mockHealthService.checkHealth.mockResolvedValue({ status: 'healthy' });

      // Mock the actual HTTP request
      jest.spyOn(proxyService, 'executeRequest').mockResolvedValue(freshResponse);
      mockCacheService.set.mockResolvedValue();

      const result = await proxyService.proxyRequest(mockSourceConfig, mockEndpoint, mockOptions);

      expect(result).toEqual(freshResponse);
      expect(mockHealthService.checkHealth).toHaveBeenCalledWith(mockSourceConfig);
      expect(mockCacheService.set).toHaveBeenCalled();
    });

    test('throws error when external source is unhealthy', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockHealthService.checkHealth.mockResolvedValue({ status: 'unhealthy' });

      await expect(proxyService.proxyRequest(mockSourceConfig, mockEndpoint, mockOptions))
        .rejects.toThrow('External source not available');
    });

    test('handles and logs errors appropriately', async () => {
      const error = new Error('Network Error');

      mockCacheService.get.mockResolvedValue(null);
      mockHealthService.checkHealth.mockResolvedValue({ status: 'healthy' });
      jest.spyOn(proxyService, 'executeRequest').mockRejectedValue(error);

      await expect(proxyService.proxyRequest(mockSourceConfig, mockEndpoint, mockOptions))
        .rejects.toThrow('Network Error');
    });
  });
});
```

## Integration Testing Strategy

### API Integration Testing
```javascript
// tests/integration/api/external-wordpress/sources.test.js
import request from 'supertest';
import { app } from '@/api';
import { createTestSource } from '@/__tests__/helpers/test-data';

describe('External WordPress Sources API', () => {
  let testSource;

  beforeEach(async () => {
    testSource = await createTestSource();
  });

  describe('POST /api/external-wordpress/sources', () => {
    test('creates new source with valid data', async () => {
      const sourceData = {
        name: 'Test Blog',
        base_url: 'https://test-blog.com',
        api_key: 'test-api-key'
      };

      const response = await request(app)
        .post('/api/external-wordpress/sources')
        .send(sourceData)
        .expect(201);

      expect(response.body).toMatchObject({
        name: sourceData.name,
        base_url: sourceData.base_url,
        status: 'active'
      });
      expect(response.body.id).toBeDefined();
    });

    test('validates required fields', async () => {
      const invalidData = {
        name: '', // Invalid: empty name
        base_url: 'invalid-url' // Invalid: not a valid URL
      };

      const response = await request(app)
        .post('/api/external-wordpress/sources')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    test('validates URL format', async () => {
      const invalidData = {
        name: 'Test Blog',
        base_url: 'not-a-valid-url'
      };

      const response = await request(app)
        .post('/api/external-wordpress/sources')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toContain('base_url');
    });
  });

  describe('GET /api/external-wordpress/sources', () => {
    test('returns list of sources', async () => {
      const response = await request(app)
        .get('/api/external-wordpress/sources')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    test('filters by status when query param provided', async () => {
      const response = await request(app)
        .get('/api/external-wordpress/sources?status=active')
        .expect(200);

      expect(response.body.every(source => source.status === 'active')).toBe(true);
    });
  });

  describe('GET /api/external-wordpress/sources/:id', () => {
    test('returns specific source', async () => {
      const response = await request(app)
        .get(`/api/external-wordpress/sources/${testSource.id}`)
        .expect(200);

      expect(response.body.id).toBe(testSource.id);
      expect(response.body.name).toBe(testSource.name);
    });

    test('returns 404 for non-existent source', async () => {
      const response = await request(app)
        .get('/api/external-wordpress/sources/99999')
        .expect(404);
    });
  });
});
```

### Database Integration Testing
```javascript
// tests/integration/database/external-wordpress/content.test.js
import { createClient } from '@supabase/supabase-js';
import { migrateDatabase, seedTestData } from '@/__tests__/helpers/database';

describe('External WordPress Content Database Integration', () => {
  let supabase;
  let testSource;

  beforeAll(async () => {
    // Setup test database
    await migrateDatabase();
    supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

    // Seed test data
    const { data } = await seedTestData();
    testSource = data.sources[0];
  });

  describe('Content Caching', () => {
    test('stores and retrieves cached content', async () => {
      const contentData = {
        source_id: testSource.id,
        content_type: 'post',
        external_id: 123,
        content: {
          title: 'Test Post',
          content: '<p>Test content</p>'
        },
        expires_at: new Date(Date.now() + 300000) // 5 minutes
      };

      // Store content
      const { data: storedContent, error: storeError } = await supabase
        .from('external_wordpress_content')
        .insert([contentData])
        .select()
        .single();

      expect(storeError).toBeNull();
      expect(storedContent.id).toBeDefined();

      // Retrieve content
      const { data: retrievedContent, error: retrieveError } = await supabase
        .from('external_wordpress_content')
        .select('*')
        .eq('source_id', testSource.id)
        .eq('external_id', 123)
        .single();

      expect(retrieveError).toBeNull();
      expect(retrievedContent.content).toEqual(contentData.content);
    });

    test('respects RLS policies', async () => {
      // Test with anonymous user (should fail)
      const anonymousClient = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

      const { data, error } = await anonymousClient
        .from('external_wordpress_content')
        .select('*');

      expect(error).toBeDefined();
      expect(data).toBeNull();
    });
  });

  describe('Content Expiration', () => {
    test('automatically handles expired content', async () => {
      const expiredContent = {
        source_id: testSource.id,
        content_type: 'post',
        external_id: 456,
        content: { title: 'Expired Post' },
        expires_at: new Date(Date.now() - 1000) // Expired 1 second ago
      };

      // Insert expired content
      await supabase
        .from('external_wordpress_content')
        .insert([expiredContent]);

      // Try to retrieve expired content
      const { data, error } = await supabase
        .from('external_wordpress_content')
        .select('*')
        .eq('source_id', testSource.id)
        .eq('external_id', 456)
        .single();

      // Should still be in database but marked as expired
      expect(data).toBeDefined();
      expect(new Date(data.expires_at).getTime()).toBeLessThan(Date.now());
    });
  });
});
```

## End-to-End Testing Strategy

### Critical User Flow Testing
```javascript
// tests/e2e/external-wp-flow/source-setup.spec.js
import { test, expect } from '@playwright/test';

test.describe('External WordPress Source Setup Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'admin@saraivavision.com.br');
    await page.fill('[data-testid="password"]', 'admin-password');
    await page.click('[data-testid="login-button"]');

    // Navigate to external sources admin
    await page.goto('/admin/external-wordpress/sources');
  });

  test('allows admin to add new external WordPress source', async ({ page }) => {
    // Click add new source button
    await page.click('[data-testid="add-source-button"]');

    // Fill in source details
    await page.fill('[data-testid="source-name"]', 'Test Medical Blog');
    await page.fill('[data-testid="source-url"]', 'https://test-medical-blog.com');
    await page.fill('[data-testid="source-api-key"]', 'test-api-key-123');

    // Configure sync settings
    await page.selectOption('[data-testid="sync-frequency"]', '15 minutes');
    await page.fill('[data-testid="cache-ttl"]', '600');

    // Enable compliance filtering
    await page.check('[data-testid="enable-compliance"]');

    // Save source
    await page.click('[data-testid="save-source-button"]');

    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toHaveText('Source created successfully');

    // Verify source appears in list
    await expect(page.locator('text=Test Medical Blog')).toBeVisible();
  });

  test('validates source configuration before saving', async ({ page }) => {
    await page.click('[data-testid="add-source-button"]');

    // Try to save without required fields
    await page.click('[data-testid="save-source-button"]');

    // Should show validation errors
    await expect(page.locator('[data-testid="name-error"]')).toHaveText('Name is required');
    await expect(page.locator('[data-testid="url-error"]')).toHaveText('Valid URL is required');
  });

  test('tests source connection before saving', async ({ page }) => {
    await page.click('[data-testid="add-source-button"]');

    // Fill in source details with invalid URL
    await page.fill('[data-testid="source-name"]', 'Invalid Source');
    await page.fill('[data-testid="source-url"]', 'https://invalid-domain-that-does-not-exist.com');
    await page.fill('[data-testid="source-api-key"]', 'test-key');

    // Click test connection button
    await page.click('[data-testid="test-connection-button"]');

    // Should show connection error
    await expect(page.locator('[data-testid="connection-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="connection-error"]')).toHaveText(/Connection failed/i);
  });
});
```

### Compliance Validation Testing
```javascript
// tests/e2e/compliance/cfm-validation.spec.js
import { test, expect } from '@playwright/test';

test.describe('CFM Compliance Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Setup test environment with compliance requirements
    await page.goto('/admin/external-wordpress/compliance-test');
  });

  test('automatically injects medical disclaimer into external content', async ({ page }) => {
    // Load test content from external source
    await page.fill('[data-testid="test-content-url"]', 'https://test-medical-content.com/post/123');
    await page.click('[data-testid="load-content-button"]');

    // Wait for content to be processed
    await page.waitForSelector('[data-testid="processed-content"]');

    // Verify medical disclaimer is present
    const content = await page.locator('[data-testid="processed-content"]').textContent();
    expect(content).toContain('Este conteúdo não substitui uma consulta médica');
    expect(content).toContain('O Conselho Federal de Medicina');
  });

  test('flags inappropriate medical content', async ({ page }) => {
    // Load content with medical claims
    await page.fill('[data-testid="test-content"]', 'Este tratamento cura 100% dos casos de glaucoma sem cirurgia');
    await page.click('[data-testid="validate-content-button"]');

    // Should flag as non-compliant
    await expect(page.locator('[data-testid="compliance-warning"]')).toBeVisible();
    await expect(page.locator('[data-testid="compliance-warning"]')).toHaveText(/Conteúdo não compatível/i);
  });

  test('detects and anonymizes PII data', async ({ page }) => {
    // Load content with patient information
    await page.fill('[data-testid="test-content"]', 'Paciente João Silva, CPF 123.456.789-00, nascido em 15/03/1980');
    await page.click('[data-testid="validate-content-button"]');

    // Should anonymize PII
    const processedContent = await page.locator('[data-testid="processed-content"]').textContent();
    expect(processedContent).not.toContain('João Silva');
    expect(processedContent).not.toContain('123.456.789-00');
    expect(processedContent).not.toContain('15/03/1980');
    expect(processedContent).toContain('[NOME DO PACIENTE]');
    expect(processedContent).toContain('[CPF]');
    expect(processedContent).toContain('[DATA DE NASCIMENTO]');
  });
});
```

## Performance Testing Strategy

### Load Testing with K6
```javascript
// tests/performance/load-testing/external-wp-load.test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const cacheHitRate = new Rate('cache_hit_rate');
const apiResponseTime = new Trend('api_response_time');

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 200 },  // Ramp up to 200 users
    { duration: '5m', target: 200 },  // Stay at 200 users
    { duration: '2m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests < 500ms
    http_req_failed: ['rate<0.01'],   // <1% error rate
    cache_hit_rate: ['rate>0.8'],     // >80% cache hit rate
  },
};

const BASE_URL = 'http://localhost:3002';

export default function () {
  // Test content retrieval
  const contentResponse = http.get(`${BASE_URL}/api/external-wordpress/1/posts?per_page=10`);

  check(contentResponse, {
    'content status is 200': (r) => r.status === 200,
    'content response time < 500ms': (r) => r.timings.duration < 500,
    'content has cache header': (r) => r.headers['X-Cache'] === 'HIT',
  });

  // Record custom metrics
  apiResponseTime.add(contentResponse.timings.duration);
  if (contentResponse.headers['X-Cache'] === 'HIT') {
    cacheHitRate.add(1);
  }

  // Test source health check
  const healthResponse = http.get(`${BASE_URL}/api/external-wordpress/1/health`);

  check(healthResponse, {
    'health status is 200': (r) => r.status === 200,
    'health response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);
}

export function teardown(data) {
  // Generate performance report
  console.log('Cache Hit Rate:', cacheHitRate.rate);
  console.log('Average API Response Time:', apiResponseTime.mean);
}
```

### Cache Performance Testing
```javascript
// tests/performance/cache-performance.spec.js
import { test, expect } from '@playwright/test';

test.describe('Cache Performance', () => {
  test('measures cache hit rate under load', async ({ page }) => {
    // Clear cache before test
    await page.goto('/api/external-wordpress/cache/clear');

    // Make identical requests to test cache
    const responseTimes = [];
    const cacheStatuses = [];

    for (let i = 0; i < 50; i++) {
      const startTime = Date.now();

      const response = await page.request.get('/api/external-wordpress/1/posts/1');
      const responseTime = Date.now() - startTime;

      responseTimes.push(responseTime);
      cacheStatuses.push(response.headers()['x-cache']);

      // Small delay between requests
      await page.waitForTimeout(100);
    }

    // Calculate cache hit rate
    const cacheHits = cacheStatuses.filter(status => status === 'HIT').length;
    const cacheHitRate = cacheHits / cacheStatuses.length;

    // Calculate average response times
    const cacheMissTimes = [];
    const cacheHitTimes = [];

    for (let i = 0; i < responseTimes.length; i++) {
      if (cacheStatuses[i] === 'HIT') {
        cacheHitTimes.push(responseTimes[i]);
      } else {
        cacheMissTimes.push(responseTimes[i]);
      }
    }

    const avgCacheHitTime = cacheHitTimes.reduce((a, b) => a + b, 0) / cacheHitTimes.length;
    const avgCacheMissTime = cacheMissTimes.reduce((a, b) => a + b, 0) / cacheMissTimes.length;

    // Assert performance expectations
    expect(cacheHitRate).toBeGreaterThan(0.8); // 80% cache hit rate
    expect(avgCacheHitTime).toBeLessThan(100); // Cache hits < 100ms
    expect(avgCacheMissTime).toBeLessThan(500); // Cache misses < 500ms

    console.log(`Cache Hit Rate: ${(cacheHitRate * 100).toFixed(2)}%`);
    console.log(`Avg Cache Hit Time: ${avgCacheHitTime.toFixed(2)}ms`);
    console.log(`Avg Cache Miss Time: ${avgCacheMissTime.toFixed(2)}ms`);
  });
});
```

## Mocking Strategy

### External API Mocking
```javascript
// tests/__mocks__/external-wordpress-api.js
export const mockWordPressAPI = {
  // Mock post data
  posts: [
    {
      id: 1,
      title: { rendered: 'Test Post Title' },
      content: { rendered: '<p>Test post content</p>' },
      excerpt: { rendered: 'Test excerpt' },
      date: '2024-01-01T00:00:00Z',
      modified: '2024-01-01T00:00:00Z',
      slug: 'test-post',
      status: 'publish',
      author: 1,
      categories: [1, 2],
      tags: [3, 4],
      featured_media: 123
    }
  ],

  // Mock media data
  media: [
    {
      id: 123,
      title: { rendered: 'Test Image' },
      media_type: 'image',
      mime_type: 'image/jpeg',
      source_url: 'https://test.com/image.jpg',
      alt_text: 'Test image description'
    }
  ],

  // Mock categories
  categories: [
    {
      id: 1,
      name: 'Medical News',
      slug: 'medical-news',
      description: 'Latest medical news and updates'
    }
  ],

  // Mock responses
  getPosts: () => ({ data: mockWordPressAPI.posts }),
  getPost: (id) => ({ data: mockWordPressAPI.posts.find(p => p.id === id) }),
  getMedia: (id) => ({ data: mockWordPressAPI.media.find(m => m.id === id) }),
  getCategories: () => ({ data: mockWordPressAPI.categories }),

  // Mock error responses
  simulateError: (errorCode = 500) => {
    const error = new Error(`API Error: ${errorCode}`);
    error.response = { status: errorCode };
    throw error;
  },

  // Mock rate limiting
  simulateRateLimit: () => {
    const error = new Error('Rate limit exceeded');
    error.response = { status: 429 };
    throw error;
  }
};

// Mock fetch implementation
global.fetch = jest.fn();
fetch.mockImplementation((url) => {
  if (url.includes('/wp/v2/posts')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockWordPressAPI.posts)
    });
  }

  if (url.includes('/wp/v2/media')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockWordPressAPI.media)
    });
  }

  if (url.includes('/wp/v2/categories')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockWordPressAPI.categories)
    });
  }

  return Promise.resolve({
    ok: false,
    status: 404,
    json: () => Promise.resolve({})
  });
});
```

### Database Mocking
```javascript
// tests/__mocks__/database.js
export const mockDatabase = {
  // Mock source data
  sources: [
    {
      id: 1,
      name: 'Test Medical Blog',
      base_url: 'https://test-medical-blog.com',
      api_key: 'test-api-key',
      status: 'active',
      sync_frequency: '5 minutes',
      cache_ttl: 300,
      enable_compliance_filter: true,
      health_status: 'healthy'
    }
  ],

  // Mock content data
  content: [
    {
      id: 1,
      source_id: 1,
      content_type: 'post',
      external_id: 123,
      content: {
        title: 'Test Post',
        content: '<p>Test content</p>'
      },
      cached_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 300000).toISOString(),
      compliance_score: 85,
      cache_hits: 10
    }
  ],

  // Query methods
  findSource: (id) => mockDatabase.sources.find(s => s.id === id),
  findContent: (sourceId, contentType, externalId) =>
    mockDatabase.content.find(c =>
      c.source_id === sourceId &&
      c.content_type === contentType &&
      c.external_id === externalId
    ),

  // Mock database operations
  insertContent: (content) => {
    const newContent = {
      id: mockDatabase.content.length + 1,
      ...content,
      cached_at: new Date().toISOString()
    };
    mockDatabase.content.push(newContent);
    return newContent;
  },

  updateContent: (id, updates) => {
    const index = mockDatabase.content.findIndex(c => c.id === id);
    if (index !== -1) {
      mockDatabase.content[index] = { ...mockDatabase.content[index], ...updates };
    }
    return mockDatabase.content[index];
  },

  // Mock errors
  simulateConnectionError: () => {
    throw new Error('Database connection failed');
  },

  simulateQueryError: () => {
    throw new Error('Query execution failed');
  }
};

// Mock Supabase client
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: mockDatabase.content[0], error: null }))
      })),
      gte: jest.fn(() => Promise.resolve({ data: mockDatabase.content, error: null }))
    })),
    insert: jest.fn((data) => Promise.resolve({
      data: Array.isArray(data) ? data.map(d => mockDatabase.insertContent(d)) : [mockDatabase.insertContent(data)],
      error: null
    })),
    update: jest.fn((updates) => ({
      eq: jest.fn(() => Promise.resolve({
        data: [mockDatabase.updateContent(1, updates)],
        error: null
      }))
    })),
    delete: jest.fn(() => Promise.resolve({ data: null, error: null }))
  })),
  rpc: jest.fn(() => Promise.resolve({ data: null, error: null }))
};

export default mockSupabase;
```

## CI/CD Pipeline Integration

### GitHub Actions Configuration
```yaml
# .github/workflows/external-wp-integration-tests.yml
name: External WordPress Integration Tests

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

    - name: Run unit tests
      run: npm run test:unit
      env:
        NODE_ENV: test
        VITE_SUPABASE_URL: ${{ secrets.SUPABASE_TEST_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_TEST_ANON_KEY }}

    - name: Run integration tests
      run: npm run test:integration
      env:
        SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_TEST_SERVICE_KEY }}
        TEST_DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

    - name: Run E2E tests
      run: npm run test:e2e
      env:
        BASE_URL: http://localhost:3002
        ADMIN_EMAIL: ${{ secrets.ADMIN_EMAIL }}
        ADMIN_PASSWORD: ${{ secrets.ADMIN_PASSWORD }}

    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: external-wp-integration

  performance:
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: 20

    - name: Install dependencies
      run: npm ci

    - name: Install k6
      run: |
        curl https://github.com/grafana/k6/releases/download/v0.47.0/k6-v0.47.0-linux-amd64.tar.gz -L | tar xvz --strip-components 1
        sudo mv k6 /usr/local/bin/

    - name: Run load tests
      run: k6 run tests/performance/load-testing/external-wp-load.test.js
      env:
        BASE_URL: http://localhost:3002

  security:
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v3

    - name: Run security audit
      run: npm audit --audit-level=moderate

    - name: Check for vulnerabilities
      run: npm run security:check

    - name: Validate API security
      run: npm run test:security
```

### Quality Gates Configuration
```javascript
// .eslintrc.js for external WordPress integration
module.exports = {
  extends: [
    '@react-native-community',
    'plugin:react-hooks/recommended',
    'plugin:security/recommended'
  ],
  plugins: ['security', 'jest'],
  rules: {
    // Security rules
    'security/detect-object-injection': 'error',
    'security/detect-non-literal-fs-filename': 'error',
    'security/detect-possible-timing-attacks': 'warn',

    // React rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/prop-types': 'off', // Using TypeScript

    // Best practices
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': 'error',
    'prefer-const': 'error',
    'no-var': 'error',

    // Test-specific rules
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error'
  },
  env: {
    browser: true,
    node: true,
    es2020: true,
    jest: true
  },
  overrides: [
    {
      files: ['tests/**/*.{js,jsx}'],
      env: {
        jest: true
      },
      rules: {
        'no-console': 'off' // Allow console in tests
      }
    }
  ]
};
```

## Test Reporting and Monitoring

### Coverage Reporting
```javascript
// jest.config.js
module.exports = {
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'clover',
    'html',
    'json-summary'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 75,
      statements: 75
    },
    // Stricter thresholds for critical modules
    './src/services/external-wordpress/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './src/hooks/useExternalWordPress.js': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.d.ts',
    '!src/index.js',
    '!src/reportWebVitals.js'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '.test.',
    '.spec.'
  ]
};
```

### Performance Monitoring
```javascript
// tests/performance/monitoring.js
export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      responseTimes: [],
      cacheHitRates: [],
      errorRates: [],
      memoryUsage: []
    };
  }

  recordResponseTime(endpoint, duration) {
    this.metrics.responseTimes.push({ endpoint, duration, timestamp: Date.now() });
  }

  recordCacheHit(hit) {
    this.metrics.cacheHitRates.push({ hit, timestamp: Date.now() });
  }

  recordError(endpoint, error) {
    this.metrics.errorRates.push({ endpoint, error, timestamp: Date.now() });
  }

  recordMemoryUsage(usage) {
    this.metrics.memoryUsage.push({ usage, timestamp: Date.now() });
  }

  generateReport() {
    const report = {
      summary: {
        totalRequests: this.metrics.responseTimes.length,
        averageResponseTime: this.calculateAverageResponseTime(),
        cacheHitRate: this.calculateCacheHitRate(),
        errorRate: this.calculateErrorRate(),
        averageMemoryUsage: this.calculateAverageMemoryUsage()
      },
      details: {
        responseTimes: this.metrics.responseTimes,
        cacheHitRates: this.metrics.cacheHitRates,
        errorRates: this.metrics.errorRates,
        memoryUsage: this.metrics.memoryUsage
      },
      recommendations: this.generateRecommendations()
    };

    // Save report
    fs.writeFileSync(
      `performance-report-${Date.now()}.json`,
      JSON.stringify(report, null, 2)
    );

    return report;
  }

  calculateAverageResponseTime() {
    if (this.metrics.responseTimes.length === 0) return 0;
    const sum = this.metrics.responseTimes.reduce((acc, curr) => acc + curr.duration, 0);
    return sum / this.metrics.responseTimes.length;
  }

  calculateCacheHitRate() {
    if (this.metrics.cacheHitRates.length === 0) return 0;
    const hits = this.metrics.cacheHitRates.filter(r => r.hit).length;
    return hits / this.metrics.cacheHitRates.length;
  }

  calculateErrorRate() {
    if (this.metrics.errorRates.length === 0) return 0;
    return this.metrics.errorRates.length / Math.max(this.metrics.responseTimes.length, 1);
  }

  calculateAverageMemoryUsage() {
    if (this.metrics.memoryUsage.length === 0) return 0;
    const sum = this.metrics.memoryUsage.reduce((acc, curr) => acc + curr.usage, 0);
    return sum / this.metrics.memoryUsage.length;
  }

  generateRecommendations() {
    const recommendations = [];

    const avgResponseTime = this.calculateAverageResponseTime();
    if (avgResponseTime > 500) {
      recommendations.push({
        priority: 'high',
        issue: 'High average response time',
        recommendation: 'Optimize API queries and implement caching strategies'
      });
    }

    const cacheHitRate = this.calculateCacheHitRate();
    if (cacheHitRate < 0.8) {
      recommendations.push({
        priority: 'medium',
        issue: 'Low cache hit rate',
        recommendation: 'Review cache key generation and TTL settings'
      });
    }

    const errorRate = this.calculateErrorRate();
    if (errorRate > 0.05) {
      recommendations.push({
        priority: 'high',
        issue: 'High error rate',
        recommendation: 'Implement better error handling and retry logic'
      });
    }

    return recommendations;
  }
}
```

## Test Data Management

### Test Data Factory
```javascript
// tests/__tests__/helpers/factory.js
import { faker } from '@faker-js/faker';

export class TestDataFactory {
  // Create test source
  static createSource(overrides = {}) {
    return {
      name: faker.company.name() + ' Blog',
      base_url: faker.internet.url(),
      api_key: faker.string.alphanumeric(32),
      status: 'active',
      sync_frequency: '5 minutes',
      cache_ttl: 300,
      enable_compliance_filter: true,
      enable_ssl_verification: true,
      rate_limit_requests: 1000,
      rate_limit_window: 3600,
      ...overrides
    };
  }

  // Create test post
  static createPost(overrides = {}) {
    return {
      id: faker.number.int({ min: 1, max: 10000 }),
      title: { rendered: faker.lorem.sentence() },
      content: { rendered: `<p>${faker.lorem.paragraphs()}</p>` },
      excerpt: { rendered: faker.lorem.sentence() },
      date: faker.date.past().toISOString(),
      modified: faker.date.recent().toISOString(),
      slug: faker.lorem.slug(),
      status: 'publish',
      author: faker.number.int({ min: 1, max: 100 }),
      categories: [1, 2],
      tags: [3, 4],
      featured_media: faker.number.int({ min: 1, max: 1000 }),
      ...overrides
    };
  }

  // Create test media
  static createMedia(overrides = {}) {
    return {
      id: faker.number.int({ min: 1, max: 10000 }),
      title: { rendered: faker.lorem.words() },
      media_type: 'image',
      mime_type: 'image/jpeg',
      source_url: faker.image.url(),
      alt_text: faker.lorem.sentence(),
      media_details: {
        width: 800,
        height: 600,
        file: 'test-image.jpg'
      },
      ...overrides
    };
  }

  // Create test category
  static createCategory(overrides = {}) {
    return {
      id: faker.number.int({ min: 1, max: 100 }),
      name: faker.lorem.words(),
      slug: faker.lorem.slug(),
      description: faker.lorem.sentence(),
      count: faker.number.int({ min: 0, max: 100 }),
      ...overrides
    };
  }

  // Create test tag
  static createTag(overrides = {}) {
    return {
      id: faker.number.int({ min: 1, max: 100 }),
      name: faker.lorem.words(),
      slug: faker.lorem.slug(),
      description: faker.lorem.sentence(),
      count: faker.number.int({ min: 0, max: 100 }),
      ...overrides
    };
  }

  // Create batch test data
  static createBatchData(config = {}) {
    const {
      sourcesCount = 3,
      postsCount = 20,
      mediaCount = 10,
      categoriesCount = 5,
      tagsCount = 8
    } = config;

    const sources = Array.from({ length: sourcesCount }, () => this.createSource());
    const posts = Array.from({ length: postsCount }, () => this.createPost());
    const media = Array.from({ length: mediaCount }, () => this.createMedia());
    const categories = Array.from({ length: categoriesCount }, () => this.createCategory());
    const tags = Array.from({ length: tagsCount }, () => this.createTag());

    return {
      sources,
      posts,
      media,
      categories,
      tags
    };
  }
}
```

### Test Data Cleanup
```javascript
// tests/__tests__/helpers/cleanup.js
import { createClient } from '@supabase/supabase-js';

export class TestDataCleanup {
  constructor() {
    this.supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
    );
  }

  async cleanupAll() {
    try {
      // Clean up in correct order to respect foreign keys
      await this.cleanupContent();
      await this.cleanupSources();
      await this.cleanupSyncLogs();
      await this.cleanupMedia();
      await this.cleanupUserPreferences();

      console.log('Test data cleanup completed');
    } catch (error) {
      console.error('Error during cleanup:', error);
      throw error;
    }
  }

  async cleanupContent() {
    const { error } = await this.supabase
      .from('external_wordpress_content')
      .delete()
      .neq('id', 0); // Delete all

    if (error) throw error;
  }

  async cleanupSources() {
    const { error } = await this.supabase
      .from('external_wordpress_sources')
      .delete()
      .neq('id', 0); // Delete all

    if (error) throw error;
  }

  async cleanupSyncLogs() {
    const { error } = await this.supabase
      .from('external_wordpress_sync_logs')
      .delete()
      .neq('id', 0); // Delete all

    if (error) throw error;
  }

  async cleanupMedia() {
    const { error } = await this.supabase
      .from('external_wordpress_media')
      .delete()
      .neq('id', 0); // Delete all

    if (error) throw error;
  }

  async cleanupUserPreferences() {
    const { error } = await this.supabase
      .from('external_wordpress_user_preferences')
      .delete()
      .neq('id', 0); // Delete all

    if (error) throw error;
  }

  async cleanupSpecificSource(sourceId) {
    try {
      // Clean up content for this source
      await this.supabase
        .from('external_wordpress_content')
        .delete()
        .eq('source_id', sourceId);

      // Clean up sync logs for this source
      await this.supabase
        .from('external_wordpress_sync_logs')
        .delete()
        .eq('source_id', sourceId);

      // Clean up media for this source
      await this.supabase
        .from('external_wordpress_media')
        .delete()
        .eq('source_id', sourceId);

      // Clean up user preferences for this source
      await this.supabase
        .from('external_wordpress_user_preferences')
        .delete()
        .eq('source_id', sourceId);

      console.log(`Cleaned up test data for source ${sourceId}`);
    } catch (error) {
      console.error(`Error cleaning up source ${sourceId}:`, error);
      throw error;
    }
  }
}
```

## Test Environment Setup

### Local Development Setup
```bash
# scripts/setup-test-environment.sh
#!/bin/bash

echo "Setting up test environment for External WordPress Integration..."

# Install test dependencies
npm install --save-dev \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  @playwright/test \
  jest \
  jest-environment-jsdom \
  supertest \
  faker \
  k6

# Setup test database
echo "Setting up test database..."
npm run db:setup:test

# Run initial tests to verify setup
echo "Running initial test verification..."
npm run test:unit -- --testNamePattern=".*"

echo "Test environment setup complete!"
```

### Test Configuration Files
```javascript
// jest.setup.js
import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';
import { configure } from '@testing-library/react';

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock TextEncoder/TextDecoder for Node.js
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Configure testing library
configure({
  testIdAttribute: 'data-testid',
  throwSuggestions: true,
});

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  // Uncomment to ignore specific console methods in test output
  // log: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Setup global test utilities
global.afterEach(() => {
  // Clean up after each test
  jest.clearAllMocks();
});

// Setup test timeout
jest.setTimeout(30000);
```

## Test Documentation Standards

### Test File Documentation Template
```javascript
/**
 * @file ExternalWordPressContent.test.jsx
 * @description Unit tests for ExternalWordPressContent component
 *
 * @covers src/components/external-wordpress/ExternalWordPressContent.jsx
 * @covers src/hooks/useExternalWordPress.js
 *
 * @test {
 *   - Renders loading state initially
 *   - Renders content when data is loaded
 *   - Renders error state when API fails
 *   - Calls fetchContent on mount
 *   - Handles retry logic
 *   - Validates compliance requirements
 * }
 *
 * @mocks {
 *   - useExternalWordPress: Custom hook for data fetching
 *   - externalWordPressAPI: External API service
 *   - CFMCompliance: Compliance validation component
 * }
 *
 * @dependencies {
 *   - React Testing Library
 *   - Jest
 *   - Mock service implementations
 * }
 *
 * @setup {
 *   - Mock useExternalWordPress hook
 *   - Mock API responses
 *   - Set up test data
 * }
 *
 * @teardown {
 *   - Clear all mocks
 *   - Reset test state
 * }
 */
```

This comprehensive testing strategy ensures the external WordPress integration is thoroughly tested across all dimensions - unit, integration, E2E, performance, security, and compliance. The strategy provides clear guidelines for test organization, mocking strategies, CI/CD integration, and quality gates to ensure reliable and maintainable code.
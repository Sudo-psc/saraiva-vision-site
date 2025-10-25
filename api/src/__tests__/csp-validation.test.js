/**
 * CSP Validation Tests
 * Comprehensive tests for Content Security Policy middleware and reporting
 *
 * Tests cover:
 * - CSP middleware configuration
 * - Nonce generation and security
 * - CSP header validation
 * - CSP reporting endpoint
 * - Production vs report-only modes
 * - Security header compliance
 *
 * @author Dr. Philipe Saraiva Cruz
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import express from 'express'
import request from 'supertest'

// Mock express app
function createTestApp(cspMiddleware) {
  const app = express()
  app.use(express.json())
  app.use(cspMiddleware)

  // Test route
  app.get('/test', (req, res) => {
    res.json({
      nonce: res.locals.cspNonce,
      message: 'CSP test endpoint'
    })
  })

  return app
}

describe('CSP Middleware Validation', () => {
  let cspMiddleware

  beforeEach(async () => {
    vi.clearAllMocks()
    // Dynamic import to ensure fresh instance
    const module = await import('../middleware/cspMiddleware.js')
    cspMiddleware = module.default
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Nonce Generation', () => {
    it('should generate unique nonce for each request', async () => {
      const app = createTestApp(cspMiddleware('report-only'))

      const response1 = await request(app).get('/test')
      const response2 = await request(app).get('/test')

      expect(response1.body.nonce).toBeDefined()
      expect(response2.body.nonce).toBeDefined()
      expect(response1.body.nonce).not.toBe(response2.body.nonce)
    })

    it('should generate cryptographically secure nonce (base64, 16 bytes)', async () => {
      const app = createTestApp(cspMiddleware('report-only'))

      const response = await request(app).get('/test')
      const nonce = response.body.nonce

      // Base64 encoded 16 bytes should be 24 characters
      expect(nonce).toMatch(/^[A-Za-z0-9+/]{22}==?$/)
      expect(nonce.length).toBeGreaterThanOrEqual(22)
    })

    it('should make nonce available in res.locals', async () => {
      const app = express()
      app.use(cspMiddleware('report-only'))
      app.get('/test', (req, res) => {
        expect(res.locals.cspNonce).toBeDefined()
        expect(typeof res.locals.cspNonce).toBe('string')
        res.json({ success: true })
      })

      await request(app).get('/test').expect(200)
    })

    it('should make nonce available in req object', async () => {
      const app = express()
      app.use(cspMiddleware('report-only'))
      app.get('/test', (req, res) => {
        expect(req.cspNonce).toBeDefined()
        expect(req.cspNonce).toBe(res.locals.cspNonce)
        res.json({ success: true })
      })

      await request(app).get('/test').expect(200)
    })
  })

  describe('CSP Header Configuration - Report-Only Mode', () => {
    it('should set Content-Security-Policy-Report-Only header in report-only mode', async () => {
      const app = createTestApp(cspMiddleware('report-only'))

      const response = await request(app).get('/test')

      expect(response.headers['content-security-policy-report-only']).toBeDefined()
      expect(response.headers['content-security-policy']).toBeUndefined()
    })

    it('should allow unsafe-inline and unsafe-eval in report-only mode', async () => {
      const app = createTestApp(cspMiddleware('report-only'))

      const response = await request(app).get('/test')
      const csp = response.headers['content-security-policy-report-only']

      expect(csp).toContain("'unsafe-inline'")
      expect(csp).toContain("'unsafe-eval'")
      expect(csp).not.toContain("'strict-dynamic'")
    })

    it('should not include upgrade-insecure-requests in report-only mode', async () => {
      const app = createTestApp(cspMiddleware('report-only'))

      const response = await request(app).get('/test')
      const csp = response.headers['content-security-policy-report-only']

      expect(csp).not.toContain('upgrade-insecure-requests')
      expect(csp).not.toContain('block-all-mixed-content')
    })
  })

  describe('CSP Header Configuration - Production Mode', () => {
    it('should set Content-Security-Policy header in production mode', async () => {
      const app = createTestApp(cspMiddleware('production'))

      const response = await request(app).get('/test')

      expect(response.headers['content-security-policy']).toBeDefined()
      expect(response.headers['content-security-policy-report-only']).toBeUndefined()
    })

    it('should use nonce-based script execution in production', async () => {
      const app = createTestApp(cspMiddleware('production'))

      const response = await request(app).get('/test')
      const csp = response.headers['content-security-policy']
      const nonce = response.body.nonce

      expect(csp).toContain(`'nonce-${nonce}'`)
      expect(csp).toContain("'strict-dynamic'")
      expect(csp).not.toContain("'unsafe-inline'")
      expect(csp).not.toContain("'unsafe-eval'")
    })

    it('should include upgrade-insecure-requests in production', async () => {
      const app = createTestApp(cspMiddleware('production'))

      const response = await request(app).get('/test')
      const csp = response.headers['content-security-policy']

      expect(csp).toContain('upgrade-insecure-requests')
      expect(csp).toContain('block-all-mixed-content')
    })
  })

  describe('CSP Directives Validation', () => {
    it('should include all required CSP directives', async () => {
      const app = createTestApp(cspMiddleware('report-only'))

      const response = await request(app).get('/test')
      const csp = response.headers['content-security-policy-report-only']

      const requiredDirectives = [
        'default-src',
        'script-src',
        'style-src',
        'img-src',
        'font-src',
        'connect-src',
        'frame-src',
        'object-src',
        'base-uri',
        'form-action',
        'frame-ancestors'
      ]

      requiredDirectives.forEach(directive => {
        expect(csp).toContain(directive)
      })
    })

    it('should restrict object-src to none', async () => {
      const app = createTestApp(cspMiddleware('report-only'))

      const response = await request(app).get('/test')
      const csp = response.headers['content-security-policy-report-only']

      expect(csp).toMatch(/object-src\s+'none'/)
    })

    it('should allow self as base-uri', async () => {
      const app = createTestApp(cspMiddleware('report-only'))

      const response = await request(app).get('/test')
      const csp = response.headers['content-security-policy-report-only']

      expect(csp).toMatch(/base-uri\s+'self'/)
    })

    it('should restrict frame-ancestors', async () => {
      const app = createTestApp(cspMiddleware('report-only'))

      const response = await request(app).get('/test')
      const csp = response.headers['content-security-policy-report-only']

      expect(csp).toMatch(/frame-ancestors\s+'self'/)
    })
  })

  describe('Trusted Domains Validation', () => {
    it('should allow Google services (Analytics, Tag Manager, Maps)', async () => {
      const app = createTestApp(cspMiddleware('report-only'))

      const response = await request(app).get('/test')
      const csp = response.headers['content-security-policy-report-only']

      const googleDomains = [
        'https://www.google.com',
        'https://www.googletagmanager.com',
        'https://www.google-analytics.com',
        'https://maps.googleapis.com'
      ]

      googleDomains.forEach(domain => {
        expect(csp).toContain(domain)
      })
    })

    it('should allow Supabase connections', async () => {
      const app = createTestApp(cspMiddleware('report-only'))

      const response = await request(app).get('/test')
      const csp = response.headers['content-security-policy-report-only']

      expect(csp).toContain('https://*.supabase.co')
      expect(csp).toContain('wss://*.supabase.co')
    })

    it('should allow Spotify for podcast integration', async () => {
      const app = createTestApp(cspMiddleware('report-only'))

      const response = await request(app).get('/test')
      const csp = response.headers['content-security-policy-report-only']

      expect(csp).toContain('https://open.spotify.com')
      expect(csp).toContain('https://*.spotify.com')
    })

    it('should allow Ninsaude for medical system integration', async () => {
      const app = createTestApp(cspMiddleware('report-only'))

      const response = await request(app).get('/test')
      const csp = response.headers['content-security-policy-report-only']

      expect(csp).toContain('https://apolo.ninsaude.com')
      expect(csp).toContain('https://*.ninsaude.com')
    })

    it('should NOT include Resend API (backend-only)', async () => {
      const app = createTestApp(cspMiddleware('report-only'))

      const response = await request(app).get('/test')
      const csp = response.headers['content-security-policy-report-only']

      // Resend API should NOT be in frontend CSP as it's backend-only
      expect(csp).not.toContain('https://api.resend.com')
    })
  })

  describe('CSP Reporting Configuration', () => {
    it('should set Reporting-Endpoints header', async () => {
      const app = createTestApp(cspMiddleware('report-only'))

      const response = await request(app).get('/test')

      expect(response.headers['reporting-endpoints']).toBeDefined()
      expect(response.headers['reporting-endpoints']).toContain(
        'csp-endpoint="https://saraivavision.com.br/api/csp-reports"'
      )
    })

    it('should set Report-To header for legacy browsers', async () => {
      const app = createTestApp(cspMiddleware('report-only'))

      const response = await request(app).get('/test')
      const reportTo = response.headers['report-to']

      expect(reportTo).toBeDefined()

      const reportToObj = JSON.parse(reportTo)
      expect(reportToObj.group).toBe('csp-endpoint')
      expect(reportToObj.max_age).toBe(86400)
      expect(reportToObj.endpoints[0].url).toBe('https://saraivavision.com.br/api/csp-reports')
    })

    it('should include report-uri directive', async () => {
      const app = createTestApp(cspMiddleware('report-only'))

      const response = await request(app).get('/test')
      const csp = response.headers['content-security-policy-report-only']

      expect(csp).toContain('report-uri https://saraivavision.com.br/api/csp-reports')
    })

    it('should include report-to directive', async () => {
      const app = createTestApp(cspMiddleware('report-only'))

      const response = await request(app).get('/test')
      const csp = response.headers['content-security-policy-report-only']

      expect(csp).toContain('report-to csp-endpoint')
    })
  })

  describe('Healthcare Compliance - LGPD/CFM Requirements', () => {
    it('should prevent data exfiltration via form-action restriction', async () => {
      const app = createTestApp(cspMiddleware('production'))

      const response = await request(app).get('/test')
      const csp = response.headers['content-security-policy']

      // form-action should only allow self and specific trusted forms
      expect(csp).toMatch(/form-action\s+'self'/)
    })

    it('should prevent clickjacking via frame-ancestors', async () => {
      const app = createTestApp(cspMiddleware('production'))

      const response = await request(app).get('/test')
      const csp = response.headers['content-security-policy']

      // frame-ancestors should be restricted to prevent embedding
      expect(csp).toMatch(/frame-ancestors\s+'self'/)
    })

    it('should prevent inline script execution in production (XSS protection)', async () => {
      const app = createTestApp(cspMiddleware('production'))

      const response = await request(app).get('/test')
      const csp = response.headers['content-security-policy']

      // Production should NOT allow unsafe-inline or unsafe-eval
      expect(csp).not.toContain("'unsafe-inline'")
      expect(csp).not.toContain("'unsafe-eval'")
    })

    it('should enforce HTTPS upgrade in production (data confidentiality)', async () => {
      const app = createTestApp(cspMiddleware('production'))

      const response = await request(app).get('/test')
      const csp = response.headers['content-security-policy']

      expect(csp).toContain('upgrade-insecure-requests')
    })
  })
})

describe('CSP Reporting Endpoint', () => {
  let cspReportsRouter

  beforeEach(async () => {
    vi.clearAllMocks()
    const module = await import('../routes/csp-reports.js')
    cspReportsRouter = module.default
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  function createReportingApp() {
    const app = express()
    app.use(express.json())
    app.use('/api/csp-reports', cspReportsRouter)
    return app
  }

  describe('Legacy CSP Level 2 Report Format', () => {
    it('should accept and process legacy CSP report', async () => {
      const app = createReportingApp()

      const legacyReport = {
        'csp-report': {
          'document-uri': 'https://saraivavision.com.br/test',
          'violated-directive': 'script-src',
          'blocked-uri': 'https://evil.com/malicious.js',
          'status-code': 200,
          'source-file': 'https://saraivavision.com.br/test',
          'line-number': 42,
          'column-number': 15,
          'original-policy': "default-src 'self'"
        }
      }

      const response = await request(app)
        .post('/api/csp-reports')
        .send(legacyReport)

      expect(response.status).toBe(204)
    })
  })

  describe('Modern Reporting API Format', () => {
    it('should accept and process Reporting API format', async () => {
      const app = createReportingApp()

      const reportingApiReport = [{
        type: 'csp-violation',
        age: 10,
        url: 'https://saraivavision.com.br/test',
        user_agent: 'Mozilla/5.0',
        body: {
          documentURL: 'https://saraivavision.com.br/test',
          blockedURL: 'https://evil.com/malicious.js',
          effectiveDirective: 'script-src',
          disposition: 'enforce',
          statusCode: 200,
          sourceFile: 'https://saraivavision.com.br/test',
          lineNumber: 42,
          columnNumber: 15
        }
      }]

      const response = await request(app)
        .post('/api/csp-reports')
        .send(reportingApiReport)

      expect(response.status).toBe(204)
    })
  })

  describe('Report Validation', () => {
    it('should reject invalid report format', async () => {
      const app = createReportingApp()

      const invalidReport = {
        random: 'data',
        not: 'a valid report'
      }

      const response = await request(app)
        .post('/api/csp-reports')
        .send(invalidReport)

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Invalid report format')
    })

    it('should handle empty report body', async () => {
      const app = createReportingApp()

      const response = await request(app)
        .post('/api/csp-reports')
        .send({})

      expect(response.status).toBe(400)
    })

    it('should handle malformed JSON gracefully', async () => {
      const app = createReportingApp()

      const response = await request(app)
        .post('/api/csp-reports')
        .set('Content-Type', 'application/json')
        .send('invalid json{')

      expect(response.status).toBe(400)
    })
  })

  describe('Health Check Endpoint', () => {
    it('should provide health status', async () => {
      const app = createReportingApp()

      const response = await request(app)
        .get('/api/csp-reports/health')

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('ok')
      expect(response.body.endpoint).toBe('/api/csp-reports')
      expect(response.body.logFile).toBeDefined()
      expect(response.body.logSize).toBeDefined()
    })
  })
})

describe('CSP Integration Tests', () => {
  it('should work with typical Express middleware chain', async () => {
    const module = await import('../middleware/cspMiddleware.js')
    const cspMiddleware = module.default

    const app = express()
    app.use(express.json())
    app.use(cspMiddleware('report-only'))

    // Simulate other middleware
    app.use((req, res, next) => {
      res.locals.otherData = 'test'
      next()
    })

    app.get('/test', (req, res) => {
      res.json({
        cspNonce: res.locals.cspNonce,
        otherData: res.locals.otherData
      })
    })

    const response = await request(app).get('/test')

    expect(response.status).toBe(200)
    expect(response.body.cspNonce).toBeDefined()
    expect(response.body.otherData).toBe('test')
    expect(response.headers['content-security-policy-report-only']).toBeDefined()
  })

  it('should not interfere with other response headers', async () => {
    const module = await import('../middleware/cspMiddleware.js')
    const cspMiddleware = module.default

    const app = express()
    app.use(cspMiddleware('report-only'))
    app.get('/test', (req, res) => {
      res.setHeader('X-Custom-Header', 'test-value')
      res.json({ success: true })
    })

    const response = await request(app).get('/test')

    expect(response.headers['x-custom-header']).toBe('test-value')
    expect(response.headers['content-security-policy-report-only']).toBeDefined()
  })
})

describe('CSP Security Best Practices', () => {
  it('should generate different nonces across multiple requests (replay attack prevention)', async () => {
    const module = await import('../middleware/cspMiddleware.js')
    const cspMiddleware = module.default
    const app = createTestApp(cspMiddleware('production'))

    const nonces = new Set()
    const iterations = 100

    for (let i = 0; i < iterations; i++) {
      const response = await request(app).get('/test')
      nonces.add(response.body.nonce)
    }

    // All nonces should be unique
    expect(nonces.size).toBe(iterations)
  })

  it('should use sufficiently long nonce for security', async () => {
    const module = await import('../middleware/cspMiddleware.js')
    const cspMiddleware = module.default
    const app = createTestApp(cspMiddleware('production'))

    const response = await request(app).get('/test')
    const nonce = response.body.nonce

    // 16 bytes in base64 = at least 22 characters
    expect(nonce.length).toBeGreaterThanOrEqual(22)
  })

  it('should prevent common XSS vectors in production', async () => {
    const module = await import('../middleware/cspMiddleware.js')
    const cspMiddleware = module.default
    const app = createTestApp(cspMiddleware('production'))

    const response = await request(app).get('/test')
    const csp = response.headers['content-security-policy']

    // Should NOT allow these dangerous directives in production
    expect(csp).not.toContain("'unsafe-inline'")
    expect(csp).not.toContain("'unsafe-eval'")
    expect(csp).not.toContain('data: *')
  })
})

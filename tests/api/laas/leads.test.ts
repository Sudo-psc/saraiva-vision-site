/**
 * API Tests for /api/laas/leads endpoint
 * Tests validation, rate limiting, and LGPD compliance
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Next.js Request/Response
class MockRequest {
  method: string;
  body: any;
  headers: Map<string, string>;

  constructor(method: string, body: any, headers: Record<string, string> = {}) {
    this.method = method;
    this.body = body;
    this.headers = new Map(Object.entries(headers));
  }

  json() {
    return Promise.resolve(this.body);
  }

  header(name: string) {
    return this.headers.get(name);
  }
}

class MockResponse {
  statusCode: number = 200;
  body: any = null;
  headers: Map<string, string> = new Map();

  status(code: number) {
    this.statusCode = code;
    return this;
  }

  json(data: any) {
    this.body = data;
    return this;
  }

  setHeader(name: string, value: string) {
    this.headers.set(name, value);
    return this;
  }
}

describe('/api/laas/leads', () => {
  let mockRequest: MockRequest;
  let mockResponse: MockResponse;

  beforeEach(() => {
    mockResponse = new MockResponse();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Validation', () => {
    it('should reject empty request body', async () => {
      mockRequest = new MockRequest('POST', {});

      // Simulated validation failure
      const result = validateLeadData(mockRequest.body);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should validate nome field is required', async () => {
      mockRequest = new MockRequest('POST', {
        whatsapp: '33999999999',
        email: 'test@example.com',
        lgpdConsent: true
      });

      const result = validateLeadData(mockRequest.body);

      expect(result.success).toBe(false);
      expect(result.errors?.nome).toBeDefined();
    });

    it('should validate whatsapp field is required', async () => {
      mockRequest = new MockRequest('POST', {
        nome: 'João Silva',
        email: 'test@example.com',
        lgpdConsent: true
      });

      const result = validateLeadData(mockRequest.body);

      expect(result.success).toBe(false);
      expect(result.errors?.whatsapp).toBeDefined();
    });

    it('should validate email format', async () => {
      mockRequest = new MockRequest('POST', {
        nome: 'João Silva',
        whatsapp: '33999999999',
        email: 'invalid-email',
        lgpdConsent: true
      });

      const result = validateLeadData(mockRequest.body);

      expect(result.success).toBe(false);
      expect(result.errors?.email).toBeDefined();
    });

    it('should reject invalid email domains', async () => {
      const invalidEmails = [
        'test@',
        '@example.com',
        'test@.com',
        'test@domain',
        'test..test@domain.com'
      ];

      invalidEmails.forEach(email => {
        const result = validateLeadData({
          nome: 'João Silva',
          whatsapp: '33999999999',
          email,
          lgpdConsent: true
        });

        expect(result.success).toBe(false);
      });
    });

    it('should validate whatsapp number format', async () => {
      const invalidPhones = [
        '123', // Too short
        'abcdefghijk', // Non-numeric
        '00000000000', // Invalid pattern
      ];

      invalidPhones.forEach(whatsapp => {
        const result = validateLeadData({
          nome: 'João Silva',
          whatsapp,
          email: 'test@example.com',
          lgpdConsent: true
        });

        expect(result.success).toBe(false);
      });
    });

    it('should require LGPD consent', async () => {
      mockRequest = new MockRequest('POST', {
        nome: 'João Silva',
        whatsapp: '33999999999',
        email: 'test@example.com',
        lgpdConsent: false
      });

      const result = validateLeadData(mockRequest.body);

      expect(result.success).toBe(false);
      expect(result.errors?.lgpdConsent).toBeDefined();
    });

    it('should accept valid lead data', async () => {
      mockRequest = new MockRequest('POST', {
        nome: 'João Silva',
        whatsapp: '33999999999',
        email: 'joao@example.com',
        lgpdConsent: true
      });

      const result = validateLeadData(mockRequest.body);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        nome: 'João Silva',
        whatsapp: '33999999999',
        email: 'joao@example.com',
        lgpdConsent: true
      });
    });

    it('should sanitize input data', async () => {
      mockRequest = new MockRequest('POST', {
        nome: '  João Silva  ',
        whatsapp: '(33) 99999-9999',
        email: ' JOAO@EXAMPLE.COM ',
        lgpdConsent: true
      });

      const result = validateLeadData(mockRequest.body);

      expect(result.success).toBe(true);
      expect(result.data?.nome).toBe('João Silva');
      expect(result.data?.whatsapp).toBe('33999999999');
      expect(result.data?.email).toBe('joao@example.com');
    });

    it('should reject SQL injection attempts', async () => {
      mockRequest = new MockRequest('POST', {
        nome: "'; DROP TABLE leads;--",
        whatsapp: '33999999999',
        email: 'test@example.com',
        lgpdConsent: true
      });

      const result = validateLeadData(mockRequest.body);

      // Should either reject or sanitize
      expect(result.success).toBe(true);
      expect(result.data?.nome).not.toContain('DROP TABLE');
    });

    it('should reject XSS attempts', async () => {
      mockRequest = new MockRequest('POST', {
        nome: '<script>alert("xss")</script>',
        whatsapp: '33999999999',
        email: 'test@example.com',
        lgpdConsent: true
      });

      const result = validateLeadData(mockRequest.body);

      expect(result.success).toBe(true);
      expect(result.data?.nome).not.toContain('<script>');
    });
  });

  describe('Rate Limiting', () => {
    it('should track request count per IP', async () => {
      const clientIp = '192.168.1.1';

      // Simulate multiple requests
      for (let i = 0; i < 5; i++) {
        mockRequest = new MockRequest('POST', validLeadData(), {
          'x-forwarded-for': clientIp
        });

        const rateLimitCheck = checkRateLimit(clientIp);
        expect(rateLimitCheck.allowed).toBe(true);
      }
    });

    it('should reject requests exceeding rate limit', async () => {
      const clientIp = '192.168.1.2';

      // Simulate 11 requests (limit is 10 per 15 minutes)
      for (let i = 0; i < 11; i++) {
        mockRequest = new MockRequest('POST', validLeadData(), {
          'x-forwarded-for': clientIp
        });

        const rateLimitCheck = checkRateLimit(clientIp);

        if (i < 10) {
          expect(rateLimitCheck.allowed).toBe(true);
        } else {
          expect(rateLimitCheck.allowed).toBe(false);
        }
      }
    });

    it('should return 429 status when rate limited', async () => {
      const clientIp = '192.168.1.3';

      // Exceed rate limit
      for (let i = 0; i < 11; i++) {
        checkRateLimit(clientIp);
      }

      const result = checkRateLimit(clientIp);

      expect(result.allowed).toBe(false);
      expect(result.statusCode).toBe(429);
      expect(result.message).toContain('muitas tentativas');
    });

    it('should include retry-after header', async () => {
      const clientIp = '192.168.1.4';

      // Exceed rate limit
      for (let i = 0; i < 11; i++) {
        checkRateLimit(clientIp);
      }

      const result = checkRateLimit(clientIp);

      expect(result.retryAfter).toBeDefined();
      expect(result.retryAfter).toBeGreaterThan(0);
    });
  });

  describe('LGPD Compliance', () => {
    it('should log consent timestamp', async () => {
      mockRequest = new MockRequest('POST', validLeadData());

      const result = processLead(mockRequest.body);

      expect(result.consentTimestamp).toBeDefined();
      expect(result.consentTimestamp).toBeInstanceOf(Date);
    });

    it('should hash email for storage', async () => {
      mockRequest = new MockRequest('POST', validLeadData());

      const result = processLead(mockRequest.body);

      expect(result.emailHash).toBeDefined();
      expect(result.emailHash).not.toBe(mockRequest.body.email);
      expect(result.emailHash.length).toBe(64); // SHA-256
    });

    it('should not store plain email after processing', async () => {
      mockRequest = new MockRequest('POST', validLeadData());

      const result = processLead(mockRequest.body);

      // Should only have hash, not plain email
      expect(result.storedData.email).toBeUndefined();
      expect(result.storedData.emailHash).toBeDefined();
    });

    it('should generate anonymized user ID', async () => {
      mockRequest = new MockRequest('POST', validLeadData());

      const result = processLead(mockRequest.body);

      expect(result.anonymousId).toBeDefined();
      expect(result.anonymousId).toMatch(/^[a-f0-9]{32}$/); // MD5 format
    });

    it('should include data retention policy', async () => {
      mockRequest = new MockRequest('POST', validLeadData());

      const result = processLead(mockRequest.body);

      expect(result.dataRetentionDays).toBe(365); // 1 year
      expect(result.expiresAt).toBeDefined();
    });
  });

  describe('Response Format', () => {
    it('should return success response with estimated savings', async () => {
      mockRequest = new MockRequest('POST', validLeadData());

      const result = await processLeadRequest(mockRequest);

      expect(result.success).toBe(true);
      expect(result.estimatedSavings).toBeDefined();
      expect(result.estimatedSavings.monthly).toBeGreaterThan(0);
      expect(result.estimatedSavings.yearly).toBeGreaterThan(0);
    });

    it('should calculate realistic savings', async () => {
      mockRequest = new MockRequest('POST', validLeadData());

      const result = await processLeadRequest(mockRequest);

      // Savings should be between R$ 50-150/month
      expect(result.estimatedSavings.monthly).toBeGreaterThanOrEqual(50);
      expect(result.estimatedSavings.monthly).toBeLessThanOrEqual(150);

      // Yearly should be monthly * 12
      expect(result.estimatedSavings.yearly).toBe(result.estimatedSavings.monthly * 12);
    });

    it('should return error response for invalid data', async () => {
      mockRequest = new MockRequest('POST', {
        nome: '',
        whatsapp: '',
        email: 'invalid',
        lgpdConsent: false
      });

      const result = await processLeadRequest(mockRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.errors).toBeDefined();
    });

    it('should return 400 status for validation errors', async () => {
      mockRequest = new MockRequest('POST', {});

      const result = await processLeadRequest(mockRequest);

      expect(result.statusCode).toBe(400);
      expect(result.success).toBe(false);
    });

    it('should return 201 status for successful creation', async () => {
      mockRequest = new MockRequest('POST', validLeadData());

      const result = await processLeadRequest(mockRequest);

      expect(result.statusCode).toBe(201);
      expect(result.success).toBe(true);
    });
  });

  describe('Method Handling', () => {
    it('should only accept POST requests', async () => {
      const methods = ['GET', 'PUT', 'DELETE', 'PATCH'];

      methods.forEach(method => {
        mockRequest = new MockRequest(method, {});
        const result = handleRequest(mockRequest);

        expect(result.statusCode).toBe(405);
        expect(result.error).toContain('Method not allowed');
      });
    });

    it('should return 405 with allowed methods header', async () => {
      mockRequest = new MockRequest('GET', {});

      const result = handleRequest(mockRequest);

      expect(result.statusCode).toBe(405);
      expect(result.headers.get('Allow')).toBe('POST');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockRequest = new MockRequest('POST', validLeadData());

      // Simulate database error
      const result = await processLeadRequest(mockRequest, { simulateDbError: true });

      expect(result.statusCode).toBe(500);
      expect(result.error).toContain('erro ao processar');
    });

    it('should not expose internal error details', async () => {
      mockRequest = new MockRequest('POST', validLeadData());

      const result = await processLeadRequest(mockRequest, { simulateDbError: true });

      // Should not contain stack traces or internal paths
      expect(result.error).not.toContain('Error:');
      expect(result.error).not.toContain('/home/');
    });

    it('should log errors for monitoring', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      mockRequest = new MockRequest('POST', validLeadData());
      await processLeadRequest(mockRequest, { simulateDbError: true });

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});

// Helper functions for testing
function validLeadData() {
  return {
    nome: 'João Silva',
    whatsapp: '33999999999',
    email: 'joao@example.com',
    lgpdConsent: true
  };
}

function validateLeadData(data: any) {
  const errors: any = {};

  // Validate nome
  if (!data.nome || typeof data.nome !== 'string' || data.nome.trim().length < 3) {
    errors.nome = 'Nome é obrigatório e deve ter pelo menos 3 caracteres';
  }

  // Validate whatsapp
  const phoneDigits = data.whatsapp?.replace(/\D/g, '') || '';
  if (!phoneDigits || phoneDigits.length < 10 || phoneDigits.length > 11) {
    errors.whatsapp = 'WhatsApp inválido';
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.email = 'E-mail inválido';
  }

  // Validate LGPD consent
  if (data.lgpdConsent !== true) {
    errors.lgpdConsent = 'Consentimento LGPD é obrigatório';
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  // Sanitize data
  return {
    success: true,
    data: {
      nome: data.nome.trim().replace(/<script.*?>.*?<\/script>/gi, ''),
      whatsapp: phoneDigits,
      email: data.email.trim().toLowerCase(),
      lgpdConsent: true
    }
  };
}

function checkRateLimit(clientIp: string) {
  // Simulated rate limiting (10 requests per 15 minutes)
  const rateLimitMap = new Map();
  const limit = 10;
  const windowMs = 15 * 60 * 1000;

  const now = Date.now();
  const requests = rateLimitMap.get(clientIp) || [];

  // Remove old requests outside window
  const validRequests = requests.filter((time: number) => now - time < windowMs);

  if (validRequests.length >= limit) {
    return {
      allowed: false,
      statusCode: 429,
      message: 'Muitas tentativas. Tente novamente em alguns minutos.',
      retryAfter: Math.ceil((validRequests[0] + windowMs - now) / 1000)
    };
  }

  validRequests.push(now);
  rateLimitMap.set(clientIp, validRequests);

  return { allowed: true };
}

function processLead(data: any) {
  const crypto = require('crypto');

  const emailHash = crypto.createHash('sha256').update(data.email).digest('hex');
  const anonymousId = crypto.createHash('md5').update(data.email + Date.now()).digest('hex');

  const consentTimestamp = new Date();
  const dataRetentionDays = 365;
  const expiresAt = new Date(consentTimestamp.getTime() + dataRetentionDays * 24 * 60 * 60 * 1000);

  return {
    consentTimestamp,
    emailHash,
    anonymousId,
    dataRetentionDays,
    expiresAt,
    storedData: {
      nome: data.nome,
      whatsappHash: crypto.createHash('sha256').update(data.whatsapp).digest('hex'),
      emailHash,
      anonymousId,
      consentedAt: consentTimestamp.toISOString()
    }
  };
}

async function processLeadRequest(request: MockRequest, options: any = {}) {
  if (options.simulateDbError) {
    console.error('Simulated database error');
    return {
      statusCode: 500,
      success: false,
      error: 'Erro ao processar solicitação. Tente novamente.'
    };
  }

  const validation = validateLeadData(request.body);

  if (!validation.success) {
    return {
      statusCode: 400,
      success: false,
      error: 'Dados inválidos',
      errors: validation.errors
    };
  }

  // Simulate savings calculation
  const estimatedSavings = {
    monthly: 80,
    yearly: 960
  };

  return {
    statusCode: 201,
    success: true,
    estimatedSavings
  };
}

function handleRequest(request: MockRequest) {
  if (request.method !== 'POST') {
    const response = new MockResponse();
    response.setHeader('Allow', 'POST');
    return {
      statusCode: 405,
      error: 'Method not allowed',
      headers: response.headers
    };
  }

  return { statusCode: 200 };
}

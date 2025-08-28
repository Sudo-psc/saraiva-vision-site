import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { default: handler } = await import('../contact.js');

describe('Contact API Handler (reCAPTCHA v3)', () => {
  let mockReq;
  let mockRes;
  let originalEnv;

  beforeEach(() => {
    originalEnv = process.env;
    process.env = { ...originalEnv, NODE_ENV: 'test' };

    mockReq = {
      method: 'POST',
      headers: {},
      url: '/api/contact',
      body: {}
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      setHeader: vi.fn().mockReturnThis(),
      end: vi.fn().mockReturnThis(),
      writeHead: vi.fn().mockReturnThis(),
      write: vi.fn().mockReturnThis(),
    };

    global.fetch = vi.fn();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('rejects non-POST methods with 405', async () => {
    mockReq.method = 'GET';
    await handler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(405);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
  });

  it('returns 400 when token is missing', async () => {
    await handler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'missing_token' });
  });

  it('returns 400 when secret is missing', async () => {
    mockReq.body = { token: 'abc123', action: 'contact', name: 'A', email: 'a@b.com', phone: '1', message: 'm' };
    await handler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'recaptcha_failed' }));
  });

  it('verifies reCAPTCHA and returns ok on success', async () => {
    process.env.RECAPTCHA_SECRET = 'secret';
    mockReq.body = { token: 'abc123', action: 'contact', name: 'John', email: 'john@test.com', phone: '33998601427', message: 'Hello there' };

    global.fetch.mockResolvedValue({
      json: () => Promise.resolve({ success: true, score: 0.9, action: 'contact' })
    });

    await handler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    const payload = mockRes.json.mock.calls[0][0];
    expect(payload.ok).toBe(true);
    expect(payload.recaptcha.score).toBeGreaterThan(0.5);
  });

  it('returns 400 for low score', async () => {
    process.env.RECAPTCHA_SECRET = 'secret';
    mockReq.body = { token: 'abc123', action: 'contact' };
    global.fetch.mockResolvedValue({ json: () => Promise.resolve({ success: true, score: 0.3, action: 'contact' }) });
    await handler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'recaptcha_failed' }));
  });

  it('returns 400 for action mismatch', async () => {
    process.env.RECAPTCHA_SECRET = 'secret';
    mockReq.body = { token: 'abc123', action: 'contact' };
    global.fetch.mockResolvedValue({ json: () => Promise.resolve({ success: true, score: 0.9, action: 'other' }) });
    await handler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });
});


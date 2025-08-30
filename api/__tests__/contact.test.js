import { describe, it, expect, vi, beforeEach } from 'vitest';
import handler from '../contact.js';

vi.mock('resend', () => {
  const send = vi.fn().mockResolvedValue({ id: '1' });
  return {
    Resend: vi.fn().mockImplementation(() => ({
      emails: { send }
    }))
  };
});

const mockReqRes = (body = {}) => {
  const req = {
    method: 'POST',
    body,
    headers: {},
    connection: { remoteAddress: '127.0.0.1' }
  };
  const res = {
    statusCode: 200,
    headers: {},
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    }
  };
  return { req, res };
};

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({
    json: () => Promise.resolve({ success: true, score: 0.9 })
  });
  process.env.RESEND_API_KEY = 'test';
  process.env.CONTACT_FROM_EMAIL = 'from@example.com';
  process.env.CONTACT_TO_EMAIL = 'to@example.com';
  process.env.RECAPTCHA_SECRET_KEY = 'recaptcha';
  delete global.rateLimitStore;
});

describe('contact API handler', () => {
  it('rejects missing fields', async () => {
    const { req, res } = mockReqRes({});
    await handler(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.payload.error).toBe('Missing required fields');
  });

  it('sanitizes input and sends email', async () => {
    const { Resend } = await import('resend');
    const { req, res } = mockReqRes({
      name: '<b>Ana</b>',
      email: 'ana@example.com',
      phone: '(33) 99999-9999',
      message: 'Ola<script>alert(1)</script>',
      consent: true,
      recaptchaToken: 'token'
    });

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    const resendInstance = Resend.mock.instances[0];
    expect(resendInstance.emails.send).toHaveBeenCalled();
    const args = resendInstance.emails.send.mock.calls[0][0];
    expect(args.html).not.toContain('<script>');
  });
});


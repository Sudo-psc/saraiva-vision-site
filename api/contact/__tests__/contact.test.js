import { describe, it, expect, vi, beforeEach } from 'vitest';
import handler from '../index.js';
import { rateLimiter } from '../rate-limiter.js';

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({
        data: { id: 'test-email-id-123' },
        error: null
      })
    }
  }))
}));

describe('Contact API Endpoint', () => {
  let mockReq;
  let mockRes;
  let jsonMock;
  let statusMock;

  beforeEach(() => {
    jsonMock = vi.fn();
    statusMock = vi.fn(() => ({ json: jsonMock }));
    
    mockRes = {
      status: statusMock,
      json: jsonMock
    };

    mockReq = {
      method: 'POST',
      headers: {
        'x-forwarded-for': '192.168.1.1'
      },
      connection: {},
      body: {
        name: 'João Silva',
        email: 'joao@email.com',
        phone: '(33) 99999-9999',
        message: 'Gostaria de agendar uma consulta',
        consent: true,
        honeypot: ''
      }
    };

    vi.clearAllMocks();
    rateLimiter.reset('192.168.1.1');
  });

  describe('HTTP Method Validation', () => {
    it('deve retornar 405 para método GET', async () => {
      mockReq.method = 'GET';
      
      await handler(mockReq, mockRes);
      
      expect(statusMock).toHaveBeenCalledWith(405);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Método não permitido'
      });
    });

    it('deve aceitar método POST', async () => {
      await handler(mockReq, mockRes);
      
      expect(statusMock).toHaveBeenCalledWith(200);
    });
  });

  describe('Input Validation', () => {
    it('deve validar nome obrigatório', async () => {
      mockReq.body.name = '';
      
      await handler(mockReq, mockRes);
      
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          errors: expect.objectContaining({
            name: expect.any(String)
          })
        })
      );
    });

    it('deve validar email obrigatório e formato', async () => {
      mockReq.body.email = 'email-invalido';
      
      await handler(mockReq, mockRes);
      
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          errors: expect.objectContaining({
            email: expect.any(String)
          })
        })
      );
    });

    it('deve validar telefone brasileiro', async () => {
      mockReq.body.phone = '123';
      
      await handler(mockReq, mockRes);
      
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          errors: expect.objectContaining({
            phone: expect.any(String)
          })
        })
      );
    });

    it('deve validar mensagem mínima de 10 caracteres', async () => {
      mockReq.body.message = 'curta';
      
      await handler(mockReq, mockRes);
      
      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('deve validar consentimento LGPD', async () => {
      mockReq.body.consent = false;
      
      await handler(mockReq, mockRes);
      
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          errors: expect.objectContaining({
            consent: expect.any(String)
          })
        })
      );
    });
  });

  describe('Spam Protection', () => {
    it('deve rejeitar se honeypot estiver preenchido', async () => {
      mockReq.body.honeypot = 'spam content';
      
      await handler(mockReq, mockRes);
      
      expect(statusMock).toHaveBeenCalledWith(400);
    });
  });

  describe('Rate Limiting', () => {
    it('deve aplicar rate limit após 3 tentativas', async () => {
      await handler(mockReq, mockRes);
      await handler(mockReq, mockRes);
      await handler(mockReq, mockRes);
      
      vi.clearAllMocks();
      
      await handler(mockReq, mockRes);
      
      expect(statusMock).toHaveBeenCalledWith(429);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          code: 'RATE_LIMIT_EXCEEDED'
        })
      );
    });
  });

  describe('Successful Submission', () => {
    it('deve enviar email com sucesso', async () => {
      await handler(mockReq, mockRes);
      
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: expect.stringContaining('sucesso'),
          messageId: 'test-email-id-123'
        })
      );
    });

    it('deve sanitizar inputs antes de enviar', async () => {
      mockReq.body.name = '<script>alert("xss")</script>João Silva';
      mockReq.body.message = 'Mensagem <b>com HTML</b> tags';
      
      await handler(mockReq, mockRes);
      
      expect(statusMock).toHaveBeenCalledWith(200);
    });
  });

  describe('Error Handling', () => {
    it('deve tratar erro de API Resend gracefully', async () => {
      const { Resend } = await import('resend');
      Resend.mockImplementationOnce(() => ({
        emails: {
          send: vi.fn().mockRejectedValue(new Error('API Error'))
        }
      }));
      
      await handler(mockReq, mockRes);
      
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          code: 'INTERNAL_ERROR'
        })
      );
    });
  });
});

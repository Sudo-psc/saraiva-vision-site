/**
 * Testes para API de Contato
 * Verifica envio de emails, validação, rate limiting e segurança
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { POST, OPTIONS } from '@/app/api/contact/route'

// Mock do Resend
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn()
    }
  }))
}))

// Mock das validações
vi.mock('@/lib/validations/api', () => ({
  contactFormSchema: {
    safeParse: vi.fn()
  },
  anonymizePII: vi.fn((data) => ({
    ...data,
    email: data.email ? data.email.replace(/(.{2}).*@/, '$1***@') : data.email,
    phone: data.phone ? data.phone.replace(/(\d{2})\d{4}(\d{4})/, '$1****$2') : data.phone
  })),
  checkRateLimit: vi.fn()
}))

describe('API de Contato', () => {
  let mockRequest: any
  let mockResend: any

  beforeEach(() => {
    // Limpa todos os mocks
    vi.clearAllMocks()

    // Mock do Resend
    mockResend = {
      emails: {
        send: vi.fn().mockResolvedValue({
          data: { id: 'test-email-id' },
          error: null
        })
      }
    }
    const { Resend } = require('resend')
    Resend.mockImplementation(() => mockResend)

    // Mock das variáveis de ambiente
    process.env.RESEND_API_KEY = 'test-key'
    process.env.CONTACT_TO_EMAIL = 'test@example.com'
    process.env.CONTACT_EMAIL_FROM = 'noreply@example.com'
    process.env.RATE_LIMIT_MAX = '10'
    process.env.RATE_LIMIT_WINDOW = '600000'

    // Mock das validações
    const { contactFormSchema, checkRateLimit } = require('@/lib/validations/api')
    contactFormSchema.safeParse = vi.fn()
    checkRateLimit.mockReturnValue({ allowed: true, remaining: 9, resetAt: Date.now() + 600000 })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('POST /api/contact', () => {
    it('deve enviar email com dados válidos', async () => {
      // Arrange
      const validData = {
        name: 'João Silva',
        email: 'joao@example.com',
        phone: '33999999999',
        message: 'Gostaria de agendar uma consulta'
      }

      const { contactFormSchema } = require('@/lib/validations/api')
      contactFormSchema.safeParse.mockReturnValue({
        success: true,
        data: validData
      })

      mockRequest = {
        json: vi.fn().mockResolvedValue(validData),
        headers: {
          get: vi.fn((header) => {
            if (header === 'x-forwarded-for') return '192.168.1.1'
            return null
          })
        }
      }

      // Act
      const response = await POST(mockRequest)
      const result = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.message).toBe('Mensagem enviada com sucesso! Entraremos em contato em breve.')
      expect(result.messageId).toBe('test-email-id')

      expect(mockResend.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'noreply@example.com',
          to: 'test@example.com',
          subject: '📧 Novo Contato: João Silva',
          html: expect.stringContaining('João Silva'),
          text: expect.stringContaining('João Silva'),
          reply_to: 'joao@example.com'
        })
      )
    })

    it('deve rejeitar dados inválidos', async () => {
      // Arrange
      const invalidData = {
        name: '',
        email: 'invalid-email',
        phone: '',
        message: ''
      }

      const { contactFormSchema } = require('@/lib/validations/api')
      contactFormSchema.safeParse.mockReturnValue({
        success: false,
        error: {
          flatten: () => ({
            fieldErrors: {
              name: ['Nome é obrigatório'],
              email: ['Email inválido'],
              message: ['Mensagem é obrigatória']
            }
          })
        }
      })

      mockRequest = {
        json: vi.fn().mockResolvedValue(invalidData),
        headers: { get: vi.fn() }
      }

      // Act
      const response = await POST(mockRequest)
      const result = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Dados inválidos. Verifique os campos e tente novamente.')
      expect(result.details).toBeDefined()
    })

    it('deve respeitar rate limiting', async () => {
      // Arrange
      const { checkRateLimit } = require('@/lib/validations/api')
      checkRateLimit.mockReturnValue({
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + 600000
      })

      const validData = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '33999999999',
        message: 'Test message'
      }

      const { contactFormSchema } = require('@/lib/validations/api')
      contactFormSchema.safeParse.mockReturnValue({
        success: true,
        data: validData
      })

      mockRequest = {
        json: vi.fn().mockResolvedValue(validData),
        headers: { get: vi.fn() }
      }

      // Act
      const response = await POST(mockRequest)
      const result = await response.json()

      // Assert
      expect(response.status).toBe(429)
      expect(result.success).toBe(false)
      expect(result.code).toBe('RATE_LIMIT_EXCEEDED')
      expect(response.headers.get('X-RateLimit-Limit')).toBe('10')
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('0')
    })

    it('deve detectar spam via honeypot', async () => {
      // Arrange
      const spamData = {
        name: 'Spam Bot',
        email: 'spam@example.com',
        phone: '33999999999',
        message: 'Spam message',
        honeypot: 'filled by bot'
      }

      mockRequest = {
        json: vi.fn().mockResolvedValue(spamData),
        headers: { get: vi.fn() }
      }

      // Act
      const response = await POST(mockRequest)
      const result = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.message).toBe('Mensagem enviada com sucesso!') // Fake success

      // Não deve enviar email real
      expect(mockResend.emails.send).not.toHaveBeenCalled()
    })

    it('deve tratar erros do Resend', async () => {
      // Arrange
      mockResend.emails.send.mockResolvedValue({
        data: null,
        error: { message: 'API key invalid' }
      })

      const validData = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '33999999999',
        message: 'Test message'
      }

      const { contactFormSchema } = require('@/lib/validations/api')
      contactFormSchema.safeParse.mockReturnValue({
        success: true,
        data: validData
      })

      mockRequest = {
        json: vi.fn().mockResolvedValue(validData),
        headers: { get: vi.fn() }
      }

      // Act
      const response = await POST(mockRequest)
      const result = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(result.success).toBe(false)
      expect(result.code).toBe('INTERNAL_ERROR')
    })

    it('deve tratar erros de configuração da API key', async () => {
      // Arrange
      mockResend.emails.send.mockRejectedValue(new Error('Invalid API key'))

      const validData = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '33999999999',
        message: 'Test message'
      }

      const { contactFormSchema } = require('@/lib/validations/api')
      contactFormSchema.safeParse.mockReturnValue({
        success: true,
        data: validData
      })

      mockRequest = {
        json: vi.fn().mockResolvedValue(validData),
        headers: { get: vi.fn() }
      }

      // Act
      const response = await POST(mockRequest)
      const result = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(result.success).toBe(false)
      expect(result.code).toBe('CONFIG_ERROR')
      expect(result.error).toBe('Erro de configuração do servidor. Entre em contato por telefone.')
    })

    it('deve extrair IP corretamente dos headers', async () => {
      // Arrange
      const validData = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '33999999999',
        message: 'Test message'
      }

      const { contactFormSchema } = require('@/lib/validations/api')
      contactFormSchema.safeParse.mockReturnValue({
        success: true,
        data: validData
      })

      mockRequest = {
        json: vi.fn().mockResolvedValue(validData),
        headers: {
          get: vi.fn((header) => {
            if (header === 'x-forwarded-for') return '203.0.113.1, 10.0.0.1'
            return null
          })
        }
      }

      // Act
      const response = await POST(mockRequest)

      // Assert
      expect(response.status).toBe(200)

      // Verifica se usou o primeiro IP da lista
      const { checkRateLimit } = require('@/lib/validations/api')
      expect(checkRateLimit).toHaveBeenCalledWith('203.0.113.1', 10, 600000, expect.any(Map))
    })

    it('deve usar fallback para IP desconhecido', async () => {
      // Arrange
      const validData = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '33999999999',
        message: 'Test message'
      }

      const { contactFormSchema } = require('@/lib/validations/api')
      contactFormSchema.safeParse.mockReturnValue({
        success: true,
        data: validData
      })

      mockRequest = {
        json: vi.fn().mockResolvedValue(validData),
        headers: { get: vi.fn(() => null) }
      }

      // Act
      const response = await POST(mockRequest)

      // Assert
      expect(response.status).toBe(200)

      const { checkRateLimit } = require('@/lib/validations/api')
      expect(checkRateLimit).toHaveBeenCalledWith('unknown', 10, 600000, expect.any(Map))
    })

    it('deve personalizar email com template HTML', async () => {
      // Arrange
      const validData = {
        name: 'Maria Silva',
        email: 'maria@example.com',
        phone: '33988887777',
        message: 'Preciso agendar uma consulta para minha filha'
      }

      const { contactFormSchema } = require('@/lib/validations/api')
      contactFormSchema.safeParse.mockReturnValue({
        success: true,
        data: validData
      })

      mockRequest = {
        json: vi.fn().mockResolvedValue(validData),
        headers: { get: vi.fn() }
      }

      // Act
      const response = await POST(mockRequest)

      // Assert
      expect(response.status).toBe(200)

      const emailCall = mockResend.emails.send.mock.calls[0][0]
      expect(emailCall.html).toContain('<!DOCTYPE html>')
      expect(emailCall.html).toContain('Maria Silva')
      expect(emailCall.html).toContain('maria@example.com')
      expect(emailCall.html).toContain('33988887777')
      expect(emailCall.html).toContain('Preciso agendar uma consulta para minha filha')

      // Verifica texto alternativo
      expect(emailCall.text).toContain('Maria Silva')
      expect(emailCall.text).toContain('maria@example.com')
      expect(emailCall.text).toContain('33988887777')
    })

    it('deve incluir tags corretas no email', async () => {
      // Arrange
      const validData = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '33999999999',
        message: 'Test message'
      }

      const { contactFormSchema } = require('@/lib/validations/api')
      contactFormSchema.safeParse.mockReturnValue({
        success: true,
        data: validData
      })

      mockRequest = {
        json: vi.fn().mockResolvedValue(validData),
        headers: { get: vi.fn() }
      }

      // Act
      const response = await POST(mockRequest)

      // Assert
      expect(response.status).toBe(200)

      const emailCall = mockResend.emails.send.mock.calls[0][0]
      expect(emailCall.tags).toEqual([
        { name: 'source', value: 'website' },
        { name: 'type', value: 'contact-form' }
      ])
    })

    it('deve anonimizar PII nos logs', async () => {
      // Arrange
      const validData = {
        name: 'João Silva',
        email: 'joao.silva@example.com',
        phone: '33999999999',
        message: 'Test message'
      }

      const { contactFormSchema, anonymizePII } = require('@/lib/validations/api')
      contactFormSchema.safeParse.mockReturnValue({
        success: true,
        data: validData
      })

      mockRequest = {
        json: vi.fn().mockResolvedValue(validData),
        headers: { get: vi.fn() }
      }

      // Mock console.log para capturar logs
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      // Act
      await POST(mockRequest)

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        'Email enviado com sucesso:',
        expect.objectContaining({
          from: expect.stringContaining('***@') // Email anonimizado
        })
      )

      consoleSpy.mockRestore()
    })
  })

  describe('OPTIONS /api/contact', () => {
    it('deve retornar headers CORS corretos', async () => {
      // Arrange
      mockRequest = new Request('http://localhost:3000/api/contact', { method: 'OPTIONS' })

      // Act
      const response = await OPTIONS(mockRequest)

      // Assert
      expect(response.status).toBe(200)
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('POST, OPTIONS')
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type, Authorization')
    })
  })

  describe('Tratamento de Erros', () => {
    it('deve tratar erro de parse JSON', async () => {
      // Arrange
      mockRequest = {
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
        headers: { get: vi.fn() }
      }

      // Act
      const response = await POST(mockRequest)
      const result = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(result.success).toBe(false)
      expect(result.code).toBe('INTERNAL_ERROR')
    })

    it('deve tratar erros inesperados', async () => {
      // Arrange
      mockRequest = {
        json: vi.fn().mockRejectedValue(new Error('Unexpected error')),
        headers: { get: vi.fn() }
      }

      // Act
      const response = await POST(mockRequest)
      const result = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(result.success).toBe(false)
      expect(result.code).toBe('INTERNAL_ERROR')
      expect(result.error).toBe('Erro ao processar sua solicitação. Tente novamente em alguns minutos.')
    })
  })

  describe('Configuração', () => {
    it('deve usar valores padrão das variáveis de ambiente', async () => {
      // Arrange
      delete process.env.RATE_LIMIT_MAX
      delete process.env.RATE_LIMIT_WINDOW
      delete process.env.CONTACT_TO_EMAIL
      delete process.env.CONTACT_EMAIL_FROM

      const validData = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '33999999999',
        message: 'Test message'
      }

      const { contactFormSchema } = require('@/lib/validations/api')
      contactFormSchema.safeParse.mockReturnValue({
        success: true,
        data: validData
      })

      mockRequest = {
        json: vi.fn().mockResolvedValue(validData),
        headers: { get: vi.fn() }
      }

      // Act
      const response = await POST(mockRequest)

      // Assert
      expect(response.status).toBe(200)

      // Verifica se os valores padrão foram usados
      const { checkRateLimit } = require('@/lib/validations/api')
      expect(checkRateLimit).toHaveBeenCalledWith('unknown', 10, 600000, expect.any(Map))

      const emailCall = mockResend.emails.send.mock.calls[0][0]
      expect(emailCall.from).toBe('contato@saraivavision.com.br')
      expect(emailCall.to).toBe('philipe_cruz@outlook.com')
    })
  })
})
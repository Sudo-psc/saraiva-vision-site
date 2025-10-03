/**
 * Testes para API de Health Check
 * Verifica status do sistema, serviços e configurações
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { GET } from '@/app/api/health/route'

describe('API de Health Check', () => {
  beforeEach(() => {
    // Limpa variáveis de ambiente
    delete process.env.RESEND_API_KEY
    delete process.env.GOOGLE_PLACES_API_KEY
    delete process.env.GOOGLE_MAPS_API_KEY
    delete process.env.NODE_ENV
    delete process.env.VERCEL_GIT_COMMIT_SHA
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('GET /api/health', () => {
    it('deve retornar status saudável com todas as chaves configuradas', async () => {
      // Arrange
      process.env.RESEND_API_KEY = 'test-resend-key'
      process.env.GOOGLE_PLACES_API_KEY = 'test-google-key'
      process.env.NODE_ENV = 'production'
      process.env.VERCEL_GIT_COMMIT_SHA = 'abc123'

      // Mock da data atual
      const mockDate = new Date('2024-01-01T12:00:00Z')
      vi.setSystemTime(mockDate)

      // Act
      const response = await GET()
      const result = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(result.status).toBe('ok')
      expect(result.service).toBe('saraiva-vision-api')
      expect(result.environment).toBe('production')
      expect(result.version).toBe('abc123')
      expect(result.timestamp).toBe('2024-01-01T12:00:00.000Z')

      // Verifica serviços
      expect(result.services.contactForm.status).toBe('ok')
      expect(result.services.contactForm.configured).toBe(true)

      expect(result.services.googleReviews.status).toBe('ok')
      expect(result.services.googleReviews.configured).toBe(true)

      expect(result.services.rateLimiting.status).toBe('ok')
      expect(result.services.rateLimiting.configured).toBe(true)

      expect(result.services.validation.status).toBe('ok')
      expect(result.services.validation.configured).toBe(true)

      // Verifica config
      expect(result.config.nodeEnv).toBe('production')
      expect(result.config.hasResendKey).toBe(true)
      expect(result.config.hasGoogleKey).toBe(true)
    })

    it('deve retornar status degraded sem chave do Google', async () => {
      // Arrange
      process.env.RESEND_API_KEY = 'test-resend-key'
      // Sem chave do Google

      const mockDate = new Date('2024-01-01T12:00:00Z')
      vi.setSystemTime(mockDate)

      // Act
      const response = await GET()
      const result = await response.json()

      // Assert
      expect(response.status).toBe(200) // Ainda 200 porque email funciona
      expect(result.status).toBe('ok')
      expect(result.services.contactForm.status).toBe('ok')
      expect(result.services.googleReviews.status).toBe('degraded')
      expect(result.services.googleReviews.configured).toBe(false)
      expect(result.services.googleReviews.errors).toContain('Google API key not set')

      expect(result.config.hasResendKey).toBe(true)
      expect(result.config.hasGoogleKey).toBe(false)
    })

    it('deve retornar status 503 sem chave do Resend', async () => {
      // Arrange
      process.env.GOOGLE_PLACES_API_KEY = 'test-google-key'
      // Sem chave do Resend

      const mockDate = new Date('2024-01-01T12:00:00Z')
      vi.setSystemTime(mockDate)

      // Act
      const response = await GET()
      const result = await response.json()

      // Assert
      expect(response.status).toBe(503)
      expect(result.status).toBe('degraded')
      expect(result.services.contactForm.status).toBe('error')
      expect(result.services.contactForm.configured).toBe(false)
      expect(result.services.contactForm.errors).toContain('RESEND_API_KEY not set')

      expect(result.config.hasResendKey).toBe(false)
      expect(result.config.hasGoogleKey).toBe(true)
    })

    it('deve funcionar com apenas chave Google Maps', async () => {
      // Arrange
      process.env.RESEND_API_KEY = 'test-resend-key'
      process.env.GOOGLE_MAPS_API_KEY = 'test-google-maps-key'
      // Sem chave Google Places

      const mockDate = new Date('2024-01-01T12:00:00Z')
      vi.setSystemTime(mockDate)

      // Act
      const response = await GET()
      const result = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(result.status).toBe('ok')
      expect(result.services.googleReviews.status).toBe('ok')
      expect(result.services.googleReviews.configured).toBe(true)

      expect(result.config.hasResendKey).toBe(true)
      expect(result.config.hasGoogleKey).toBe(true)
    })

    it('deve funcionar com apenas chave Google Places', async () => {
      // Arrange
      process.env.RESEND_API_KEY = 'test-resend-key'
      process.env.GOOGLE_PLACES_API_KEY = 'test-google-places-key'
      // Sem chave Google Maps

      const mockDate = new Date('2024-01-01T12:00:00Z')
      vi.setSystemTime(mockDate)

      // Act
      const response = await GET()
      const result = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(result.status).toBe('ok')
      expect(result.services.googleReviews.status).toBe('ok')
      expect(result.services.googleReviews.configured).toBe(true)

      expect(result.config.hasResendKey).toBe(true)
      expect(result.config.hasGoogleKey).toBe(true)
    })

    it('deve usar valores padrão em ambiente de desenvolvimento', async () => {
      // Arrange
      // Sem variáveis de ambiente configuradas

      const mockDate = new Date('2024-01-01T12:00:00Z')
      vi.setSystemTime(mockDate)

      // Act
      const response = await GET()
      const result = await response.json()

      // Assert
      expect(response.status).toBe(503) // Sem chave Resend
      expect(result.status).toBe('degraded')
      expect(result.environment).toBe('development')
      expect(result.version).toBe('local')

      expect(result.services.contactForm.status).toBe('error')
      expect(result.services.googleReviews.status).toBe('degraded')

      expect(result.config.nodeEnv).toBe('development')
      expect(result.config.hasResendKey).toBe(false)
      expect(result.config.hasGoogleKey).toBe(false)
    })

    it('deve ter timestamp sempre atualizado', async () => {
      // Arrange
      process.env.RESEND_API_KEY = 'test-resend-key'

      const firstDate = new Date('2024-01-01T12:00:00Z')
      vi.setSystemTime(firstDate)

      // Act
      const firstResponse = await GET()
      const firstResult = await firstResponse.json()

      const secondDate = new Date('2024-01-01T13:00:00Z')
      vi.setSystemTime(secondDate)

      const secondResponse = await GET()
      const secondResult = await secondResponse.json()

      // Assert
      expect(firstResult.timestamp).toBe('2024-01-01T12:00:00.000Z')
      expect(secondResult.timestamp).toBe('2024-01-01T13:00:00.000Z')
    })

    it('deve validar estrutura completa da resposta', async () => {
      // Arrange
      process.env.RESEND_API_KEY = 'test-resend-key'
      process.env.GOOGLE_PLACES_API_KEY = 'test-google-key'

      const mockDate = new Date('2024-01-01T12:00:00Z')
      vi.setSystemTime(mockDate)

      // Act
      const response = await GET()
      const result = await response.json()

      // Assert - Estrutura básica
      expect(result).toHaveProperty('status')
      expect(result).toHaveProperty('timestamp')
      expect(result).toHaveProperty('service')
      expect(result).toHaveProperty('environment')
      expect(result).toHaveProperty('version')
      expect(result).toHaveProperty('services')
      expect(result).toHaveProperty('config')

      // Assert - Serviços
      expect(result.services).toHaveProperty('contactForm')
      expect(result.services).toHaveProperty('googleReviews')
      expect(result.services).toHaveProperty('rateLimiting')
      expect(result.services).toHaveProperty('validation')

      // Assert - Config
      expect(result.config).toHaveProperty('nodeEnv')
      expect(result.config).toHaveProperty('hasResendKey')
      expect(result.config).toHaveProperty('hasGoogleKey')

      // Assert - Tipos
      expect(typeof result.status).toBe('string')
      expect(typeof result.timestamp).toBe('string')
      expect(typeof result.service).toBe('string')
      expect(typeof result.environment).toBe('string')
      expect(typeof result.version).toBe('string')
    })

    it('deve detectar chaves vazias como não configuradas', async () => {
      // Arrange
      process.env.RESEND_API_KEY = '' // String vazia
      process.env.GOOGLE_PLACES_API_KEY = '   ' // Apenas espaços

      const mockDate = new Date('2024-01-01T12:00:00Z')
      vi.setSystemTime(mockDate)

      // Act
      const response = await GET()
      const result = await response.json()

      // Assert
      expect(response.status).toBe(503)
      expect(result.status).toBe('degraded')
      expect(result.config.hasResendKey).toBe(false)
      expect(result.config.hasGoogleKey).toBe(false)

      expect(result.services.contactForm.status).toBe('error')
      expect(result.services.googleReviews.status).toBe('degraded')
    })

    it('deve tratar variáveis de ambiente nulas', async () => {
      // Arrange
      process.env.RESEND_API_KEY = 'test-resend-key'
      process.env.GOOGLE_PLACES_API_KEY = null as any

      const mockDate = new Date('2024-01-01T12:00:00Z')
      vi.setSystemTime(mockDate)

      // Act
      const response = await GET()
      const result = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(result.status).toBe('ok')
      expect(result.config.hasResendKey).toBe(true)
      expect(result.config.hasGoogleKey).toBe(false)
    })

    it('deve validar formato do timestamp ISO', async () => {
      // Arrange
      process.env.RESEND_API_KEY = 'test-resend-key'

      const mockDate = new Date('2024-01-01T12:30:45.123Z')
      vi.setSystemTime(mockDate)

      // Act
      const response = await GET()
      const result = await response.json()

      // Assert
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)

      // Verifica se pode ser parseado como data válida
      const parsedDate = new Date(result.timestamp)
      expect(parsedDate.toISOString()).toBe(result.timestamp)
    })

    it('deve incluir informações de erro quando configurado mas sem chave', async () => {
      // Arrange - Sem chaves configuradas
      const mockDate = new Date('2024-01-01T12:00:00Z')
      vi.setSystemTime(mockDate)

      // Act
      const response = await GET()
      const result = await response.json()

      // Assert
      expect(result.services.contactForm.errors).toContain('RESEND_API_KEY not set')
      expect(result.services.googleReviews.errors).toContain('Google API key not set')
    })

    it('deve ter serviços sempre configurados internamente', async () => {
      // Arrange
      process.env.RESEND_API_KEY = 'test-resend-key'

      const mockDate = new Date('2024-01-01T12:00:00Z')
      vi.setSystemTime(mockDate)

      // Act
      const response = await GET()
      const result = await response.json()

      // Assert - Rate limiting e validation sempre configurados
      expect(result.services.rateLimiting.status).toBe('ok')
      expect(result.services.rateLimiting.configured).toBe(true)

      expect(result.services.validation.status).toBe('ok')
      expect(result.services.validation.configured).toBe(true)
    })
  })
})
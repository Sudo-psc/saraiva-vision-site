/**
 * Testes para API de Google Reviews
 * Verifica cache, validação, integração com Google Places API e estatísticas
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { GET, OPTIONS } from '@/app/api/reviews/route'

// Mock do fetch global
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock das validações
vi.mock('@/lib/validations/api', () => ({
  reviewsQuerySchema: {
    safeParse: vi.fn()
  }
}))

describe('API de Google Reviews', () => {
  let mockRequest: any

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()

    // Mock das variáveis de ambiente
    process.env.GOOGLE_PLACES_API_KEY = 'test-google-key'
    process.env.GOOGLE_PLACE_ID = 'test-place-id'

    // Mock das validações
    const { reviewsQuerySchema } = require('@/lib/validations/api')
    reviewsQuerySchema.safeParse.mockReturnValue({
      success: true,
      data: {
        placeId: undefined,
        limit: 5,
        language: 'pt-BR'
      }
    })

    // Mock da resposta da Google Places API
    mockFetch.mockResolvedValue({
      ok: true,
      headers: {
        get: vi.fn((header) => {
          if (header === 'content-type') return 'application/json'
          return null
        })
      },
      json: vi.fn().mockResolvedValue({
        status: 'OK',
        result: {
          name: 'Saraiva Vision',
          rating: 4.8,
          user_ratings_total: 136,
          reviews: [
            {
              author_name: 'João Silva',
              profile_photo_url: 'https://example.com/photo.jpg',
              rating: 5,
              text: 'Excelente atendimento, muito profissional!',
              time: 1704067200, // 2024-01-01
              language: 'pt',
              relative_time_description: 'há um mês'
            },
            {
              author_name: 'Maria Santos',
              rating: 4,
              text: 'Ótimos médicos e instalações modernas.',
              time: 1701388800, // 2023-12-01
              language: 'pt',
              relative_time_description: 'há dois meses'
            }
          ]
        }
      })
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('GET /api/reviews', () => {
    it('deve retornar reviews com sucesso', async () => {
      // Arrange
      mockRequest = {
        url: 'http://localhost:3000/api/reviews',
        headers: new Headers()
      }

      // Mock da data atual
      vi.setSystemTime(new Date('2024-01-15T12:00:00Z'))

      // Act
      const response = await GET(mockRequest)
      const result = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.data.reviews).toHaveLength(2)
      expect(result.data.stats.overview.totalReviews).toBe(136)
      expect(result.data.stats.overview.averageRating).toBe(4.8)
      expect(result.data.metadata.source).toBe('google-places-api')
      expect(result.data.metadata.placeName).toBe('Saraiva Vision')

      // Verifica headers de cache
      expect(response.headers.get('Cache-Control')).toBe('public, s-maxage=3600, stale-while-revalidate=7200')
      expect(response.headers.get('X-Cache')).toBe('MISS')

      // Verifica se chamou a API do Google
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('maps.googleapis.com/maps/api/place/details'),
        expect.objectContaining({
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'User-Agent': 'SaraivaVision/2.0'
          }
        })
      )
    })

    it('deve usar cache para requisições subsequentes', async () => {
      // Arrange
      mockRequest = {
        url: 'http://localhost:3000/api/reviews',
        headers: new Headers()
      }

      vi.setSystemTime(new Date('2024-01-15T12:00:00Z'))

      // Primeira requisição
      const firstResponse = await GET(mockRequest)
      expect(firstResponse.headers.get('X-Cache')).toBe('MISS')

      // Segunda requisição (deve usar cache)
      const secondResponse = await GET(mockRequest)
      expect(secondResponse.headers.get('X-Cache')).toBe('HIT')

      // Não deve chamar a API novamente
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('deve expirar cache após TTL', async () => {
      // Arrange
      mockRequest = {
        url: 'http://localhost:3000/api/reviews',
        headers: new Headers()
      }

      vi.setSystemTime(new Date('2024-01-15T12:00:00Z'))

      // Primeira requisição
      await GET(mockRequest)

      // Avança tempo além do TTL (61 minutos)
      vi.setSystemTime(new Date('2024-01-15T13:01:00Z'))

      // Segunda requisição (cache expirado)
      const response = await GET(mockRequest)
      expect(response.headers.get('X-Cache')).toBe('MISS')

      // Deve chamar a API novamente
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('deve validar parâmetros da query', async () => {
      // Arrange
      const { reviewsQuerySchema } = require('@/lib/validations/api')
      reviewsQuerySchema.safeParse.mockReturnValue({
        success: false,
        error: {
          flatten: () => ({
            fieldErrors: {
              limit: ['Limit must be between 1 and 50']
            }
          })
        }
      })

      mockRequest = {
        url: 'http://localhost:3000/api/reviews?limit=invalid',
        headers: new Headers()
      }

      // Act
      const response = await GET(mockRequest)
      const result = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Parâmetros inválidos')
      expect(result.details).toBeDefined()
    })

    it('deve tratar erro de API key ausente', async () => {
      // Arrange
      delete process.env.GOOGLE_PLACES_API_KEY
      delete process.env.GOOGLE_MAPS_API_KEY
      delete process.env.VITE_GOOGLE_PLACES_API_KEY
      delete process.env.VITE_GOOGLE_MAPS_API_KEY

      mockRequest = {
        url: 'http://localhost:3000/api/reviews',
        headers: new Headers()
      }

      // Act
      const response = await GET(mockRequest)
      const result = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(result.success).toBe(false)
      expect(result.error).toBe('API key not configured')
    })

    it('deve tratar erro de Place ID ausente', async () => {
      // Arrange
      delete process.env.GOOGLE_PLACE_ID
      delete process.env.VITE_GOOGLE_PLACE_ID

      const { reviewsQuerySchema } = require('@/lib/validations/api')
      reviewsQuerySchema.safeParse.mockReturnValue({
        success: true,
        data: { placeId: undefined, limit: 5, language: 'pt-BR' }
      })

      mockRequest = {
        url: 'http://localhost:3000/api/reviews',
        headers: new Headers()
      }

      // Act
      const response = await GET(mockRequest)
      const result = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Google Place ID not configured')
    })

    it('deve usar Place ID da query se fornecido', async () => {
      // Arrange
      const { reviewsQuerySchema } = require('@/lib/validations/api')
      reviewsQuerySchema.safeParse.mockReturnValue({
        success: true,
        data: { placeId: 'custom-place-id', limit: 5, language: 'pt-BR' }
      })

      mockRequest = {
        url: 'http://localhost:3000/api/reviews?placeId=custom-place-id',
        headers: new Headers()
      }

      // Act
      const response = await GET(mockRequest)

      // Assert
      expect(response.status).toBe(200)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('place_id=custom-place-id'),
        expect.any(Object)
      )
    })

    it('deve tratar erros específicos da Google Places API', async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: true,
        headers: { get: vi.fn(() => 'application/json') },
        json: vi.fn().mockResolvedValue({
          status: 'REQUEST_DENIED',
          error_message: 'Invalid API key'
        })
      })

      mockRequest = {
        url: 'http://localhost:3000/api/reviews',
        headers: new Headers()
      }

      // Act
      const response = await GET(mockRequest)
      const result = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(result.success).toBe(false)
      expect(result.error).toBe('API request denied. Check API key and Places API activation.')
    })

    it('deve tratar timeout da requisição', async () => {
      // Arrange
      mockFetch.mockImplementation(() =>
        new Promise((_, reject) => {
          setTimeout(() => reject(new DOMException('AbortError', 'AbortError')), 20000)
        })
      )

      mockRequest = {
        url: 'http://localhost:3000/api/reviews',
        headers: new Headers()
      }

      // Act
      const response = await GET(mockRequest)
      const result = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(result.success).toBe(false)
    })

    it('deve calcular estatísticas corretamente', async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: true,
        headers: { get: vi.fn(() => 'application/json') },
        json: vi.fn().mockResolvedValue({
          status: 'OK',
          result: {
            name: 'Test Clinic',
            rating: 4.5,
            user_ratings_total: 100,
            reviews: [
              { author_name: 'User1', rating: 5, text: 'Great!', time: Date.now() / 1000 },
              { author_name: 'User2', rating: 4, text: 'Good', time: Date.now() / 1000 },
              { author_name: 'User3', rating: 3, text: 'Average', time: Date.now() / 1000 }
            ]
          }
        })
      })

      mockRequest = {
        url: 'http://localhost:3000/api/reviews?limit=3',
        headers: new Headers()
      }

      vi.setSystemTime(new Date('2024-01-15T12:00:00Z'))

      // Act
      const response = await GET(mockRequest)
      const result = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(result.data.stats.overview.totalReviews).toBe(100)
      expect(result.data.stats.overview.averageRating).toBe(4.5)
      expect(result.data.stats.sentiment.positive).toBe(2) // Ratings 4-5
      expect(result.data.stats.sentiment.neutral).toBe(1)  // Rating 3
      expect(result.data.stats.sentiment.negative).toBe(0) // Ratings 1-2
      expect(result.data.stats.sentiment.positivePercentage).toBe(67)
      expect(result.data.stats.distribution[5]).toBe(1)
      expect(result.data.stats.distribution[4]).toBe(1)
      expect(result.data.stats.distribution[3]).toBe(1)
    })

    it('deve identificar reviews recentes', async () => {
      // Arrange
      const now = Date.now() / 1000
      const recentTime = now - (15 * 24 * 60 * 60) // 15 dias atrás
      const oldTime = now - (45 * 24 * 60 * 60) // 45 dias atrás

      mockFetch.mockResolvedValue({
        ok: true,
        headers: { get: vi.fn(() => 'application/json') },
        json: vi.fn().mockResolvedValue({
          status: 'OK',
          result: {
            reviews: [
              { author_name: 'Recent User', rating: 5, text: 'Recent!', time: recentTime },
              { author_name: 'Old User', rating: 4, text: 'Old', time: oldTime }
            ]
          }
        })
      })

      mockRequest = {
        url: 'http://localhost:3000/api/reviews',
        headers: new Headers()
      }

      vi.setSystemTime(new Date(now * 1000))

      // Act
      const response = await GET(mockRequest)
      const result = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(result.data.reviews[0].isRecent).toBe(true)
      expect(result.data.reviews[1].isRecent).toBe(false)
      expect(result.data.stats.overview.recentReviews).toBe(1)
    })

    it('deve lidar com reviews sem texto', async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: true,
        headers: { get: vi.fn(() => 'application/json') },
        json: vi.fn().mockResolvedValue({
          status: 'OK',
          result: {
            reviews: [
              { author_name: 'User1', rating: 5, text: '' },
              { author_name: 'User2', rating: 4, text: null }
            ]
          }
        })
      })

      mockRequest = {
        url: 'http://localhost:3000/api/reviews',
        headers: new Headers()
      }

      // Act
      const response = await GET(mockRequest)
      const result = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(result.data.reviews[0].comment).toBe('')
      expect(result.data.reviews[0].wordCount).toBe(0)
      expect(result.data.reviews[1].comment).toBe('')
      expect(result.data.reviews[1].wordCount).toBe(0)
    })

    it('deve usar valores padrão para reviews incompletos', async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: true,
        headers: { get: vi.fn(() => 'application/json') },
        json: vi.fn().mockResolvedValue({
          status: 'OK',
          result: {
            reviews: [
              { rating: 5 } // Apenas rating
            ]
          }
        })
      })

      mockRequest = {
        url: 'http://localhost:3000/api/reviews',
        headers: new Headers()
      }

      // Act
      const response = await GET(mockRequest)
      const result = await response.json()

      // Assert
      expect(response.status).toBe(200)
      const review = result.data.reviews[0]
      expect(review.reviewer.displayName).toBe('Anonymous')
      expect(review.reviewer.isAnonymous).toBe(true)
      expect(review.starRating).toBe(5)
      expect(review.comment).toBe('')
      expect(review.profilePhotoUrl).toBeNull()
    })

    it('deve respeitar o limite de reviews', async () => {
      // Arrange
      const { reviewsQuerySchema } = require('@/lib/validations/api')
      reviewsQuerySchema.safeParse.mockReturnValue({
        success: true,
        data: { placeId: undefined, limit: 3, language: 'pt-BR' }
      })

      mockRequest = {
        url: 'http://localhost:3000/api/reviews?limit=3',
        headers: new Headers()
      }

      // Act
      const response = await GET(mockRequest)
      const result = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(result.data.reviews.length).toBeLessThanOrEqual(3)
      expect(result.data.pagination.limit).toBe(3)
    })
  })

  describe('OPTIONS /api/reviews', () => {
    it('deve retornar headers CORS corretos', async () => {
      // Act
      const response = await OPTIONS()

      // Assert
      expect(response.status).toBe(200)
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, OPTIONS')
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type')
    })
  })

  describe('Tratamento de Erros', () => {
    it('deve tratar erro de fetch', async () => {
      // Arrange
      mockFetch.mockRejectedValue(new Error('Network error'))

      mockRequest = {
        url: 'http://localhost:3000/api/reviews',
        headers: new Headers()
      }

      // Act
      const response = await GET(mockRequest)
      const result = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })

    it('deve tratar resposta não-JSON', async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: true,
        headers: { get: vi.fn(() => 'text/html') }
      })

      mockRequest = {
        url: 'http://localhost:3000/api/reviews',
        headers: new Headers()
      }

      // Act
      const response = await GET(mockRequest)
      const result = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid response format from Google Places API')
    })
  })
})
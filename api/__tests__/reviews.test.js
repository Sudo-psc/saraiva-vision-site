import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Node.js crypto module
vi.mock('node:crypto', () => ({
  createHash: vi.fn(() => ({
    update: vi.fn().mockReturnThis(),
    digest: vi.fn().mockReturnValue('mockedhash123')
  }))
}));

// Import the handler after mocking
const { default: handler } = await import('../reviews.js');

describe('Reviews API Handler', () => {
  let mockReq;
  let mockRes;
  let originalEnv;

  beforeEach(() => {
    originalEnv = process.env;
    
    // Mock environment variables
    process.env = {
      ...originalEnv,
      GOOGLE_MAPS_API_KEY: 'mock-api-key',
      GOOGLE_PLACE_ID: 'mock-place-id',
      NODE_ENV: 'test'
    };

    // Mock request object
    mockReq = {
      method: 'GET',
      headers: {},
      url: '/api/reviews',
      on: vi.fn()
    };

    // Mock response object
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      setHeader: vi.fn().mockReturnThis(),
      end: vi.fn().mockReturnThis(),
      writeHead: vi.fn().mockReturnThis(),
      write: vi.fn().mockReturnThis()
    };

    // Mock global fetch
    global.fetch = vi.fn();

    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('HTTP Method Validation', () => {
    it('returns 405 for non-GET requests', async () => {
      mockReq.method = 'POST';

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(405);
      expect(mockRes.setHeader).toHaveBeenCalledWith('Allow', 'GET');
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
    });

    it('accepts GET requests', async () => {
      const mockGoogleResponse = {
        ok: true,
        json: () => Promise.resolve({
          status: 'OK',
          result: {
            reviews: [],
            rating: 4.5,
            user_ratings_total: 100
          }
        })
      };
      global.fetch.mockResolvedValue(mockGoogleResponse);

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('Environment Configuration', () => {
    it('returns 500 when API key is missing', async () => {
      delete process.env.GOOGLE_MAPS_API_KEY;

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Missing server credentials',
        details: {
          hasApiKey: false,
          hasPlaceId: true
        }
      });
    });

    it('returns 500 when place ID is missing', async () => {
      delete process.env.GOOGLE_PLACE_ID;

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Missing server credentials',
        details: {
          hasApiKey: true,
          hasPlaceId: false
        }
      });
    });

    it('uses fallback environment variables', async () => {
      delete process.env.GOOGLE_MAPS_API_KEY;
      delete process.env.GOOGLE_PLACE_ID;
      process.env.GOOGLE_PLACES_API_KEY = 'fallback-api-key';
      process.env.VITE_GOOGLE_PLACE_ID = 'fallback-place-id';

      const mockGoogleResponse = {
        ok: true,
        json: () => Promise.resolve({
          status: 'OK',
          result: {
            reviews: [],
            rating: 4.5,
            user_ratings_total: 100
          }
        })
      };
      global.fetch.mockResolvedValue(mockGoogleResponse);

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('fallback-place-id')
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('fallback-api-key')
      );
    });
  });

  describe('Google Places API Integration', () => {
    it('fetches and processes reviews successfully', async () => {
      const mockReviews = [
        {
          author_name: 'João Silva Santos',
          rating: 5,
          text: 'Excelente atendimento na clínica!',
          relative_time_description: '2 weeks ago'
        },
        {
          author_name: 'Maria Oliveira',
          rating: 4,
          text: 'Muito bom serviço, recomendo.',
          relative_time_description: '1 month ago'
        }
      ];

      const mockGoogleResponse = {
        ok: true,
        json: () => Promise.resolve({
          status: 'OK',
          result: {
            reviews: mockReviews,
            rating: 4.5,
            user_ratings_total: 100
          }
        })
      };
      global.fetch.mockResolvedValue(mockGoogleResponse);

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          source: 'google-places',
          total: 100,
          rating: 4.5,
          reviews: expect.arrayContaining([
            expect.objectContaining({
              id: 0,
              author: 'João S.',
              rating: 5,
              text: 'Excelente atendimento na clínica!',
              relativeTime: '2 weeks ago'
            }),
            expect.objectContaining({
              id: 1,
              author: 'Maria Oliveira',
              rating: 4,
              text: 'Muito bom serviço, recomendo.',
              relativeTime: '1 month ago'
            })
          ]),
          disclaimer: expect.stringContaining('Avaliações públicas'),
          timestamp: expect.any(String)
        })
      );
    });

    it('handles Google API errors', async () => {
      const mockGoogleResponse = {
        ok: true,
        json: () => Promise.resolve({
          status: 'REQUEST_DENIED',
          error_message: 'API key not valid'
        })
      };
      global.fetch.mockResolvedValue(mockGoogleResponse);

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Internal server error',
          message: 'API key not valid'
        })
      );
    });

    it('handles network errors', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Internal server error',
          message: 'Network error'
        })
      );
    });
  });

  describe('Data Sanitization', () => {
    it('anonymizes author names correctly', async () => {
      const mockReviews = [
        {
          author_name: 'João Silva Santos',
          rating: 5,
          text: 'Great service!',
          relative_time_description: '1 week ago'
        },
        {
          author_name: 'Maria',
          rating: 4,
          text: 'Good experience.',
          relative_time_description: '2 weeks ago'
        },
        {
          author_name: '',
          rating: 3,
          text: 'Average service.',
          relative_time_description: '1 month ago'
        }
      ];

      const mockGoogleResponse = {
        ok: true,
        json: () => Promise.resolve({
          status: 'OK',
          result: {
            reviews: mockReviews,
            rating: 4.0,
            user_ratings_total: 50
          }
        })
      };
      global.fetch.mockResolvedValue(mockGoogleResponse);

      await handler(mockReq, mockRes);

      const responseCall = mockRes.json.mock.calls[0][0];
      expect(responseCall.reviews[0].author).toBe('João S.');
      expect(responseCall.reviews[1].author).toBe('Maria');
      expect(responseCall.reviews[2].author).toBe('Paciente');
    });

    it('removes PII from review text', async () => {
      const mockReviews = [
        {
          author_name: 'João Silva',
          rating: 5,
          text: 'Great service! Call me at +55 33 99999-9999 or email test@email.com',
          relative_time_description: '1 week ago'
        }
      ];

      const mockGoogleResponse = {
        ok: true,
        json: () => Promise.resolve({
          status: 'OK',
          result: {
            reviews: mockReviews,
            rating: 5.0,
            user_ratings_total: 1
          }
        })
      };
      global.fetch.mockResolvedValue(mockGoogleResponse);

      await handler(mockReq, mockRes);

      const responseCall = mockRes.json.mock.calls[0][0];
      expect(responseCall.reviews[0].text).toContain('[removido]');
      expect(responseCall.reviews[0].text).not.toContain('99999-9999');
      expect(responseCall.reviews[0].text).not.toContain('test@email.com');
    });

    it('removes sensitive clinical terms', async () => {
      const mockReviews = [
        {
          author_name: 'João Silva',
          rating: 5,
          text: 'Tratou minha retinopatia diabética muito bem. O glaucoma também foi diagnosticado.',
          relative_time_description: '1 week ago'
        }
      ];

      const mockGoogleResponse = {
        ok: true,
        json: () => Promise.resolve({
          status: 'OK',
          result: {
            reviews: mockReviews,
            rating: 5.0,
            user_ratings_total: 1
          }
        })
      };
      global.fetch.mockResolvedValue(mockGoogleResponse);

      await handler(mockReq, mockRes);

      const responseCall = mockRes.json.mock.calls[0][0];
      expect(responseCall.reviews[0].text).toContain('[termo clínico]');
      expect(responseCall.reviews[0].text).not.toContain('retinopatia');
      expect(responseCall.reviews[0].text).not.toContain('glaucoma');
    });

    it('limits review text length', async () => {
      const longText = 'A'.repeat(500) + ' This should be truncated.';
      const mockReviews = [
        {
          author_name: 'João Silva',
          rating: 5,
          text: longText,
          relative_time_description: '1 week ago'
        }
      ];

      const mockGoogleResponse = {
        ok: true,
        json: () => Promise.resolve({
          status: 'OK',
          result: {
            reviews: mockReviews,
            rating: 5.0,
            user_ratings_total: 1
          }
        })
      };
      global.fetch.mockResolvedValue(mockGoogleResponse);

      await handler(mockReq, mockRes);

      const responseCall = mockRes.json.mock.calls[0][0];
      expect(responseCall.reviews[0].text.length).toBeLessThanOrEqual(400);
      expect(responseCall.reviews[0].text).not.toContain('This should be truncated');
    });

    it('limits number of reviews to 6', async () => {
      const mockReviews = Array.from({ length: 10 }, (_, i) => ({
        author_name: `User ${i}`,
        rating: 5,
        text: `Review ${i}`,
        relative_time_description: '1 week ago'
      }));

      const mockGoogleResponse = {
        ok: true,
        json: () => Promise.resolve({
          status: 'OK',
          result: {
            reviews: mockReviews,
            rating: 5.0,
            user_ratings_total: 10
          }
        })
      };
      global.fetch.mockResolvedValue(mockGoogleResponse);

      await handler(mockReq, mockRes);

      const responseCall = mockRes.json.mock.calls[0][0];
      expect(responseCall.reviews).toHaveLength(6);
    });
  });

  describe('Caching and ETag Support', () => {
    it('sets proper cache headers', async () => {
      const mockGoogleResponse = {
        ok: true,
        json: () => Promise.resolve({
          status: 'OK',
          result: {
            reviews: [],
            rating: 4.5,
            user_ratings_total: 100
          }
        })
      };
      global.fetch.mockResolvedValue(mockGoogleResponse);

      await handler(mockReq, mockRes);

      expect(mockRes.setHeader).toHaveBeenCalledWith('ETag', expect.stringContaining('W/"'));
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Data-Policy', 'anonymized');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Cache-Control', 'public, max-age=300');
    });

    it('returns 304 for matching ETag', async () => {
      mockReq.headers['if-none-match'] = 'W/"mockedhash123"';

      const mockGoogleResponse = {
        ok: true,
        json: () => Promise.resolve({
          status: 'OK',
          result: {
            reviews: [],
            rating: 4.5,
            user_ratings_total: 100
          }
        })
      };
      global.fetch.mockResolvedValue(mockGoogleResponse);

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(304);
      expect(mockRes.end).toHaveBeenCalled();
    });
  });

  describe('Server-Sent Events (SSE)', () => {
    it('handles SSE requests with Accept header', async () => {
      mockReq.headers.accept = 'text/event-stream';
      const onMock = vi.fn();
      mockReq.on = onMock;

      const mockGoogleResponse = {
        ok: true,
        json: () => Promise.resolve({
          status: 'OK',
          result: {
            reviews: [],
            rating: 4.5,
            user_ratings_total: 100
          }
        })
      };
      global.fetch.mockResolvedValue(mockGoogleResponse);

      await handler(mockReq, mockRes);

      expect(mockRes.writeHead).toHaveBeenCalledWith(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no'
      });

      expect(mockRes.write).toHaveBeenCalledWith(
        expect.stringContaining('data:')
      );
    });

    it('handles SSE requests with stream parameter', async () => {
      mockReq.url = '/api/reviews?stream=1';
      const onMock = vi.fn();
      mockReq.on = onMock;

      const mockGoogleResponse = {
        ok: true,
        json: () => Promise.resolve({
          status: 'OK',
          result: {
            reviews: [],
            rating: 4.5,
            user_ratings_total: 100
          }
        })
      };
      global.fetch.mockResolvedValue(mockGoogleResponse);

      await handler(mockReq, mockRes);

      expect(mockRes.writeHead).toHaveBeenCalledWith(200, expect.objectContaining({
        'Content-Type': 'text/event-stream'
      }));
    });
  });
});
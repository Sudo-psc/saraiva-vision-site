import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchPlaceDetails, clearPlaceCache } from '../fetchPlaceDetails';
import { loadGoogleMaps } from '../loadGoogleMaps';

// Mock dependencies
vi.mock('../loadGoogleMaps');

describe('fetchPlaceDetails', () => {
  let mockGoogleMaps;
  let mockPlaceClass;
  let mockPlaceInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    clearPlaceCache();

    // Mock Google Maps
    mockGoogleMaps = {
      importLibrary: vi.fn()
    };

    // Mock place instance that will be returned by Place constructor
    mockPlaceInstance = {
      fetchFields: vi.fn().mockImplementation(({ fields }) => {
        // Simulate different data based on fields requested
        if (fields.includes('reviews')) {
          // Add reviews to the instance (simulating Google Places API behavior)
          Object.assign(mockPlaceInstance, {
            reviews: [
              {
                id: 'review1',
                reviewer: { displayName: 'John Doe', profilePhotoUrl: 'photo1.jpg' },
                starRating: 5,
                comment: 'Great place!',
                createTime: '2024-01-15T10:30:00Z',
                relativeTimeDescription: '1 week ago'
              }
            ]
          });
        }
        return Promise.resolve();
      })
    };

    // Default place data (initialize with empty reviews, will be populated by fetchFields)
    Object.assign(mockPlaceInstance, {
      displayName: 'Test Place',
      location: { lat: -19.93, lng: -43.84 },
      formattedAddress: 'Test Address',
      rating: 4.5,
      userRatingCount: 100,
      googleMapsURI: 'https://maps.example.com',
      reviews: [], // Start empty, will be populated by fetchFields
      photos: [{ url: 'photo1.jpg' }],
      businessStatus: 'OPERATIONAL',
      priceLevel: 'MODERATE'
    });

    // Mock Place class
    mockPlaceClass = vi.fn().mockImplementation(() => mockPlaceInstance);

    global.window = {
      google: {
        maps: {
          importLibrary: mockGoogleMaps.importLibrary
        }
      }
    };

    loadGoogleMaps.mockResolvedValue();
    mockGoogleMaps.importLibrary.mockResolvedValue({ Place: mockPlaceClass });
  });

  afterEach(() => {
    delete global.window;
    delete global.google;
  });

  describe('successful fetching', () => {
    it('should fetch place details successfully', async () => {
      const result = await fetchPlaceDetails('test-place-id');

      expect(result).toEqual(expect.objectContaining({
        name: 'Test Place',
        location: { lat: -19.93, lng: -43.84 },
        formattedAddress: 'Test Address',
        rating: 4.5,
        userRatingCount: 100,
        url: 'https://maps.example.com',
        reviews: expect.arrayContaining([
          expect.objectContaining({
            id: 'review1',
            reviewer: expect.objectContaining({
              displayName: 'John Doe',
              profilePhotoUrl: 'photo1.jpg'
            }),
            starRating: 5,
            comment: 'Great place!'
          })
        ]),
        photos: expect.arrayContaining([{ url: 'photo1.jpg' }]),
        businessStatus: 'OPERATIONAL',
        priceLevel: 'MODERATE'
      }));

      expect(loadGoogleMaps).toHaveBeenCalled();
      expect(mockGoogleMaps.importLibrary).toHaveBeenCalledWith('places');
    });

    it('should cache results', async () => {
      const placeId = 'test-place-id';
      const fields = ['displayName', 'rating'];

      // First call
      await fetchPlaceDetails(placeId, fields);
      expect(loadGoogleMaps).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await fetchPlaceDetails(placeId, fields);
      expect(loadGoogleMaps).toHaveBeenCalledTimes(1); // No additional calls
    });

    it('should handle cache expiration', async () => {
      const placeId = 'test-place-id';
      const fields = ['displayName', 'rating'];

      // Mock Date.now to control cache timing
      const originalDateNow = Date.now;
      Date.now = vi.fn()
        .mockReturnValueOnce(1000) // First call
        .mockReturnValueOnce(1000 + 31 * 60 * 1000); // Second call after 31 minutes (expired)

      // First call
      await fetchPlaceDetails(placeId, fields);
      expect(loadGoogleMaps).toHaveBeenCalledTimes(1);

      // Second call should not use cache (expired)
      await fetchPlaceDetails(placeId, fields);
      expect(loadGoogleMaps).toHaveBeenCalledTimes(2);

      Date.now = originalDateNow;
    });
  });

  describe('data normalization', () => {
    it('should handle missing reviewer information', async () => {
      // Create a new mock instance for this specific test case
      const testMockInstance = {
        fetchFields: vi.fn().mockImplementation(({ fields }) => {
          if (fields.includes('reviews')) {
            // Simulate Google Places API behavior - reviews are populated after fetchFields
            Object.assign(testMockInstance, {
              reviews: [
                {
                  id: 'review1',
                  reviewer: {}, // Missing displayName and profilePhotoUrl
                  starRating: 5,
                  comment: 'Good place',
                  createTime: '2024-01-15T10:30:00Z'
                }
              ]
            });
          }
          return Promise.resolve();
        })
      };

      Object.assign(testMockInstance, {
        displayName: 'Test Place',
        location: { lat: -19.93, lng: -43.84 },
        formattedAddress: 'Test Address',
        rating: 4.5,
        userRatingCount: 100,
        googleMapsURI: 'https://maps.example.com',
        reviews: [], // Initially empty, populated by fetchFields
        photos: [{ url: 'photo1.jpg' }],
        businessStatus: 'OPERATIONAL',
        priceLevel: 'MODERATE'
      });

      mockGoogleMaps.importLibrary.mockResolvedValue({
        Place: vi.fn().mockImplementation(() => testMockInstance)
      });

      const result = await fetchPlaceDetails('test-place-id');

      expect(result.reviews[0]).toEqual(expect.objectContaining({
        id: 'review1',
        reviewer: expect.objectContaining({
          displayName: 'Nome não disponível',
          profilePhotoUrl: '/images/avatar-female-brunette-320w.avif'
        }),
        starRating: 5,
        comment: 'Good place'
      }));
    });

    it('should handle missing review properties', async () => {
      // Create a new mock instance for this specific test case
      const testMockInstance = {
        fetchFields: vi.fn().mockImplementation(({ fields }) => {
          if (fields.includes('reviews')) {
            // Simulate Google Places API behavior - reviews are populated after fetchFields
            Object.assign(testMockInstance, {
              reviews: [
                {
                  id: 'review1',
                  reviewer: { displayName: 'John Doe' }
                  // Missing starRating, comment, createTime
                }
              ]
            });
          }
          return Promise.resolve();
        })
      };

      Object.assign(testMockInstance, {
        displayName: 'Test Place',
        location: { lat: -19.93, lng: -43.84 },
        formattedAddress: 'Test Address',
        rating: 4.5,
        userRatingCount: 100,
        googleMapsURI: 'https://maps.example.com',
        reviews: [], // Initially empty, populated by fetchFields
        photos: [{ url: 'photo1.jpg' }],
        businessStatus: 'OPERATIONAL',
        priceLevel: 'MODERATE'
      });

      mockGoogleMaps.importLibrary.mockResolvedValue({
        Place: vi.fn().mockImplementation(() => testMockInstance)
      });

      const result = await fetchPlaceDetails('test-place-id');

      expect(result.reviews[0]).toEqual(expect.objectContaining({
        id: 'review1',
        reviewer: expect.objectContaining({
          displayName: 'John Doe'
        }),
        starRating: 5, // Default value
        comment: 'Excelente atendimento!', // Default value
        createTime: expect.any(String) // Should have default timestamp
      }));
    });

    it('should handle malformed reviews array', async () => {
      // Create a new mock instance for this specific test case
      const testMockInstance = {
        fetchFields: vi.fn().mockImplementation(({ fields }) => {
          if (fields.includes('reviews')) {
            // Simulate Google Places API behavior - reviews are populated after fetchFields
            Object.assign(testMockInstance, {
              reviews: [
                null,
                undefined,
                {},
                {
                  id: 'valid',
                  reviewer: { displayName: 'Valid User' },
                  starRating: 5,
                  comment: 'Valid comment',
                  createTime: '2024-01-15T10:30:00Z'
                }
              ]
            });
          }
          return Promise.resolve();
        })
      };

      Object.assign(testMockInstance, {
        displayName: 'Test Place',
        location: { lat: -19.93, lng: -43.84 },
        formattedAddress: 'Test Address',
        rating: 4.5,
        userRatingCount: 100,
        googleMapsURI: 'https://maps.example.com',
        reviews: [], // Initially empty, populated by fetchFields
        photos: [{ url: 'photo1.jpg' }],
        businessStatus: 'OPERATIONAL',
        priceLevel: 'MODERATE'
      });

      mockGoogleMaps.importLibrary.mockResolvedValue({
        Place: vi.fn().mockImplementation(() => testMockInstance)
      });

      const result = await fetchPlaceDetails('test-place-id');

      expect(result.reviews).toHaveLength(1);
      expect(result.reviews[0]).toEqual(expect.objectContaining({
        id: 'valid',
        reviewer: expect.objectContaining({
          displayName: 'Valid User'
        })
      }));
    });

    it('should handle missing place properties', async () => {
      const testMockInstance = {
        fetchFields: vi.fn().mockResolvedValue()
        // Missing most properties
      };

      mockGoogleMaps.importLibrary.mockResolvedValue({
        Place: vi.fn().mockImplementation(() => testMockInstance)
      });

      const result = await fetchPlaceDetails('test-place-id');

      expect(result).toEqual(expect.objectContaining({
        name: 'Nome não disponível',
        location: null,
        formattedAddress: 'Endereço não disponível',
        rating: 0,
        userRatingCount: 0,
        url: '',
        reviews: [],
        photos: [],
        businessStatus: 'UNKNOWN',
        priceLevel: null
      }));
    });

    it('should normalize star ratings to be within 1-5 range', async () => {
      const testMockInstance = {
        fetchFields: vi.fn().mockImplementation(({ fields }) => {
          if (fields.includes('reviews')) {
            testMockInstance.reviews = [
              {
                id: 'review1',
                reviewer: { displayName: 'John Doe' },
                starRating: 10, // Out of range
                comment: 'Great place',
                createTime: '2024-01-15T10:30:00Z'
              },
              {
                id: 'review2',
                reviewer: { displayName: 'Jane Doe' },
                starRating: 0, // Out of range
                comment: 'Good place',
                createTime: '2024-01-15T10:30:00Z'
              }
            ];
          }
          return Promise.resolve();
        })
      };

      Object.assign(testMockInstance, {
        displayName: 'Test Place',
        location: { lat: -19.93, lng: -43.84 },
        formattedAddress: 'Test Address',
        rating: 4.5,
        userRatingCount: 100,
        googleMapsURI: 'https://maps.example.com',
        reviews: [],
        photos: [{ url: 'photo1.jpg' }],
        businessStatus: 'OPERATIONAL',
        priceLevel: 'MODERATE'
      });

      mockGoogleMaps.importLibrary.mockResolvedValue({
        Place: vi.fn().mockImplementation(() => testMockInstance)
      });

      const result = await fetchPlaceDetails('test-place-id');

      expect(result.reviews[0].starRating).toBe(5); // Capped at 5
      expect(result.reviews[1].starRating).toBe(1); // Minimum 1
    });
  });

  describe('error handling', () => {
    it('should handle missing place ID', async () => {
      await expect(fetchPlaceDetails('')).rejects.toThrow('Place ID é obrigatório');
    });

    it('should handle Google Maps loading failure', async () => {
      loadGoogleMaps.mockRejectedValue(new Error('Failed to load Google Maps'));

      const result = await fetchPlaceDetails('test-place-id');

      expect(result).toEqual(expect.objectContaining({
        name: 'Nome não disponível',
        rating: 0,
        reviews: [],
        error: 'Failed to load Google Maps'
      }));
    });

    it('should handle Places library loading failure', async () => {
      mockGoogleMaps.importLibrary.mockRejectedValue(new Error('Failed to load Places library'));

      const result = await fetchPlaceDetails('test-place-id');

      expect(result).toEqual(expect.objectContaining({
        name: 'Nome não disponível',
        rating: 0,
        reviews: [],
        error: 'Failed to load Places library'
      }));
    });

    it('should handle Place creation failure', async () => {
      mockGoogleMaps.importLibrary.mockResolvedValue({ Place: null });

      const result = await fetchPlaceDetails('test-place-id');

      expect(result).toEqual(expect.objectContaining({
        name: 'Nome não disponível',
        rating: 0,
        reviews: [],
        error: 'Biblioteca Google Places não disponível'
      }));
    });

    it('should handle fetchFields failure', async () => {
      mockPlaceInstance.fetchFields.mockRejectedValue(new Error('Network error'));

      const result = await fetchPlaceDetails('test-place-id');

      expect(result).toEqual(expect.objectContaining({
        name: 'Nome não disponível',
        rating: 0,
        reviews: [],
        error: 'Network error'
      }));
    });
  });

  describe('cache management', () => {
    it('should clear cache when requested', () => {
      // Test cache clearing through the API
      // First call should populate cache
      fetchPlaceDetails('test-place-id');

      // Clear should work without errors
      expect(() => clearPlaceCache()).not.toThrow();
    });

    it('should handle different cache keys for different fields', async () => {
      const placeId = 'test-place-id';

      // Call with different field combinations
      await fetchPlaceDetails(placeId, ['displayName']);
      await fetchPlaceDetails(placeId, ['rating']);
      await fetchPlaceDetails(placeId, ['displayName', 'rating']);

      // Should have made 3 calls (no cache hits due to different field combinations)
      expect(loadGoogleMaps).toHaveBeenCalledTimes(3);
    });
  });

  describe('performance optimizations', () => {
    it('should use default fields when none provided', async () => {
      await fetchPlaceDetails('test-place-id');

      expect(mockPlaceInstance.fetchFields).toHaveBeenCalledWith({
        fields: expect.arrayContaining([
          'displayName',
          'location',
          'formattedAddress',
          'rating',
          'userRatingCount',
          'googleMapsURI',
          'reviews',
          'photos',
          'businessStatus',
          'priceLevel'
        ])
      });
    });

    it('should handle empty reviews array', async () => {
      const testMockInstance = {
        fetchFields: vi.fn().mockImplementation(({ fields }) => {
          if (fields.includes('reviews')) {
            testMockInstance.reviews = [];
          }
          return Promise.resolve();
        })
      };

      Object.assign(testMockInstance, {
        displayName: 'Test Place',
        location: { lat: -19.93, lng: -43.84 },
        formattedAddress: 'Test Address',
        rating: 4.5,
        userRatingCount: 100,
        googleMapsURI: 'https://maps.example.com',
        reviews: [],
        photos: [{ url: 'photo1.jpg' }],
        businessStatus: 'OPERATIONAL',
        priceLevel: 'MODERATE'
      });

      mockGoogleMaps.importLibrary.mockResolvedValue({
        Place: vi.fn().mockImplementation(() => testMockInstance)
      });

      const result = await fetchPlaceDetails('test-place-id');

      expect(result.reviews).toEqual([]);
    });

    it('should handle null reviews', async () => {
      const testMockInstance = {
        fetchFields: vi.fn().mockImplementation(({ fields }) => {
          if (fields.includes('reviews')) {
            // Simulate Google Places API behavior - reviews are set to null after fetchFields
            Object.assign(testMockInstance, {
              reviews: null
            });
          }
          return Promise.resolve();
        })
      };

      Object.assign(testMockInstance, {
        displayName: 'Test Place',
        location: { lat: -19.93, lng: -43.84 },
        formattedAddress: 'Test Address',
        rating: 4.5,
        userRatingCount: 100,
        googleMapsURI: 'https://maps.example.com',
        reviews: [], // Initially empty, set to null by fetchFields
        photos: [{ url: 'photo1.jpg' }],
        businessStatus: 'OPERATIONAL',
        priceLevel: 'MODERATE'
      });

      mockGoogleMaps.importLibrary.mockResolvedValue({
        Place: vi.fn().mockImplementation(() => testMockInstance)
      });

      const result = await fetchPlaceDetails('test-place-id');

      expect(result.reviews).toEqual([]);
    });
  });
});
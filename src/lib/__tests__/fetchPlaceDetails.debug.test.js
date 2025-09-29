// Debug test to understand the mock behavior
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchPlaceDetails, clearPlaceCache } from '../fetchPlaceDetails.js';
import { loadGoogleMaps } from '../loadGoogleMaps.js';

// Mock dependencies
vi.mock('../loadGoogleMaps.js');

describe('fetchPlaceDetails Debug', () => {
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

    // Mock place instance
    mockPlaceInstance = {
      fetchFields: vi.fn().mockImplementation(({ fields }) => {
        console.log('🔍 DEBUG: fetchFields called with fields:', fields);
        if (fields.includes('reviews')) {
          console.log('🔍 DEBUG: Setting reviews data');
          Object.assign(mockPlaceInstance, {
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

    // Initialize with empty reviews
    Object.assign(mockPlaceInstance, {
      displayName: 'Test Place',
      location: { lat: -19.93, lng: -43.84 },
      formattedAddress: 'Test Address',
      rating: 4.5,
      userRatingCount: 100,
      googleMapsURI: 'https://maps.example.com',
      reviews: [], // Initially empty
      photos: [{ url: 'photo1.jpg' }],
      businessStatus: 'OPERATIONAL',
      priceLevel: 'MODERATE'
    });

    // Mock Place class - capture the constructor arguments
    mockPlaceClass = vi.fn().mockImplementation((args) => {
      console.log('🔍 DEBUG: Place constructor called with:', args);
      return mockPlaceInstance;
    });

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

  it('debug test', async () => {
    console.log('🔍 DEBUG: Test starting');
    // Clear the cache to ensure fresh API call
    clearPlaceCache();
    console.log('🔍 DEBUG: Cache cleared');

    // Add logging to loadGoogleMaps to see if it's called
    console.log('🔍 DEBUG: Before fetchPlaceDetails call');

    // Create a new mock instance for this specific test case (matching actual test pattern)
    const testMockInstance = {
      fetchFields: vi.fn().mockImplementation(({ fields }) => {
        console.log('🔍 DEBUG: fetchFields called with fields:', fields);
        if (fields.includes('reviews')) {
          console.log('🔍 DEBUG: Populating reviews array');
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
          console.log('🔍 DEBUG: After Object.assign, testMockInstance.reviews:', testMockInstance.reviews);
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

    // Override the mock Place class for this test
    mockGoogleMaps.importLibrary.mockResolvedValue({
      Place: vi.fn().mockImplementation((args) => {
        console.log('🔍 DEBUG: Place constructor called with:', args);
        return testMockInstance;
      })
    });

    const result = await fetchPlaceDetails('test-place-id');

    // Debug: Check the state after fetchPlaceDetails completes
    console.log('🔍 DEBUG: After fetchPlaceDetails - testMockInstance.reviews:', testMockInstance.reviews);
    console.log('🔍 DEBUG: Result reviews:', result.reviews);

    // Check that fetchFields was called and populated the reviews
    expect(testMockInstance.fetchFields).toHaveBeenCalled();
    expect(testMockInstance.reviews).toHaveLength(1);
    expect(result.reviews).toHaveLength(1);
    expect(result.reviews[0].reviewer.displayName).toBe('Nome não disponível');
  });
});
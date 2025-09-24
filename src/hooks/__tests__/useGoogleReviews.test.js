import { renderHook, waitFor } from '@testing-library/react';
import { useGoogleReviews } from '../useGoogleReviews';

// Mock fetch
global.fetch = jest.fn();

describe('useGoogleReviews', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle successful API response', async () => {
    const mockData = {
      success: true,
      data: {
        reviews: [
          { id: 1, comment: 'Great service!', starRating: 5 }
        ],
        stats: { averageRating: 4.5 }
      }
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve(mockData)
    });

    const { result } = renderHook(() =>
      useGoogleReviews({ placeId: 'test-place-id', autoFetch: true })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.reviews).toEqual(mockData.data.reviews);
      expect(result.current.stats).toEqual(mockData.data.stats);
    });
  });

  it('should handle JSON parsing error', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'text/html' }),
      text: () => Promise.resolve('<html>Server Error</html>')
    });

    const { result } = renderHook(() =>
      useGoogleReviews({ placeId: 'test-place-id', autoFetch: true })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeDefined();
      expect(result.current.error.message).toContain('Server returned non-JSON response');
    });
  });

  it('should handle network error with retry', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() =>
      useGoogleReviews({ placeId: 'test-place-id', autoFetch: true })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeDefined();
      expect(result.current.retryCount).toBeGreaterThan(0);
    });
  });
});
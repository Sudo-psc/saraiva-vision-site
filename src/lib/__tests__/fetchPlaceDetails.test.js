import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchPlaceDetails, clearPlaceCache } from '../fetchPlaceDetails';

describe('fetchPlaceDetails', () => {
  beforeEach(() => {
    clearPlaceCache();
    delete global.window;
    delete global.google;
  });

  it('throws when Google Places is not available', async () => {
    global.window = {};
    await expect(fetchPlaceDetails('abc')).rejects.toThrow('Google Places library not available');
  });

  it('fetches and caches place details', async () => {
    const fetchFields = vi.fn().mockResolvedValue();
    const placeInstance = {
      fetchFields,
      displayName: 'Clinic',
      location: { lat: 1, lng: 2 },
      formattedAddress: 'Street 1',
      rating: 4.5,
      userRatingCount: 10,
      googleMapsURI: 'http://maps.example'
    };
    const Place = vi.fn().mockImplementation(() => placeInstance);
    global.window = {};
    global.google = { maps: { places: { Place } } };

    const first = await fetchPlaceDetails('id');
    expect(first.name).toBe('Clinic');
    expect(Place).toHaveBeenCalledTimes(1);

    const second = await fetchPlaceDetails('id');
    expect(Place).toHaveBeenCalledTimes(1);
    expect(fetchFields).toHaveBeenCalledTimes(1);
    expect(second).toEqual(first);
  });
});

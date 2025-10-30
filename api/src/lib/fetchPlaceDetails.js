const placeCache = new Map();

/**
 * Clears the cache of Google Place details.
 */
export function clearPlaceCache() {
  placeCache.clear();
}

/**
 * Fetches details for a Google Place.
 *
 * @param {string} placeId The ID of the place to fetch details for.
 * @param {string[]} [fields=['displayName', 'location', 'formattedAddress', 'rating', 'userRatingCount', 'googleMapsURI']] The fields to fetch for the place.
 * @returns {Promise<object>} A promise that resolves with the place details.
 * @throws {Error} An error if the Place ID is not provided or the Google Places library is not available.
 */
export async function fetchPlaceDetails(placeId, fields = ['displayName', 'location', 'formattedAddress', 'rating', 'userRatingCount', 'googleMapsURI']) {
  if (!placeId) throw new Error('Place ID required');
  if (placeCache.has(placeId)) return placeCache.get(placeId);

  if (!(window?.google?.maps?.places?.Place)) {
    throw new Error('Google Places library not available');
  }

  const { Place } = window.google.maps.places;
  const place = new Place({ id: placeId, requestedLanguage: 'pt-BR' });
  await place.fetchFields({ fields });

  const data = {
    name: place.displayName,
    location: place.location,
    formattedAddress: place.formattedAddress,
    rating: place.rating,
    userRatingCount: place.userRatingCount,
    url: place.googleMapsURI
  };

  placeCache.set(placeId, data);
  return data;
}

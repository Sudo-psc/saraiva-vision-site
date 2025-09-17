const placeCache = new Map();

export function clearPlaceCache() {
  placeCache.clear();
}

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

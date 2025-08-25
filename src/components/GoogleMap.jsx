import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '@/lib/loadGoogleMaps';
import { CLINIC_PLACE_ID } from '@/lib/clinicInfo';

const GoogleMap = ({ height = 340 }) => {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [place, setPlace] = useState(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('❌ Google Maps API Key não encontrada nas variáveis de ambiente');
      setError('Chave Google Maps ausente - verifique .env');
      setLoading(false);
      return;
    }
    console.log('🗺️ Iniciando carregamento Google Maps API...');
    let mapInstance;

    loadGoogleMaps(apiKey)
      .then(() => {
        if (!containerRef.current) return;
        mapInstance = new google.maps.Map(containerRef.current, {
          zoom: 17,
          center: { lat: -19.7868, lng: -42.1392 }, // fallback center
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        // Modern Google Maps with Places API and AdvancedMarkerElement
        if (CLINIC_PLACE_ID && google.maps.places && google.maps.places.Place) {
          try {
            // Use modern Place class - recommended API
            const { Place } = google.maps.places;
            const place = new Place({
              id: CLINIC_PLACE_ID,
              requestedLanguage: 'pt-BR',
            });

            // Request place details with modern API
            const request = {
              fields: ['displayName', 'location', 'formattedAddress', 'rating', 'userRatingCount', 'googleMapsURI']
            };

            place.fetchFields(request).then(() => {
              const placeData = {
                name: place.displayName,
                geometry: { location: place.location },
                formatted_address: place.formattedAddress,
                rating: place.rating,
                user_ratings_total: place.userRatingCount,
                url: place.googleMapsURI
              };

              setPlace(placeData);

              if (place.location) {
                mapInstance.setCenter(place.location);

                // Use modern AdvancedMarkerElement - prevents deprecation warnings
                if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
                  new google.maps.marker.AdvancedMarkerElement({
                    map: mapInstance,
                    position: place.location,
                    title: place.displayName
                  });
                }
              }
              setLoading(false);
            }).catch((error) => {
              console.error('Error fetching place details:', error);
              setError('Não foi possível obter detalhes do local');
              setLoading(false);
            });

          } catch (error) {
            console.error('Modern Places API not available:', error);
            setError('API Google Places não disponível');
            setLoading(false);
          }
        } else {
          console.warn('Google Places API or Place class not available');
          setLoading(false);
        }
      })
      .catch((e) => {
        console.error('❌ Erro ao carregar Google Maps:', e.message);
        setError(`Erro Google Maps: ${e.message}`);
        setLoading(false);
      });

    return () => { /* cleanup */ };
  }, []);

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center text-xs text-slate-600 p-4">
        <p className="font-medium mb-2">{error}</p>
        <p>Verifique a chave API e Place ID.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ height }}>
      {loading && <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">Carregando mapa...</div>}
      <div ref={containerRef} className="w-full h-full" />
      {place && (
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-3 py-2 rounded shadow text-[11px] leading-tight">
          <div className="font-semibold text-slate-800">{place.name}</div>
          {place.rating && (
            <div className="text-yellow-600">⭐ {place.rating} ({place.user_ratings_total})</div>
          )}
        </div>
      )}
    </div>
  );
};

export default GoogleMap;

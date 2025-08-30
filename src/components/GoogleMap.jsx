import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '@/lib/loadGoogleMaps';
import { CLINIC_PLACE_ID } from '@/lib/clinicInfo';
import { fetchPlaceDetails } from '@/lib/fetchPlaceDetails';

const GoogleMap = ({ height = 340 }) => {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [place, setPlace] = useState(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError('Chave Google Maps ausente - verifique .env');
      setLoading(false);
      return;
    }

    let mapInstance;
    let mounted = true;

    (async () => {
      try {
        await loadGoogleMaps(apiKey);
        if (!mounted || !containerRef.current) return;

        mapInstance = new google.maps.Map(containerRef.current, {
          zoom: 17,
          center: { lat: -19.7868, lng: -42.1392 },
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        try {
          const placeData = await fetchPlaceDetails(CLINIC_PLACE_ID);
          if (!mounted) return;
          setPlace({
            name: placeData.name,
            geometry: { location: placeData.location },
            formatted_address: placeData.formattedAddress,
            rating: placeData.rating,
            user_ratings_total: placeData.userRatingCount,
            url: placeData.url
          });

          if (placeData.location) {
            mapInstance.setCenter(placeData.location);
            if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
              new google.maps.marker.AdvancedMarkerElement({
                map: mapInstance,
                position: placeData.location,
                title: placeData.name
              });
            }
          }
        } catch (err) {
          if (import.meta.env.DEV) console.error('Error fetching place details:', err);
          if (mounted) setError('Não foi possível obter detalhes do local');
        }
      } catch (err) {
        if (import.meta.env.DEV) console.error('Erro ao carregar Google Maps:', err);
        if (mounted) setError(`Erro Google Maps: ${err.message}`);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
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

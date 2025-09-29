import React, { useEffect, useRef, useState } from 'react';
import { MapPin, ExternalLink, AlertCircle } from 'lucide-react';
import { clinicInfo, CLINIC_PLACE_ID } from '@/lib/clinicInfo';
import { loadGoogleMaps } from '@/lib/loadGoogleMaps';
import { resolveGoogleMapsApiKey, isValidGoogleMapsKey } from '@/lib/googleMapsKey';

const GoogleMapSimple = ({ height = 340 }) => {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFallback, setShowFallback] = useState(false);
  const [healthStatus, setHealthStatus] = useState(null);

  const staticMapUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${clinicInfo.latitude},${clinicInfo.longitude}&zoom=17&size=640x360&markers=${clinicInfo.latitude},${clinicInfo.longitude},lightblue1`;

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const enableFallback = (message) => {
      if (!isMounted) return;
      if (message) {
        setError(message);
      }
      setShowFallback(true);
      setLoading(false);
    };

    const initializeMap = async () => {
      let apiKey;

      try {
        apiKey = await resolveGoogleMapsApiKey();
      } catch (resolveError) {
        console.error('[GoogleMap] Falha ao resolver Google Maps API key:', resolveError);
        enableFallback('Mapa interativo indisponível: chave da API ausente.');
        return;
      }

      if (!isValidGoogleMapsKey(apiKey)) {
        enableFallback('Mapa interativo indisponível: chave da API inválida.');
        return;
      }

      try {
        const response = await fetch('/api/maps-health', {
          signal: abortController.signal,
          headers: { Accept: 'application/json' }
        });

        if (response.ok) {
          const status = await response.json();
          if (!isMounted) return;
          setHealthStatus(status);
          if (status.status !== 'healthy') {
            enableFallback(`Mapa interativo temporariamente indisponível (${status.status}).`);
            return;
          }
        }
      } catch (healthError) {
        if (import.meta.env.DEV) {
          console.warn('[GoogleMap] Falha ao verificar saúde do serviço:', healthError);
        }
      }

      if (!containerRef.current) {
        enableFallback('Não foi possível carregar o mapa neste momento.');
        return;
      }

      try {
        await loadGoogleMaps(apiKey);
        if (!isMounted || !containerRef.current) {
          return;
        }

        const map = new window.google.maps.Map(containerRef.current, {
          zoom: 17,
          center: { lat: clinicInfo.latitude, lng: clinicInfo.longitude },
          mapId: import.meta.env.VITE_GOOGLE_MAP_ID || undefined,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false
        });

        const marker = new window.google.maps.Marker({
          position: { lat: clinicInfo.latitude, lng: clinicInfo.longitude },
          map,
          title: clinicInfo.name
        });

        if (CLINIC_PLACE_ID && window.google?.maps?.places) {
          const service = new window.google.maps.places.PlacesService(map);
          service.getDetails(
            {
              placeId: CLINIC_PLACE_ID,
              fields: ['geometry', 'name', 'url']
            },
            (place, status) => {
              if (status === window.google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
                map.setCenter(place.geometry.location);
                marker.setPosition(place.geometry.location);
              } else if (import.meta.env.DEV) {
                console.warn('[GoogleMap] Place ID não pôde ser confirmado:', status);
              }
            }
          );
        }

        setLoading(false);
        setError(null);
      } catch (mapError) {
        enableFallback(`Não foi possível carregar o mapa: ${mapError.message}`);
      }
    };

    initializeMap();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, []);

  const MapFallback = () => (
    <div
      className="relative w-full bg-gradient-to-br from-blue-50 to-slate-100 rounded-lg overflow-hidden"
      style={{ height }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="p-3 bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
            <MapPin className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Localização da Clínica</h3>
            <p className="text-sm text-gray-600 mb-3">
              {clinicInfo.address.street}
              <br />
              {clinicInfo.address.city}, {clinicInfo.address.state}
              <br />
              CEP: {clinicInfo.address.zip}
            </p>
            <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm">
              <img
                src={staticMapUrl}
                alt={`Mapa estático da região da clínica ${clinicInfo.name}`}
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
            {(healthStatus?.status || error) && (
              <p className="mt-3 text-xs text-gray-500 flex items-center justify-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {error || 'Mapa interativo indisponível no momento.'}
              </p>
            )}
            <div className="space-y-2 mt-4">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${clinicInfo.latitude},${clinicInfo.longitude}&query_place_id=${CLINIC_PLACE_ID || ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Abrir no Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (showFallback || error) {
    return <MapFallback />;
  }

  return (
    <div className="relative w-full" style={{ height }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500 bg-gray-50">
          Carregando mapa...
        </div>
      )}
      <div ref={containerRef} className="w-full h-full rounded" />
    </div>
  );
};

export default GoogleMapSimple;
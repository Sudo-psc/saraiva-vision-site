import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '@/lib/loadGoogleMaps';
import { CLINIC_PLACE_ID, clinicInfo } from '@/lib/clinicInfo';

const GoogleMap = ({ height = 340 }) => {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [place, setPlace] = useState(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError('Chave Google Maps ausente');
      setLoading(false);
      return;
    }
    let mapInstance;
    loadGoogleMaps(apiKey)
      .then((gmaps) => {
        if (!containerRef.current) return;
        const centerCoords = { lat: clinicInfo.latitude, lng: clinicInfo.longitude };
        mapInstance = new gmaps.Map(containerRef.current, {
          zoom: 17,
          center: centerCoords, // Caratinga-MG coordinates
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        if (CLINIC_PLACE_ID && gmaps.places) {
          const service = new gmaps.places.PlacesService(mapInstance);
          service.getDetails({ placeId: CLINIC_PLACE_ID, fields: ['name', 'geometry', 'formatted_address', 'rating', 'user_ratings_total', 'url'] }, (res, status) => {
            if (status === gmaps.places.PlacesServiceStatus.OK && res) {
              setPlace(res);
              if (res.geometry?.location) {
                mapInstance.setCenter(res.geometry.location);
                new gmaps.Marker({ map: mapInstance, position: res.geometry.location, title: res.name });
              }
            } else {
              // Fallback: Use clinic coordinates and add marker with clinic info
              new gmaps.Marker({ 
                map: mapInstance, 
                position: centerCoords, 
                title: clinicInfo.name 
              });
              setPlace({
                name: clinicInfo.name,
                formatted_address: `${clinicInfo.streetAddress}, ${clinicInfo.neighborhood}, ${clinicInfo.city}-${clinicInfo.state}`
              });
            }
            setLoading(false);
          });
        } else {
          // No Place ID: Use clinic coordinates and add marker
          new gmaps.Marker({ 
            map: mapInstance, 
            position: centerCoords, 
            title: clinicInfo.name 
          });
          setPlace({
            name: clinicInfo.name,
            formatted_address: `${clinicInfo.streetAddress}, ${clinicInfo.neighborhood}, ${clinicInfo.city}-${clinicInfo.state}`
          });
          setLoading(false);
        }
      })
      .catch((e) => { setError(e.message); setLoading(false); });
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

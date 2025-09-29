import React, { useEffect, useRef } from 'react';
import { MapPin, Phone, Clock } from 'lucide-react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';

/**
 * Google Maps Loader Component for Saraiva Vision
 * Carrega o Google Maps de forma otimizada e segura
 */
const GoogleMapsLoader = ({ apiKey: apiKeyProp }) => {
  const { ready, error: mapsError, loading } = useGoogleMaps();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Dados da clínica
  const clinicInfo = {
    name: 'Clínica Saraiva Vision',
    address: 'Rua Catarina Maria Passos, 97 - Santa Zita, Caratinga - MG',
    phone: '+55 33 99860-1427',
    hours: {
      weekdays: '8:00 - 18:00',
      saturday: '8:00 - 12:00',
      sunday: 'Fechado'
    },
    coordinates: {
      lat: -19.7890206, // Coordenadas reais da clínica
      lng: -42.1347583
    }
  };

  useEffect(() => {
    if (!ready || !mapRef.current || mapInstanceRef.current) {
      return;
    }

    initializeMap();
  }, [ready]);

  const initializeMap = () => {
    if (!window.google?.maps || !mapRef.current) return;

    try {
      // Cria o mapa
      const map = new window.google.maps.Map(mapRef.current, {
        center: clinicInfo.coordinates,
        zoom: 15,
        styles: [
          {
            featureType: 'all',
            elementType: 'geometry',
            stylers: [{ color: '#f5f5f5' }]
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#c8d7e3' }]
          },
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#ffffff' }]
          }
        ],
        mapTypeControl: false,
        fullscreenControl: true,
        streetViewControl: true,
        zoomControl: true
      });

      mapInstanceRef.current = map;

      // Adiciona marcador da clínica
      const marker = new window.google.maps.Marker({
        position: clinicInfo.coordinates,
        map: map,
        title: clinicInfo.name,
        animation: window.google.maps.Animation.DROP,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="#0066cc"/>
              <path d="M20 10 C15 10 10 15 10 20 C10 27 20 35 20 35 C20 35 30 27 30 20 C30 15 25 10 20 10 Z" fill="#0066cc"/>
              <circle cx="20" cy="20" r="5" fill="white"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(40, 40)
        }
      });

      // InfoWindow com informações da clínica
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; max-width: 280px;">
            <h3 style="margin: 0 0 10px; color: #0066cc; font-size: 18px;">
              ${clinicInfo.name}
            </h3>
            <p style="margin: 5px 0; color: #666;">
              <strong>📍</strong> ${clinicInfo.address}
            </p>
            <p style="margin: 5px 0; color: #666;">
              <strong>📞</strong> ${clinicInfo.phone}
            </p>
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee;">
              <p style="margin: 5px 0; color: #666; font-size: 14px;">
                <strong>Horários:</strong><br>
                Seg-Sex: ${clinicInfo.hours.weekdays}<br>
                Sábado: ${clinicInfo.hours.saturday}<br>
                Domingo: ${clinicInfo.hours.sunday}
              </p>
            </div>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${clinicInfo.coordinates.lat},${clinicInfo.coordinates.lng}"
               target="_blank"
               rel="noopener noreferrer"
               style="display: inline-block; margin-top: 10px; padding: 8px 16px; background: #0066cc; color: white; text-decoration: none; border-radius: 4px; font-size: 14px;">
              Como chegar
            </a>
          </div>
        `
      });

      // Abre InfoWindow ao clicar no marcador
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      // Abre InfoWindow automaticamente após 2 segundos
      setTimeout(() => {
        infoWindow.open(map, marker);
      }, 2000);

    } catch (error) {
      console.error('Erro ao inicializar Google Maps:', error);
    }
  };

  // Fallback se o mapa não carregar
  if (mapsError) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-4">Localização</h3>
        <div className="space-y-3 text-left max-w-md mx-auto">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-500 mt-1" />
            <div>
              <p className="font-medium">{clinicInfo.name}</p>
              <p className="text-gray-600">{clinicInfo.address}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-gray-500" />
            <p className="text-gray-600">{clinicInfo.phone}</p>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-gray-500 mt-1" />
            <div className="text-gray-600">
              <p>Seg-Sex: {clinicInfo.hours.weekdays}</p>
              <p>Sábado: {clinicInfo.hours.saturday}</p>
              <p>Domingo: {clinicInfo.hours.sunday}</p>
            </div>
          </div>
        </div>
        <a
          href={`https://www.google.com/maps/search/${encodeURIComponent(clinicInfo.name + ' ' + clinicInfo.address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Ver no Google Maps
        </a>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className="w-full h-96 rounded-lg shadow-lg"
        style={{ minHeight: '400px' }}
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando mapa...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMapsLoader;
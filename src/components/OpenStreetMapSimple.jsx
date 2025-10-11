import React, { useState } from 'react';
import { MapPin, ExternalLink, Maximize2 } from 'lucide-react';
import { clinicInfo, CLINIC_PLACE_ID } from '@/lib/clinicInfo';

/**
 * OpenStreetMap Simple Component
 * Mapa interativo usando OpenStreetMap - sem necessidade de API key
 *
 * Features:
 * - 100% gratuito e open-source
 * - Sem API key necessária
 * - Fallback para imagem estática
 * - Links diretos para Google Maps e OpenStreetMap
 */
const OpenStreetMapSimple = ({ height = 340 }) => {
  const [mapError, setMapError] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Coordenadas da clínica
  const { latitude, longitude } = clinicInfo;

  // URL do iframe do OpenStreetMap
  const osmIframeUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.003},${latitude - 0.003},${longitude + 0.003},${latitude + 0.003}&layer=mapnik&marker=${latitude},${longitude}`;

  // URL da imagem estática OpenStreetMap
  const staticMapUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}&zoom=17&size=640x360&markers=${latitude},${longitude},lightblue1`;

  // URL para abrir no OpenStreetMap
  const osmDirectUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`;

  // URL para abrir no Google Maps
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}${CLINIC_PLACE_ID ? `&query_place_id=${CLINIC_PLACE_ID}` : ''}`;

  // Fallback quando iframe e imagem falham
  if (mapError && imageError) {
    return (
      <div
        className="relative w-full bg-gradient-to-br from-blue-50 to-slate-100 rounded-lg overflow-hidden"
        style={{ height }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
          <div className="text-center space-y-4 max-w-sm">
            <div className="p-3 bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
              <MapPin className="w-8 h-8 text-cyan-600" />
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
              <div className="space-y-2 mt-4">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors mr-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Abrir no Google Maps
                </a>
                <a
                  href={osmDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Maximize2 className="w-4 h-4" />
                  OpenStreetMap
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback para imagem estática quando iframe falha
  if (mapError) {
    return (
      <div
        className="relative w-full bg-gradient-to-br from-blue-50 to-slate-100 rounded-lg overflow-hidden"
        style={{ height }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
          <div className="text-center space-y-4 max-w-sm">
            <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm bg-white">
              <img
                src={staticMapUrl}
                alt={`Mapa estático da região da clínica ${clinicInfo.name}`}
                className="w-full h-auto"
                loading="lazy"
                onError={() => setImageError(true)}
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">{clinicInfo.name}</h3>
              <p className="text-sm text-gray-600 mb-3">
                {clinicInfo.address.street}
                <br />
                {clinicInfo.address.city}, {clinicInfo.address.state}
              </p>
              <div className="space-y-2 mt-4">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors mr-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Google Maps
                </a>
                <a
                  href={osmDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Maximize2 className="w-4 h-4" />
                  OpenStreetMap
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mapa interativo OpenStreetMap (padrão)
  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-slate-200 shadow-sm" style={{ height }}>
      <iframe
        title={`Mapa interativo de ${clinicInfo.name}`}
        src={osmIframeUrl}
        className="w-full h-full border-0"
        allowFullScreen
        loading="lazy"
        onError={() => setMapError(true)}
        style={{ minHeight: height }}
      />
      <div className="absolute bottom-4 right-4 flex gap-2">
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/95 backdrop-blur-sm text-cyan-700 text-xs font-medium rounded-md hover:bg-white transition-colors shadow-md"
          title="Abrir no Google Maps"
        >
          <ExternalLink className="w-3 h-3" />
          Google Maps
        </a>
        <a
          href={osmDirectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/95 backdrop-blur-sm text-blue-700 text-xs font-medium rounded-md hover:bg-white transition-colors shadow-md"
          title="Abrir em tela cheia no OpenStreetMap"
        >
          <Maximize2 className="w-3 h-3" />
          Expandir
        </a>
      </div>
    </div>
  );
};

export default OpenStreetMapSimple;

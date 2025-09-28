import React, { useEffect, useRef, useState } from 'react';
import { clinicInfo } from '@/lib/clinicInfo';
import { loadGoogleMaps } from '@/lib/loadGoogleMaps';
import { MapPin, ExternalLink } from 'lucide-react';

const GoogleMapSimple = ({ height = 340 }) => {
    const containerRef = useRef(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showFallback, setShowFallback] = useState(false);

    // Static map fallback URL using Google Static Maps API (no key required for basic maps)
    const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${clinicInfo.latitude},${clinicInfo.longitude}&zoom=16&size=600x400&markers=color:blue%7C${clinicInfo.latitude},${clinicInfo.longitude}&format=png`;

    useEffect(() => {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        console.log('🔑 API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'MISSING');

        if (!apiKey) {
            console.warn('⚠️ Google Maps API Key não encontrada, usando fallback');
            setShowFallback(true);
            setLoading(false);
            return;
        }

        if (!containerRef.current) {
            console.error('Container ref não disponível');
            return;
        }

        // Use the centralized loading system
        const initializeMap = async () => {
            try {
                console.log('🚀 Iniciando carregamento do Google Maps...');
                await loadGoogleMaps(apiKey);
                console.log('✅ Google Maps carregado, criando mapa...');
                createMap();
            } catch (mapError) {
                console.error('❌ Erro ao carregar Google Maps:', mapError);
                console.log('🔄 Usando fallback de mapa estático');
                setShowFallback(true);
                setLoading(false);
            }
        };

        initializeMap();

        function createMap() {
            try {
                if (!containerRef.current) {
                    console.error('Container não disponível para criar mapa');
                    return;
                }

                console.log('🗺️ Criando mapa...');
                const map = new window.google.maps.Map(containerRef.current, {
                    zoom: 17,
                    center: { lat: clinicInfo.latitude, lng: clinicInfo.longitude },
                    mapId: 'DEMO_MAP_ID', // Map ID necessário para Advanced Markers
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                });

                // Add marker
                new window.google.maps.Marker({
                    position: { lat: clinicInfo.latitude, lng: clinicInfo.longitude },
                    map: map,
                    title: clinicInfo.name
                });

                console.log('✅ Mapa criado com sucesso');
                setLoading(false);
                setError(null);

            } catch (mapError) {
                console.error('❌ Erro ao criar mapa:', mapError);
                setError(`Erro ao criar mapa: ${mapError.message}`);
                setLoading(false);
            }
        }

        // No cleanup needed since we're using the centralized loading system
    }, []);

    // Fallback component for when Google Maps fails
    const MapFallback = () => (
        <div className="relative w-full bg-gradient-to-br from-blue-50 to-slate-100 rounded-lg overflow-hidden" style={{ height }}>
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                <div className="text-center space-y-4 max-w-sm">
                    <div className="p-3 bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                        <MapPin className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Localização da Clínica</h3>
                        <p className="text-sm text-gray-600 mb-3">
                            {clinicInfo.address.street}<br/>
                            {clinicInfo.address.city}, {clinicInfo.address.state}<br/>
                            CEP: {clinicInfo.address.zip}
                        </p>
                        <div className="space-y-2">
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${clinicInfo.latitude},${clinicInfo.longitude}`}
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

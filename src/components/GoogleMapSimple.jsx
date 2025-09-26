import React, { useEffect, useRef, useState } from 'react';
import { clinicInfo } from '@/lib/clinicInfo';
import { loadGoogleMaps } from '@/lib/loadGoogleMaps';

const GoogleMapSimple = ({ height = 340 }) => {
    const containerRef = useRef(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        console.log('🔑 API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'MISSING');

        if (!apiKey) {
            setError('Google Maps API Key não encontrada');
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
                setError(`Erro ao carregar Google Maps: ${mapError.message}`);
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

    if (error) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-red-50 border border-red-200 rounded">
                <div className="text-red-600 mb-2">
                    <h3 className="font-semibold text-sm mb-1">Erro no Google Maps</h3>
                    <p className="text-xs">{error}</p>
                </div>
            </div>
        );
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

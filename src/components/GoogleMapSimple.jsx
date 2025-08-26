import React, { useEffect, useRef, useState } from 'react';

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

        // Check if Google Maps is already loaded
        if (window.google && window.google.maps) {
            console.log('✅ Google Maps já carregado, criando mapa...');
            createMap();
            return;
        }

        // Create a unique callback name
        const callbackName = `initMap${Date.now()}`;

        // Define the callback function
        window[callbackName] = () => {
            console.log('✅ Callback executado, criando mapa...');
            createMap();
            // Clean up the callback
            delete window[callbackName];
        };

        // Check if script already exists to avoid duplicates
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
            console.log('⚠️ Script já existe, aguardando callback...');
            // If script exists but callback hasn't been called, wait a bit
            setTimeout(() => {
                if (window.google && window.google.maps) {
                    createMap();
                } else {
                    setError('Google Maps não carregou após timeout');
                    setLoading(false);
                }
            }, 3000);
            return;
        }

        // Create script element
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${callbackName}`;
        script.async = true;
        script.defer = true;

        script.onerror = (error) => {
            console.error('❌ Erro ao carregar script:', error);
            setError('Erro ao carregar Google Maps API');
            setLoading(false);
            delete window[callbackName];
        };

        console.log('📝 Adicionando script ao DOM...');
        document.head.appendChild(script);

        function createMap() {
            try {
                if (!containerRef.current) {
                    console.error('Container não disponível para criar mapa');
                    return;
                }

                console.log('🗺️ Criando mapa...');
                const map = new google.maps.Map(containerRef.current, {
                    zoom: 17,
                    center: { lat: -19.7868, lng: -42.1392 },
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                });

                // Add marker
                new google.maps.Marker({
                    position: { lat: -19.7868, lng: -42.1392 },
                    map: map,
                    title: 'Clínica Saraiva Vision'
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

        return () => {
            // Cleanup callback if component unmounts
            if (window[callbackName]) {
                delete window[callbackName];
            }
        };
    }, []);

    if (error) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-red-50 border border-red-200 rounded">
                <div className="text-red-600 mb-2">
                    <h3 className="font-semibold text-sm mb-1">❌ Erro no Google Maps</h3>
                    <p className="text-xs">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full" style={{ height }}>
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500 bg-gray-50">
                    🗺️ Carregando mapa...
                </div>
            )}
            <div ref={containerRef} className="w-full h-full rounded" />
        </div>
    );
};

export default GoogleMapSimple;
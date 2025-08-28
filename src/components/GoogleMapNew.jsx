import React, { useEffect, useRef, useState, useCallback } from 'react';
import { loadGoogleMaps, isGoogleMapsReady, resetGoogleMapsLoader } from '@/lib/loadGoogleMaps';
import { CLINIC_PLACE_ID } from '@/lib/clinicInfo';

const GoogleMap = ({ height = 340 }) => {
    const containerRef = useRef(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [place, setPlace] = useState(null);
    const [debugInfo, setDebugInfo] = useState([]);
    const [retryCount, setRetryCount] = useState(0);
    const maxRetries = 3;

    // Debug logging function
    const addDebugLog = useCallback((message) => {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `${timestamp}: ${message}`;
        console.log(`[GoogleMap] ${logEntry}`);
        setDebugInfo(prev => [...prev.slice(-4), logEntry]); // Keep only last 5 entries
    }, []);

    // Retry function
    const retryMapLoading = useCallback(() => {
        if (retryCount < maxRetries) {
            addDebugLog(`🔄 Tentativa ${retryCount + 1}/${maxRetries} de carregamento`);
            setError(null);
            setLoading(true);
            setRetryCount(prev => prev + 1);
            resetGoogleMapsLoader();
        } else {
            addDebugLog('❌ Máximo de tentativas excedido');
            setError('Falha no carregamento após múltiplas tentativas');
        }
    }, [retryCount, maxRetries, addDebugLog]);

    useEffect(() => {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

        addDebugLog('🚀 Iniciando useEffect do GoogleMap');
        addDebugLog(`🔑 API Key: ${apiKey ? 'Presente' : 'Ausente'}`);
        addDebugLog(`🏥 Place ID: ${CLINIC_PLACE_ID ? 'Presente' : 'Ausente'}`);
        addDebugLog(`🔄 Retry count: ${retryCount}`);

        if (!apiKey) {
            const errorMsg = 'Chave Google Maps ausente - verifique .env';
            addDebugLog(`❌ ${errorMsg}`);
            setError(errorMsg);
            setLoading(false);
            return;
        }

        if (!containerRef.current) {
            addDebugLog('⚠️ Container ref não disponível, aguardando...');
            setTimeout(() => {
                // Re-trigger useEffect if container becomes available
                if (containerRef.current) {
                    addDebugLog('✅ Container ref agora disponível');
                    // Don't increment retry count for container wait
                    setLoading(true);
                }
            }, 100);
            return;
        }

        addDebugLog('🗺️ Iniciando carregamento Google Maps API...');

        let mapInstance;
        let isComponentMounted = true;

        // Check if already ready before loading
        if (isGoogleMapsReady()) {
            addDebugLog('✅ Google Maps já está pronto, pulando carregamento');
            initializeMap();
            return;
        }

        async function initializeMap() {
            try {
                if (!isComponentMounted) {
                    addDebugLog('⚠️ Componente desmontado, cancelando inicialização');
                    return;
                }

                addDebugLog('🗺️ Criando instância do mapa...');
                mapInstance = new google.maps.Map(containerRef.current, {
                    zoom: 17,
                    center: { lat: -19.7868, lng: -42.1392 },
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                    styles: [
                        {
                            featureType: 'poi',
                            elementType: 'labels',
                            stylers: [{ visibility: 'on' }]
                        }
                    ]
                });
                addDebugLog('✅ Mapa criado com sucesso');

                // Load Places and Marker libraries
                if (CLINIC_PLACE_ID) {
                    addDebugLog('🏥 Carregando biblioteca Places...');

                    try {
                        const placesLib = await google.maps.importLibrary("places");
                        addDebugLog('✅ Biblioteca Places carregada');

                        const place = new placesLib.Place({
                            id: CLINIC_PLACE_ID,
                            requestedLanguage: 'pt-BR',
                        });

                        addDebugLog('🔍 Buscando detalhes do local...');
                        await place.fetchFields({
                            fields: ['displayName', 'location', 'formattedAddress', 'rating', 'userRatingCount', 'googleMapsURI']
                        });
                        addDebugLog('✅ Detalhes do local obtidos');

                        const placeData = {
                            name: place.displayName,
                            geometry: { location: place.location },
                            formatted_address: place.formattedAddress,
                            rating: place.rating,
                            user_ratings_total: place.userRatingCount,
                            url: place.googleMapsURI
                        };

                        if (isComponentMounted) {
                            setPlace(placeData);
                            addDebugLog(`📍 Dados do local: ${placeData.name}`);
                        }

                        if (place.location && isComponentMounted) {
                            mapInstance.setCenter(place.location);
                            addDebugLog('🎯 Centro do mapa definido');

                            // Load marker library
                            addDebugLog('📍 Carregando biblioteca Marker...');
                            const markerLib = await google.maps.importLibrary("marker");
                            addDebugLog('✅ Biblioteca Marker carregada');

                            new markerLib.AdvancedMarkerElement({
                                map: mapInstance,
                                position: place.location,
                                title: place.displayName
                            });
                            addDebugLog('✅ Marcador adicionado ao mapa');
                        }

                    } catch (placesError) {
                        addDebugLog(`❌ Erro Places API: ${placesError.message}`);
                        // Continue without places data
                        addDebugLog('⚠️ Continuando sem dados do Places API');
                    }
                }

                if (isComponentMounted) {
                    addDebugLog('🎉 Google Maps completamente carregado');
                    setLoading(false);
                    setError(null);
                }

            } catch (initError) {
                addDebugLog(`❌ Erro na inicialização: ${initError.message}`);
                if (isComponentMounted) {
                    setError(`Erro na inicialização do mapa: ${initError.message}`);
                    setLoading(false);
                }
            }
        }

        // Load Google Maps with enhanced error handling
        loadGoogleMaps(apiKey)
            .then(async (googleMaps) => {
                if (!isComponentMounted) {
                    addDebugLog('⚠️ Componente desmontado, cancelando then');
                    return;
                }

                addDebugLog('✅ Google Maps API carregada com sucesso');
                addDebugLog(`🔍 Verificando Google object: ${typeof window.google}`);
                addDebugLog(`🔍 Verificando Maps object: ${typeof window.google?.maps}`);
                addDebugLog(`🔍 Verificando importLibrary: ${typeof window.google?.maps?.importLibrary}`);

                if (!containerRef.current) {
                    addDebugLog('❌ Container ref perdido durante carregamento');
                    setError('Container do mapa não disponível');
                    setLoading(false);
                    return;
                }

                await initializeMap();
            })
            .catch((loadError) => {
                if (!isComponentMounted) {
                    addDebugLog('⚠️ Componente desmontado, ignorando erro');
                    return;
                }

                addDebugLog(`❌ Erro no carregamento: ${loadError.message}`);
                console.error('❌ [GoogleMap] Erro completo:', loadError);

                const errorMessage = `Erro ao carregar Google Maps: ${loadError.message}`;
                setError(errorMessage);
                setLoading(false);

                // Auto-retry on certain errors
                if (loadError.message.includes('Timeout') || loadError.message.includes('network')) {
                    setTimeout(() => {
                        if (retryCount < maxRetries) {
                            addDebugLog('🔄 Auto-retry devido a erro de network/timeout');
                            retryMapLoading();
                        }
                    }, 2000);
                }
            });

        // Cleanup function
        return () => {
            isComponentMounted = false;
            addDebugLog('🧹 Limpando recursos do Google Maps');
            if (mapInstance) {
                try {
                    mapInstance = null;
                } catch (e) {
                    addDebugLog(`⚠️ Erro durante cleanup: ${e.message}`);
                }
            }
        };
    }, [retryCount, addDebugLog, retryMapLoading]);

    // Enhanced error display with debug info and retry button
    if (error) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-red-50 border border-red-200 rounded">
                <div className="text-red-600 mb-4">
                    <h3 className="font-semibold text-sm mb-2">Erro no Google Maps</h3>
                    <p className="text-xs mb-2">{error}</p>

                    {retryCount < maxRetries && (
                        <button
                            onClick={retryMapLoading}
                            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                            Tentar Novamente ({retryCount}/{maxRetries})
                        </button>
                    )}
                </div>

                {debugInfo.length > 0 && (
                    <details className="text-xs text-gray-600 max-w-full">
                        <summary className="cursor-pointer mb-2">Debug Info</summary>
                        <div className="text-left bg-gray-100 p-2 rounded max-h-32 overflow-y-auto">
                            {debugInfo.map((log, index) => (
                                <div key={index} className="font-mono text-xs whitespace-nowrap">
                                    {log}
                                </div>
                            ))}
                        </div>
                    </details>
                )}
            </div>
        );
    }

    return (
        <div className="relative w-full" style={{ height }}>
            {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-sm text-slate-500 bg-gray-50">
                    <div className="mb-2">Carregando mapa...</div>
                    {retryCount > 0 && (
                        <div className="text-xs text-gray-400">
                            Tentativa {retryCount}/{maxRetries}
                        </div>
                    )}
                    {debugInfo.length > 0 && (
                        <div className="text-xs text-gray-400 mt-2 max-w-xs text-center">
                            {debugInfo[debugInfo.length - 1]?.split(': ')[1]}
                        </div>
                    )}
                </div>
            )}

            <div ref={containerRef} className="w-full h-full rounded" />

            {place && !loading && (
                <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg text-[11px] leading-tight max-w-xs">
                    <div className="font-semibold text-slate-800 truncate">{place.name}</div>
                    {place.rating && (
                        <div className="text-yellow-600 flex items-center">
                            {place.rating} ({place.user_ratings_total})
                        </div>
                    )}
                </div>
            )}

            {/* Debug panel for development */}
            {process.env.NODE_ENV === 'development' && debugInfo.length > 0 && (
                <details className="absolute bottom-2 right-2 bg-black/80 text-white text-xs p-2 rounded max-w-sm">
                    <summary className="cursor-pointer">Debug</summary>
                    <div className="mt-2 max-h-32 overflow-y-auto">
                        {debugInfo.map((log, index) => (
                            <div key={index} className="font-mono text-xs">
                                {log}
                            </div>
                        ))}
                    </div>
                </details>
            )}
        </div>
    );
};

export default GoogleMap;

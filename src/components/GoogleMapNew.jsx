import React, { useEffect, useRef, useState, useCallback } from 'react';
import { loadGoogleMaps, isGoogleMapsReady, resetGoogleMapsLoader } from '@/lib/loadGoogleMaps';
import { CLINIC_PLACE_ID, clinicInfo } from '@/lib/clinicInfo';

const GoogleMap = ({ height = 340 }) => {
    const containerRef = useRef(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [place, setPlace] = useState(null);
    const [debugInfo, setDebugInfo] = useState([]);
    const [retryCount, setRetryCount] = useState(0);
    const maxRetries = 3;

    // Create custom marker element with clinic icon
    const createCustomMarkerElement = () => {
        const markerElement = document.createElement('div');
        markerElement.style.cssText = `
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #2563eb, #1d4ed8);
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        `;
        
        const iconElement = document.createElement('div');
        iconElement.innerHTML = '👁️';
        iconElement.style.cssText = `
            transform: rotate(45deg);
            font-size: 16px;
            color: white;
        `;
        
        markerElement.appendChild(iconElement);
        return markerElement;
    };

    // Create business profile content for InfoWindow
    const createBusinessProfileContent = (placeData) => {
        const formatRating = (rating, total) => {
            const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
            return `${stars} ${rating} (${total} avaliações)`;
        };

        const formatOpeningHours = (hours) => {
            if (!hours || !hours.weekdayDescriptions) return 'Horário não disponível';
            const today = new Date().getDay();
            const todayHours = hours.weekdayDescriptions[today === 0 ? 6 : today - 1]; // Adjust for Sunday
            return todayHours || 'Horário não disponível';
        };

        const businessStatus = placeData.business_status === 'OPERATIONAL' ? 
            '<span style="color: #22c55e; font-weight: 600;">● Aberto</span>' : 
            '<span style="color: #ef4444; font-weight: 600;">● Status não disponível</span>';

        return `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 320px; padding: 4px;">
                ${placeData.photos && placeData.photos.length > 0 ? `
                    <div style="margin-bottom: 12px; border-radius: 8px; overflow: hidden;">
                        <img src="${placeData.photos[0].getURI({ maxWidth: 320, maxHeight: 160 })}" 
                             style="width: 100%; height: 160px; object-fit: cover; display: block;" 
                             alt="Foto da clínica" />
                    </div>
                ` : ''}
                
                <div style="margin-bottom: 12px;">
                    <h3 style="margin: 0 0 6px 0; font-size: 18px; font-weight: 700; color: #1f2937; line-height: 1.2;">
                        ${placeData.name}
                    </h3>
                    <div style="margin-bottom: 4px;">
                        ${businessStatus}
                    </div>
                    ${placeData.primary_type ? `
                        <div style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">
                            ${placeData.primary_type}
                        </div>
                    ` : ''}
                </div>

                ${placeData.rating ? `
                    <div style="margin-bottom: 12px; padding: 8px; background: #f9fafb; border-radius: 6px; border-left: 3px solid #fbbf24;">
                        <div style="font-size: 14px; color: #f59e0b; font-weight: 600;">
                            ${formatRating(placeData.rating, placeData.user_ratings_total)}
                        </div>
                    </div>
                ` : ''}

                <div style="margin-bottom: 12px;">
                    ${placeData.short_address ? `
                        <div style="display: flex; align-items: flex-start; margin-bottom: 6px;">
                            <span style="color: #2563eb; margin-right: 6px; font-size: 14px;">📍</span>
                            <span style="font-size: 13px; color: #4b5563; line-height: 1.4;">
                                ${placeData.short_address}
                            </span>
                        </div>
                    ` : ''}
                    
                    ${placeData.phone ? `
                        <div style="display: flex; align-items: center; margin-bottom: 6px;">
                            <span style="color: #2563eb; margin-right: 6px; font-size: 14px;">📞</span>
                            <a href="tel:${placeData.phone}" style="font-size: 13px; color: #2563eb; text-decoration: none; font-weight: 500;">
                                ${placeData.phone}
                            </a>
                        </div>
                    ` : ''}

                    ${placeData.opening_hours ? `
                        <div style="display: flex; align-items: flex-start; margin-bottom: 8px;">
                            <span style="color: #2563eb; margin-right: 6px; font-size: 14px;">🕐</span>
                            <span style="font-size: 13px; color: #4b5563; line-height: 1.4;">
                                ${formatOpeningHours(placeData.opening_hours)}
                            </span>
                        </div>
                    ` : ''}
                </div>

                ${placeData.editorial_summary ? `
                    <div style="margin-bottom: 12px; padding: 8px; background: #eff6ff; border-radius: 6px; border-left: 3px solid #2563eb;">
                        <div style="font-size: 13px; color: #1e40af; line-height: 1.4;">
                            ${placeData.editorial_summary.text}
                        </div>
                    </div>
                ` : ''}

                ${placeData.reviews && placeData.reviews.length > 0 ? `
                    <div style="margin-bottom: 12px;">
                        <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #374151;">
                            Avaliações Recentes:
                        </h4>
                        ${placeData.reviews.slice(0, 2).map(review => `
                            <div style="margin-bottom: 8px; padding: 6px; background: #f9fafb; border-radius: 4px; border-left: 2px solid #e5e7eb;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                                    <span style="font-weight: 600; font-size: 12px; color: #374151;">
                                        ${review.authorAttribution?.displayName || 'Cliente'}
                                    </span>
                                    <span style="color: #f59e0b; font-size: 11px;">
                                        ${'★'.repeat(review.rating)}
                                    </span>
                                </div>
                                <div style="font-size: 11px; color: #6b7280; line-height: 1.3;">
                                    ${review.text?.text ? (review.text.text.length > 80 ? review.text.text.substring(0, 80) + '...' : review.text.text) : 'Sem comentário'}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <div style="display: flex; gap: 8px; margin-top: 12px;">
                    ${placeData.url ? `
                        <a href="${placeData.url}" target="_blank" rel="noopener noreferrer" 
                           style="flex: 1; padding: 8px 12px; background: #2563eb; color: white; text-decoration: none; 
                                  border-radius: 6px; font-size: 12px; font-weight: 600; text-align: center; 
                                  transition: background-color 0.2s;">
                            Ver no Google Maps
                        </a>
                    ` : ''}
                    
                    ${placeData.website ? `
                        <a href="${placeData.website}" target="_blank" rel="noopener noreferrer" 
                           style="flex: 1; padding: 8px 12px; background: #059669; color: white; text-decoration: none; 
                                  border-radius: 6px; font-size: 12px; font-weight: 600; text-align: center; 
                                  transition: background-color 0.2s;">
                            Site Oficial
                        </a>
                    ` : ''}
                </div>
            </div>
        `;
    };

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
                    center: { lat: clinicInfo.latitude, lng: clinicInfo.longitude },
                    mapId: 'DEMO_MAP_ID', // Map ID necessário para Advanced Markers
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

                        addDebugLog('🔍 Buscando detalhes completos do perfil Google Business...');
                        await place.fetchFields({
                            fields: [
                                'displayName', 'location', 'formattedAddress', 'rating', 'userRatingCount', 
                                'googleMapsURI', 'businessStatus', 'priceLevel', 'photos', 'reviews',
                                'regularOpeningHours', 'websiteURI', 'nationalPhoneNumber', 'types',
                                'editorialSummary', 'primaryType', 'shortFormattedAddress'
                            ]
                        });
                        addDebugLog('✅ Detalhes completos do perfil Google Business obtidos');

                        const placeData = {
                            name: place.displayName,
                            geometry: { location: place.location },
                            formatted_address: place.formattedAddress,
                            short_address: place.shortFormattedAddress,
                            rating: place.rating,
                            user_ratings_total: place.userRatingCount,
                            url: place.googleMapsURI,
                            website: place.websiteURI,
                            phone: place.nationalPhoneNumber,
                            business_status: place.businessStatus,
                            price_level: place.priceLevel,
                            types: place.types,
                            primary_type: place.primaryType,
                            editorial_summary: place.editorialSummary,
                            opening_hours: place.regularOpeningHours,
                            photos: place.photos ? place.photos.slice(0, 3) : [], // First 3 photos
                            reviews: place.reviews ? place.reviews.slice(0, 3) : [] // First 3 reviews
                        };

                        if (isComponentMounted) {
                            setPlace(placeData);
                            addDebugLog(`📍 Dados do local: ${placeData.name}`);
                        }

                        if (place.location && isComponentMounted) {
                            mapInstance.setCenter(place.location);
                            addDebugLog('🎯 Centro do mapa definido');

                            // Load marker library and create enhanced InfoWindow
                            addDebugLog('📍 Carregando biblioteca Marker...');
                            const markerLib = await google.maps.importLibrary("marker");
                            addDebugLog('✅ Biblioteca Marker carregada');

                            // Create custom marker with clinic icon
                            const marker = new markerLib.AdvancedMarkerElement({
                                map: mapInstance,
                                position: place.location,
                                title: place.displayName,
                                content: createCustomMarkerElement()
                            });

                            // Create rich InfoWindow with Google Business profile
                            const infoWindow = new google.maps.InfoWindow({
                                content: createBusinessProfileContent(placeData),
                                maxWidth: 350
                            });

                            // Auto-open InfoWindow and add click listener
                            infoWindow.open(mapInstance, marker);
                            
                            marker.addListener('click', () => {
                                infoWindow.open(mapInstance, marker);
                            });

                            addDebugLog('✅ Marcador aprimorado com perfil do negócio adicionado ao mapa');
                        }

                    } catch (placesError) {
                        addDebugLog(`❌ Erro Places API: ${placesError.message}`);
                        // Continue without places data
                        addDebugLog('⚠️ Continuando sem dados do Places API');
                    }
                }

                // Fallback: se não houver Place ID ou a busca falhar, garantir um marcador nas coordenadas da clínica
                try {
                    if (mapInstance && (!CLINIC_PLACE_ID || !place?.geometry?.location)) {
                        addDebugLog('📍 Aplicando marcador de fallback com coordenadas da clínica');
                        const markerLib = await google.maps.importLibrary("marker");
                        const fallbackPosition = { lat: clinicInfo.latitude, lng: clinicInfo.longitude };
                        mapInstance.setCenter(fallbackPosition);
                        new markerLib.AdvancedMarkerElement({
                            map: mapInstance,
                            position: fallbackPosition,
                            title: clinicInfo.name,
                        });
                    }
                } catch (fallbackErr) {
                    addDebugLog(`⚠️ Erro ao aplicar marcador de fallback: ${fallbackErr.message}`);
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
                        <div className="text-left bg-gray-100 p-2 rounded max-h-32 overflow-y-auto scroll-container scrollbar-none">
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
                    <div className="mt-2 max-h-32 overflow-y-auto scroll-container scrollbar-none">
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

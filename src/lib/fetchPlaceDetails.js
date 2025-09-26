import { loadGoogleMaps } from './loadGoogleMaps';

const placeCache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos

export function clearPlaceCache() {
  placeCache.clear();
}

/**
 * Busca detalhes de um local do Google Places
 * @param {string} placeId - ID do local no Google Places
 * @param {string[]} fields - Campos a serem buscados
 * @returns {Promise<Object>} Dados do local
 */
export async function fetchPlaceDetails(
  placeId, 
  fields = [
    'displayName', 
    'location', 
    'formattedAddress', 
    'rating', 
    'userRatingCount', 
    'googleMapsURI',
    'reviews',
    'photos',
    'businessStatus',
    'priceLevel'
  ]
) {
  if (!placeId) {
    throw new Error('Place ID é obrigatório');
  }

  // Verificar cache com expiração
  const cacheKey = `${placeId}_${fields.join(',')}`;
  const cached = placeCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    console.log('✅ [DEBUG] Dados do local obtidos do cache');
    return cached.data;
  }

  try {
    // Garantir que o Google Maps está carregado
    await loadGoogleMaps();
    
    // Importar biblioteca Places
    const { Place } = await window.google.maps.importLibrary('places');
    
    if (!Place) {
      throw new Error('Biblioteca Google Places não disponível');
    }

    console.log('🔍 [DEBUG] Buscando detalhes do local:', placeId);

    const place = new Place({ 
      id: placeId, 
      requestedLanguage: 'pt-BR' 
    });
    
    await place.fetchFields({ fields });

    const data = {
      name: place.displayName || 'Nome não disponível',
      location: place.location,
      formattedAddress: place.formattedAddress || 'Endereço não disponível',
      rating: place.rating || 0,
      userRatingCount: place.userRatingCount || 0,
      url: place.googleMapsURI || '',
      reviews: place.reviews || [],
      photos: place.photos || [],
      businessStatus: place.businessStatus || 'UNKNOWN',
      priceLevel: place.priceLevel || null,
      fetchedAt: new Date().toISOString()
    };

    // Armazenar no cache com timestamp
    placeCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    console.log('✅ [DEBUG] Detalhes do local obtidos com sucesso:', {
      name: data.name,
      rating: data.rating,
      userRatingCount: data.userRatingCount,
      reviewsCount: data.reviews.length
    });

    return data;

  } catch (error) {
    console.error('❌ [ERROR] Erro ao buscar detalhes do local:', error);
    
    // Retornar dados básicos em caso de erro
    return {
      name: 'Saraiva Vision',
      location: null,
      formattedAddress: 'Endereço não disponível',
      rating: 0,
      userRatingCount: 0,
      url: '',
      reviews: [],
      photos: [],
      businessStatus: 'UNKNOWN',
      priceLevel: null,
      error: error.message,
      fetchedAt: new Date().toISOString()
    };
  }
}

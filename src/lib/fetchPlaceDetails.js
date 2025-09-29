import { loadGoogleMaps } from './loadGoogleMaps';

// Safe formatDate helper with proper fallback handling
const safeFormatDate = (input, format = "DD/MM/YYYY") => {
  if (!input) return '';

  try {
    // Try to use dayjs if available
    if (typeof window !== 'undefined' && window.dayjs) {
      const date = window.dayjs(input);
      if (date.isValid()) {
        return date.format(format);
      }
    }

    // Fallback to native Date formatting
    const date = new Date(input);
    if (isNaN(date.getTime())) return '';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch (error) {
    console.warn('Erro ao formatar data:', error);
    return '';
  }
};

const placeCache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos

export function clearPlaceCache() {
  placeCache.clear();
}

export { placeCache };

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

    // Normalize place data to prevent undefined errors with safe formatDate usage
    const data = {
      name: place.displayName || 'Nome não disponível',
      location: place.location || null,
      formattedAddress: place.formattedAddress || 'Endereço não disponível',
      rating: place.rating || 0,
      userRatingCount: place.userRatingCount || 0,
      url: place.googleMapsURI || '',
      reviews: Array.isArray(place.reviews) ? place.reviews.filter(review => review && typeof review === 'object').map(review => {
        let relativeTime = '';
        try {
          // Safe formatDate usage with error handling
          const timeToFormat = review.createTime || review.time;
           relativeTime = review.relativeTimeDescription || (timeToFormat ? safeFormatDate(timeToFormat, 'DD/MM/YYYY') : '');
        } catch (dateError) {
          console.warn('Erro ao formatar data do review:', dateError);
          relativeTime = review.relativeTimeDescription || '';
        }

        return {
          id: review.id || `review-${Date.now()}-${Math.random()}`,
          reviewer: {
            displayName: review.reviewer?.displayName || review.reviewer?.name || review.author_name || 'Nome não disponível',
            profilePhotoUrl: review.reviewer?.profilePhotoUrl || review.reviewer?.photoUrl || review.author_profile_photo || '/images/avatar-female-brunette-320w.avif'
          },
          starRating: Math.max(1, Math.min(5, Number(review.starRating) || Number(review.rating) || 5)),
          comment: review.comment || review.text || review.review_text || 'Excelente atendimento!',
          createTime: review.createTime || review.time || review.relative_time || new Date().toISOString(),
          relativeTimeDescription: relativeTime
        };
      }) : [],
      photos: Array.isArray(place.photos) ? place.photos : [],
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
      name: 'Nome não disponível',
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

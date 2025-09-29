// src/utils/googleReviews.js

/**
 * Normaliza o objeto de review da API do Google Places para um formato seguro e consistente.
 * A API pode retornar informações do autor em `reviewer` ou `authorAttribution`.
 *
 * @param {object} review - O objeto de review bruto da API.
 * @returns {object} - Um objeto de review normalizado.
 */
export const normalizeReview = (review) => {
    if (!review || typeof review !== 'object') {
        return createFallbackReview();
    }

    const authorName = review?.reviewer?.displayName ||
                      review?.authorAttribution?.displayName ||
                      review?.author_name ||
                      'Anônimo';

    const authorAvatar = review?.reviewer?.profilePhotoUrl ||
                        review?.authorAttribution?.photoUri ||
                        review?.author_avatar ||
                        review?.profile_photo_url ||
                        '/images/avatar-female-brunette-320w.avif';

    const reviewRating = Math.max(0, Math.min(5, review?.rating || review?.starRating || 0));
    const reviewText = review?.text?.text || review?.text || review?.comment || '';
    const reviewId = review?.name || review?.id || `${authorName}-${reviewRating}-${Date.now()}`;

    const reviewer = review?.reviewer || review?.authorAttribution || {};

    return {
        id: reviewId,
        author: authorName,
        avatar: authorAvatar,
        rating: reviewRating,
        text: reviewText,
        reviewer: {
            displayName: authorName,
            profilePhotoUrl: authorAvatar,
            isAnonymous: reviewer?.isAnonymous || reviewer?.anonymous || false,
            ...reviewer
        },
        starRating: reviewRating,
        comment: reviewText,
        createTime: review?.createTime || review?.time || review?.created_at || new Date().toISOString(),
        updateTime: review?.updateTime || review?.updated_at || null,
        reviewReply: normalizeReviewReply(review?.reviewReply || review?.reply),
        isRecent: isRecentReview(review?.createTime || review?.time),
        hasResponse: !!(review?.reviewReply || review?.reply),
        wordCount: countWords(reviewText)
    };
};

/**
 * Normaliza a resposta de review do estabelecimento
 */
const normalizeReviewReply = (reply) => {
    if (!reply || typeof reply !== 'object') {
        return null;
    }

    return {
        comment: reply?.comment || reply?.text || '',
        updateTime: reply?.updateTime || reply?.updated_at || null,
        reviewer: reply?.reviewer || {
            displayName: reply?.author_name || 'Estabelecimento'
        }
    };
};

/**
 * Verifica se a review é recente (menos de 30 dias)
 */
const isRecentReview = (dateString) => {
    if (!dateString) return false;

    try {
        const reviewDate = new Date(dateString);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return reviewDate > thirtyDaysAgo;
    } catch {
        return false;
    }
};

/**
 * Conta o número de palavras em um texto
 */
const countWords = (text) => {
    if (!text || typeof text !== 'string') return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

/**
 * Cria uma review de fallback segura
 */
const createFallbackReview = () => ({
    id: `fallback-${Date.now()}`,
    author: 'Anônimo',
    avatar: '/images/avatar-female-brunette-320w.avif',
    rating: 5,
    text: 'Ótima experiência!',
    reviewer: {
        displayName: 'Anônimo',
        profilePhotoUrl: '/images/avatar-female-brunette-320w.avif',
        isAnonymous: true
    },
    starRating: 5,
    comment: 'Ótima experiência!',
    createTime: new Date().toISOString(),
    updateTime: null,
    reviewReply: null,
    isRecent: false,
    hasResponse: false,
    wordCount: 3
});

/**
 * Normaliza um array de reviews com validação robusta
 */
export const normalizeReviewsArray = (reviews) => {
    if (!Array.isArray(reviews)) {
        console.warn('normalizeReviewsArray: input não é um array, usando array vazio');
        return [];
    }

    return reviews
        .filter(review => review && typeof review === 'object')
        .map(normalizeReview)
        .filter(review => review && review.id);
};

/**
 * Valida se um objeto de review é seguro para uso
 */
export const isValidReview = (review) => {
    if (!review || typeof review !== 'object') {
        return false;
    }

    return (
        typeof review.id === 'string' && review.id.length > 0 &&
        typeof review.author === 'string' && review.author.length > 0 &&
        typeof review.rating === 'number' && review.rating >= 0 && review.rating <= 5 &&
        typeof review.text === 'string'
    );
};

/**
 * Extrai informações seguras do autor da review
 */
export const extractReviewerInfo = (review) => {
    if (!review || typeof review !== 'object') {
        return {
            displayName: 'Anônimo',
            profilePhotoUrl: '/images/avatar-female-brunette-320w.avif',
            isAnonymous: true
        };
    }

    const reviewer = review?.reviewer || review?.authorAttribution || {};

    return {
        displayName: reviewer?.displayName || reviewer?.author_name || 'Anônimo',
        profilePhotoUrl: reviewer?.profilePhotoUrl || reviewer?.photoUri || reviewer?.author_avatar || '/images/avatar-female-brunette-320w.avif',
        isAnonymous: Boolean(reviewer?.isAnonymous || reviewer?.anonymous || false)
    };
};
/**
 * Google Reviews Statistics API Endpoint
 * Provides statistics from Google Places API data
 * Optimized with caching for production performance
 */

import { CLINIC_PLACE_ID } from './src/lib/clinicInfo.js';

// Cache for stats data (separate from reviews cache)
const statsCache = new Map();
const STATS_CACHE_DURATION = 60 * 60 * 1000; // 1 hour for stats (less frequent changes)
const MAX_STATS_CACHE_SIZE = 50;

/**
 * Generates a cache key for statistics data.
 *
 * @param {string} placeId The Google Place ID.
 * @param {string} period The time period for the statistics.
 * @returns {string} The generated cache key.
 */
const getStatsCacheKey = (placeId, period) => `stats-${placeId}-${period}`;

/**
 * Checks if a statistics cache entry is still valid.
 *
 * @param {object} cacheEntry The cache entry to check.
 * @returns {boolean} `true` if the cache entry is valid, `false` otherwise.
 */
const isStatsCacheValid = (cacheEntry) => cacheEntry && (Date.now() - cacheEntry.timestamp < STATS_CACHE_DURATION);

/**
 * Removes expired entries from the statistics cache.
 */
const cleanExpiredStatsCache = () => {
    const now = Date.now();
    for (const [key, entry] of statsCache.entries()) {
        if (now - entry.timestamp > STATS_CACHE_DURATION) {
            statsCache.delete(key);
        }
    }
};

/**
 * Normalizes a Google Place ID by trimming whitespace and checking for placeholder values.
 *
 * @param {string} value The Place ID to normalize.
 * @returns {string|null} The normalized Place ID, or `null` if the value is invalid.
 */
const normalizePlaceId = (value) => {
    if (!value) return null;
    const cleaned = String(value).trim();
    if (!cleaned) return null;
    if (cleaned.toUpperCase().includes('PLACEHOLDER')) return null;
    return cleaned;
};

/**
 * Resolves the Google Place ID to use by checking explicit, environment, and fallback values.
 *
 * @param {string} explicitId An explicitly provided Place ID.
 * @returns {string|null} The resolved Place ID, or `null` if none is available.
 */
const resolvePlaceId = (explicitId) => (
    normalizePlaceId(explicitId) ||
    normalizePlaceId(process.env.GOOGLE_PLACE_ID) ||
    normalizePlaceId(process.env.VITE_GOOGLE_PLACE_ID) ||
    CLINIC_PLACE_ID
);

/**
 * Handles the request for Google Reviews statistics.
 *
 * @param {object} req The HTTP request object.
 * @param {object} res The HTTP response object.
 * @returns {Promise<void>} A promise that resolves when the request is handled.
 */
export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

    try {
        const {
            placeId,
            period = '30',
            includeDistribution = 'true',
            includeTrends = 'false' // Trends not available with Places API
        } = req.query;

        const resolvedPlaceId = resolvePlaceId(placeId);

        if (!resolvedPlaceId) {
            return res.status(400).json({
                success: false,
                error: 'placeId parameter is required'
            });
        }

        const apiKey = process.env.VITE_GOOGLE_PLACES_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            return res.status(500).json({
                success: false,
                error: 'Google Places API key not configured. Please check VITE_GOOGLE_PLACES_API_KEY or VITE_GOOGLE_MAPS_API_KEY environment variable.'
            });
        }

        // Fetch place details with reviews
        const baseUrl = 'https://maps.googleapis.com/maps/api/place/details/json';
        const params = new URLSearchParams({
            place_id: resolvedPlaceId,
            fields: 'reviews,rating,user_ratings_total,name,formatted_address',
            language: 'pt-BR',
            key: apiKey
        });

        // Fetch with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        const response = await fetch(`${baseUrl}?${params.toString()}`, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'SaraivaVision/1.0'
            }
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Google Places API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.status !== 'OK') {
            // Handle specific error cases
            if (data.status === 'REQUEST_DENIED') {
                throw new Error('API request denied. Please check your API key and ensure Places API is enabled.');
            } else if (data.status === 'INVALID_REQUEST') {
                throw new Error('Invalid request. Please check the place ID format.');
            } else if (data.status === 'NOT_FOUND') {
                throw new Error('Place not found. Please verify the place ID.');
            } else {
                throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
            }
        }

        const place = data.result;
        const reviews = place.reviews || [];

        // Calculate comprehensive statistics
        const stats = calculateComprehensiveStats(reviews, place, {
            periodDays: parseInt(period),
            includeDistribution: includeDistribution === 'true',
            includeTrends: includeTrends === 'true'
        });

        return res.status(200).json({
            success: true,
            data: stats,
            source: 'google-places-api',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Google Reviews Stats API Error:', error);

        return res.status(500).json({
            success: false,
            error: error.message || 'Internal server error',
            timestamp: new Date().toISOString()
        });
    }
}

/**
 * Calculates comprehensive statistics from Google Reviews data.
 *
 * @param {Array<object>} reviews An array of review objects.
 * @param {object} place A place object from the Google Places API.
 * @param {object} options An object of options for calculating statistics.
 * @param {number} options.periodDays The number of days to consider for recent reviews.
 * @param {boolean} options.includeDistribution Whether to include the rating distribution.
 * @param {boolean} options.includeTrends Whether to include trends (not currently supported).
 * @returns {object} An object containing the calculated statistics.
 */
function calculateComprehensiveStats(reviews, place, options = {}) {
    const {
        periodDays = 30,
        includeDistribution = true,
        includeTrends = false
    } = options;

    const totalReviews = place.user_ratings_total || reviews.length;
    const averageRating = place.rating || 0;

    if (!reviews || reviews.length === 0) {
        return {
            overview: {
                totalReviews,
                averageRating,
                recentReviews: 0,
                responseRate: 0
            },
            distribution: includeDistribution ? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } : null,
            trends: includeTrends ? [] : null,
            sentiment: {
                positive: 0,
                neutral: 0,
                negative: 0,
                positivePercentage: 0,
                negativePercentage: 0
            },
            engagement: {
                averageWordCount: 0,
                reviewsWithPhotos: 0,
                businessResponses: 0,
                responseRate: 0
            },
            period: {
                days: periodDays,
                startDate: new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString(),
                endDate: new Date().toISOString()
            },
            place: {
                name: place.name || 'Unknown',
                address: place.formatted_address || 'Unknown',
                placeId: place.place_id
            }
        };
    }

    // Filter reviews by period
    const cutoffDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
    const recentReviews = reviews.filter(review => {
        if (!review.time) return false;
        const reviewDate = new Date(review.time * 1000);
        return reviewDate >= cutoffDate;
    });

    // Rating distribution
    let distribution = null;
    if (includeDistribution) {
        distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach(review => {
            const rating = Math.round(review.rating);
            if (rating >= 1 && rating <= 5) {
                distribution[rating]++;
            }
        });
    }

    // Sentiment analysis
    const sentiment = {
        positive: reviews.filter(review => review.rating >= 4).length,
        neutral: reviews.filter(review => review.rating === 3).length,
        negative: reviews.filter(review => review.rating <= 2).length
    };

    // Engagement metrics
    const totalWordCount = reviews.reduce((sum, review) => {
        return sum + (review.text ? review.text.split(' ').length : 0);
    }, 0);
    const averageWordCount = reviews.length > 0 ? Math.round(totalWordCount / reviews.length) : 0;

    // Business responses (not available in Places API)
    const reviewsWithResponses = 0;
    const responseRate = 0;

    return {
        overview: {
            totalReviews,
            averageRating: Math.round(averageRating * 10) / 10,
            recentReviews: recentReviews.length,
            responseRate
        },
        distribution,
        trends: includeTrends ? [] : null, // Not available with Places API
        sentiment: {
            positive: sentiment.positive,
            neutral: sentiment.neutral,
            negative: sentiment.negative,
            positivePercentage: reviews.length > 0 ? Math.round((sentiment.positive / reviews.length) * 100) : 0,
            negativePercentage: reviews.length > 0 ? Math.round((sentiment.negative / reviews.length) * 100) : 0
        },
        engagement: {
            averageWordCount,
            reviewsWithPhotos: 0, // Not available in Places API
            businessResponses: reviewsWithResponses,
            responseRate
        },
        period: {
            days: periodDays,
            startDate: cutoffDate.toISOString(),
            endDate: new Date().toISOString()
        },
        place: {
            name: place.name || 'Unknown',
            address: place.formatted_address || 'Unknown',
            totalReviews: place.user_ratings_total || 0,
            averageRating: place.rating || 0
        },
        lastUpdated: new Date().toISOString()
    };
}
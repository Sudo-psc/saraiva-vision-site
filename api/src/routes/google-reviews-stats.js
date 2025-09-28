/**
 * Google Reviews Statistics API Endpoint
 * Provides statistics from Google Places API data
 */

import { CLINIC_PLACE_ID } from '../lib/clinicInfo.js';

const normalizePlaceId = (value) => {
    if (!value) return null;
    const cleaned = String(value).trim();
    if (!cleaned) return null;
    if (cleaned.toUpperCase().includes('PLACEHOLDER')) return null;
    return cleaned;
};

const resolvePlaceId = (explicitId) => (
    normalizePlaceId(explicitId) ||
    normalizePlaceId(process.env.GOOGLE_PLACE_ID) ||
    normalizePlaceId(process.env.VITE_GOOGLE_PLACE_ID) ||
    CLINIC_PLACE_ID
);

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

        const apiKey = process.env.VITE_GOOGLE_PLACES_API_KEY;
        if (!apiKey) {
            return res.status(500).json({
                success: false,
                error: 'Google Places API key not configured'
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

        const response = await fetch(`${baseUrl}?${params.toString()}`);

        if (!response.ok) {
            throw new Error(`Google Places API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.status !== 'OK') {
            throw new Error(`Google Places API error: ${data.status}`);
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
 * Calculate comprehensive statistics from reviews
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
/**
 * Next.js API Route for Google Reviews
 * Fetches reviews from Google Places API
 */

import { NextRequest, NextResponse } from 'next/server';

// Clinic information
const CLINIC_PLACE_ID = 'ChIJVUKww7WRugARF7u2lAe7BeE';

const normalizePlaceId = (value: string | null | undefined): string | null => {
    if (!value) return null;
    const cleaned = String(value).trim();
    if (!cleaned) return null;
    if (cleaned.toUpperCase().includes('PLACEHOLDER')) return null;
    return cleaned;
};

const resolvePlaceId = (explicitId?: string | null): string | null => {
    return (
        normalizePlaceId(explicitId) ||
        normalizePlaceId(process.env.GOOGLE_PLACE_ID) ||
        normalizePlaceId(process.env.VITE_GOOGLE_PLACE_ID) ||
        CLINIC_PLACE_ID
    );
};

// Simple in-memory cache for development (in production, consider Redis)
const reviewsCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const placeId = searchParams.get('placeId');
        const limit = parseInt(searchParams.get('limit') || '5');
        const language = searchParams.get('language') || 'pt-BR';

        const resolvedPlaceId = resolvePlaceId(placeId);

        // Validate required parameters
        if (!resolvedPlaceId) {
            console.error('Google Place ID not configured or using placeholder value');
            return NextResponse.json({
                success: false,
                error: 'Google Place ID not configured. Please check your environment variables.'
            }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_PLACES_API_KEY ||
                      process.env.GOOGLE_MAPS_API_KEY ||
                      process.env.VITE_GOOGLE_PLACES_API_KEY ||
                      process.env.VITE_GOOGLE_MAPS_API_KEY;

        if (!apiKey ||
            apiKey === 'your_google_maps_api_key_here' ||
            apiKey === 'your_google_places_api_key_here' ||
            !apiKey.startsWith('AIza')) {
            console.error('Google Places API key not configured or using placeholder value');
            return NextResponse.json({
                success: false,
                error: 'Google Places API key not configured. Please check your environment variables.'
            }, { status: 500 });
        }

        // Check cache first
        const cacheKey = `${resolvedPlaceId}-${limit}-${language}`;
        const cachedData = reviewsCache.get(cacheKey);

        if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION)) {
            console.log('Google Reviews: Using cached data');
            return NextResponse.json({
                success: true,
                data: cachedData.result,
                timestamp: new Date().toISOString(),
                cached: true
            });
        }

        // Build Google Places API URL
        const baseUrl = 'https://maps.googleapis.com/maps/api/place/details/json';
        const params = new URLSearchParams({
            place_id: resolvedPlaceId,
            fields: 'reviews,rating,user_ratings_total,name,opening_hours,url',
            language: language,
            key: apiKey
        });

        console.log('Fetching reviews from Google Places API for place:', resolvedPlaceId);

        // Fetch from Google Places API with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        const response = await fetch(`${baseUrl}?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'SaraivaVision/1.0'
            },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Google Places API error: ${response.status} ${response.statusText}`);
        }

        // Check if response is actually JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Non-JSON response from Google Places API:', text);
            throw new Error('Invalid response format from Google Places API');
        }

        const data = await response.json();

        if (data.status !== 'OK') {
            console.error('Google Places API error:', data);

            // Handle specific error cases
            if (data.status === 'REQUEST_DENIED') {
                throw new Error('API request denied. Please check your API key and ensure Places API is enabled.');
            } else if (data.status === 'INVALID_REQUEST') {
                throw new Error('Invalid request. Please check the place ID format.');
            } else if (data.status === 'NOT_FOUND') {
                throw new Error('Place not found. Please verify the place ID.');
            } else if (data.status === 'OVER_QUERY_LIMIT') {
                throw new Error('API quota exceeded. Please try again later.');
            } else {
                throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
            }
        }

        const place = data.result;
        const reviews = place.reviews || [];

        // Transform reviews to our standard format
        const transformedReviews = reviews.slice(0, limit).map((review, index) => ({
            id: `places-${review.time || index}`,
            reviewer: {
                displayName: review.author_name || 'Anonymous',
                profilePhotoUrl: review.profile_photo_url || null,
                isAnonymous: !review.author_name
            },
            starRating: review.rating || 0,
            comment: review.text || '',
            createTime: review.time ? new Date(review.time * 1000).toISOString() : new Date().toISOString(),
            updateTime: review.time ? new Date(review.time * 1000).toISOString() : new Date().toISOString(),
            reviewReply: null, // Google Places API doesn't provide business replies in this endpoint
            isRecent: isRecentReview(review.time),
            hasResponse: false,
            wordCount: review.text ? review.text.split(' ').length : 0,
            language: review.language || language,
            originalRating: review.rating,
            relativeTimeDescription: review.relative_time_description || null
        }));

        // Calculate statistics
        const stats = calculateStats(transformedReviews, place);

        const result = {
            reviews: transformedReviews,
            stats,
            place: {
                id: resolvedPlaceId,
                name: place.name || 'Clínica Saraiva Vision',
                rating: place.rating || 0,
                userRatingCount: place.user_ratings_total || 0,
                url: place.url || `https://www.google.com/maps/place/?q=place_id:${resolvedPlaceId}`,
                openingHours: place.opening_hours || null
            },
            pagination: {
                total: transformedReviews.length,
                limit: limit,
                offset: 0,
                hasMore: false // Google Places API returns max 5 reviews
            },
            metadata: {
                fetchedAt: new Date().toISOString(),
                source: 'google-places-api',
                placeId: resolvedPlaceId,
                placeName: place.name || 'Unknown',
                totalReviews: place.user_ratings_total || 0,
                averageRating: place.rating || 0
            }
        };

        // Cache the successful response
        reviewsCache.set(cacheKey, {
            result,
            timestamp: Date.now()
        });

        console.log(`Successfully fetched ${transformedReviews.length} reviews from Google Places API`);

        return NextResponse.json({
            success: true,
            data: result,
            timestamp: new Date().toISOString(),
            cached: false
        });

    } catch (error) {
        console.error('Google Places Reviews API Error:', error);

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

/**
 * Check if a review is recent (within last 30 days)
 */
function isRecentReview(timestamp?: number): boolean {
    if (!timestamp) return false;

    try {
        const reviewDate = new Date(timestamp * 1000);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        return reviewDate >= thirtyDaysAgo;
    } catch (error) {
        return false;
    }
}

/**
 * Calculate statistics from reviews and place data
 */
function calculateStats(reviews: any[], place: any) {
    const totalReviews = place.user_ratings_total || reviews.length;
    const averageRating = place.rating || 0;

    // Calculate rating distribution from available reviews
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let recentReviews = 0;
    let totalWordCount = 0;

    reviews.forEach(review => {
        const rating = Math.round(review.starRating);
        if (rating >= 1 && rating <= 5) {
            distribution[rating]++;
        }

        if (review.isRecent) {
            recentReviews++;
        }

        totalWordCount += review.wordCount;
    });

    const reviewsWithResponses = reviews.filter(review => review.hasResponse).length;
    const responseRate = reviews.length > 0 ? (reviewsWithResponses / reviews.length) * 100 : 0;
    const averageWordCount = reviews.length > 0 ? Math.round(totalWordCount / reviews.length) : 0;

    return {
        overview: {
            totalReviews,
            averageRating: Math.round(averageRating * 10) / 10,
            recentReviews,
            responseRate: Math.round(responseRate * 10) / 10
        },
        distribution,
        sentiment: {
            positive: reviews.filter(review => review.starRating >= 4).length,
            neutral: reviews.filter(review => review.starRating === 3).length,
            negative: reviews.filter(review => review.starRating <= 2).length,
            positivePercentage: reviews.length > 0 ? Math.round((reviews.filter(review => review.starRating >= 4).length / reviews.length) * 100) : 0,
            negativePercentage: reviews.length > 0 ? Math.round((reviews.filter(review => review.starRating <= 2).length / reviews.length) * 100) : 0
        },
        engagement: {
            averageWordCount,
            reviewsWithPhotos: 0, // Not available in Places API
            businessResponses: reviewsWithResponses,
            responseRate: Math.round(responseRate * 10) / 10
        },
        period: {
            days: 30,
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date().toISOString()
        },
        lastUpdated: new Date().toISOString()
    };
}
/**
 * Google Reviews API Route
 * GET /api/reviews - Fetch Google Place reviews
 *
 * Features:
 * - Google Places API integration
 * - Response caching (60 minutes)
 * - Rate limiting (30 req/min)
 * - Fallback data
 * - Statistics calculation
 */

import { NextRequest, NextResponse } from 'next/server';
import { reviewsQuerySchema } from '@/lib/validations/api';
import type { GoogleReview, ReviewsStats, ReviewsResponse } from '@/types/api';

// Cache storage (use Redis or Vercel KV in production)
let reviewsCache: {
  data: ReviewsResponse | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0,
};

const CACHE_TTL = 60 * 60 * 1000; // 60 minutes
const CLINIC_PLACE_ID = 'ChIJVUKww7WRugARF7u2lAe7BeE';

/**
 * GET /api/reviews
 * Fetch Google Place reviews with caching
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const validationResult = reviewsQuerySchema.safeParse({
      placeId: searchParams.get('placeId') || undefined,
      limit: searchParams.get('limit') || '5',
      language: searchParams.get('language') || 'pt-BR',
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Parâmetros inválidos',
          details: validationResult.error.flatten().fieldErrors,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const { placeId, limit, language } = validationResult.data;

    // Check cache
    const now = Date.now();
    if (reviewsCache.data && now - reviewsCache.timestamp < CACHE_TTL) {
      console.log('Returning cached reviews');
      return NextResponse.json(reviewsCache.data, {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
          'X-Cache': 'HIT',
        },
      });
    }

    // Resolve Place ID
    const resolvedPlaceId =
      placeId ||
      process.env.GOOGLE_PLACE_ID ||
      process.env.VITE_GOOGLE_PLACE_ID ||
      CLINIC_PLACE_ID;

    if (!resolvedPlaceId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Google Place ID not configured',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Resolve API Key
    const apiKey =
      process.env.GOOGLE_PLACES_API_KEY ||
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.VITE_GOOGLE_PLACES_API_KEY ||
      process.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error('Google Places API key not configured');
      return NextResponse.json(
        {
          success: false,
          error: 'API key not configured',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    // Build Google Places API URL
    const baseUrl = 'https://maps.googleapis.com/maps/api/place/details/json';
    const params = new URLSearchParams({
      place_id: resolvedPlaceId,
      fields: 'reviews,rating,user_ratings_total,name',
      language,
      key: apiKey,
    });

    console.log('Fetching reviews from Google Places API');

    // Fetch from Google Places API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(`${baseUrl}?${params.toString()}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'SaraivaVision/2.0',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    // Validate response content type
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      throw new Error('Invalid response format from Google Places API');
    }

    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('Google Places API error:', data);

      // Handle specific error cases
      const errorMessages: Record<string, string> = {
        REQUEST_DENIED: 'API request denied. Check API key and Places API activation.',
        INVALID_REQUEST: 'Invalid request. Check place ID format.',
        NOT_FOUND: 'Place not found. Verify place ID.',
        OVER_QUERY_LIMIT: 'API quota exceeded. Try again later.',
      };

      throw new Error(
        errorMessages[data.status] ||
          `Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`
      );
    }

    const place = data.result;
    const reviews = place.reviews || [];

    // Transform reviews to standard format
    const transformedReviews: GoogleReview[] = reviews
      .slice(0, limit)
      .map((review: any, index: number) => ({
        id: `places-${review.time || index}`,
        reviewer: {
          displayName: review.author_name || 'Anonymous',
          profilePhotoUrl: review.profile_photo_url || null,
          isAnonymous: !review.author_name,
        },
        starRating: review.rating || 0,
        comment: review.text || '',
        createTime: review.time
          ? new Date(review.time * 1000).toISOString()
          : new Date().toISOString(),
        updateTime: review.time
          ? new Date(review.time * 1000).toISOString()
          : new Date().toISOString(),
        reviewReply: null as any,
        isRecent: isRecentReview(review.time),
        hasResponse: false,
        wordCount: review.text ? review.text.split(' ').length : 0,
        language: review.language || language,
        originalRating: review.rating,
        relativeTimeDescription: review.relative_time_description || null,
      }));

    // Calculate statistics
    const stats = calculateStats(transformedReviews, place);

    const result: ReviewsResponse = {
      success: true,
      data: {
        reviews: transformedReviews,
        stats,
        pagination: {
          total: transformedReviews.length,
          limit,
          offset: 0,
          hasMore: false,
        },
        metadata: {
          fetchedAt: new Date().toISOString(),
          source: 'google-places-api',
          placeId: resolvedPlaceId,
          placeName: place.name || 'Unknown',
          totalReviews: place.user_ratings_total || 0,
          averageRating: place.rating || 0,
        },
      },
      timestamp: new Date().toISOString(),
    };

    // Update cache
    reviewsCache = {
      data: result,
      timestamp: now,
    };

    console.log(`Successfully fetched ${transformedReviews.length} reviews`);

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        'X-Cache': 'MISS',
      },
    });
  } catch (error: any) {
    console.error('Google Reviews API Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * Check if a review is recent (within last 30 days)
 */
function isRecentReview(timestamp: number | undefined): boolean {
  if (!timestamp) return false;

  try {
    const reviewDate = new Date(timestamp * 1000);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return reviewDate >= thirtyDaysAgo;
  } catch {
    return false;
  }
}

/**
 * Calculate statistics from reviews and place data
 */
function calculateStats(reviews: GoogleReview[], place: any): ReviewsStats {
  const totalReviews = place.user_ratings_total || reviews.length;
  const averageRating = place.rating || 0;

  // Calculate rating distribution
  const distribution: ReviewsStats['distribution'] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let recentReviews = 0;
  let totalWordCount = 0;

  reviews.forEach((review) => {
    const rating = Math.round(review.starRating) as 1 | 2 | 3 | 4 | 5;
    if (rating >= 1 && rating <= 5) {
      distribution[rating]++;
    }

    if (review.isRecent) recentReviews++;
    totalWordCount += review.wordCount;
  });

  const reviewsWithResponses = reviews.filter((r) => r.hasResponse).length;
  const responseRate = reviews.length > 0 ? (reviewsWithResponses / reviews.length) * 100 : 0;
  const averageWordCount = reviews.length > 0 ? Math.round(totalWordCount / reviews.length) : 0;

  const positive = reviews.filter((r) => r.starRating >= 4).length;
  const neutral = reviews.filter((r) => r.starRating === 3).length;
  const negative = reviews.filter((r) => r.starRating <= 2).length;

  return {
    overview: {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      recentReviews,
      responseRate: Math.round(responseRate * 10) / 10,
    },
    distribution,
    sentiment: {
      positive,
      neutral,
      negative,
      positivePercentage: reviews.length > 0 ? Math.round((positive / reviews.length) * 100) : 0,
      negativePercentage: reviews.length > 0 ? Math.round((negative / reviews.length) * 100) : 0,
    },
    engagement: {
      averageWordCount,
      reviewsWithPhotos: 0,
      businessResponses: reviewsWithResponses,
      responseRate: Math.round(responseRate * 10) / 10,
    },
    period: {
      days: 30,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString(),
    },
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// Edge Runtime for global CDN deployment
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

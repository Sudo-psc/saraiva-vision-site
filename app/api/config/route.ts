import { NextRequest, NextResponse } from 'next/server';

// Rate limiting: Simple in-memory rate limiter for Next.js
const rateLimitMap = new Map();
const RATE_LIMIT = 30; // 30 requests per 15 minutes
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] :
             request.headers.get('x-real-ip') ||
             'unknown';
  return `config:${ip}`;
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, []);
  }

  const requests = rateLimitMap.get(key);

  // Remove old requests outside the window
  const validRequests = requests.filter((timestamp: number) => timestamp > windowStart);
  rateLimitMap.set(key, validRequests);

  if (validRequests.length >= RATE_LIMIT) {
    return true;
  }

  // Add current request
  validRequests.push(now);
  return false;
}

/**
 * GET /api/config
 * Returns public environment configuration including Google Maps API keys
 */
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitKey = getRateLimitKey(request);
    if (isRateLimited(rateLimitKey)) {
      return NextResponse.json(
        { error: 'Too many configuration requests, please try again later' },
        { status: 429 }
      );
    }

    // Return only public, non-sensitive configuration
    const config = {
      // Google Maps (public client-side key)
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || '',
      googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY || process.env.VITE_GOOGLE_PLACES_API_KEY || '',
      googlePlaceId: process.env.GOOGLE_PLACE_ID || process.env.VITE_GOOGLE_PLACE_ID || 'ChIJVUKww7WRugARF7u2lAe7BeE',
    };

    // Validate required fields
    if (!config.googleMapsApiKey) {
      console.warn('Google Maps API key not configured');
      // Return empty config instead of error to allow frontend to handle gracefully
      return NextResponse.json({
        googleMapsApiKey: '',
        googlePlacesApiKey: '',
        googlePlaceId: '',
      }, {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=300',
          'Content-Type': 'application/json',
        }
      });
    }

    // Set cache headers (5 minutes)
    const response = NextResponse.json(config, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300',
        'Content-Type': 'application/json',
      }
    });

    return response;

  } catch (error) {
    console.error('Error serving configuration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Only allow GET requests
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
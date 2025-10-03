/**
 * Health Check API Route
 * GET /api/health - System health status
 */

import { NextResponse } from 'next/server';
import type { HealthCheckResponse } from '@/types/api';

export async function GET() {
  const hasResendKey = !!process.env.RESEND_API_KEY;
  const hasGoogleKey = !!(
    process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY
  );

  const emailService = hasResendKey
    ? { status: 'ok' as const, configured: true }
    : { status: 'error' as const, configured: false, errors: ['RESEND_API_KEY not set'] };

  const googleService = hasGoogleKey
    ? { status: 'ok' as const, configured: true }
    : { status: 'degraded' as const, configured: false, errors: ['Google API key not set'] };

  const isHealthy = hasResendKey;
  const status = isHealthy ? 'ok' : 'degraded';

  const response: HealthCheckResponse = {
    status,
    timestamp: new Date().toISOString(),
    service: 'saraiva-vision-api',
    environment: process.env.NODE_ENV || 'development',
    version: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
    services: {
      contactForm: emailService,
      googleReviews: googleService,
      rateLimiting: { status: 'ok', configured: true },
      validation: { status: 'ok', configured: true },
    },
    config: {
      nodeEnv: process.env.NODE_ENV || 'development',
      hasResendKey,
      hasGoogleKey,
    },
  };

  return NextResponse.json(response, { status: isHealthy ? 200 : 503 });
}

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

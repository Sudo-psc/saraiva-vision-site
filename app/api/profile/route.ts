/**
 * Profile API Route
 * POST /api/profile - Set user profile preference
 * GET /api/profile - Get current profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { profileSchema } from '@/lib/validations/api';
import type { ProfileResponse } from '@/types/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = profileSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid profile data',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { profile, source, confidence } = validationResult.data;

    const response: ProfileResponse = {
      success: true,
      data: {
        profile,
        detectedAt: new Date().toISOString(),
        source,
        confidence,
      },
      message: 'Profile preference saved successfully',
    };

    // Set cookie
    const cookieResponse = NextResponse.json(response, { status: 200 });
    cookieResponse.cookies.set('profile-preference', profile, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 31536000,
      path: '/',
    });

    return cookieResponse;
  } catch (error) {
    console.error('Profile API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const profile = request.cookies.get('profile-preference')?.value as
    | 'familiar'
    | 'jovem'
    | 'senior'
    | undefined;

  if (!profile) {
    return NextResponse.json(
      { success: false, error: 'No profile preference set' },
      { status: 404 }
    );
  }

  const response: ProfileResponse = {
    success: true,
    data: {
      profile,
      detectedAt: new Date().toISOString(),
      source: 'manual',
    },
  };

  return NextResponse.json(response, { status: 200 });
}

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

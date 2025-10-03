import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile } = body;

    const validProfiles = ['familiar', 'jovem', 'senior'];

    if (!profile || !validProfiles.includes(profile)) {
      return NextResponse.json(
        { error: 'Invalid profile' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();

    // Set profile cookie with 1 year expiration
    cookieStore.set('profile', profile, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return NextResponse.json({
      success: true,
      profile,
      redirectUrl: `/${profile}`
    });
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const profileCookie = cookieStore.get('profile');

  return NextResponse.json({
    profile: profileCookie?.value || null,
  });
}

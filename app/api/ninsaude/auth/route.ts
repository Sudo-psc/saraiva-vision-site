import { NextRequest, NextResponse } from 'next/server';

const NINSAUDE_API_BASE_URL = process.env.NINSAUDE_API_URL || 'https://api.ninsaude.com/v1';
const NINSAUDE_ACCOUNT = process.env.NINSAUDE_ACCOUNT;
const NINSAUDE_USERNAME = process.env.NINSAUDE_USERNAME;
const NINSAUDE_PASSWORD = process.env.NINSAUDE_PASSWORD;
const NINSAUDE_ACCOUNT_UNIT = process.env.NINSAUDE_ACCOUNT_UNIT;

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === 'login') {
      return await handleLogin();
    } else if (action === 'refresh') {
      const { refreshToken } = await request.json();
      return await handleRefreshToken(refreshToken);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleLogin() {
  if (!NINSAUDE_ACCOUNT || !NINSAUDE_USERNAME || !NINSAUDE_PASSWORD || !NINSAUDE_ACCOUNT_UNIT) {
    return NextResponse.json(
      { error: 'Ninsaúde credentials not configured' },
      { status: 500 }
    );
  }

  const formData = new URLSearchParams();
  formData.append('grant_type', 'password');
  formData.append('account', NINSAUDE_ACCOUNT);
  formData.append('username', NINSAUDE_USERNAME);
  formData.append('password', NINSAUDE_PASSWORD);
  formData.append('accountUnit', NINSAUDE_ACCOUNT_UNIT);

  const response = await fetch(`${NINSAUDE_API_BASE_URL}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'cache-control': 'no-cache',
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return NextResponse.json(
      { error: errorData.message || 'Authentication failed' },
      { status: response.status }
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}

async function handleRefreshToken(refreshToken: string) {
  if (!refreshToken) {
    return NextResponse.json(
      { error: 'Refresh token is required' },
      { status: 400 }
    );
  }

  const formData = new URLSearchParams();
  formData.append('grant_type', 'refresh_token');
  formData.append('refresh_token', refreshToken);

  const response = await fetch(`${NINSAUDE_API_BASE_URL}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'cache-control': 'no-cache',
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return NextResponse.json(
      { error: errorData.message || 'Token refresh failed' },
      { status: response.status }
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}

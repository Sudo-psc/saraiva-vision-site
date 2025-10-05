import { NextRequest, NextResponse } from 'next/server';

const NINSAUDE_API_BASE_URL = process.env.NINSAUDE_API_URL || 'https://api.ninsaude.com/v1';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.headers.get('x-access-token');

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') || '50';

    const response = await fetch(
      `${NINSAUDE_API_BASE_URL}/cadastro_profissional/listar?limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch professionals' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      professionals: data.result || [],
      total: data.result?.length || 0
    });

  } catch (error) {
    console.error('Error fetching professionals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

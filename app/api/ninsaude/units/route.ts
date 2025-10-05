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
    const ativo = searchParams.get('ativo') || '1';

    const response = await fetch(
      `${NINSAUDE_API_BASE_URL}/account_geral/listar?limit=${limit}&ativo=${ativo}`,
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
        { error: errorData.message || 'Failed to fetch units' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      units: data.result || [],
      total: data.result?.length || 0
    });

  } catch (error) {
    console.error('Error fetching units:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

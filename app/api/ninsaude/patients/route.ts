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
    const filter = searchParams.get('filter') || '';

    const endpoint = filter 
      ? `${NINSAUDE_API_BASE_URL}/cadastro_paciente/listar/${encodeURIComponent(filter)}`
      : `${NINSAUDE_API_BASE_URL}/cadastro_paciente/listar?limit=${limit}`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch patients' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      patients: data.result || [],
      total: data.result?.length || 0
    });

  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.headers.get('x-access-token');

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const { nome, cpf, telefone, email, dataNascimento } = body;

    if (!nome || !cpf) {
      return NextResponse.json(
        { error: 'Missing required fields: nome, cpf' },
        { status: 400 }
      );
    }

    const patientData = {
      nome,
      cpf,
      ...(telefone && { foneCelular: telefone }),
      ...(email && { email }),
      ...(dataNascimento && { dataNascimento }),
      ativo: 1,
    };

    const response = await fetch(
      `${NINSAUDE_API_BASE_URL}/cadastro_paciente`,
      {
        method: 'POST',
        headers: {
          'Authorization': `bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || errorData.message || 'Failed to create patient' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

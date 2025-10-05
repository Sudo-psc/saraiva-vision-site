import { NextRequest, NextResponse } from 'next/server';

const NINSAUDE_API_BASE_URL = process.env.NINSAUDE_API_URL || 'https://api.ninsaude.com/v1';

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

    const { 
      accountUnidade,
      profissional, 
      data: appointmentDate, 
      horaInicial, 
      horaFinal,
      paciente, 
      status,
      servico,
      consent 
    } = body;

    if (!accountUnidade || !profissional || !appointmentDate || !horaInicial || !horaFinal || !paciente) {
      return NextResponse.json(
        { error: 'Missing required fields: accountUnidade, profissional, data, horaInicial, horaFinal, paciente' },
        { status: 400 }
      );
    }

    if (!consent?.lgpd) {
      return NextResponse.json(
        { error: 'LGPD consent is required' },
        { status: 400 }
      );
    }

    const appointmentData = {
      accountUnidade,
      profissional,
      data: appointmentDate,
      horaInicial,
      horaFinal,
      paciente,
      status: status || 1,
      enviadoConfirmacao: 1,
      ...(servico && { servico }),
    };

    const apiResponse = await fetch(
      `${NINSAUDE_API_BASE_URL}/atendimento_agenda`,
      {
        method: 'POST',
        headers: {
          'Authorization': `bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      }
    );

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || errorData.message || 'Failed to create appointment' },
        { status: apiResponse.status }
      );
    }

    const responseData = await apiResponse.json();
    return NextResponse.json(responseData, { status: 201 });

  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const accessToken = request.headers.get('x-access-token');
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const appointmentId = searchParams.get('id');

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    const apiResponse = await fetch(
      `${NINSAUDE_API_BASE_URL}/atendimento_agenda/${appointmentId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || errorData.message || 'Failed to cancel appointment' },
        { status: apiResponse.status }
      );
    }

    return NextResponse.json(
      { message: 'Appointment cancelled successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error cancelling appointment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

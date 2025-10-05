import { NextRequest, NextResponse } from 'next/server';

const NINSAUDE_API_BASE_URL = process.env.NINSAUDE_API_URL || 'https://api.ninsaude.com/v1';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const professionalId = searchParams.get('professional_id');
    const accessToken = request.headers.get('x-access-token');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'start_date and end_date parameters are required' },
        { status: 400 }
      );
    }

    if (!professionalId) {
      return NextResponse.json(
        { error: 'professional_id parameter is required' },
        { status: 400 }
      );
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 401 }
      );
    }

    const response = await fetch(
      `${NINSAUDE_API_BASE_URL}/atendimento_agenda/listar/horario/disponivel/profissional/${professionalId}/dataInicial/${startDate}/dataFinal/${endDate}`,
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
        { error: errorData.message || 'Failed to fetch available slots' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    const slots = (data.result || []).flatMap((day: any) => 
      (day.horarioLivre || []).map((slot: any) => ({
        date: day.data,
        startTime: slot.horaInicial,
        endTime: slot.horaFinal,
        unitId: slot.accountUnidade
      }))
    );

    return NextResponse.json({
      slots,
      total: slots.length
    });

  } catch (error) {
    console.error('Error fetching available slots:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

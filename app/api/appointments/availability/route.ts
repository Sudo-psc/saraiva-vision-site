/**
 * Appointment Availability API Route
 * GET /api/appointments/availability - Get available time slots
 *
 * Features:
 * - Returns available slots for next N business days
 * - Monday-Friday 08:00-18:00 in 30-minute intervals
 * - Mock data (replace with backend integration)
 * - LGPD compliant
 */

import { NextRequest, NextResponse } from 'next/server';
import { availabilityQuerySchema } from '@/lib/validations/api';
import { clinicInfo } from '@/lib/clinicInfo';
import type { AvailabilityResponse, TimeSlot } from '@/types/appointment';

const BUSINESS_HOURS = {
  start: 8,
  end: 18,
  slotDuration: 30,
  workDays: [1, 2, 3, 4, 5],
  timezone: 'America/Sao_Paulo',
};

const mockBookedSlots = new Map<string, Set<string>>();

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = BUSINESS_HOURS.start; hour < BUSINESS_HOURS.end; hour++) {
    for (let minute = 0; minute < 60; minute += BUSINESS_HOURS.slotDuration) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute
        .toString()
        .padStart(2, '0')}`;
      slots.push(timeString);
    }
  }
  return slots;
}

function isBusinessDay(date: Date): boolean {
  const dayOfWeek = date.getDay();
  return BUSINESS_HOURS.workDays.includes(dayOfWeek);
}

function getAvailableSlotsForDate(dateStr: string): TimeSlot[] {
  const allSlots = generateTimeSlots();
  const bookedSlots = mockBookedSlots.get(dateStr) || new Set<string>();
  const now = new Date();
  const targetDate = new Date(dateStr);
  const isToday = targetDate.toDateString() === now.toDateString();

  return allSlots.map((slot_time) => {
    let is_available = !bookedSlots.has(slot_time);

    if (isToday) {
      const [hours, minutes] = slot_time.split(':').map(Number);
      const slotDateTime = new Date(now);
      slotDateTime.setHours(hours, minutes, 0, 0);

      if (slotDateTime <= now) {
        is_available = false;
      }
    }

    const randomUnavailable = Math.random() > 0.7;
    if (randomUnavailable) {
      is_available = false;
    }

    return {
      slot_time,
      is_available,
      slot_id: `${dateStr}-${slot_time}`,
    };
  });
}

function getAvailability(days: number): Record<string, TimeSlot[]> {
  const availability: Record<string, TimeSlot[]> = {};
  const today = new Date();
  let currentDate = new Date(today);
  let businessDaysFound = 0;

  while (businessDaysFound < days) {
    if (isBusinessDay(currentDate)) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const slots = getAvailableSlotsForDate(dateStr);

      const availableSlots = slots.filter((slot) => slot.is_available);
      if (availableSlots.length > 0) {
        availability[dateStr] = slots;
      }

      businessDaysFound++;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return availability;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = {
      days: searchParams.get('days') || '14',
    };

    const validationResult = availabilityQuerySchema.safeParse(queryParams);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Parâmetros inválidos',
            code: 'VALIDATION_ERROR',
          },
          timestamp: new Date().toISOString(),
        } as AvailabilityResponse,
        { status: 400 }
      );
    }

    const { days } = validationResult.data;

    const availability = getAvailability(days);

    const response: AvailabilityResponse = {
      success: true,
      data: {
        availability,
        schedulingEnabled: true,
        contact: {
          whatsapp: clinicInfo.whatsapp,
          phone: clinicInfo.phone,
          phoneDisplay: clinicInfo.phoneDisplay,
          externalUrl: clinicInfo.onlineSchedulingUrl,
        },
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Expires': '0',
        'Pragma': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('Availability API Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Erro ao buscar disponibilidade. Tente novamente.',
          code: 'INTERNAL_ERROR',
        },
        timestamp: new Date().toISOString(),
      } as AvailabilityResponse,
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export { mockBookedSlots };

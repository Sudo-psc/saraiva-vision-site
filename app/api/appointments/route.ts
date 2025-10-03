/**
 * Appointments API Route
 * POST /api/appointments - Create appointment
 * GET /api/appointments - List appointments (admin only - future feature)
 *
 * Features:
 * - Zod validation
 * - Rate limiting (5 appointments per hour per IP)
 * - Conflict detection
 * - Email confirmation (Resend API)
 * - LGPD compliance
 * - Mock storage (replace with database)
 */

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createAppointmentSchema } from '@/lib/validations/api';
import { anonymizePII, checkRateLimit } from '@/lib/validations/api';
import { mockBookedSlots } from './availability/route';
import type { CreateAppointmentResponse, AppointmentData } from '@/types/appointment';

const resend = new Resend(process.env.RESEND_API_KEY);

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 3600000;

const DOCTOR_EMAIL = process.env.CONTACT_TO_EMAIL || 'philipe_cruz@outlook.com';
const FROM_EMAIL = process.env.CONTACT_EMAIL_FROM || 'contato@saraivavision.com.br';

const appointmentsStore = new Map<string, AppointmentData>();

function isSlotAvailable(date: string, time: string): boolean {
  const bookedSlots = mockBookedSlots.get(date);
  if (!bookedSlots) {
    return true;
  }
  return !bookedSlots.has(time);
}

function bookSlot(date: string, time: string): void {
  if (!mockBookedSlots.has(date)) {
    mockBookedSlots.set(date, new Set<string>());
  }
  mockBookedSlots.get(date)!.add(time);
}

export async function POST(request: NextRequest) {
  try {
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const rateLimit = checkRateLimit(
      clientIp,
      RATE_LIMIT_MAX,
      RATE_LIMIT_WINDOW,
      rateLimitStore
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Muitas tentativas de agendamento. Aguarde 1 hora antes de tentar novamente.',
            code: 'RATE_LIMIT',
          },
          timestamp: new Date().toISOString(),
        } as CreateAppointmentResponse,
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
            'X-RateLimit-Remaining': String(rateLimit.remaining),
            'X-RateLimit-Reset': String(rateLimit.resetAt),
          },
        }
      );
    }

    const body = await request.json();

    if (body.honeypot && body.honeypot.trim() !== '') {
      console.log('Spam detected via honeypot:', anonymizePII(body));
      return NextResponse.json(
        {
          success: true,
          data: {
            id: 'fake-id',
            appointment: body as AppointmentData,
            confirmationSent: true,
          },
          timestamp: new Date().toISOString(),
        } as CreateAppointmentResponse,
        { status: 200 }
      );
    }

    const validationResult = createAppointmentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Dados inválidos. Verifique os campos e tente novamente.',
            code: 'VALIDATION_ERROR',
          },
          timestamp: new Date().toISOString(),
        } as CreateAppointmentResponse,
        { status: 400 }
      );
    }

    const {
      patient_name,
      patient_email,
      patient_phone,
      appointment_date,
      appointment_time,
      notes,
    } = validationResult.data;

    if (!isSlotAvailable(appointment_date, appointment_time)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Este horário não está mais disponível. Por favor, escolha outro horário.',
            code: 'SLOT_UNAVAILABLE',
          },
          timestamp: new Date().toISOString(),
        } as CreateAppointmentResponse,
        { status: 409 }
      );
    }

    const appointmentId = `APT-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

    const appointment: AppointmentData = {
      id: appointmentId,
      patient_name,
      patient_email,
      patient_phone,
      appointment_date,
      appointment_time,
      notes: notes || '',
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    bookSlot(appointment_date, appointment_time);
    appointmentsStore.set(appointmentId, appointment);

    let confirmationSent = false;
    try {
      const emailHtml = createAppointmentEmailTemplate(appointment);
      const emailText = createAppointmentEmailText(appointment);

      const emailResponse = await resend.emails.send({
        from: FROM_EMAIL,
        to: DOCTOR_EMAIL,
        subject: `🗓️ Nova Consulta Agendada: ${patient_name}`,
        html: emailHtml,
        text: emailText,
        replyTo: patient_email,
        tags: [
          { name: 'source', value: 'website' },
          { name: 'type', value: 'appointment' },
        ],
      });

      if (!emailResponse.error) {
        confirmationSent = true;
        console.log('Appointment confirmation sent:', {
          id: emailResponse.data?.id,
          appointmentId,
          patient: anonymizePII({ email: patient_email }).email,
        });
      }
    } catch (emailError) {
      console.error('Error sending appointment confirmation:', emailError);
    }

    console.log('Appointment created:', {
      id: appointmentId,
      date: appointment_date,
      time: appointment_time,
      patient: anonymizePII({ name: patient_name, email: patient_email }),
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: appointmentId,
          appointment,
          confirmationSent,
        },
        timestamp: new Date().toISOString(),
      } as CreateAppointmentResponse,
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Appointments API Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Erro ao processar agendamento. Tente novamente em alguns minutos.',
          code: 'INTERNAL_ERROR',
        },
        timestamp: new Date().toISOString(),
      } as CreateAppointmentResponse,
      { status: 500 }
    );
  }
}

function createAppointmentEmailTemplate(appointment: AppointmentData): string {
  const { patient_name, patient_email, patient_phone, appointment_date, appointment_time, notes } = appointment;

  const formattedDate = new Date(appointment_date).toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nova Consulta Agendada</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: white;
      padding: 20px;
      border-radius: 8px 8px 0 0;
      margin: -30px -30px 20px -30px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .appointment-details {
      background-color: #dbeafe;
      border-left: 4px solid #2563eb;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
    }
    .field {
      margin-bottom: 15px;
    }
    .label {
      font-weight: 600;
      color: #555;
      display: block;
      margin-bottom: 5px;
    }
    .value {
      color: #333;
      font-size: 15px;
    }
    .notes-box {
      background-color: #f8f9fa;
      padding: 15px;
      border-left: 4px solid #6b7280;
      border-radius: 4px;
      margin-top: 10px;
      white-space: pre-wrap;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      font-size: 12px;
      color: #999;
      text-align: center;
    }
    .cta-button {
      display: inline-block;
      background-color: #2563eb;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🗓️ Nova Consulta Agendada</h1>
    </div>

    <div class="appointment-details">
      <h2 style="margin-top: 0; color: #1e40af;">Detalhes da Consulta</h2>
      <p style="margin: 0; font-size: 18px;">
        <strong>Data:</strong> ${formattedDate}<br>
        <strong>Horário:</strong> ${appointment_time}
      </p>
    </div>

    <div class="field">
      <span class="label">Paciente:</span>
      <span class="value">${patient_name}</span>
    </div>

    <div class="field">
      <span class="label">Email:</span>
      <span class="value"><a href="mailto:${patient_email}">${patient_email}</a></span>
    </div>

    <div class="field">
      <span class="label">Telefone:</span>
      <span class="value"><a href="tel:+55${patient_phone}">+55 ${patient_phone}</a></span>
    </div>

    ${notes ? `
    <div class="field">
      <span class="label">Observações:</span>
      <div class="notes-box">${notes}</div>
    </div>
    ` : ''}

    <a href="mailto:${patient_email}" class="cta-button">Confirmar Agendamento</a>

    <div class="footer">
      <p>Agendamento criado em: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>
      <p>ID da consulta: ${appointment.id}</p>
      <p>Saraiva Vision - Clínica Oftalmológica | Caratinga, MG</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function createAppointmentEmailText(appointment: AppointmentData): string {
  const { patient_name, patient_email, patient_phone, appointment_date, appointment_time, notes } = appointment;

  const formattedDate = new Date(appointment_date).toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
Nova Consulta Agendada - Saraiva Vision

DETALHES DA CONSULTA
Data: ${formattedDate}
Horário: ${appointment_time}

DADOS DO PACIENTE
Nome: ${patient_name}
Email: ${patient_email}
Telefone: +55 ${patient_phone}

${notes ? `OBSERVAÇÕES:\n${notes}\n` : ''}
---
Agendamento criado em: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
ID da consulta: ${appointment.id}
  `.trim();
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * LAAS Lead Capture API Route
 * POST /api/laas/leads - Capture lead from calculator form
 *
 * Features:
 * - Resend email integration
 * - Rate limiting (5 req/10min per IP)
 * - Zod validation
 * - LGPD compliance (data anonymization)
 * - Honeypot spam protection
 * - Estimated savings calculation
 */

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { laasLeadFormSchema, type LaasLeadResponse } from '@/lib/validations/laas';
import { anonymizePII, checkRateLimit } from '@/lib/validations/api';

const resend = new Resend(process.env.RESEND_API_KEY);

// Rate limiting storage (in-memory, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Configuration
const RATE_LIMIT_MAX = 5; // Stricter for lead capture
const RATE_LIMIT_WINDOW = 600000; // 10 min

const DOCTOR_EMAIL = process.env.CONTACT_TO_EMAIL || 'philipe_cruz@outlook.com';
const FROM_EMAIL = process.env.CONTACT_EMAIL_FROM || 'contato@saraivavision.com.br';

/**
 * POST /api/laas/leads
 * Capture lead from calculator form
 */
export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Check rate limit
    const rateLimit = checkRateLimit(
      clientIp,
      RATE_LIMIT_MAX,
      RATE_LIMIT_WINDOW,
      rateLimitStore
    );

    if (!rateLimit.allowed) {
      return NextResponse.json<LaasLeadResponse>(
        {
          success: false,
          error: 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.',
          code: 'RATE_LIMIT_EXCEEDED',
          message: '',
        },
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

    // Parse and validate request body
    const body = await request.json();

    // Honeypot check (anti-spam)
    if (body.honeypot && body.honeypot.trim() !== '') {
      console.log('LAAS spam detected via honeypot:', anonymizePII(body));
      return NextResponse.json<LaasLeadResponse>(
        {
          success: true,
          message: 'Obrigado! Em breve entraremos em contato para calcular sua economia.',
        },
        { status: 200 }
      );
    }

    const validationResult = laasLeadFormSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json<LaasLeadResponse>(
        {
          success: false,
          error: 'Dados inválidos. Verifique os campos e tente novamente.',
          message: '',
        },
        { status: 400 }
      );
    }

    const { nome, whatsapp, email } = validationResult.data;

    // Calculate estimated savings (mock data - replace with actual logic)
    const estimatedSavings = {
      monthly: 80.0, // Avg savings per month
      yearly: 960.0, // Avg savings per year
    };

    // Create email template
    const emailHtml = createLeadEmailTemplate({
      nome,
      email,
      whatsapp,
      estimatedSavings,
    });

    const emailText = `
Nova Lead LAAS - Calculadora de Economia

Nome: ${nome}
Email: ${email}
WhatsApp: +55 ${whatsapp}

Economia Estimada:
- Mensal: R$ ${estimatedSavings.monthly.toFixed(2)}
- Anual: R$ ${estimatedSavings.yearly.toFixed(2)}

---
Recebido em: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
IP: ${clientIp}
    `.trim();

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: FROM_EMAIL,
      to: DOCTOR_EMAIL,
      subject: `💰 Nova Lead LAAS: ${nome}`,
      html: emailHtml,
      text: emailText,
      replyTo: email,
      tags: [
        { name: 'source', value: 'laas-landing' },
        { name: 'type', value: 'lead-calculator' },
      ],
    });

    if (emailResponse.error) {
      console.error('Resend API Error (LAAS):', emailResponse.error);
      throw new Error('Falha ao enviar email');
    }

    // Log success (anonymized for LGPD compliance)
    console.log('LAAS lead captured:', {
      id: emailResponse.data?.id,
      email: anonymizePII({ email }).email,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json<LaasLeadResponse>(
      {
        success: true,
        message: 'Obrigado! Em breve entraremos em contato para calcular sua economia.',
        leadId: emailResponse.data?.id,
        estimatedSavings,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('LAAS Lead API Error:', error);

    if (error.message?.includes('API key')) {
      return NextResponse.json<LaasLeadResponse>(
        {
          success: false,
          error: 'Erro de configuração do servidor. Entre em contato por telefone.',
          code: 'CONFIG_ERROR',
          message: '',
        },
        { status: 500 }
      );
    }

    return NextResponse.json<LaasLeadResponse>(
      {
        success: false,
        error: 'Erro ao processar sua solicitação. Tente novamente em alguns minutos.',
        code: 'INTERNAL_ERROR',
        message: '',
      },
      { status: 500 }
    );
  }
}

/**
 * Create HTML email template for LAAS lead
 */
function createLeadEmailTemplate({
  nome,
  email,
  whatsapp,
  estimatedSavings,
}: {
  nome: string;
  email: string;
  whatsapp: string;
  estimatedSavings: { monthly: number; yearly: number };
}): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nova Lead LAAS</title>
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
      background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
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
    .field {
      margin-bottom: 20px;
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
    .savings-box {
      background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%);
      padding: 20px;
      border-left: 4px solid #22C55E;
      border-radius: 4px;
      margin-top: 20px;
    }
    .savings-box h3 {
      margin: 0 0 10px 0;
      color: #16A34A;
    }
    .savings-item {
      margin: 10px 0;
    }
    .savings-value {
      font-size: 24px;
      font-weight: 700;
      color: #15803D;
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
      background-color: #4F46E5;
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
      <h1>💰 Nova Lead LAAS</h1>
    </div>

    <div class="field">
      <span class="label">Nome:</span>
      <span class="value">${nome}</span>
    </div>

    <div class="field">
      <span class="label">Email:</span>
      <span class="value"><a href="mailto:${email}">${email}</a></span>
    </div>

    <div class="field">
      <span class="label">WhatsApp:</span>
      <span class="value"><a href="https://wa.me/55${whatsapp}">+55 ${whatsapp}</a></span>
    </div>

    <div class="savings-box">
      <h3>💵 Economia Estimada</h3>
      <div class="savings-item">
        <div class="label">Economia Mensal:</div>
        <div class="savings-value">R$ ${estimatedSavings.monthly.toFixed(2)}</div>
      </div>
      <div class="savings-item">
        <div class="label">Economia Anual:</div>
        <div class="savings-value">R$ ${estimatedSavings.yearly.toFixed(2)}</div>
      </div>
    </div>

    <a href="https://wa.me/55${whatsapp}" class="cta-button">Entrar em Contato via WhatsApp</a>

    <div class="footer">
      <p>Recebido em: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>
      <p>Saraiva Vision - LAAS (Lentes As A Service) | Caratinga, MG</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * OPTIONS handler for CORS preflight
 */
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

// Edge Runtime for faster cold starts
export const runtime = 'nodejs'; // Use nodejs for Resend SDK
export const dynamic = 'force-dynamic';

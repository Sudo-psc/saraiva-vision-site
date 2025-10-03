/**
 * Contact Form API Route
 * POST /api/contact - Send contact form email
 *
 * Features:
 * - Resend email integration
 * - Rate limiting (10 req/10min per IP)
 * - Zod validation
 * - LGPD compliance (data anonymization)
 * - Honeypot spam protection
 */

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { contactFormSchema } from '@/lib/validations/api';
import { anonymizePII, checkRateLimit } from '@/lib/validations/api';

const resend = new Resend(process.env.RESEND_API_KEY);

// Rate limiting storage (in-memory, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Configuration
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '10', 10);
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW || '600000', 10); // 10 min

const DOCTOR_EMAIL = process.env.CONTACT_TO_EMAIL || 'philipe_cruz@outlook.com';
const FROM_EMAIL = process.env.CONTACT_EMAIL_FROM || 'contato@saraivavision.com.br';

/**
 * POST /api/contact
 * Send contact form email
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
      return NextResponse.json(
        {
          success: false,
          error: 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.',
          code: 'RATE_LIMIT_EXCEEDED',
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
      console.log('Spam detected via honeypot:', anonymizePII(body));
      return NextResponse.json(
        {
          success: true,
          message: 'Mensagem enviada com sucesso!', // Fake success to confuse bots
        },
        { status: 200 }
      );
    }

    const validationResult = contactFormSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos. Verifique os campos e tente novamente.',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, phone, message } = validationResult.data;

    // Create email template
    const emailHtml = createEmailTemplate({ name, email, phone, message });

    const emailText = `
Nova Solicitação de Contato - Saraiva Vision

Nome: ${name}
Email: ${email}
Telefone: ${phone}

Mensagem:
${message}

---
Recebido em: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
IP: ${clientIp}
    `.trim();

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: FROM_EMAIL,
      to: DOCTOR_EMAIL,
      subject: `📧 Novo Contato: ${name}`,
      html: emailHtml,
      text: emailText,
      replyTo: email,
      tags: [
        { name: 'source', value: 'website' },
        { name: 'type', value: 'contact-form' },
      ],
    });

    if (emailResponse.error) {
      console.error('Resend API Error:', emailResponse.error);
      throw new Error('Falha ao enviar email');
    }

    // Log success (anonymized for LGPD compliance)
    console.log('Email enviado com sucesso:', {
      id: emailResponse.data?.id,
      to: DOCTOR_EMAIL,
      from: anonymizePII({ email }).email,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.',
        messageId: emailResponse.data?.id,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Contact API Error:', error);

    if (error.message?.includes('API key')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Erro de configuração do servidor. Entre em contato por telefone.',
          code: 'CONFIG_ERROR',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao processar sua solicitação. Tente novamente em alguns minutos.',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * Create HTML email template
 */
function createEmailTemplate({
  name,
  email,
  phone,
  message,
}: {
  name: string;
  email: string;
  phone: string;
  message: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nova Solicitação de Contato</title>
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
    .message-box {
      background-color: #f8f9fa;
      padding: 15px;
      border-left: 4px solid #667eea;
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
      background-color: #667eea;
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
      <h1>📧 Nova Solicitação de Contato</h1>
    </div>

    <div class="field">
      <span class="label">Nome:</span>
      <span class="value">${name}</span>
    </div>

    <div class="field">
      <span class="label">Email:</span>
      <span class="value"><a href="mailto:${email}">${email}</a></span>
    </div>

    <div class="field">
      <span class="label">Telefone:</span>
      <span class="value"><a href="tel:+55${phone}">+55 ${phone}</a></span>
    </div>

    <div class="field">
      <span class="label">Mensagem:</span>
      <div class="message-box">${message}</div>
    </div>

    <a href="mailto:${email}" class="cta-button">Responder por Email</a>

    <div class="footer">
      <p>Recebido em: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>
      <p>Saraiva Vision - Clínica Oftalmológica | Caratinga, MG</p>
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

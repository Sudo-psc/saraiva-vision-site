import { Resend } from 'resend';
import { randomBytes } from 'crypto';

let resend;
function getResendClient() {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

function formatPhoneNumber(phone) {
  if (!phone) return '';
  const cleaned = String(phone).replace(/\D/g, '');
  
  const digits = cleaned.replace(/^55/, '');
  
  if (digits.length === 11) {
    return `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7)}`;
  } else if (digits.length === 10) {
    return `(${digits.substring(0, 2)}) ${digits.substring(2, 6)}-${digits.substring(6)}`;
  }
  
  return phone;
}

function validateEmail(email) {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function createEmailHTML(data) {
  const { name, email, phone, message, timestamp } = data;
  const formattedPhone = formatPhoneNumber(phone);
  const formattedDate = timestamp ? new Date(timestamp).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR');

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Novo Contato - Saraiva Vision</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
  <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <div style="border-bottom: 3px solid #0066cc; padding-bottom: 20px; margin-bottom: 30px;">
      <h1 style="color: #0066cc; margin: 0; font-size: 24px;">Saraiva Vision</h1>
      <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Novo Contato do Site</p>
    </div>

    <div style="margin-bottom: 20px;">
      <h2 style="color: #333; font-size: 18px; margin-bottom: 15px;">Informações do Contato</h2>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
            <strong style="color: #666; display: block; font-size: 12px; text-transform: uppercase;">Nome</strong>
            <span style="color: #333; font-size: 16px;">${sanitizeInput(name)}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
            <strong style="color: #666; display: block; font-size: 12px; text-transform: uppercase;">E-mail</strong>
            <a href="mailto:${sanitizeInput(email)}" style="color: #0066cc; font-size: 16px; text-decoration: none;">${sanitizeInput(email)}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
            <strong style="color: #666; display: block; font-size: 12px; text-transform: uppercase;">Telefone</strong>
            <a href="tel:${sanitizeInput(phone)}" style="color: #0066cc; font-size: 16px; text-decoration: none;">${formattedPhone}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 0;">
            <strong style="color: #666; display: block; font-size: 12px; text-transform: uppercase;">Mensagem</strong>
            <p style="color: #333; font-size: 16px; margin: 10px 0; white-space: pre-wrap;">${sanitizeInput(message)}</p>
          </td>
        </tr>
      </table>
    </div>

    <div style="background-color: #f9f9f9; border-left: 4px solid #0066cc; padding: 15px; margin-top: 30px; border-radius: 4px;">
      <p style="margin: 0; font-size: 14px; color: #666;">
        <strong>Data e Hora:</strong> ${formattedDate}
      </p>
    </div>

    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
      <p style="margin: 5px 0;">
        <strong>Conformidade LGPD:</strong> Este contato foi enviado através do formulário do site com consentimento expresso do usuário para tratamento de dados pessoais conforme Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
      </p>
      <p style="margin: 5px 0; font-style: italic;">
        Esta é uma mensagem automática do sistema de contato da Saraiva Vision. Não responda este e-mail.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function createEmailText(data) {
  const { name, email, phone, message, timestamp } = data;
  const formattedPhone = formatPhoneNumber(phone);
  const formattedDate = timestamp ? new Date(timestamp).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR');

  return `
NOVO CONTATO - SARAIVA VISION
=====================================

INFORMAÇÕES DO CONTATO:

Nome: ${sanitizeInput(name)}
E-mail: ${sanitizeInput(email)}
Telefone: ${formattedPhone}

Mensagem:
${sanitizeInput(message)}

-------------------------------------

Data e Hora: ${formattedDate}

CONFORMIDADE LGPD:
Este contato foi enviado através do formulário do site com consentimento expresso do usuário para tratamento de dados pessoais conforme Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).

Esta é uma mensagem automática do sistema de contato da Saraiva Vision.
  `.trim();
}

export async function sendContactEmail(contactData, retries = 3) {
  const { name, email, phone, message, timestamp } = contactData;
  let { id } = contactData;

  if (!id) {
    id = randomBytes(16).toString('hex');
  }

  const sanitizedData = {
    name: sanitizeInput(name),
    email: sanitizeInput(email)?.toLowerCase(),
    phone: sanitizeInput(phone),
    message: sanitizeInput(message),
    timestamp,
    id
  };

  const emailPayload = {
    from: 'Saraiva Vision <contato@saraivavision.com.br>',
    to: [process.env.DOCTOR_EMAIL || 'contato@saraivavision.com.br'],
    replyTo: validateEmail(sanitizedData.email) ? sanitizedData.email : '',
    subject: `Novo contato do site - ${sanitizedData.name}`,
    html: createEmailHTML(sanitizedData),
    text: createEmailText(sanitizedData),
    headers: {
      'X-Priority': '1',
      'X-Mailer': 'SaraivaVision-ContactForm',
      'X-Contact-ID': id
    }
  };

  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await getResendClient().emails.send(emailPayload);

      if (result.error) {
        throw new Error(result.error.message || 'Resend API error');
      }

      return {
        success: true,
        messageId: result.data.id,
        contactId: id,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      lastError = error;
      
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  return {
    success: false,
    error: {
      code: 'EMAIL_SEND_FAILED',
      message: 'Failed to send email after maximum retries',
      details: lastError?.message || 'Unknown error'
    },
    contactId: id,
    timestamp: new Date().toISOString()
  };
}

export function validateEmailServiceConfig() {
  const errors = [];

  if (!process.env.RESEND_API_KEY) {
    errors.push('RESEND_API_KEY environment variable is not set');
  }

  if (!process.env.DOCTOR_EMAIL) {
    errors.push('DOCTOR_EMAIL environment variable is not set');
  } else if (!validateEmail(process.env.DOCTOR_EMAIL)) {
    errors.push('DOCTOR_EMAIL environment variable is not a valid email address');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export async function checkEmailServiceHealth() {
  const configValidation = validateEmailServiceConfig();

  if (!configValidation.isValid) {
    return {
      healthy: false,
      error: 'Configuration error',
      details: configValidation.errors
    };
  }

  try {
    const testData = {
      name: 'Health Check',
      email: 'healthcheck@example.com',
      phone: '11999999999',
      message: 'System health check',
      timestamp: new Date().toISOString()
    };

    createEmailHTML(testData);
    createEmailText(testData);

    return {
      healthy: true,
      message: 'Email service is configured correctly',
      config: {
        doctorEmail: process.env.DOCTOR_EMAIL,
        resendConfigured: !!process.env.RESEND_API_KEY
      }
    };
  } catch (error) {
    return {
      healthy: false,
      error: 'Health check failed',
      details: error.message
    };
  }
}

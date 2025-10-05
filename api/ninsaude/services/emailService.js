/**
 * Email Service - Resend API Integration for Ninsaúde Notifications
 * Handles appointment confirmation, cancellation, rescheduling, and reminder emails
 *
 * @module api/ninsaude/services/emailService
 */

import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Generate email HTML template with CFM medical disclaimers and LGPD compliance
 */
function generateEmailTemplate(data) {
  const { patientName, appointmentDate, appointmentTime, doctorName, procedure, type } = data;

  let subject = '';
  let heading = '';
  let message = '';

  switch (type) {
    case 'booking_confirmation':
      subject = `Consulta Agendada - ${appointmentDate} às ${appointmentTime}`;
      heading = 'Consulta Agendada com Sucesso';
      message = `
        <p>Olá <strong>${patientName}</strong>,</p>
        <p>Sua consulta foi agendada com sucesso!</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0066cc;">Detalhes da Consulta</h3>
          <p><strong>Data:</strong> ${appointmentDate}</p>
          <p><strong>Horário:</strong> ${appointmentTime}</p>
          <p><strong>Médico:</strong> ${doctorName}</p>
          ${procedure ? `<p><strong>Procedimento:</strong> ${procedure}</p>` : ''}
        </div>
        <p>Por favor, chegue com 10 minutos de antecedência.</p>
      `;
      break;

    case 'cancellation':
      subject = `Consulta Cancelada - ${appointmentDate}`;
      heading = 'Consulta Cancelada';
      message = `
        <p>Olá <strong>${patientName}</strong>,</p>
        <p>Sua consulta marcada para <strong>${appointmentDate} às ${appointmentTime}</strong> foi cancelada.</p>
        <p>Para reagendar, entre em contato conosco ou acesse nosso sistema de agendamento online.</p>
      `;
      break;

    case 'rescheduling':
      subject = `Consulta Reagendada - Nova data: ${appointmentDate}`;
      heading = 'Consulta Reagendada';
      message = `
        <p>Olá <strong>${patientName}</strong>,</p>
        <p>Sua consulta foi reagendada com sucesso!</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0066cc;">Nova Data e Horário</h3>
          <p><strong>Data:</strong> ${appointmentDate}</p>
          <p><strong>Horário:</strong> ${appointmentTime}</p>
          <p><strong>Médico:</strong> ${doctorName}</p>
        </div>
      `;
      break;

    case 'reminder':
      subject = `Lembrete: Consulta amanhã às ${appointmentTime}`;
      heading = 'Lembrete de Consulta';
      message = `
        <p>Olá <strong>${patientName}</strong>,</p>
        <p>Este é um lembrete da sua consulta marcada para <strong>amanhã, ${appointmentDate} às ${appointmentTime}</strong>.</p>
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <p style="margin: 0;"><strong>⏰ Não se esqueça!</strong></p>
          <p style="margin: 5px 0 0 0;">Chegue com 10 minutos de antecedência.</p>
        </div>
      `;
      break;
  }

  return {
    subject,
    html: `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #0066cc; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Saraiva Vision</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px;">Clínica Oftalmológica</p>
        </div>

        <div style="background-color: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #0066cc; margin-top: 0;">${heading}</h2>
          ${message}

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="margin: 0; font-size: 14px; color: #666;">
              <strong>Saraiva Vision - Clínica Oftalmológica</strong><br>
              Caratinga, MG, Brasil<br>
              Telefone: (33) 3321-2345<br>
              WhatsApp: (33) 99999-9999
            </p>
          </div>

          <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 8px; font-size: 12px; color: #666;">
            <p style="margin: 0 0 10px 0;"><strong>⚕️ Aviso Médico (CFM)</strong></p>
            <p style="margin: 0;">Este e-mail contém informações sobre seu agendamento médico. O atendimento médico completo só ocorre durante a consulta presencial. Em caso de emergência, procure imediatamente um pronto-socorro.</p>

            <p style="margin: 15px 0 10px 0;"><strong>🔒 LGPD - Lei Geral de Proteção de Dados</strong></p>
            <p style="margin: 0;">Seus dados pessoais são tratados com segurança e confidencialidade, conforme a Lei 13.709/2018 (LGPD). Para exercer seus direitos (acesso, correção, exclusão), entre em contato conosco.</p>
          </div>
        </div>

        <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
          <p>© ${new Date().getFullYear()} Saraiva Vision. Todos os direitos reservados.</p>
        </div>
      </body>
      </html>
    `,
    text: `
${heading.toUpperCase()}

Olá ${patientName},

${type === 'booking_confirmation' ? `Sua consulta foi agendada com sucesso!

DETALHES DA CONSULTA:
Data: ${appointmentDate}
Horário: ${appointmentTime}
Médico: ${doctorName}
${procedure ? `Procedimento: ${procedure}` : ''}

Por favor, chegue com 10 minutos de antecedência.` : ''}

${type === 'cancellation' ? `Sua consulta marcada para ${appointmentDate} às ${appointmentTime} foi cancelada.

Para reagendar, entre em contato conosco ou acesse nosso sistema de agendamento online.` : ''}

${type === 'rescheduling' ? `Sua consulta foi reagendada com sucesso!

NOVA DATA E HORÁRIO:
Data: ${appointmentDate}
Horário: ${appointmentTime}
Médico: ${doctorName}` : ''}

${type === 'reminder' ? `Este é um lembrete da sua consulta marcada para amanhã, ${appointmentDate} às ${appointmentTime}.

⏰ NÃO SE ESQUEÇA!
Chegue com 10 minutos de antecedência.` : ''}

---
Saraiva Vision - Clínica Oftalmológica
Caratinga, MG, Brasil
Telefone: (33) 3321-2345
WhatsApp: (33) 99999-9999

⚕️ AVISO MÉDICO (CFM)
Este e-mail contém informações sobre seu agendamento médico. O atendimento médico completo só ocorre durante a consulta presencial. Em caso de emergência, procure imediatamente um pronto-socorro.

🔒 LGPD - Lei Geral de Proteção de Dados
Seus dados pessoais são tratados com segurança e confidencialidade, conforme a Lei 13.709/2018 (LGPD). Para exercer seus direitos (acesso, correção, exclusão), entre em contato conosco.

© ${new Date().getFullYear()} Saraiva Vision. Todos os direitos reservados.
    `.trim()
  };
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmation(appointmentData) {
  const { patientEmail, patientName, appointmentDate, appointmentTime, doctorName, procedure } = appointmentData;

  const template = generateEmailTemplate({
    patientName,
    appointmentDate,
    appointmentTime,
    doctorName,
    procedure,
    type: 'booking_confirmation'
  });

  try {
    const result = await resend.emails.send({
      from: 'Saraiva Vision <agendamento@saraivavision.com.br>',
      to: [patientEmail],
      subject: template.subject,
      html: template.html,
      text: template.text,
      headers: {
        'X-Entity-Ref-ID': crypto.randomBytes(16).toString('hex'),
        'X-Notification-Type': 'booking_confirmation'
      }
    });

    return {
      success: true,
      messageId: result.data?.id || result.id,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    return {
      success: false,
      error: {
        code: 'EMAIL_SEND_FAILED',
        message: 'Failed to send booking confirmation email',
        details: error.message
      }
    };
  }
}

/**
 * Send cancellation notice email
 */
export async function sendCancellationNotice(appointmentData) {
  const { patientEmail, patientName, appointmentDate, appointmentTime, doctorName } = appointmentData;

  const template = generateEmailTemplate({
    patientName,
    appointmentDate,
    appointmentTime,
    doctorName,
    type: 'cancellation'
  });

  try {
    const result = await resend.emails.send({
      from: 'Saraiva Vision <agendamento@saraivavision.com.br>',
      to: [patientEmail],
      subject: template.subject,
      html: template.html,
      text: template.text,
      headers: {
        'X-Entity-Ref-ID': crypto.randomBytes(16).toString('hex'),
        'X-Notification-Type': 'cancellation'
      }
    });

    return {
      success: true,
      messageId: result.data?.id || result.id,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error sending cancellation email:', error);
    return {
      success: false,
      error: {
        code: 'EMAIL_SEND_FAILED',
        message: 'Failed to send cancellation email',
        details: error.message
      }
    };
  }
}

/**
 * Send rescheduling notice email
 */
export async function sendReschedulingNotice(appointmentData) {
  const { patientEmail, patientName, appointmentDate, appointmentTime, doctorName } = appointmentData;

  const template = generateEmailTemplate({
    patientName,
    appointmentDate,
    appointmentTime,
    doctorName,
    type: 'rescheduling'
  });

  try {
    const result = await resend.emails.send({
      from: 'Saraiva Vision <agendamento@saraivavision.com.br>',
      to: [patientEmail],
      subject: template.subject,
      html: template.html,
      text: template.text,
      headers: {
        'X-Entity-Ref-ID': crypto.randomBytes(16).toString('hex'),
        'X-Notification-Type': 'rescheduling'
      }
    });

    return {
      success: true,
      messageId: result.data?.id || result.id,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error sending rescheduling email:', error);
    return {
      success: false,
      error: {
        code: 'EMAIL_SEND_FAILED',
        message: 'Failed to send rescheduling email',
        details: error.message
      }
    };
  }
}

/**
 * Send appointment reminder email
 */
export async function sendReminder(appointmentData) {
  const { patientEmail, patientName, appointmentDate, appointmentTime, doctorName } = appointmentData;

  const template = generateEmailTemplate({
    patientName,
    appointmentDate,
    appointmentTime,
    doctorName,
    type: 'reminder'
  });

  try {
    const result = await resend.emails.send({
      from: 'Saraiva Vision <agendamento@saraivavision.com.br>',
      to: [patientEmail],
      subject: template.subject,
      html: template.html,
      text: template.text,
      headers: {
        'X-Entity-Ref-ID': crypto.randomBytes(16).toString('hex'),
        'X-Notification-Type': 'reminder'
      }
    });

    return {
      success: true,
      messageId: result.data?.id || result.id,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error sending reminder email:', error);
    return {
      success: false,
      error: {
        code: 'EMAIL_SEND_FAILED',
        message: 'Failed to send reminder email',
        details: error.message
      }
    };
  }
}

/**
 * WhatsApp Service - Evolution API Integration for Ninsaúde Notifications
 * Handles appointment notifications via WhatsApp using self-hosted Evolution API
 *
 * @module api/ninsaude/services/whatsappService
 */

import axios from 'axios';

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
const EVOLUTION_INSTANCE_NAME = process.env.EVOLUTION_INSTANCE_NAME || 'saraiva_vision';

/**
 * Format Brazilian phone number to WhatsApp format (+5533999999999)
 * @param {string} phone - Phone number in various formats
 * @returns {string} Formatted phone number
 */
function formatPhoneNumber(phone) {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // Add country code if not present
  if (!cleaned.startsWith('55')) {
    return `55${cleaned}`;
  }

  return cleaned;
}

/**
 * Generate WhatsApp message template
 */
function generateWhatsAppMessage(data) {
  const { patientName, appointmentDate, appointmentTime, doctorName, procedure, type } = data;

  let message = '';

  switch (type) {
    case 'booking_confirmation':
      message = `
✅ *Consulta Agendada com Sucesso*

Olá *${patientName}*!

Sua consulta foi agendada:

📅 *Data:* ${appointmentDate}
🕐 *Horário:* ${appointmentTime}
👨‍⚕️ *Médico:* ${doctorName}
${procedure ? `🏥 *Procedimento:* ${procedure}` : ''}

⚠️ Por favor, chegue com 10 minutos de antecedência.

_Saraiva Vision - Clínica Oftalmológica_
_Caratinga, MG_
      `.trim();
      break;

    case 'cancellation':
      message = `
❌ *Consulta Cancelada*

Olá *${patientName}*,

Sua consulta marcada para *${appointmentDate} às ${appointmentTime}* foi cancelada.

Para reagendar, entre em contato conosco ou acesse nosso sistema de agendamento online.

_Saraiva Vision - Clínica Oftalmológica_
_Caratinga, MG_
      `.trim();
      break;

    case 'rescheduling':
      message = `
🔄 *Consulta Reagendada*

Olá *${patientName}*!

Sua consulta foi reagendada com sucesso:

📅 *Nova Data:* ${appointmentDate}
🕐 *Novo Horário:* ${appointmentTime}
👨‍⚕️ *Médico:* ${doctorName}

⚠️ Por favor, chegue com 10 minutos de antecedência.

_Saraiva Vision - Clínica Oftalmológica_
_Caratinga, MG_
      `.trim();
      break;

    case 'reminder':
      message = `
⏰ *Lembrete de Consulta*

Olá *${patientName}*!

Este é um lembrete da sua consulta marcada para *amanhã, ${appointmentDate} às ${appointmentTime}*.

👨‍⚕️ *Médico:* ${doctorName}

⚠️ *Não se esqueça!*
Chegue com 10 minutos de antecedência.

_Saraiva Vision - Clínica Oftalmológica_
_Caratinga, MG_
      `.trim();
      break;
  }

  return message;
}

/**
 * Send WhatsApp message via Evolution API
 */
async function sendWhatsAppMessage(phone, message) {
  const formattedPhone = formatPhoneNumber(phone);

  try {
    const response = await axios.post(
      `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE_NAME}`,
      {
        number: formattedPhone,
        text: message
      },
      {
        headers: {
          'apikey': EVOLUTION_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      messageId: response.data?.key?.id || response.data?.messageId,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error.response?.data || error.message);
    return {
      success: false,
      error: {
        code: 'WHATSAPP_SEND_FAILED',
        message: 'Failed to send WhatsApp message',
        details: error.response?.data?.message || error.message
      }
    };
  }
}

/**
 * Send booking confirmation via WhatsApp
 */
export async function sendBookingConfirmation(appointmentData) {
  const { patientPhone, patientName, appointmentDate, appointmentTime, doctorName, procedure } = appointmentData;

  const message = generateWhatsAppMessage({
    patientName,
    appointmentDate,
    appointmentTime,
    doctorName,
    procedure,
    type: 'booking_confirmation'
  });

  return await sendWhatsAppMessage(patientPhone, message);
}

/**
 * Send cancellation notice via WhatsApp
 */
export async function sendCancellationNotice(appointmentData) {
  const { patientPhone, patientName, appointmentDate, appointmentTime, doctorName } = appointmentData;

  const message = generateWhatsAppMessage({
    patientName,
    appointmentDate,
    appointmentTime,
    doctorName,
    type: 'cancellation'
  });

  return await sendWhatsAppMessage(patientPhone, message);
}

/**
 * Send rescheduling notice via WhatsApp
 */
export async function sendReschedulingNotice(appointmentData) {
  const { patientPhone, patientName, appointmentDate, appointmentTime, doctorName } = appointmentData;

  const message = generateWhatsAppMessage({
    patientName,
    appointmentDate,
    appointmentTime,
    doctorName,
    type: 'rescheduling'
  });

  return await sendWhatsAppMessage(patientPhone, message);
}

/**
 * Send appointment reminder via WhatsApp
 */
export async function sendReminder(appointmentData) {
  const { patientPhone, patientName, appointmentDate, appointmentTime, doctorName } = appointmentData;

  const message = generateWhatsAppMessage({
    patientName,
    appointmentDate,
    appointmentTime,
    doctorName,
    type: 'reminder'
  });

  return await sendWhatsAppMessage(patientPhone, message);
}

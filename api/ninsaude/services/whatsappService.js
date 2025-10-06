import axios from 'axios';

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
const EVOLUTION_INSTANCE_NAME = process.env.EVOLUTION_INSTANCE_NAME || 'saraiva_vision';

if (!EVOLUTION_API_URL) {
  throw new Error('Missing required environment variable: EVOLUTION_API_URL');
}
if (!EVOLUTION_API_KEY) {
  throw new Error('Missing required environment variable: EVOLUTION_API_KEY');
}

function formatPhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') {
    return null;
  }
  
  const cleaned = phone.trim().replace(/\D/g, '');
  
  if (!cleaned) {
    return null;
  }
  
  if (cleaned.startsWith('55')) {
    if (cleaned.length === 12 || cleaned.length === 13) {
      return cleaned;
    }
    return null;
  }
  
  if (cleaned.length === 10 || cleaned.length === 11) {
    return `55${cleaned}`;
  }
  
  return null;
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

import express from 'express';
import rateLimit from 'express-rate-limit';
import { Resend } from 'resend';
import { logger } from '../utils/logger.js';
import { validateEmail as isValidEmail } from '../utils/validation.js';

const router = express.Router();

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Rate limiting para agendamentos
const agendamentoLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 agendamentos por hora por IP
  message: {
    success: false,
    message: 'Muitos agendamentos em pouco tempo. Por favor, aguarde antes de tentar novamente.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Sanitizes a string by removing potentially malicious content.
 * @param {string} str The string to sanitize.
 * @returns {string} The sanitized string.
 * @private
 */
const sanitize = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

/**
 * Validates the appointment scheduling data.
 * @param {object} data The appointment data to validate.
 * @returns {{isValid: boolean, errors: string[]}} An object containing the validation result.
 * @private
 */
const validateAgendamento = (data) => {
  const errors = [];

  // Nome
  if (!data.nome || data.nome.trim().length < 3) {
    errors.push('Nome deve ter pelo menos 3 caracteres');
  }

  // Telefone
  if (!data.telefone) {
    errors.push('Telefone é obrigatório');
  } else if (!/^\(\d{2}\) \d{4,5}-\d{4}$/.test(data.telefone)) {
    errors.push('Telefone em formato inválido');
  }

  // Motivo
  if (!data.motivo) {
    errors.push('Motivo da consulta é obrigatório');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Generates the HTML for the appointment notification email sent to the doctor.
 * @param {object} data The appointment data.
 * @returns {string} The HTML content of the email.
 * @private
 */
const generateDoctorEmail = (data) => {
  const { nome, telefone, motivo, convenio, variant, timestamp } = data;
  const formattedDate = new Date(timestamp).toLocaleString('pt-BR');

  const motivoLabels = {
    'primeira-consulta': 'Primeira Consulta',
    'retorno': 'Retorno',
    'exame-vista': 'Exame de Vista para Óculos',
    'lentes-contato': 'Lentes de Contato',
    'cirurgia': 'Cirurgia (Catarata, Pterígio, etc.)',
    'olho-seco': 'Olho Seco / Meibografia',
    'glaucoma': 'Glaucoma',
    'urgencia': 'Urgência Oftalmológica',
    'outro': 'Outro'
  };

  const motivoText = motivoLabels[motivo] || motivo;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Novo Agendamento - Formulário Otimizado</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">

    <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 25px; color: white;">
      <h1 style="margin: 0; font-size: 22px;">✅ Novo Agendamento Recebido</h1>
      <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">
        ${variant === 'B' ? 'Formulário Versão B (4 campos)' : 'Formulário Versão A (3 campos)'}
      </p>
    </div>

    <div style="padding: 30px;">

      <!-- Dados do Paciente -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
            <strong style="color: #64748b; font-size: 12px; text-transform: uppercase; display: block;">Nome</strong>
            <span style="color: #1e293b; font-size: 16px;">${sanitize(nome)}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
            <strong style="color: #64748b; font-size: 12px; text-transform: uppercase; display: block;">Telefone/WhatsApp</strong>
            <a href="tel:${sanitize(telefone.replace(/\D/g, ''))}" style="color: #0284c7; font-size: 16px; text-decoration: none;">
              ${sanitize(telefone)}
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
            <strong style="color: #64748b; font-size: 12px; text-transform: uppercase; display: block;">Motivo da Consulta</strong>
            <span style="color: #1e293b; font-size: 16px;">${motivoText}</span>
          </td>
        </tr>
        ${convenio ? `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
            <strong style="color: #64748b; font-size: 12px; text-transform: uppercase; display: block;">Convênio</strong>
            <span style="color: #1e293b; font-size: 16px;">${sanitize(convenio)}</span>
          </td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 12px 0;">
            <strong style="color: #64748b; font-size: 12px; text-transform: uppercase; display: block;">Data/Hora</strong>
            <span style="color: #1e293b; font-size: 14px;">${formattedDate}</span>
          </td>
        </tr>
      </table>

      <!-- Call to Action -->
      <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 20px; border-radius: 8px; text-align: center;">
        <p style="margin: 0 0 15px 0; color: #065f46; font-size: 14px; font-weight: 600;">
          📞 Próxima Ação: Entrar em contato em até 2 horas úteis
        </p>
        <a href="https://wa.me/55${sanitize(telefone.replace(/\D/g, ''))}?text=Olá ${sanitize(nome)}, sou da Saraiva Vision. Recebi seu agendamento e gostaria de confirmar..."
           style="display: inline-block; background-color: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">
          Contatar via WhatsApp
        </a>
      </div>

    </div>

    <div style="background-color: #f8fafc; padding: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
      <p style="margin: 0 0 5px 0;">
        <strong>LGPD:</strong> Dados coletados com consentimento para agendamento de consulta.
      </p>
      <p style="margin: 0;">
        Sistema de Agendamento Otimizado - Saraiva Vision
      </p>
    </div>

  </div>
</body>
</html>
  `.trim();
};

/**
 * Sends appointment data to a Google Sheets webhook.
 * @param {object} data The appointment data.
 * @returns {Promise<{success: boolean, message?: string, error?: string}>} The result of the operation.
 * @private
 */
const sendToGoogleSheets = async (data) => {
  // Se você tiver um webhook do Google Sheets configurado
  const GOOGLE_SHEETS_WEBHOOK = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  if (!GOOGLE_SHEETS_WEBHOOK) {
    logger.warn('Google Sheets webhook não configurado');
    return { success: false, message: 'Webhook não configurado' };
  }

  try {
    const response = await fetch(GOOGLE_SHEETS_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        timestamp: data.timestamp,
        nome: data.nome,
        telefone: data.telefone,
        motivo: data.motivo,
        convenio: data.convenio || 'Não informado',
        variant: data.variant
      })
    });

    if (!response.ok) {
      throw new Error('Erro ao enviar para Google Sheets');
    }

    return { success: true };
  } catch (error) {
    logger.error('Erro ao enviar para Google Sheets:', error);
    return { success: false, error: error.message };
  }
};

/**
 * @swagger
 * /api/agendamento-otimizado:
 *   post:
 *     summary: Receives an optimized appointment scheduling request.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               telefone:
 *                 type: string
 *               motivo:
 *                 type: string
 *               convenio:
 *                 type: string
 *               variant:
 *                 type: string
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: The appointment was received successfully.
 *       400:
 *         description: Bad request. Invalid data.
 *       429:
 *         description: Too many requests.
 *       500:
 *         description: Internal server error.
 */
router.post('/', agendamentoLimiter, async (req, res) => {
  try {
    const { nome, telefone, motivo, convenio, variant, timestamp } = req.body;

    // Validar dados
    const validation = validateAgendamento({ nome, telefone, motivo });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: validation.errors
      });
    }

    const sanitizedData = {
      nome: sanitize(nome),
      telefone: sanitize(telefone),
      motivo: sanitize(motivo),
      convenio: convenio ? sanitize(convenio) : null,
      variant: variant || 'A',
      timestamp: timestamp || new Date().toISOString(),
      ip: req.ip,
      id: `AGEND-${Date.now()}`
    };

    // Log
    logger.info('Agendamento otimizado recebido', {
      id: sanitizedData.id,
      nome: sanitizedData.nome,
      telefone: sanitizedData.telefone,
      motivo: sanitizedData.motivo,
      variant: sanitizedData.variant
    });

    // Envia email para médico
    try {
      await resend.emails.send({
        from: 'Saraiva Vision <contato@saraivavision.com.br>',
        to: process.env.DOCTOR_EMAIL || 'philipe_cruz@outlook.com',
        subject: `Novo Agendamento - ${sanitizedData.nome}`,
        html: generateDoctorEmail(sanitizedData),
        headers: {
          'X-Agendamento-ID': sanitizedData.id,
          'X-Form-Variant': sanitizedData.variant,
          'X-Priority': motivo === 'urgencia' ? '1' : '3'
        }
      });

      logger.info('Email de agendamento enviado', {
        id: sanitizedData.id
      });
    } catch (emailError) {
      logger.error('Erro ao enviar email de agendamento', {
        error: emailError.message,
        id: sanitizedData.id
      });
      // Continua mesmo se email falhar
    }

    // Envia para Google Sheets (opcional)
    const sheetsResult = await sendToGoogleSheets(sanitizedData);

    if (!sheetsResult.success) {
      logger.warn('Google Sheets sync falhou', {
        id: sanitizedData.id,
        error: sheetsResult.error
      });
    }

    // Armazena em memória (em produção, usar banco de dados)
    if (!global.agendamentosOtimizados) {
      global.agendamentosOtimizados = [];
    }

    global.agendamentosOtimizados.push(sanitizedData);

    // Mantém apenas últimos 1000
    if (global.agendamentosOtimizados.length > 1000) {
      global.agendamentosOtimizados = global.agendamentosOtimizados.slice(-1000);
    }

    // Resposta de sucesso
    res.status(201).json({
      success: true,
      message: 'Agendamento recebido com sucesso! Entraremos em contato em breve.',
      id: sanitizedData.id
    });

  } catch (error) {
    logger.error('Erro ao processar agendamento otimizado', {
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      message: 'Erro ao processar agendamento. Por favor, tente novamente ou entre em contato por telefone.'
    });
  }
});

/**
 * @swagger
 * /api/agendamento-otimizado/stats:
 *   get:
 *     summary: Retrieves statistics for optimized appointments. This is an admin-only endpoint.
 *     responses:
 *       200:
 *         description: The statistics were retrieved successfully.
 *       500:
 *         description: Internal server error.
 */
router.get('/stats', async (req, res) => {
  try {
    if (!global.agendamentosOtimizados) {
      global.agendamentosOtimizados = [];
    }

    const total = global.agendamentosOtimizados.length;

    // Por variante
    const porVariante = {
      A: global.agendamentosOtimizados.filter(a => a.variant === 'A').length,
      B: global.agendamentosOtimizados.filter(a => a.variant === 'B').length
    };

    // Por motivo
    const porMotivo = {};
    global.agendamentosOtimizados.forEach(a => {
      porMotivo[a.motivo] = (porMotivo[a.motivo] || 0) + 1;
    });

    // Taxa de conversão por variante (precisa GA4 data)
    const taxasConversao = {
      A: total > 0 ? ((porVariante.A / total) * 100).toFixed(2) : 0,
      B: total > 0 ? ((porVariante.B / total) * 100).toFixed(2) : 0
    };

    res.json({
      success: true,
      stats: {
        total,
        porVariante,
        porMotivo,
        taxasConversao,
        ultimoAgendamento: global.agendamentosOtimizados[total - 1]?.timestamp || null
      }
    });
  } catch (error) {
    logger.error('Erro ao buscar estatísticas', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas.'
    });
  }
});

export default router;

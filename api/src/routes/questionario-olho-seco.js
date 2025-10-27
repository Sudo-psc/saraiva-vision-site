import express from 'express';
import rateLimit from 'express-rate-limit';
import { Resend } from 'resend';
import { logger } from '../utils/logger.js';
import { validateEmail as isValidEmail } from '../utils/validation.js';

const router = express.Router();

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Rate limiting for questionnaire submissions
const questionarioLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 submissions per hour per IP
  message: {
    success: false,
    message: 'Muitos questionários enviados. Por favor, aguarde antes de tentar novamente.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Sanitize user input
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
 * Validate questionnaire data
 */
const validateQuestionarioData = (data) => {
  const errors = [];

  // Required fields
  if (!data.nome || data.nome.trim().length < 3) {
    errors.push('Nome deve ter pelo menos 3 caracteres');
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Email inválido');
  }

  if (!data.telefone || data.telefone.trim().length < 10) {
    errors.push('Telefone inválido');
  }

  if (typeof data.score !== 'number' || data.score < 0 || data.score > 40) {
    errors.push('Score inválido');
  }

  if (!data.nivel || !['baixo', 'moderado', 'alto', 'muito-alto'].includes(data.nivel)) {
    errors.push('Nível de risco inválido');
  }

  if (!data.respostas || typeof data.respostas !== 'object') {
    errors.push('Respostas inválidas');
  }

  if (!data.aceitaContato) {
    errors.push('É necessário aceitar o recebimento de informações');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Get risk level data
 */
const getRiskLevelData = (nivel) => {
  const data = {
    'baixo': {
      titulo: 'Baixo Risco',
      descricao: 'Seus olhos parecem saudáveis!',
      cor: '#10b981'
    },
    'moderado': {
      titulo: 'Risco Moderado',
      descricao: 'Atenção: Sinais Iniciais de Olho Seco',
      cor: '#f59e0b'
    },
    'alto': {
      titulo: 'Alto Risco',
      descricao: 'Importante: Sintomas Significativos de Olho Seco',
      cor: '#f97316'
    },
    'muito-alto': {
      titulo: 'Risco Muito Alto',
      descricao: 'Urgente: Procure Avaliação Oftalmológica',
      cor: '#ef4444'
    }
  };

  return data[nivel] || data['baixo'];
};

/**
 * Generate HTML email for user
 */
const generateUserEmailHTML = (data) => {
  const { nome, score, nivel } = data;
  const riskData = getRiskLevelData(nivel);
  const promocao = nivel !== 'baixo';

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resultado do Questionário de Olho Seco</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f0f9ff;">
  <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 28px;">Saraiva Vision</h1>
      <p style="color: #e0f2fe; margin: 0; font-size: 16px;">Resultado do Questionário de Olho Seco</p>
    </div>

    <!-- Saudação -->
    <div style="padding: 30px;">
      <p style="font-size: 18px; margin: 0 0 20px 0;">Olá, <strong>${sanitize(nome)}</strong>!</p>
      <p style="color: #666; margin: 0 0 30px 0;">
        Obrigado por realizar nosso questionário de autoavaliação de olho seco.
        Aqui está seu resultado detalhado:
      </p>

      <!-- Resultado -->
      <div style="background-color: #f8fafc; border-left: 4px solid ${riskData.cor}; padding: 20px; margin-bottom: 30px; border-radius: 8px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
          <h2 style="color: ${riskData.cor}; margin: 0; font-size: 20px;">${riskData.titulo}</h2>
          <span style="background-color: ${riskData.cor}; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 18px;">
            ${score}/40
          </span>
        </div>
        <p style="color: #475569; margin: 0; font-size: 16px;">${riskData.descricao}</p>
      </div>

      <!-- Recomendações por Nível -->
      ${nivel === 'baixo' ? `
        <div style="background-color: #ecfdf5; border: 1px solid #d1fae5; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="color: #059669; margin: 0 0 15px 0; font-size: 18px;">Recomendações:</h3>
          <ul style="color: #065f46; margin: 0; padding-left: 20px;">
            <li>Continue mantendo bons hábitos de saúde ocular</li>
            <li>Faça pausas regulares ao usar telas (regra 20-20-20)</li>
            <li>Mantenha-se hidratado</li>
            <li>Realize exames oftalmológicos anuais de rotina</li>
          </ul>
        </div>
      ` : ''}

      ${nivel === 'moderado' ? `
        <div style="background-color: #fffbeb; border: 1px solid #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="color: #d97706; margin: 0 0 15px 0; font-size: 18px;">O que fazer:</h3>
          <ul style="color: #92400e; margin: 0; padding-left: 20px;">
            <li>Considere uma avaliação oftalmológica em breve</li>
            <li>Implemente hábitos de prevenção imediatamente</li>
            <li>Monitore a evolução dos sintomas</li>
            <li>Considere realizar meibografia para diagnóstico preciso</li>
          </ul>
        </div>
      ` : ''}

      ${nivel === 'alto' ? `
        <div style="background-color: #fff7ed; border: 1px solid #fed7aa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="color: #ea580c; margin: 0 0 15px 0; font-size: 18px;">Ação Recomendada:</h3>
          <ul style="color: #9a3412; margin: 0; padding-left: 20px;">
            <li>Agende uma avaliação oftalmológica o quanto antes</li>
            <li>Meibografia pode identificar disfunção glandular precoce</li>
            <li>Tratamentos eficazes estão disponíveis</li>
            <li>Não deixe os sintomas piorarem</li>
          </ul>
        </div>
      ` : ''}

      ${nivel === 'muito-alto' ? `
        <div style="background-color: #fef2f2; border: 2px solid #fecaca; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="color: #dc2626; margin: 0 0 15px 0; font-size: 18px;">⚠️ Ação Urgente Necessária:</h3>
          <ul style="color: #991b1b; margin: 0; padding-left: 20px; font-weight: 500;">
            <li>Agende uma consulta nos próximos dias</li>
            <li>Considere realizar meibografia para diagnóstico detalhado</li>
            <li>Evite automedicação</li>
            <li>Prepare-se para discutir todos os sintomas com seu médico</li>
          </ul>
        </div>
      ` : ''}

      <!-- Promoção (se aplicável) -->
      ${promocao ? `
        <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 25px; border-radius: 12px; margin-bottom: 30px; text-align: center;">
          <h3 style="color: #ffffff; margin: 0 0 10px 0; font-size: 22px;">🎉 Promoção Especial Outubro</h3>
          <p style="color: #d1fae5; margin: 0 0 15px 0; font-size: 28px; font-weight: bold;">R$ 100 OFF</p>
          <p style="color: #ecfdf5; margin: 0 0 20px 0; font-size: 16px;">
            no exame de <strong>Meibografia</strong>
          </p>
          <p style="color: #f0fdf4; margin: 0; font-size: 14px; line-height: 1.6;">
            A meibografia é um exame não invasivo que permite visualizar
            as glândulas de Meibômio e identificar disfunções precocemente.
          </p>
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">
            <p style="color: #f0fdf4; margin: 0; font-size: 14px;">
              Use o código: <strong style="background-color: rgba(255,255,255,0.2); padding: 5px 10px; border-radius: 4px;">OUTUBRO100</strong>
            </p>
          </div>
        </div>
      ` : ''}

      <!-- CTA -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://wa.me/553333212293?text=Olá! Fiz o questionário de olho seco e gostaria de agendar uma consulta."
           style="display: inline-block; background-color: #0284c7; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          Agendar Consulta via WhatsApp
        </a>
      </div>

      <!-- Informações Adicionais -->
      <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin-top: 30px;">
        <h3 style="color: #334155; margin: 0 0 15px 0; font-size: 16px;">📍 Endereço da Clínica</h3>
        <p style="color: #475569; margin: 0; font-size: 14px; line-height: 1.6;">
          Rua Coronel Manoel Alves, 555 - Centro<br>
          Caratinga, MG - CEP 35300-035
        </p>
      </div>

      <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin-top: 15px;">
        <h3 style="color: #334155; margin: 0 0 15px 0; font-size: 16px;">📞 Contato</h3>
        <p style="color: #475569; margin: 0; font-size: 14px; line-height: 1.6;">
          Telefone: (33) 3321-2293<br>
          WhatsApp: (33) 99999-9999<br>
          Email: contato@saraivavision.com.br
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8fafc; padding: 25px 30px; border-top: 1px solid #e2e8f0;">
      <p style="color: #64748b; margin: 0 0 10px 0; font-size: 12px;">
        <strong>Aviso Médico:</strong> Este questionário é apenas uma ferramenta de triagem
        e não substitui consulta médica. Apenas um oftalmologista pode dar diagnóstico definitivo.
      </p>
      <p style="color: #94a3b8; margin: 0; font-size: 11px;">
        <strong>LGPD:</strong> Seus dados são tratados com segurança conforme a Lei Geral de Proteção
        de Dados. Você pode solicitar a exclusão dos seus dados a qualquer momento.
      </p>
      <p style="color: #cbd5e1; margin: 15px 0 0 0; font-size: 11px; text-align: center;">
        © ${new Date().getFullYear()} Saraiva Vision - Todos os direitos reservados<br>
        Dr. Philipe Saraiva Cruz - CRM-MG 12345
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
};

/**
 * Generate notification email for doctor
 */
const generateDoctorEmailHTML = (data) => {
  const { nome, email, telefone, idade, score, nivel, timestamp } = data;
  const riskData = getRiskLevelData(nivel);
  const formattedDate = new Date(timestamp).toLocaleString('pt-BR');

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Novo Questionário de Olho Seco</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">

    <div style="background-color: #0284c7; padding: 25px; color: white;">
      <h1 style="margin: 0; font-size: 22px;">Novo Questionário de Olho Seco</h1>
      <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">Campanha Outubro - Meibografia</p>
    </div>

    <div style="padding: 30px;">

      <!-- Score e Nível de Risco -->
      <div style="background-color: #f8fafc; border-left: 4px solid ${riskData.cor}; padding: 20px; margin-bottom: 25px; border-radius: 4px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <h2 style="margin: 0; color: ${riskData.cor}; font-size: 18px;">${riskData.titulo}</h2>
            <p style="margin: 5px 0 0 0; color: #64748b;">Score: <strong style="font-size: 24px;">${score}/40</strong></p>
          </div>
        </div>
      </div>

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
            <strong style="color: #64748b; font-size: 12px; text-transform: uppercase; display: block;">Email</strong>
            <a href="mailto:${sanitize(email)}" style="color: #0284c7; font-size: 16px; text-decoration: none;">${sanitize(email)}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
            <strong style="color: #64748b; font-size: 12px; text-transform: uppercase; display: block;">Telefone</strong>
            <a href="tel:${sanitize(telefone)}" style="color: #0284c7; font-size: 16px; text-decoration: none;">${sanitize(telefone)}</a>
          </td>
        </tr>
        ${idade ? `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
            <strong style="color: #64748b; font-size: 12px; text-transform: uppercase; display: block;">Idade</strong>
            <span style="color: #1e293b; font-size: 16px;">${sanitize(idade)} anos</span>
          </td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 12px 0;">
            <strong style="color: #64748b; font-size: 12px; text-transform: uppercase; display: block;">Data</strong>
            <span style="color: #1e293b; font-size: 14px;">${formattedDate}</span>
          </td>
        </tr>
      </table>

      <!-- Call to Action -->
      <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 20px; border-radius: 8px; text-align: center;">
        <p style="margin: 0 0 15px 0; color: #065f46; font-size: 14px;">
          ${nivel === 'muito-alto' ? '🚨 <strong>URGENTE:</strong> Paciente com sintomas severos' :
            nivel === 'alto' ? '⚠️ <strong>IMPORTANTE:</strong> Paciente com sintomas significativos' :
            nivel === 'moderado' ? 'ℹ️ Paciente com sinais iniciais de olho seco' :
            '✅ Paciente com baixo risco'}
        </p>
        <a href="https://wa.me/55${sanitize(telefone).replace(/\D/g, '')}?text=Olá ${sanitize(nome)}, sou Dr. Philipe da Saraiva Vision. Vi que você realizou nosso questionário de olho seco..."
           style="display: inline-block; background-color: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">
          Entrar em Contato via WhatsApp
        </a>
      </div>

    </div>

    <div style="background-color: #f8fafc; padding: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
      <p style="margin: 0 0 5px 0;">
        <strong>LGPD:</strong> Paciente consentiu com o tratamento de dados conforme LGPD.
      </p>
      <p style="margin: 0;">
        Sistema de Questionário de Olho Seco - Saraiva Vision
      </p>
    </div>

  </div>
</body>
</html>
  `.trim();
};

/**
 * POST /api/questionario-olho-seco
 * Submit questionnaire and send emails
 */
router.post('/', questionarioLimiter, async (req, res) => {
  try {
    const { nome, email, telefone, idade, score, nivel, respostas, aceitaContato, timestamp } = req.body;

    // Validate input
    const validation = validateQuestionarioData({
      nome,
      email,
      telefone,
      score,
      nivel,
      respostas,
      aceitaContato
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: validation.errors
      });
    }

    const sanitizedData = {
      nome: sanitize(nome),
      email: sanitize(email).toLowerCase(),
      telefone: sanitize(telefone),
      idade: idade ? sanitize(idade) : null,
      score,
      nivel,
      respostas,
      timestamp: timestamp || new Date().toISOString(),
      ip: req.ip,
      id: `QUEST-${Date.now()}`
    };

    // Log submission
    logger.info('Questionário de olho seco recebido', {
      id: sanitizedData.id,
      nome: sanitizedData.nome,
      email: sanitizedData.email,
      score: sanitizedData.score,
      nivel: sanitizedData.nivel,
      timestamp: sanitizedData.timestamp
    });

    // Send email to user
    try {
      await resend.emails.send({
        from: 'Saraiva Vision <contato@saraivavision.com.br>',
        to: sanitizedData.email,
        subject: `Resultado do seu Questionário de Olho Seco - Score: ${score}/40`,
        html: generateUserEmailHTML(sanitizedData),
        headers: {
          'X-Questionario-ID': sanitizedData.id,
          'X-Mailer': 'SaraivaVision-QuestionarioOlhoSeco'
        }
      });

      logger.info('Email de resultado enviado para usuário', {
        id: sanitizedData.id,
        email: sanitizedData.email
      });
    } catch (emailError) {
      logger.error('Erro ao enviar email para usuário', {
        error: emailError.message,
        id: sanitizedData.id
      });
      // Continue execution even if user email fails
    }

    // Send notification to doctor
    try {
      await resend.emails.send({
        from: 'Saraiva Vision <contato@saraivavision.com.br>',
        to: process.env.DOCTOR_EMAIL || 'philipe_cruz@outlook.com',
        replyTo: sanitizedData.email,
        subject: `[${getRiskLevelData(nivel).titulo}] Novo Questionário - ${sanitize(nome)}`,
        html: generateDoctorEmailHTML(sanitizedData),
        headers: {
          'X-Priority': nivel === 'muito-alto' || nivel === 'alto' ? '1' : '3',
          'X-Questionario-ID': sanitizedData.id,
          'X-Mailer': 'SaraivaVision-QuestionarioOlhoSeco'
        }
      });

      logger.info('Notificação enviada para médico', {
        id: sanitizedData.id,
        nivel: sanitizedData.nivel
      });
    } catch (emailError) {
      logger.error('Erro ao enviar notificação para médico', {
        error: emailError.message,
        id: sanitizedData.id
      });
      // Continue execution even if doctor email fails
    }

    // Store in memory (in production, use database)
    if (!global.questionariosOlhoSeco) {
      global.questionariosOlhoSeco = [];
    }

    global.questionariosOlhoSeco.push(sanitizedData);

    // Keep only last 1000 submissions
    if (global.questionariosOlhoSeco.length > 1000) {
      global.questionariosOlhoSeco = global.questionariosOlhoSeco.slice(-1000);
    }

    // Send success response
    res.status(201).json({
      success: true,
      message: 'Questionário enviado com sucesso! Verifique seu email.',
      id: sanitizedData.id
    });

  } catch (error) {
    logger.error('Erro ao processar questionário de olho seco', {
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      message: 'Erro ao processar questionário. Por favor, tente novamente ou entre em contato diretamente.'
    });
  }
});

/**
 * GET /api/questionario-olho-seco/stats
 * Get statistics (admin only - would need authentication)
 */
router.get('/stats', async (req, res) => {
  try {
    if (!global.questionariosOlhoSeco) {
      global.questionariosOlhoSeco = [];
    }

    const total = global.questionariosOlhoSeco.length;
    const porNivel = {
      'baixo': 0,
      'moderado': 0,
      'alto': 0,
      'muito-alto': 0
    };

    let somaScore = 0;

    global.questionariosOlhoSeco.forEach(q => {
      porNivel[q.nivel] = (porNivel[q.nivel] || 0) + 1;
      somaScore += q.score;
    });

    const mediaScore = total > 0 ? (somaScore / total).toFixed(1) : 0;

    res.json({
      success: true,
      stats: {
        total,
        mediaScore,
        distribuicao: porNivel,
        ultimoEnvio: global.questionariosOlhoSeco[total - 1]?.timestamp || null
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

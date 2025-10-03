import { Resend } from 'resend';
import { validateContactSubmission } from '../src/lib/validation.js';
import { createEmailTemplate } from './email-template.js';
import { rateLimiter } from './rate-limiter.js';

const resend = new Resend(process.env.RESEND_API_KEY);

const DOCTOR_EMAIL = 'philipe_cruz@outlook.com';
const FROM_EMAIL = 'contato@saraivavision.com.br';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Método não permitido' 
    });
  }

  try {
    const clientIp = req.headers['x-forwarded-for'] || 
                     req.headers['x-real-ip'] || 
                     req.connection?.remoteAddress || 
                     'unknown';

    const isRateLimited = rateLimiter.check(clientIp);
    if (isRateLimited) {
      return res.status(429).json({
        success: false,
        error: 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.',
        code: 'RATE_LIMIT_EXCEEDED'
      });
    }

    const validationResult = validateContactSubmission(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        errors: validationResult.errors,
        message: 'Dados inválidos. Verifique os campos e tente novamente.'
      });
    }

    const { name, email, phone, message } = validationResult.data;

    const emailHtml = createEmailTemplate({
      name,
      email,
      phone,
      message,
      submittedAt: new Date().toISOString()
    });

    const emailText = `
Nova Solicitação de Contato - Saraiva Vision

Nome: ${name}
Email: ${email}
Telefone: ${phone}

Mensagem:
${message}

---
Recebido em: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
    `.trim();

    const emailResponse = await resend.emails.send({
      from: FROM_EMAIL,
      to: DOCTOR_EMAIL,
      subject: `📧 Novo Contato: ${name}`,
      html: emailHtml,
      text: emailText,
      reply_to: email,
      tags: [
        { name: 'source', value: 'website' },
        { name: 'type', value: 'contact-form' }
      ]
    });

    if (emailResponse.error) {
      console.error('Resend API Error:', emailResponse.error);
      throw new Error('Falha ao enviar email');
    }

    console.log('Email enviado com sucesso:', {
      id: emailResponse.data?.id,
      to: DOCTOR_EMAIL,
      from: email,
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.',
      messageId: emailResponse.data?.id
    });

  } catch (error) {
    console.error('Contact API Error:', error);

    if (error.message?.includes('API key')) {
      return res.status(500).json({
        success: false,
        error: 'Erro de configuração do servidor. Entre em contato por telefone.',
        code: 'CONFIG_ERROR'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Erro ao processar sua solicitação. Tente novamente em alguns minutos.',
      code: 'INTERNAL_ERROR'
    });
  }
}

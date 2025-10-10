/**
 * Webhook simples para processar submissões de formulário
 * Exemplo sem validação de assinatura (use apenas em ambientes controlados)
 */

import { BaseWebhook } from './base-webhook.js';

export class FormWebhook extends BaseWebhook {
  constructor() {
    super({
      name: 'form-webhook',
      validationType: 'none', // Sem validação de assinatura
      allowedIPs: [] // Adicionar IPs do seu frontend se necessário
    });
  }

  /**
   * Valida dados do formulário
   * @param {Object} data
   * @returns {Object}
   */
  validateFormData(data) {
    const errors = {};

    // Validação de email
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Email inválido';
    }

    // Validação de nome
    if (!data.name || data.name.trim().length < 2) {
      errors.name = 'Nome deve ter no mínimo 2 caracteres';
    }

    // Validação de mensagem
    if (!data.message || data.message.trim().length < 10) {
      errors.message = 'Mensagem deve ter no mínimo 10 caracteres';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Processa submissão de formulário
   * @param {Object} payload
   * @returns {Promise<Object>}
   */
  async process(payload) {
    const { name, email, message, subject, phone } = payload;

    // Validar dados
    const validation = this.validateFormData(payload);
    if (!validation.isValid) {
      throw new Error(`Dados inválidos: ${JSON.stringify(validation.errors)}`);
    }

    console.log(`[Form] Nova submissão de ${name} (${email})`);

    // TODO: Implementar lógica de negócio
    // Exemplos:
    // - Salvar no banco de dados
    // - Enviar email de confirmação
    // - Notificar equipe
    // - Criar ticket de suporte
    // - Integrar com CRM

    // Exemplo de envio de email (usando Resend - já está no package.json)
    await this.sendNotificationEmail({
      name,
      email,
      message,
      subject,
      phone
    });

    return {
      processed: true,
      message: 'Formulário recebido com sucesso',
      submissionId: this.generateSubmissionId()
    };
  }

  /**
   * Envia email de notificação
   * @param {Object} data
   */
  async sendNotificationEmail(data) {
    // TODO: Implementar com Resend ou outro serviço
    console.log('[Form] Email de notificação:', data);

    // Exemplo básico:
    /*
    import { Resend } from 'resend';
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'contato@saraivavision.com.br',
      to: process.env.DOCTOR_EMAIL,
      subject: `Nova mensagem: ${data.subject}`,
      html: `
        <h2>Nova mensagem de contato</h2>
        <p><strong>Nome:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Telefone:</strong> ${data.phone || 'Não informado'}</p>
        <p><strong>Mensagem:</strong></p>
        <p>${data.message}</p>
      `
    });
    */
  }

  /**
   * Gera ID único para a submissão
   * @returns {string}
   */
  generateSubmissionId() {
    return `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

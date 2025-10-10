/**
 * Classe base para criação de webhooks
 * Fornece estrutura reutilizável com validação, logging e error handling
 */

import { validateHmacSignature, validateStripeSignature, getRawBody } from '../middleware/webhook-validator.js';
import { createWebhookLogger } from '../middleware/webhook-logger.js';

export class BaseWebhook {
  constructor(config = {}) {
    this.name = config.name || 'unnamed-webhook';
    this.secret = config.secret || process.env.WEBHOOK_SECRET;
    this.validationType = config.validationType || 'hmac'; // 'hmac', 'stripe', 'none'
    this.allowedIPs = config.allowedIPs || [];
    this.logger = createWebhookLogger(this.name);
  }

  /**
   * Valida a requisição do webhook
   * @param {NextRequest} req
   * @param {string} rawBody
   * @returns {boolean}
   */
  async validate(req, rawBody) {
    // Validação de método HTTP
    if (req.method !== 'POST') {
      throw new Error('Método não permitido. Use POST.');
    }

    // Validação de IP (se configurada)
    if (this.allowedIPs.length > 0) {
      // X-Forwarded-For can contain multiple IPs (client, proxy1, proxy2, ...)
      // The leftmost IP is the original client IP
      const forwardedFor = req.headers['x-forwarded-for'];
      const clientIP = forwardedFor
        ? forwardedFor.split(',')[0].trim()
        : (req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown');

      if (!this.allowedIPs.includes(clientIP)) {
        throw new Error(`IP não autorizado: ${clientIP}`);
      }
    }

    // Validação de assinatura
    if (this.validationType === 'none') {
      return true;
    }

    if (!this.secret) {
      throw new Error('Webhook secret não configurado');
    }

    const signature = req.headers['x-webhook-signature']
                     || req.headers['stripe-signature']
                     || req.headers['x-hub-signature-256'];

    if (!signature) {
      throw new Error('Assinatura não fornecida');
    }

    let isValid = false;

    if (this.validationType === 'stripe') {
      isValid = validateStripeSignature(rawBody, signature, this.secret);
    } else if (this.validationType === 'hmac') {
      isValid = validateHmacSignature(rawBody, signature, this.secret);
    }

    if (!isValid) {
      throw new Error('Assinatura inválida');
    }

    return true;
  }

  /**
   * Processa o payload do webhook
   * DEVE ser sobrescrito pelas classes filhas
   * @param {Object} payload
   * @returns {Promise<Object>}
   */
  async process(payload) {
    throw new Error('Método process() deve ser implementado pela classe filha');
  }

  /**
   * Handler principal do webhook
   * @param {NextRequest} req
   * @returns {Promise<NextResponse>}
   */
  async handle(req) {
    const startTime = Date.now();
    let rawBody = '';
    let payload = null;
    let result = { success: false };

    try {
      // Extrair raw body para validação de assinatura com limite de tamanho
      const MAX_PAYLOAD_SIZE = 1024 * 1024; // 1MB limit
      rawBody = await getRawBody(req, MAX_PAYLOAD_SIZE);
      payload = JSON.parse(rawBody);

      // Validar requisição
      await this.validate(req, rawBody);

      // Processar webhook
      const processResult = await this.process(payload);

      // Resultado de sucesso
      result = {
        success: true,
        data: processResult,
        responseTime: Date.now() - startTime
      };

      // Logging (fire-and-forget, não bloqueia)
      this.logger(req, payload, result);

      return new Response(JSON.stringify({
        success: true,
        message: 'Webhook processado com sucesso',
        data: processResult
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error(`[${this.name}] Erro ao processar webhook:`, error);

      // Resultado de erro
      result = {
        success: false,
        error: error.message,
        responseTime: Date.now() - startTime
      };

      // Logging (fire-and-forget, não bloqueia)
      this.logger(req, payload || {}, result);

      // Determinar código de status apropriado
      let status = 500;
      if (error.message.includes('não permitido')) status = 405;
      if (error.message.includes('inválida') || error.message.includes('não autorizado')) status = 401;
      if (error.message.includes('não fornecida')) status = 400;

      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
}

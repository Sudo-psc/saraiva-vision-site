/**
 * Middleware para validação de webhooks
 * Valida assinaturas HMAC para garantir autenticidade
 */

import crypto from 'crypto';

/**
 * Valida assinatura HMAC SHA256
 * @param {string} payload - Corpo da requisição (raw)
 * @param {string} signature - Assinatura enviada pelo webhook
 * @param {string} secret - Segredo compartilhado
 * @returns {boolean}
 */
export function validateHmacSignature(payload, signature, secret) {
  if (!payload || !signature || !secret) {
    return false;
  }

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload, 'utf8');
  const digest = hmac.digest('hex');

  // Comparação segura contra timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(digest, 'hex')
  );
}

/**
 * Valida assinatura Stripe (SHA256 com timestamp)
 * @param {string} payload - Corpo da requisição (raw)
 * @param {string} signature - Header stripe-signature
 * @param {string} secret - Webhook secret do Stripe
 * @returns {boolean}
 */
export function validateStripeSignature(payload, signature, secret) {
  if (!payload || !signature || !secret) {
    return false;
  }

  try {
    const elements = signature.split(',');
    const signatureObj = {};

    elements.forEach(element => {
      const [key, value] = element.split('=');
      signatureObj[key] = value;
    });

    const timestamp = signatureObj.t;
    const v1Signature = signatureObj.v1;

    if (!timestamp || !v1Signature) {
      return false;
    }

    // Verificar se timestamp não é muito antigo (5 minutos)
    const currentTime = Math.floor(Date.now() / 1000);
    const timeDiff = currentTime - parseInt(timestamp, 10);

    if (timeDiff > 300) {
      console.warn('[Webhook] Timestamp muito antigo:', timeDiff, 'segundos');
      return false;
    }

    // Gerar assinatura esperada
    const signedPayload = `${timestamp}.${payload}`;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(signedPayload, 'utf8');
    const expectedSignature = hmac.digest('hex');

    // Comparação segura
    return crypto.timingSafeEqual(
      Buffer.from(v1Signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('[Webhook] Erro ao validar assinatura Stripe:', error);
    return false;
  }
}

/**
 * Middleware para validação de IP whitelist
 * @param {string[]} allowedIPs - Lista de IPs permitidos
 * @returns {Function}
 */
export function validateIPWhitelist(allowedIPs = []) {
  return (req) => {
    if (!allowedIPs.length) {
      return true; // Sem whitelist configurada
    }

    const clientIP = req.headers['x-forwarded-for']?.split(',')[0].trim()
                    || req.headers['x-real-ip']
                    || req.connection?.remoteAddress;

    return allowedIPs.includes(clientIP);
  };
}

/**
 * Extrai raw body de uma requisição Next.js com limite de tamanho
 * @param {NextRequest} req
 * @param {number} sizeLimit - Tamanho máximo do payload em bytes (default: 1MB)
 * @returns {Promise<string>}
 */
export async function getRawBody(req, sizeLimit = 1024 * 1024) { // Default: 1MB
  try {
    const chunks = [];
    let totalSize = 0;

    for await (const chunk of req.body) {
      totalSize += chunk.length;

      // Check if we're exceeding the size limit
      if (totalSize > sizeLimit) {
        console.error(`[Webhook] Payload size limit exceeded: ${totalSize} bytes (limit: ${sizeLimit} bytes)`);
        throw new Error(`Payload size limit exceeded: maximum ${sizeLimit} bytes allowed`);
      }

      chunks.push(chunk);
    }

    const body = Buffer.concat(chunks).toString('utf8');

    // Log payload size for monitoring (only if significant)
    if (totalSize > 1024) { // Only log if > 1KB
      console.log(`[Webhook] Processed payload: ${totalSize} bytes`);
    }

    return body;
  } catch (error) {
    console.error('[Webhook] Erro ao extrair raw body:', error);
    throw error;
  }
}

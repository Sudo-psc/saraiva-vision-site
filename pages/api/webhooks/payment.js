/**
 * API Route: /api/webhooks/payment
 * Endpoint para receber webhooks de pagamento (Stripe, Mercado Pago, etc.)
 */

import { PaymentWebhook } from '../src/webhooks/payment-webhook.js';

export const config = {
  api: {
    bodyParser: false, // Desabilitar para validação de assinatura
  },
};

const webhook = new PaymentWebhook();

export default async function handler(req, res) {
  return await webhook.handle(req);
}

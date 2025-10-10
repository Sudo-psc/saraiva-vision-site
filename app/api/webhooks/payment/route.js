/**
 * API Route: /api/webhooks/payment
 * Endpoint para receber webhooks de pagamento (Stripe, Mercado Pago, etc.)
 */

import { PaymentWebhook } from '../../../../api/src/webhooks/payment-webhook.js';

export const runtime = 'nodejs';

const webhook = new PaymentWebhook();

export async function POST(req) {
  return await webhook.handle(req);
}

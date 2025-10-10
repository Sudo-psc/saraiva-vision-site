/**
 * API Route: /api/webhooks/appointment
 * Endpoint para receber webhooks de agendamento
 *
 * Como usar:
 * 1. Gerar assinatura HMAC:
 *    node api/utils/generate-webhook-signature.js hmac '{"event":"appointment.created",...}' SEU_SECRET
 *
 * 2. Enviar requisição:
 *    curl -X POST https://saraivavision.com.br/api/webhooks/appointment \
 *      -H "Content-Type: application/json" \
 *      -H "X-Webhook-Signature: ASSINATURA_GERADA" \
 *      -d '{"event":"appointment.created","data":{...}}'
 */

import { AppointmentWebhook } from '../../../../api/src/webhooks/appointment-webhook.js';

export const runtime = 'nodejs';

const webhook = new AppointmentWebhook();

export async function POST(req) {
  return await webhook.handle(req);
}

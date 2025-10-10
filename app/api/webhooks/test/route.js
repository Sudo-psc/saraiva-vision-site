/**
 * API Route: /api/webhooks/test
 * Endpoint de teste sem validação de assinatura
 */

import { FormWebhook } from '../../../../api/src/webhooks/form-webhook.js';

export const runtime = 'nodejs';

const webhook = new FormWebhook();

export async function POST(req) {
  return await webhook.handle(req);
}

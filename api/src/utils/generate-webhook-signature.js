/**
 * Utilitário para gerar assinaturas de webhook
 * Útil para testes e debugging
 */

import crypto from 'crypto';

/**
 * Gera assinatura HMAC SHA256
 * @param {string} payload - Corpo da requisição
 * @param {string} secret - Segredo compartilhado
 * @returns {string}
 */
export function generateHmacSignature(payload, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload, 'utf8');
  return hmac.digest('hex');
}

/**
 * Gera assinatura no formato Stripe
 * @param {string} payload - Corpo da requisição
 * @param {string} secret - Webhook secret do Stripe
 * @param {number} timestamp - Unix timestamp (opcional, usa atual se não fornecido)
 * @returns {string}
 */
export function generateStripeSignature(payload, secret, timestamp = null) {
  const ts = timestamp || Math.floor(Date.now() / 1000);
  const signedPayload = `${ts}.${payload}`;

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(signedPayload, 'utf8');
  const signature = hmac.digest('hex');

  return `t=${ts},v1=${signature}`;
}

/**
 * CLI para gerar assinaturas
 * Uso: node generate-webhook-signature.js <tipo> <payload> <secret>
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const [,, type, payload, secret] = process.argv;

  if (!type || !payload || !secret) {
    console.log('Uso: node generate-webhook-signature.js <tipo> <payload> <secret>');
    console.log('');
    console.log('Tipos disponíveis:');
    console.log('  hmac   - Gera assinatura HMAC SHA256');
    console.log('  stripe - Gera assinatura no formato Stripe');
    console.log('');
    console.log('Exemplos:');
    console.log('  node generate-webhook-signature.js hmac \'{"test":"data"}\' mysecret');
    console.log('  node generate-webhook-signature.js stripe \'{"event":"test"}\' whsec_123');
    process.exit(1);
  }

  let signature;

  if (type === 'hmac') {
    signature = generateHmacSignature(payload, secret);
    console.log('\n=== Assinatura HMAC SHA256 ===');
    console.log('Payload:', payload);
    console.log('Secret:', secret);
    console.log('Signature:', signature);
    console.log('\nHeader para enviar:');
    console.log(`X-Webhook-Signature: ${signature}`);
  } else if (type === 'stripe') {
    signature = generateStripeSignature(payload, secret);
    console.log('\n=== Assinatura Stripe ===');
    console.log('Payload:', payload);
    console.log('Secret:', secret);
    console.log('Signature:', signature);
    console.log('\nHeader para enviar:');
    console.log(`Stripe-Signature: ${signature}`);
  } else {
    console.error(`Tipo inválido: ${type}`);
    console.log('Use "hmac" ou "stripe"');
    process.exit(1);
  }

  console.log('\n=== Exemplo de cURL ===');
  console.log(`curl -X POST http://localhost:3000/api/webhooks/payment \\`);
  console.log(`  -H "Content-Type: application/json" \\`);

  if (type === 'stripe') {
    console.log(`  -H "Stripe-Signature: ${signature}" \\`);
  } else {
    console.log(`  -H "X-Webhook-Signature: ${signature}" \\`);
  }

  console.log(`  -d '${payload}'`);
  console.log('');
}

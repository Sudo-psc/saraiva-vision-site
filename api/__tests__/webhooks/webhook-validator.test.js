/**
 * Testes para Webhook Validator
 */

import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { validateHmacSignature, validateStripeSignature } from '../../src/middleware/webhook-validator.js';

describe('Webhook Validator', () => {
  describe('validateHmacSignature()', () => {
    const secret = 'test_secret_key';
    const payload = '{"test":"data"}';

    it('deve validar assinatura HMAC correta', () => {
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(payload, 'utf8');
      const signature = hmac.digest('hex');

      const isValid = validateHmacSignature(payload, signature, secret);
      expect(isValid).toBe(true);
    });

    it('deve rejeitar assinatura HMAC incorreta', () => {
      // Gera assinatura com tamanho correto (64 caracteres hex = 32 bytes)
      // mas valor incorreto
      const wrongSignature = 'a'.repeat(64);
      const isValid = validateHmacSignature(payload, wrongSignature, secret);
      expect(isValid).toBe(false);
    });

    it('deve rejeitar payload vazio', () => {
      const isValid = validateHmacSignature('', 'signature', secret);
      expect(isValid).toBe(false);
    });

    it('deve rejeitar assinatura vazia', () => {
      const isValid = validateHmacSignature(payload, '', secret);
      expect(isValid).toBe(false);
    });

    it('deve rejeitar secret vazio', () => {
      const isValid = validateHmacSignature(payload, 'signature', '');
      expect(isValid).toBe(false);
    });
  });

  describe('validateStripeSignature()', () => {
    const secret = 'whsec_test_secret';
    const payload = '{"id":"evt_test"}';

    it('deve validar assinatura Stripe correta', () => {
      const timestamp = Math.floor(Date.now() / 1000);
      const signedPayload = `${timestamp}.${payload}`;

      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(signedPayload, 'utf8');
      const v1Signature = hmac.digest('hex');

      const stripeSignature = `t=${timestamp},v1=${v1Signature}`;

      const isValid = validateStripeSignature(payload, stripeSignature, secret);
      expect(isValid).toBe(true);
    });

    it('deve rejeitar timestamp muito antigo', () => {
      // Timestamp de 10 minutos atrás (deve rejeitar, limite é 5 min)
      const oldTimestamp = Math.floor(Date.now() / 1000) - 600;
      const signedPayload = `${oldTimestamp}.${payload}`;

      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(signedPayload, 'utf8');
      const v1Signature = hmac.digest('hex');

      const stripeSignature = `t=${oldTimestamp},v1=${v1Signature}`;

      const isValid = validateStripeSignature(payload, stripeSignature, secret);
      expect(isValid).toBe(false);
    });

    it('deve rejeitar assinatura Stripe incorreta', () => {
      const timestamp = Math.floor(Date.now() / 1000);
      const wrongSignature = 'abc123def456';
      const stripeSignature = `t=${timestamp},v1=${wrongSignature}`;

      const isValid = validateStripeSignature(payload, stripeSignature, secret);
      expect(isValid).toBe(false);
    });

    it('deve rejeitar formato de assinatura inválido', () => {
      const invalidSignature = 'invalid_format';
      const isValid = validateStripeSignature(payload, invalidSignature, secret);
      expect(isValid).toBe(false);
    });

    it('deve rejeitar assinatura sem timestamp', () => {
      const signature = 'v1=abc123';
      const isValid = validateStripeSignature(payload, signature, secret);
      expect(isValid).toBe(false);
    });

    it('deve rejeitar assinatura sem v1', () => {
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = `t=${timestamp}`;
      const isValid = validateStripeSignature(payload, signature, secret);
      expect(isValid).toBe(false);
    });
  });
});

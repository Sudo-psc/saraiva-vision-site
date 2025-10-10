/**
 * Testes para Payment Webhook
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PaymentWebhook } from '../../src/webhooks/payment-webhook.js';

describe('PaymentWebhook', () => {
  let webhook;

  beforeEach(() => {
    webhook = new PaymentWebhook();
  });

  describe('process()', () => {
    it('deve processar pagamento bem-sucedido', async () => {
      const payload = {
        type: 'payment.succeeded',
        data: {
          id: 'pay_123456',
          amount: 5000,
          currency: 'brl',
          customer: 'cus_abc123',
          metadata: {}
        }
      };

      const result = await webhook.process(payload);

      expect(result.processed).toBe(true);
      expect(result.paymentId).toBe('pay_123456');
      expect(result.status).toBe('completed');
    });

    it('deve processar pagamento falho', async () => {
      const payload = {
        type: 'payment.failed',
        data: {
          id: 'pay_failed123',
          customer: 'cus_abc123',
          failure_message: 'Cartão recusado'
        }
      };

      const result = await webhook.process(payload);

      expect(result.processed).toBe(true);
      expect(result.paymentId).toBe('pay_failed123');
      expect(result.status).toBe('failed');
      expect(result.reason).toBe('Cartão recusado');
    });

    it('deve processar reembolso', async () => {
      const payload = {
        type: 'payment.refunded',
        data: {
          id: 'ref_123456',
          amount: 5000,
          reason: 'Solicitado pelo cliente'
        }
      };

      const result = await webhook.process(payload);

      expect(result.processed).toBe(true);
      expect(result.refundId).toBe('ref_123456');
      expect(result.status).toBe('refunded');
    });

    it('deve processar criação de assinatura', async () => {
      const payload = {
        type: 'subscription.created',
        data: {
          id: 'sub_123456',
          customer: 'cus_abc123',
          plan: 'premium',
          status: 'active'
        }
      };

      const result = await webhook.process(payload);

      expect(result.processed).toBe(true);
      expect(result.subscriptionId).toBe('sub_123456');
      expect(result.status).toBe('active');
    });

    it('deve processar atualização de assinatura', async () => {
      const payload = {
        type: 'subscription.updated',
        data: {
          id: 'sub_123456',
          status: 'active',
          plan: 'enterprise'
        }
      };

      const result = await webhook.process(payload);

      expect(result.processed).toBe(true);
      expect(result.subscriptionId).toBe('sub_123456');
      expect(result.status).toBe('active');
    });

    it('deve processar cancelamento de assinatura', async () => {
      const payload = {
        type: 'subscription.deleted',
        data: {
          id: 'sub_123456',
          customer: 'cus_abc123',
          canceled_at: 1234567890
        }
      };

      const result = await webhook.process(payload);

      expect(result.processed).toBe(true);
      expect(result.subscriptionId).toBe('sub_123456');
      expect(result.status).toBe('canceled');
    });

    it('deve retornar não processado para evento desconhecido', async () => {
      const payload = {
        type: 'unknown.event',
        data: {}
      };

      const result = await webhook.process(payload);

      expect(result.processed).toBe(false);
      expect(result.reason).toBe('Tipo de evento não suportado');
    });
  });

  describe('Configuration', () => {
    it('deve ter configuração correta', () => {
      expect(webhook.name).toBe('payment-webhook');
      expect(webhook.validationType).toBe('stripe');
    });
  });
});

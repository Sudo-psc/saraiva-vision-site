/**
 * Subscription Checkout Form Component
 * Stripe payment form with validation
 */

'use client';

import React from 'react';
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import type { SubscriptionPlanId } from '../../types/subscription';
import { MEDICAL_DISCLAIMER_TEXT } from '../../types/subscription';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

interface CheckoutFormProps {
  planId: SubscriptionPlanId;
  onSuccess: (subscriptionId: string) => void;
  onCancel: () => void;
}

export function CheckoutForm({ planId, onSuccess, onCancel }: CheckoutFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    consentTerms: false,
    consentPrivacy: false,
    consentMarketing: false,
    medicalDisclaimer: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate form
      if (!formData.name || !formData.email) {
        throw new Error('Nome e email são obrigatórios');
      }

      if (!formData.consentTerms || !formData.consentPrivacy) {
        throw new Error('Você deve aceitar os termos e a política de privacidade');
      }

      if (!formData.medicalDisclaimer) {
        throw new Error('Você deve ler e aceitar o aviso médico');
      }

      // In a real implementation, you would:
      // 1. Collect payment method using Stripe Elements
      // 2. Create payment method token
      // 3. Send to backend to create subscription

      // For now, simulate payment method creation
      const paymentMethodId = 'pm_' + Math.random().toString(36).substring(7);

      // Call API to create subscription
      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          email: formData.email,
          name: formData.name,
          paymentMethodId,
          consentTerms: formData.consentTerms,
          consentPrivacy: formData.consentPrivacy,
          consentMarketing: formData.consentMarketing,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erro ao criar assinatura');
      }

      // Handle client secret for 3D Secure if needed
      if (data.subscription.clientSecret) {
        const stripe = await stripePromise;
        if (!stripe) throw new Error('Stripe não carregado');

        // Confirm payment (3D Secure, etc.)
        // This is where you'd handle payment confirmation
      }

      onSuccess(data.subscription.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-white p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900">Finalizar Assinatura</h2>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Personal Information */}
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nome Completo *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email *
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Payment Method */}
        <div className="rounded-lg border border-gray-200 p-4">
          <p className="mb-2 text-sm font-medium text-gray-700">Método de Pagamento</p>
          <p className="text-sm text-gray-600">
            O formulário de cartão do Stripe será exibido aqui em produção
          </p>
          {/* Stripe Elements would go here */}
        </div>

        {/* Medical Disclaimer */}
        <div className="space-y-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-start">
            <input
              type="checkbox"
              id="medicalDisclaimer"
              checked={formData.medicalDisclaimer}
              onChange={(e) =>
                setFormData({ ...formData, medicalDisclaimer: e.target.checked })
              }
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="medicalDisclaimer" className="ml-3 text-sm text-gray-700">
              Li e compreendi o{' '}
              <button
                type="button"
                onClick={() => setShowDisclaimer(!showDisclaimer)}
                className="font-semibold text-blue-600 hover:underline"
              >
                aviso médico importante
              </button>
            </label>
          </div>

          {showDisclaimer && (
            <div className="mt-3 max-h-48 overflow-y-auto rounded border border-yellow-300 bg-white p-3 text-xs text-gray-700">
              <pre className="whitespace-pre-wrap font-sans">
                {MEDICAL_DISCLAIMER_TEXT}
              </pre>
            </div>
          )}
        </div>

        {/* Consent Checkboxes */}
        <div className="space-y-3">
          <div className="flex items-start">
            <input
              type="checkbox"
              id="consentTerms"
              checked={formData.consentTerms}
              onChange={(e) =>
                setFormData({ ...formData, consentTerms: e.target.checked })
              }
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              required
            />
            <label htmlFor="consentTerms" className="ml-3 text-sm text-gray-700">
              Aceito os{' '}
              <a href="/termos" className="text-blue-600 hover:underline" target="_blank">
                Termos de Serviço
              </a>{' '}
              *
            </label>
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              id="consentPrivacy"
              checked={formData.consentPrivacy}
              onChange={(e) =>
                setFormData({ ...formData, consentPrivacy: e.target.checked })
              }
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              required
            />
            <label htmlFor="consentPrivacy" className="ml-3 text-sm text-gray-700">
              Aceito a{' '}
              <a
                href="/privacidade"
                className="text-blue-600 hover:underline"
                target="_blank"
              >
                Política de Privacidade
              </a>{' '}
              (LGPD) *
            </label>
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              id="consentMarketing"
              checked={formData.consentMarketing}
              onChange={(e) =>
                setFormData({ ...formData, consentMarketing: e.target.checked })
              }
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="consentMarketing" className="ml-3 text-sm text-gray-700">
              Desejo receber ofertas e novidades por email
            </label>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Processando...' : 'Assinar Agora'}
          </button>
        </div>
      </form>
    </div>
  );
}

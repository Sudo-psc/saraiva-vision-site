/**
 * Reusable Subscription Plans Component
 * Shared across all profiles (Jovem, Familiar, Senior)
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlanCard } from './PlanCard';
import type { SubscriptionPlan, SubscriptionPlanId } from '../../types/subscription';

interface SubscriptionPlansPageProps {
  profile: 'jovem' | 'familiar' | 'senior';
  title?: string;
  subtitle?: string;
}

export function SubscriptionPlansPage({
  profile,
  title = 'Escolha Seu Plano',
  subtitle = 'Assinatura de lentes sem complicação. Cancele quando quiser.',
}: SubscriptionPlansPageProps) {
  const router = useRouter();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanId | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/subscription/plans');
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setPlans(data.plans);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar planos');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (planId: string) => {
    // Validate plan ID before setting state
    const validPlanIds: SubscriptionPlanId[] = ['basic', 'pro', 'premium'];
    if (validPlanIds.includes(planId as SubscriptionPlanId)) {
      setSelectedPlan(planId as SubscriptionPlanId);
    } else {
      console.error('Invalid plan ID:', planId);
    }
  };

  const handleProceedToCheckout = () => {
    if (selectedPlan) {
      router.push(`/${profile}/assinatura/checkout?plan=${selectedPlan}`);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl text-gray-600">Carregando planos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg bg-red-50 p-8 text-red-800">
          <h2 className="mb-2 text-xl font-bold">Erro</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-16 px-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
            {title}
          </h1>
          <p className="text-lg text-gray-600">{subtitle}</p>
        </div>

        {/* Plans Grid */}
        <div className="mb-12 grid gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              selected={selectedPlan === plan.id}
              onSelect={handleSelectPlan}
            />
          ))}
        </div>

        {/* Proceed Button */}
        {selectedPlan && (
          <div className="flex justify-center">
            <button
              onClick={handleProceedToCheckout}
              className="rounded-lg bg-blue-600 px-12 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl"
            >
              Continuar para Checkout
            </button>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-16 rounded-lg bg-white p-8 shadow-lg">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Perguntas Frequentes
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="mb-2 font-semibold text-gray-900">
                Posso cancelar a qualquer momento?
              </h3>
              <p className="text-gray-600">
                Sim! Você pode cancelar sua assinatura a qualquer momento. Ela
                continuará ativa até o final do período pago.
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-gray-900">
                Como funciona a entrega?
              </h3>
              <p className="text-gray-600">
                As lentes são enviadas mensalmente para o endereço cadastrado. O
                envio é gratuito para todo o Brasil.
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-gray-900">
                Preciso de receita médica?
              </h3>
              <p className="text-gray-600">
                Sim, é necessário uma receita oftalmológica válida. Você pode
                enviar sua receita durante o processo de cadastro.
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-gray-900">
                Posso mudar de plano?
              </h3>
              <p className="text-gray-600">
                Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer
                momento através do painel de gerenciamento.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 text-center">
          <div className="flex flex-wrap items-center justify-center gap-8 text-gray-600">
            <div className="flex items-center">
              <svg
                className="mr-2 h-6 w-6 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Pagamento Seguro
            </div>
            <div className="flex items-center">
              <svg
                className="mr-2 h-6 w-6 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              LGPD Compliant
            </div>
            <div className="flex items-center">
              <svg
                className="mr-2 h-6 w-6 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              CFM Aprovado
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

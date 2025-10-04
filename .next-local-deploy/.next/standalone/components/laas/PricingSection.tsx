'use client';

import { useState } from 'react';
import { Check, Star } from 'lucide-react';
import { PLANOS } from '@/lib/laas/config';
import { trackCtaClick } from '@/lib/laas/analytics';
import type { BillingInterval } from '@/types/laas';

export function PricingSection() {
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly');

  const handlePlanClick = (planId: string) => {
    trackCtaClick('agendar_consulta', `plano_${planId}`);
    // TODO: Redirecionar para checkout ou formulário de agendamento
    alert(`Plano ${planId} selecionado! Redirecionando para agendamento...`);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <section id="planos" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Escolha seu plano ideal
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Todos os planos incluem consulta médica, entregas automáticas e suporte especializado
          </p>

          {/* Toggle Mensal/Anual */}
          <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                billingInterval === 'monthly'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                billingInterval === 'yearly'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Anual
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                Economize 16%
              </span>
            </button>
          </div>
        </div>

        {/* Grid de Planos */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {PLANOS.map((plano) => {
            const price = billingInterval === 'monthly' ? plano.priceMonthly : plano.priceYearly;
            const pricePerMonth =
              billingInterval === 'yearly' ? plano.priceYearly / 12 : plano.priceMonthly;

            return (
              <div
                key={plano.id}
                className={`relative bg-white rounded-2xl border-2 p-8 ${
                  plano.recommended
                    ? 'border-primary shadow-2xl scale-105'
                    : 'border-gray-200 shadow-lg'
                }`}
              >
                {/* Badge Recomendado */}
                {plano.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <Star className="h-4 w-4 fill-current" />
                      Mais Popular
                    </div>
                  </div>
                )}

                {/* Nome do Plano */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plano.name}</h3>
                  <p className="text-gray-600">{plano.description}</p>
                </div>

                {/* Preço */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900">
                      R$ {formatPrice(pricePerMonth)}
                    </span>
                    <span className="text-gray-600">/mês</span>
                  </div>
                  {billingInterval === 'yearly' && (
                    <p className="text-sm text-gray-500 mt-1">
                      R$ {formatPrice(price)} cobrado anualmente
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plano.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handlePlanClick(plano.id)}
                  className={`w-full py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105 ${
                    plano.recommended
                      ? 'bg-primary text-white hover:bg-primary/90 shadow-lg'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Agendar Consulta
                </button>

                {/* Stripe Price ID (hidden, usado no checkout) */}
                <input
                  type="hidden"
                  value={
                    billingInterval === 'monthly'
                      ? plano.stripePriceIdMonthly
                      : plano.stripePriceIdYearly
                  }
                />
              </div>
            );
          })}
        </div>

        {/* Nota de rodapé */}
        <p className="text-center text-gray-500 mt-8 text-sm">
          Todos os valores incluem impostos. Cancelamento a qualquer momento sem taxas.
        </p>
      </div>
    </section>
  );
}

/**
 * Subscription Plan Card Component
 * Displays pricing plan with features
 */

'use client';

import { Check } from 'lucide-react';
import type { SubscriptionPlan } from '../../types/subscription';

interface PlanCardProps {
  plan: SubscriptionPlan;
  onSelect: (planId: string) => void;
  selected?: boolean;
  loading?: boolean;
}

export function PlanCard({ plan, onSelect, selected, loading }: PlanCardProps) {
  return (
    <div
      className={`
        relative rounded-2xl border-2 p-8 transition-all hover:shadow-lg
        ${selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}
        ${plan.recommended ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
      `}
    >
      {plan.recommended && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-4 py-1 text-sm font-semibold text-white">
          Recomendado
        </div>
      )}

      <div className="mb-6">
        <h3 className="mb-2 text-2xl font-bold text-gray-900">{plan.name}</h3>
        <p className="text-sm text-gray-600">{plan.description}</p>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline">
          <span className="text-5xl font-bold text-gray-900">
            {plan.priceFormatted}
          </span>
          <span className="ml-2 text-gray-600">/mês</span>
        </div>
      </div>

      <ul className="mb-8 space-y-4">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="mr-3 h-5 w-5 flex-shrink-0 text-green-500" />
            <span className="text-sm text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSelect(plan.id)}
        disabled={loading}
        className={`
          w-full rounded-lg px-6 py-3 font-semibold transition-colors
          ${
            selected
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
          }
          disabled:cursor-not-allowed disabled:opacity-50
        `}
      >
        {loading ? 'Processando...' : selected ? 'Selecionado' : 'Selecionar'}
      </button>
    </div>
  );
}

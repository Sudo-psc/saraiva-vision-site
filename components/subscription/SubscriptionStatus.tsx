/**
 * Subscription Status Dashboard Component
 * Displays current subscription status and management options
 */

'use client';

import { useState, useEffect } from 'react';
import { Calendar, CreditCard, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import type { SubscriptionStatus as Status } from '../../types/subscription';

interface SubscriptionData {
  id: string;
  status: Status;
  customerId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date | null;
  trialEnd?: Date | null;
  items: Array<{
    id: string;
    priceId: string;
    amount: number;
    amountFormatted: string;
    interval: string;
  }>;
}

interface SubscriptionStatusProps {
  subscriptionId: string;
}

export function SubscriptionStatus({ subscriptionId }: SubscriptionStatusProps) {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, [subscriptionId]);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/subscription/${subscriptionId}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setSubscription({
        ...data.subscription,
        currentPeriodStart: new Date(data.subscription.currentPeriodStart),
        currentPeriodEnd: new Date(data.subscription.currentPeriodEnd),
        canceledAt: data.subscription.canceledAt
          ? new Date(data.subscription.canceledAt)
          : null,
        trialEnd: data.subscription.trialEnd
          ? new Date(data.subscription.trialEnd)
          : null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar assinatura');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (
      !confirm(
        'Tem certeza que deseja cancelar sua assinatura? Ela permanecerá ativa até o final do período atual.'
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch('/api/subscription/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
          cancelAtPeriodEnd: true,
          cancelReason: 'User requested cancellation',
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      alert(data.message);
      await loadSubscription();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao cancelar assinatura');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      setActionLoading(true);
      const response = await fetch('/api/subscription/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
          cancelAtPeriodEnd: false,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      alert(data.message);
      await loadSubscription();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao reativar assinatura');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-800">
        <AlertCircle className="inline h-5 w-5" /> {error}
      </div>
    );
  }

  if (!subscription) {
    return null;
  }

  const statusConfig = {
    active: {
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
      text: 'Ativa',
    },
    trialing: {
      icon: Calendar,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      text: 'Em Período de Teste',
    },
    past_due: {
      icon: AlertCircle,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      text: 'Pagamento Atrasado',
    },
    cancelled: {
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      text: 'Cancelada',
    },
    incomplete: {
      icon: AlertCircle,
      color: 'text-gray-600',
      bg: 'bg-gray-50',
      text: 'Incompleta',
    },
    incomplete_expired: {
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      text: 'Expirada',
    },
    unpaid: {
      icon: AlertCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      text: 'Não Paga',
    },
  };

  const config = statusConfig[subscription.status] || statusConfig.active;
  const StatusIcon = config.icon;

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <div className={`rounded-lg p-6 ${config.bg}`}>
        <div className="flex items-center">
          <StatusIcon className={`h-8 w-8 ${config.color}`} />
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Status da Assinatura
            </h3>
            <p className={`${config.color} font-medium`}>{config.text}</p>
          </div>
        </div>

        {subscription.cancelAtPeriodEnd && (
          <div className="mt-4 rounded border border-yellow-300 bg-yellow-50 p-3">
            <p className="text-sm text-yellow-800">
              Sua assinatura será cancelada em{' '}
              <strong>
                {subscription.currentPeriodEnd.toLocaleDateString('pt-BR')}
              </strong>
            </p>
          </div>
        )}
      </div>

      {/* Subscription Details */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h4 className="mb-4 text-lg font-semibold text-gray-900">Detalhes</h4>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Valor</span>
            <span className="font-semibold text-gray-900">
              {subscription.items[0]?.amountFormatted || 'N/A'}/{subscription.items[0]?.interval}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">Próxima Cobrança</span>
            <span className="font-semibold text-gray-900">
              {subscription.currentPeriodEnd.toLocaleDateString('pt-BR')}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">Período Atual</span>
            <span className="font-semibold text-gray-900">
              {subscription.currentPeriodStart.toLocaleDateString('pt-BR')} -{' '}
              {subscription.currentPeriodEnd.toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
          <button
            onClick={handleCancelSubscription}
            disabled={actionLoading}
            className="w-full rounded-lg border border-red-300 bg-white px-6 py-3 font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {actionLoading ? 'Processando...' : 'Cancelar Assinatura'}
          </button>
        )}

        {subscription.cancelAtPeriodEnd && (
          <button
            onClick={handleReactivateSubscription}
            disabled={actionLoading}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {actionLoading ? 'Processando...' : 'Reativar Assinatura'}
          </button>
        )}
      </div>
    </div>
  );
}

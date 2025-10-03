/**
 * Manage Subscription Page - Jovem Profile
 * Dashboard for subscription management
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SubscriptionStatus } from '../../../../components/subscription/SubscriptionStatus';

function ManageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);

  useEffect(() => {
    // In production, fetch subscription ID from user session/cookie
    // For now, check URL param or localStorage
    const id = searchParams.get('subscription') || localStorage.getItem('subscriptionId');

    if (id) {
      setSubscriptionId(id);
      if (!searchParams.get('subscription')) {
        // Update URL without reload
        router.replace(`/jovem/assinatura/manage?subscription=${id}`);
      }
    } else {
      // Redirect to plans if no subscription
      router.push('/jovem/assinatura');
    }
  }, [searchParams, router]);

  if (!subscriptionId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl text-gray-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-16 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Gerenciar Assinatura
          </h1>
          <p className="text-gray-600">
            Acompanhe e gerencie sua assinatura de lentes
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <SubscriptionStatus subscriptionId={subscriptionId} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Ações Rápidas
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/jovem/assinatura')}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Mudar de Plano
                </button>
                <button
                  onClick={() => alert('Funcionalidade em desenvolvimento')}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Atualizar Endereço
                </button>
                <button
                  onClick={() => alert('Funcionalidade em desenvolvimento')}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Enviar Nova Receita
                </button>
              </div>
            </div>

            {/* Support */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Precisa de Ajuda?
              </h3>
              <p className="mb-4 text-sm text-gray-600">
                Nossa equipe está pronta para ajudar você com qualquer dúvida.
              </p>
              <a
                href="mailto:suporte@saraivavision.com.br"
                className="block rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
              >
                Entrar em Contato
              </a>
            </div>

            {/* FAQs */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Dúvidas Comuns
              </h3>
              <div className="space-y-3 text-sm">
                <a
                  href="#"
                  className="block text-blue-600 hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('FAQ em desenvolvimento');
                  }}
                >
                  Como atualizar minha receita?
                </a>
                <a
                  href="#"
                  className="block text-blue-600 hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('FAQ em desenvolvimento');
                  }}
                >
                  Quando serei cobrado?
                </a>
                <a
                  href="#"
                  className="block text-blue-600 hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('FAQ em desenvolvimento');
                  }}
                >
                  Como cancelar minha assinatura?
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ManagePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl text-gray-600">Carregando...</div>
      </div>
    }>
      <ManageContent />
    </Suspense>
  );
}

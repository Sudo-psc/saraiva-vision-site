/**
 * Success Page - Jovem Profile
 * Subscription creation success confirmation
 */

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get('subscription');
    if (id) {
      setSubscriptionId(id);
    } else {
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
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl bg-white p-12 text-center shadow-xl">
          {/* Success Icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>

          {/* Title */}
          <h1 className="mb-4 text-3xl font-bold text-gray-900">
            Assinatura Confirmada!
          </h1>

          {/* Message */}
          <p className="mb-8 text-lg text-gray-600">
            Parabéns! Sua assinatura foi criada com sucesso.
          </p>

          {/* Subscription ID */}
          <div className="mb-8 rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-600">ID da Assinatura</p>
            <p className="font-mono text-sm text-gray-900">{subscriptionId}</p>
          </div>

          {/* Next Steps */}
          <div className="mb-8 text-left">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Próximos Passos
            </h2>
            <ol className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                  1
                </span>
                <span>
                  Verifique seu email para instruções sobre envio da receita médica
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                  2
                </span>
                <span>
                  Suas lentes serão enviadas em até 3 dias úteis após recebimento
                  da receita
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                  3
                </span>
                <span>
                  Acesse o painel de gerenciamento para acompanhar sua assinatura
                </span>
              </li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/jovem/assinatura/manage')}
              className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Gerenciar Assinatura
            </button>
            <button
              onClick={() => router.push('/jovem')}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
            >
              Voltar ao Início
            </button>
          </div>

          {/* Support */}
          <div className="mt-8 border-t border-gray-200 pt-6 text-sm text-gray-600">
            <p>
              Dúvidas? Entre em contato:{' '}
              <a
                href="mailto:suporte@saraivavision.com.br"
                className="text-blue-600 hover:underline"
              >
                suporte@saraivavision.com.br
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl text-gray-600">Carregando...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}

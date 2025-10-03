/**
 * Checkout Page - Jovem Profile
 * Payment and subscription creation
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckoutForm } from '../../../../components/subscription/CheckoutForm';
import type { SubscriptionPlanId } from '../../../../types/subscription';
import { SUBSCRIPTION_PLANS } from '../../../../types/subscription';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [planId, setPlanId] = useState<SubscriptionPlanId | null>(null);

  useEffect(() => {
    const plan = searchParams.get('plan') as SubscriptionPlanId;
    if (plan && SUBSCRIPTION_PLANS[plan]) {
      setPlanId(plan);
    } else {
      router.push('/jovem/assinatura');
    }
  }, [searchParams, router]);

  const handleSuccess = (subscriptionId: string) => {
    router.push(`/jovem/assinatura/success?subscription=${subscriptionId}`);
  };

  const handleCancel = () => {
    router.push('/jovem/assinatura');
  };

  if (!planId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl text-gray-600">Carregando...</div>
      </div>
    );
  }

  const selectedPlan = SUBSCRIPTION_PLANS[planId];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-16 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600">
            Plano: <span className="font-semibold">{selectedPlan.name}</span> -{' '}
            {selectedPlan.priceFormatted}/mês
          </p>
        </div>

        {/* Checkout Form */}
        <CheckoutForm
          planId={planId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />

        {/* Security Notice */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Pagamento seguro processado via Stripe. Seus dados são protegidos com
            criptografia SSL.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl text-gray-600">Carregando...</div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}

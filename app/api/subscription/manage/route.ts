/**
 * Manage Subscription API Route
 * POST: Update or cancel subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  updateSubscriptionSchema,
  updateStripeSubscription,
  cancelStripeSubscription,
  STRIPE_PRICE_IDS,
} from '../../../../lib/stripe';
import type { UpdateSubscriptionRequest } from '../../../../types/subscription';

export async function POST(request: NextRequest) {
  try {
    const body: UpdateSubscriptionRequest = await request.json();

    // Validate input
    const validation = updateSubscriptionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { subscriptionId, planId, cancelAtPeriodEnd, cancelReason } =
      validation.data;

    // Handle plan change
    if (planId) {
      const priceId = STRIPE_PRICE_IDS[planId];
      if (!priceId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Plano inválido ou não configurado',
          },
          { status: 400 }
        );
      }

      const subscription = await updateStripeSubscription(subscriptionId, {
        priceId,
      });

      return NextResponse.json({
        success: true,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          planId,
        },
        message: 'Plano atualizado com sucesso!',
      });
    }

    // Handle cancellation
    if (cancelAtPeriodEnd !== undefined) {
      if (cancelAtPeriodEnd) {
        // Schedule cancellation at period end
        const subscription = await updateStripeSubscription(subscriptionId, {
          cancelAtPeriodEnd: true,
        });

        // Log cancellation reason (in production, store in database)
        if (cancelReason) {
          console.log('Subscription cancellation requested:', {
            subscriptionId,
            reason: cancelReason,
            timestamp: new Date().toISOString(),
          });
        }

        return NextResponse.json({
          success: true,
          subscription: {
            id: subscription.id,
            status: subscription.status,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
          message:
            'Sua assinatura será cancelada no final do período atual.',
        });
      } else {
        // Reactivate subscription
        const subscription = await updateStripeSubscription(subscriptionId, {
          cancelAtPeriodEnd: false,
        });

        return NextResponse.json({
          success: true,
          subscription: {
            id: subscription.id,
            status: subscription.status,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
          message: 'Assinatura reativada com sucesso!',
        });
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Nenhuma ação especificada',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Manage subscription error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao gerenciar assinatura. Tente novamente.',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Cancel subscription immediately
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get('subscriptionId');

    if (!subscriptionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID da assinatura é obrigatório',
        },
        { status: 400 }
      );
    }

    const subscription = await cancelStripeSubscription(subscriptionId);

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
      },
      message: 'Assinatura cancelada imediatamente.',
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao cancelar assinatura. Tente novamente.',
      },
      { status: 500 }
    );
  }
}

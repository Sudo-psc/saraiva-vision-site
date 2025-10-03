/**
 * Subscription Detail API Route
 * GET: Retrieve subscription details by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStripeSubscription, formatBRL } from '../../../../lib/stripe';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID da assinatura é obrigatório',
        },
        { status: 400 }
      );
    }

    // Retrieve subscription from Stripe
    const stripeSubscription = await getStripeSubscription(id);

    // Format response
    const subscription = {
      id: stripeSubscription.id,
      status: stripeSubscription.status,
      customerId:
        typeof stripeSubscription.customer === 'string'
          ? stripeSubscription.customer
          : stripeSubscription.customer.id,
      currentPeriodStart: new Date(
        stripeSubscription.current_period_start * 1000
      ),
      currentPeriodEnd: new Date(
        stripeSubscription.current_period_end * 1000
      ),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      canceledAt: stripeSubscription.canceled_at
        ? new Date(stripeSubscription.canceled_at * 1000)
        : null,
      trialEnd: stripeSubscription.trial_end
        ? new Date(stripeSubscription.trial_end * 1000)
        : null,
      items: stripeSubscription.items.data.map((item) => ({
        id: item.id,
        priceId: item.price.id,
        amount: item.price.unit_amount,
        amountFormatted: formatBRL(item.price.unit_amount || 0),
        interval: item.price.recurring?.interval,
      })),
    };

    return NextResponse.json({
      success: true,
      subscription,
    });
  } catch (error) {
    console.error('Get subscription error:', error);

    // Handle not found error
    if (error.statusCode === 404) {
      return NextResponse.json(
        {
          success: false,
          error: 'Assinatura não encontrada',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar assinatura. Tente novamente.',
      },
      { status: 500 }
    );
  }
}

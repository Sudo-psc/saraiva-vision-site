/**
 * Subscription Plans API Route
 * GET: List all available subscription plans
 */

import { NextResponse } from 'next/server';
import { SUBSCRIPTION_PLANS } from '../../../../types/subscription';

export async function GET() {
  try {
    const plans = Object.values(SUBSCRIPTION_PLANS).map((plan) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      priceFormatted: plan.priceFormatted,
      features: plan.features,
      recommended: plan.recommended || false,
    }));

    return NextResponse.json({
      success: true,
      plans,
    });
  } catch (error) {
    console.error('Plans API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao carregar planos de assinatura',
      },
      { status: 500 }
    );
  }
}

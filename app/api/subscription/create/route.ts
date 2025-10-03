/**
 * Create Subscription API Route
 * POST: Create new subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createSubscriptionSchema,
  getOrCreateCustomer,
  createStripeSubscription,
  STRIPE_PRICE_IDS,
  hashUserId,
} from '../../../../lib/stripe';
import type { CreateSubscriptionRequest } from '../../../../types/subscription';

// Rate limiting (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5; // requests
const RATE_WINDOW = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Muitas requisições. Tente novamente em alguns minutos.',
        },
        { status: 429 }
      );
    }

    const body: CreateSubscriptionRequest = await request.json();

    // Validate input
    const validation = createSubscriptionSchema.safeParse(body);
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

    const { planId, email, name, paymentMethodId, consentMarketing } =
      validation.data;

    // Verify plan exists
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

    // Create or retrieve Stripe customer
    const customer = await getOrCreateCustomer(email, name);

    // Create subscription
    const subscription = await createStripeSubscription(
      customer.id,
      priceId,
      paymentMethodId
    );

    // Hash user ID for LGPD compliance
    const hashedUserId = await hashUserId(email);

    // Log consent (in production, store in database)
    console.log('User consent recorded:', {
      hashedUserId,
      timestamp: new Date().toISOString(),
      ip: ip.substring(0, 10) + '...', // Partial IP for audit
      consentTerms: true,
      consentPrivacy: true,
      consentMarketing: consentMarketing || false,
      medicalDisclaimer: true,
    });

    // Extract payment intent for client confirmation if needed
    const paymentIntent =
      typeof subscription.latest_invoice !== 'string' &&
      subscription.latest_invoice?.payment_intent
        ? typeof subscription.latest_invoice.payment_intent === 'string'
          ? { client_secret: null }
          : subscription.latest_invoice.payment_intent
        : null;

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        customerId: customer.id,
        clientSecret: paymentIntent?.client_secret || null,
      },
      message: 'Assinatura criada com sucesso!',
    });
  } catch (error) {
    console.error('Create subscription error:', error);

    // Handle Stripe errors
    if (error.type === 'StripeCardError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Erro no pagamento: ' + error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao criar assinatura. Tente novamente.',
      },
      { status: 500 }
    );
  }
}

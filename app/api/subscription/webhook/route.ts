/**
 * Stripe Webhook API Route
 * POST: Handle Stripe webhook events
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '../../../../lib/stripe';
import Stripe from 'stripe';

// Disable body parsing for webhooks
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing stripe-signature header',
        },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const event = verifyWebhookSignature(body, signature);

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Webhook processing failed',
      },
      { status: 400 }
    );
  }
}

/**
 * Handle subscription created
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Subscription created:', {
    id: subscription.id,
    customer: subscription.customer,
    status: subscription.status,
  });

  // TODO: In production, save to database
  // TODO: Send welcome email via Resend
}

/**
 * Handle subscription updated
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', {
    id: subscription.id,
    status: subscription.status,
    cancel_at_period_end: subscription.cancel_at_period_end,
  });

  // TODO: In production, update database
  // TODO: Send email notification if status changed
}

/**
 * Handle subscription deleted/cancelled
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', {
    id: subscription.id,
    customer: subscription.customer,
  });

  // TODO: In production, update database
  // TODO: Send cancellation confirmation email
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Payment succeeded:', {
    id: invoice.id,
    customer: invoice.customer,
    amount: invoice.amount_paid,
    subscription: invoice.subscription,
  });

  // TODO: In production, update payment records
  // TODO: Send receipt email via Resend
  // TODO: Update subscription status if needed
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Payment failed:', {
    id: invoice.id,
    customer: invoice.customer,
    subscription: invoice.subscription,
  });

  // TODO: In production, mark subscription as past_due
  // TODO: Send payment failure notification email
  // TODO: Implement retry logic or suspension
}

/**
 * Handle trial ending soon
 */
async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  console.log('Trial will end:', {
    id: subscription.id,
    customer: subscription.customer,
    trial_end: subscription.trial_end,
  });

  // TODO: Send trial ending reminder email
}

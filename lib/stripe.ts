/**
 * Stripe Integration Utilities
 * Server-side Stripe SDK configuration
 */

import Stripe from 'stripe';
import { z } from 'zod';
import type {
  SubscriptionPlanId,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
} from '../types/subscription';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-01-27.acacia',
  typescript: true,
});

// Validation schemas using Zod
export const createSubscriptionSchema = z.object({
  planId: z.enum(['basic', 'pro', 'premium']),
  email: z.string().email('Email inválido'),
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  paymentMethodId: z.string().min(1, 'Método de pagamento é obrigatório'),
  consentTerms: z.literal(true, {
    errorMap: () => ({ message: 'Você deve aceitar os termos de serviço' }),
  }),
  consentPrivacy: z.literal(true, {
    errorMap: () => ({ message: 'Você deve aceitar a política de privacidade' }),
  }),
  consentMarketing: z.boolean().optional(),
});

export const updateSubscriptionSchema = z.object({
  subscriptionId: z.string().min(1),
  planId: z.enum(['basic', 'pro', 'premium']).optional(),
  cancelAtPeriodEnd: z.boolean().optional(),
  cancelReason: z.string().optional(),
});

// Stripe Price IDs (set these in environment or database)
export const STRIPE_PRICE_IDS: Record<SubscriptionPlanId, string> = {
  basic: process.env.STRIPE_PRICE_ID_BASIC || '',
  pro: process.env.STRIPE_PRICE_ID_PRO || '',
  premium: process.env.STRIPE_PRICE_ID_PREMIUM || '',
};

/**
 * Create or retrieve Stripe customer
 */
export async function getOrCreateCustomer(
  email: string,
  name: string
): Promise<Stripe.Customer> {
  // Check if customer already exists
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0];
  }

  // Create new customer
  return await stripe.customers.create({
    email,
    name,
    metadata: {
      source: 'saraiva-vision-jovem',
      created_via: 'subscription_api',
    },
  });
}

/**
 * Create Stripe subscription
 */
export async function createStripeSubscription(
  customerId: string,
  priceId: string,
  paymentMethodId: string
): Promise<Stripe.Subscription> {
  // Attach payment method to customer
  await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customerId,
  });

  // Set as default payment method
  await stripe.customers.update(customerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  });

  // Create subscription
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: {
      payment_method_types: ['card'],
      save_default_payment_method: 'on_subscription',
    },
    expand: ['latest_invoice.payment_intent'],
    metadata: {
      source: 'saraiva-vision-jovem',
    },
  });
}

/**
 * Update Stripe subscription
 */
export async function updateStripeSubscription(
  subscriptionId: string,
  updates: {
    priceId?: string;
    cancelAtPeriodEnd?: boolean;
  }
): Promise<Stripe.Subscription> {
  const updateData: Stripe.SubscriptionUpdateParams = {};

  if (updates.priceId) {
    // Get current subscription to update items
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    updateData.items = [
      {
        id: subscription.items.data[0].id,
        price: updates.priceId,
      },
    ];
  }

  if (updates.cancelAtPeriodEnd !== undefined) {
    updateData.cancel_at_period_end = updates.cancelAtPeriodEnd;
  }

  return await stripe.subscriptions.update(subscriptionId, updateData);
}

/**
 * Cancel Stripe subscription immediately
 */
export async function cancelStripeSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.cancel(subscriptionId);
}

/**
 * Retrieve subscription details
 */
export async function getStripeSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['default_payment_method', 'customer'],
  });
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }

  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }
}

/**
 * Format amount from cents to BRL string
 */
export function formatBRL(amountInCents: number): string {
  const amount = amountInCents / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

/**
 * Generate SHA-256 hash for LGPD compliance
 */
export async function hashUserId(userId: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(userId);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

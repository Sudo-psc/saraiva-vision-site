/**
 * Subscription System Type Definitions
 * Saraiva Vision - Medical Compliance & LGPD
 */

export type SubscriptionPlanId = 'basic' | 'pro' | 'premium';

export type SubscriptionStatus =
  | 'active'
  | 'cancelled'
  | 'past_due'
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'unpaid';

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  description: string;
  price: number; // in BRL (cents)
  priceFormatted: string; // R$ XX,XX
  features: string[];
  stripePriceId?: string; // Stripe Price ID
  recommended?: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'card';
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
}

export interface Subscription {
  id: string;
  userId: string; // LGPD: SHA-256 hashed user identifier
  planId: SubscriptionPlanId;
  status: SubscriptionStatus;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  cancelReason?: string;
  paymentMethod?: PaymentMethod;
  trialEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubscriptionRequest {
  planId: SubscriptionPlanId;
  email: string;
  name: string;
  paymentMethodId: string; // Stripe payment method token
  // LGPD compliance
  consentTerms: boolean;
  consentPrivacy: boolean;
  consentMarketing?: boolean;
}

export interface UpdateSubscriptionRequest {
  subscriptionId: string;
  planId?: SubscriptionPlanId;
  cancelAtPeriodEnd?: boolean;
  cancelReason?: string;
}

export interface SubscriptionWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
}

export interface SubscriptionStats {
  total: number;
  active: number;
  cancelled: number;
  revenue: number; // in BRL (cents)
}

// LGPD: Minimized user data
export interface SubscriptionUser {
  hashedId: string; // SHA-256 hash
  email: string; // Required for billing
  name: string; // Required for legal purposes
  createdAt: Date;
  consentTimestamp: Date;
  consentIp?: string; // For audit trail
}

// CFM Compliance: Medical disclaimer
export interface MedicalDisclaimer {
  acknowledged: boolean;
  acknowledgedAt: Date;
  text: string;
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlanId, SubscriptionPlan> = {
  basic: {
    id: 'basic',
    name: 'Basic',
    description: '1 par de lentes por mês',
    price: 4900, // R$ 49,00
    priceFormatted: 'R$ 49',
    features: [
      '1 par de lentes de contato por mês',
      'Lentes de prescrição básica',
      'Suporte online',
      'Cancelamento a qualquer momento',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: '2 pares + experimentação virtual',
    price: 7900, // R$ 79,00
    priceFormatted: 'R$ 79',
    recommended: true,
    features: [
      '2 pares de lentes por mês (principal + reserva)',
      'Lentes premium',
      'Experimentação virtual',
      'Suporte prioritário',
      'Descontos em armações',
    ],
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    description: 'Lentes ilimitadas + consultas',
    price: 9900, // R$ 99,00
    priceFormatted: 'R$ 99',
    features: [
      'Substituições ilimitadas de lentes',
      'Armações de grife incluídas',
      'Consultas presenciais',
      'Acesso a recursos exclusivos do app',
      'Concierge oftalmológico',
    ],
  },
};

export const MEDICAL_DISCLAIMER_TEXT = `
AVISO MÉDICO IMPORTANTE:

Este serviço de assinatura de lentes é complementar ao acompanhamento oftalmológico regular.
A assinatura NÃO substitui consultas médicas periódicas com oftalmologista.

Recomendamos consultas oftalmológicas pelo menos uma vez ao ano, ou conforme orientação médica.

Em caso de desconforto, vermelhidão, dor ou alterações visuais, suspenda o uso das lentes
e consulte imediatamente um oftalmologista.

As lentes fornecidas são baseadas na sua prescrição mais recente. É sua responsabilidade
manter sua prescrição atualizada através de consultas regulares.

Ao prosseguir, você reconhece ter lido e compreendido este aviso médico.
`;

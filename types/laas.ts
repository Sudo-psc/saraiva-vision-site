/**
 * LAAS (Lentes As A Service) - Type Definitions
 * Landing page para serviço de assinatura de lentes de contato
 */

export interface LaasFormData {
  nome: string;
  whatsapp: string;
  email: string;
  lgpdConsent: boolean;
}

export interface LaasPlan {
  id: string;
  name: string;
  description: string;
  features: string[];
  priceMonthly: number;
  priceYearly: number;
  stripePriceIdMonthly: string;
  stripePriceIdYearly: string;
  recommended?: boolean;
}

export interface LaasAddon {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface LaasFaqItem {
  question: string;
  answer: string;
}

export interface LaasStep {
  number: number;
  icon: string;
  title: string;
  description: string;
}

export interface LaasProblema {
  text: string;
}

export interface LaasSolucao {
  text: string;
}

export interface LaasGA4Event {
  event: string;
  cta_type?: string;
  location?: string;
  lead_type?: string;
  section_name?: string;
  faq_question?: string;
}

export type BillingInterval = 'monthly' | 'yearly';

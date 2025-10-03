/**
 * LAAS Configuration
 * Dados estáticos para a landing page
 */

import type { LaasPlan, LaasAddon, LaasFaqItem, LaasStep, LaasProblema, LaasSolucao } from '@/types/laas';

export const LAAS_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5533999999999';
export const LAAS_CNPJ = process.env.NEXT_PUBLIC_CNPJ_CLINICA || '';
export const LAAS_CRM_MEDICO = process.env.NEXT_PUBLIC_CRM_MEDICO || '';

// Problemas e Soluções
export const PROBLEMAS: LaasProblema[] = [
  { text: 'Ficar sem lentes na hora errada' },
  { text: 'Preço varia a cada compra' },
  { text: 'Esquecer de renovar receita' },
  { text: 'Perder tempo indo à ótica' },
  { text: 'Lentes inadequadas sem acompanhamento' },
];

export const SOLUCOES: LaasSolucao[] = [
  { text: 'Entregas programadas sem esforço' },
  { text: 'Preço fixo e previsível' },
  { text: 'Acompanhamento médico contínuo' },
  { text: 'Receba em casa semestralmente' },
  { text: 'Lentes prescritas por oftalmologista' },
];

// Como Funciona - 3 Passos
export const PASSOS: LaasStep[] = [
  {
    number: 1,
    icon: 'calendar',
    title: 'Agende sua Consulta',
    description: 'Nossos oftalmologistas avaliam sua necessidade e definem as lentes ideais para você.',
  },
  {
    number: 2,
    icon: 'package',
    title: 'Receba em Casa',
    description: 'Enviamos seu primeiro kit e programamos as entregas semestrais automaticamente.',
  },
  {
    number: 3,
    icon: 'heart',
    title: 'Tenha Acompanhamento',
    description: 'Acesse nosso time de especialistas por teleorientação sempre que precisar.',
  },
];

// Planos e Preços
export const PLANOS: LaasPlan[] = [
  {
    id: 'essencial',
    name: 'Essencial',
    description: 'Ideal para quem quer começar',
    features: [
      'Consulta oftalmológica inicial',
      'Lentes de qualidade premium',
      'Entrega semestral automática',
      'Suporte por WhatsApp',
      'Cancelamento flexível',
    ],
    priceMonthly: 149.90,
    priceYearly: 1439.00, // ~R$ 119.92/mês
    stripePriceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ESSENCIAL_MENSAL || '',
    stripePriceIdYearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ESSENCIAL_ANUAL || '',
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Máximo cuidado e conveniência',
    features: [
      'Tudo do plano Essencial',
      'Lentes ultra-premium importadas',
      'Teleorientação ilimitada',
      'Consulta de renovação inclusa',
      'Seguro perda e dano',
      'Kit de limpeza premium',
    ],
    priceMonthly: 249.90,
    priceYearly: 2399.00, // ~R$ 199.92/mês
    stripePriceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM_MENSAL || '',
    stripePriceIdYearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM_ANUAL || '',
    recommended: true,
  },
  {
    id: 'vip',
    name: 'VIP',
    description: 'Experiência completa e exclusiva',
    features: [
      'Tudo do plano Premium',
      'Atendimento prioritário 24/7',
      'Entregas expressas ilimitadas',
      'Consultas presenciais ilimitadas',
      'Kit de viagem premium',
      'Upgrades de lentes sem custo',
    ],
    priceMonthly: 399.90,
    priceYearly: 3839.00, // ~R$ 319.92/mês
    stripePriceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_VIP_MENSAL || '',
    stripePriceIdYearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_VIP_ANUAL || '',
  },
];

// Add-ons
export const ADDONS: LaasAddon[] = [
  {
    id: 'consulta-renovacao',
    name: 'Consulta de Renovação',
    description: 'Consulta oftalmológica anual para renovação de receita',
    icon: 'stethoscope',
  },
  {
    id: 'seguro',
    name: 'Seguro Perda/Dano',
    description: 'Reposição gratuita em caso de perda ou dano das lentes',
    icon: 'shield',
  },
  {
    id: 'kit-limpeza',
    name: 'Kit de Limpeza Premium',
    description: 'Kit completo com soluções e acessórios de alta qualidade',
    icon: 'sparkles',
  },
  {
    id: 'teleorientacao-vip',
    name: 'Teleorientação VIP',
    description: 'Acesso prioritário a especialistas 24/7 por videochamada',
    icon: 'video',
  },
];

// FAQ
export const FAQ_ITEMS: LaasFaqItem[] = [
  {
    question: 'Como funciona o cancelamento?',
    answer: 'Você pode cancelar a qualquer momento sem multa. Basta avisar com 30 dias de antecedência.',
  },
  {
    question: 'Posso trocar de lente durante a assinatura?',
    answer: 'Sim! Mediante nova consulta com nossos oftalmologistas.',
  },
  {
    question: 'Como funciona a entrega?',
    answer: 'Enviamos automaticamente a cada 6 meses para o endereço cadastrado.',
  },
  {
    question: 'Preciso ter receita médica?',
    answer: 'Não! A consulta inicial com nossos oftalmologistas está incluída.',
  },
  {
    question: 'Quais marcas de lentes vocês trabalham?',
    answer: 'Trabalhamos com as principais marcas: Acuvue, Biofinity, Air Optix, entre outras.',
  },
  {
    question: 'O que acontece se eu perder as lentes?',
    answer: 'Assine o add-on de Seguro Perda/Dano por R$ 29/mês.',
  },
];

// Badges de Prova Social
export const SOCIAL_PROOF_BADGES = [
  'Selo de Qualidade',
  'Aprovado ANVISA',
  'Lentes Premium',
  'CRM Médico Responsável',
];

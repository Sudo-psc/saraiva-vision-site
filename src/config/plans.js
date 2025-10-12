/**
 * Configuração de links de pagamento para os planos de assinatura
 * Utiliza variáveis de ambiente com fallbacks para URLs hardcoded
 */

export const PLAN_PAYMENT_LINKS = {
    basico: import.meta.env.VITE_PLAN_PAYMENT_LINK_BASICO || 'https://tr.ee/rVpQCT',
    padrao: import.meta.env.VITE_PLAN_PAYMENT_LINK_PADRAO || 'https://wa.me/5533999999999?text=Olá! Tenho interesse no Plano Padrão de lentes de contato',
    premium: import.meta.env.VITE_PLAN_PAYMENT_LINK_PREMIUM || 'https://wa.me/5533999999999?text=Olá! Tenho interesse no Plano Premium de lentes de contato'
};

export default PLAN_PAYMENT_LINKS;

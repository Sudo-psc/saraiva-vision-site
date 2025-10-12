import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Loader2, ExternalLink, ShieldCheck, CreditCard, Crown } from 'lucide-react';

/**
 * Página de Redirecionamento para Pagamento Premium Online
 * Redireciona automaticamente para plataforma de pagamento Asaas
 *
 * @author Dr. Philipe Saraiva Cruz
 * @priority P0 - Critical (payment flow)
 */

const PAYMENT_URL = 'https://www.asaas.com/c/cxqbvojziu806q8a';
const REDIRECT_DELAY = 2000; // 2 segundos para UX suave

const PagamentoPremiumOnlinePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirecionamento automático após delay
    const timer = setTimeout(() => {
      window.location.href = PAYMENT_URL;
    }, REDIRECT_DELAY);

    return () => clearTimeout(timer);
  }, []);

  // Fallback manual para caso JavaScript esteja desabilitado
  const handleManualRedirect = () => {
    window.location.href = PAYMENT_URL;
  };

  return (
    <>
      <Helmet>
        <title>Redirecionando para Pagamento - Plano Premium Online | Saraiva Vision</title>
        <meta name="description" content="Redirecionando para página de pagamento seguro do Plano Premium Online da Saraiva Vision." />
        <meta name="robots" content="noindex, nofollow" />
        {/* Meta refresh como fallback caso JavaScript falhe */}
        <meta httpEquiv="refresh" content={`${REDIRECT_DELAY / 1000};url=${PAYMENT_URL}`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-slate-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* Card de Redirecionamento */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-yellow-200 p-8 text-center space-y-6">
            {/* Badge Premium */}
            <div className="flex justify-center -mt-12">
              <div className="bg-gradient-to-r from-yellow-400 via-slate-300 to-cyan-400 text-slate-900 px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                <Crown className="w-4 h-4" />
                <span>PLANO PREMIUM</span>
              </div>
            </div>

            {/* Ícone de Loading */}
            <div className="flex justify-center">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-slate-600 animate-spin" />
                <CreditCard className="w-8 h-8 text-yellow-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Título */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Redirecionando para Pagamento
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Você será direcionado para nossa plataforma de pagamento seguro...
              </p>
            </div>

            {/* Informações de Segurança */}
            <div className="bg-gradient-to-r from-yellow-50 to-slate-50 dark:from-yellow-900/20 dark:to-slate-900/20 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-center gap-2 text-slate-700 dark:text-slate-300">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-sm font-medium">Pagamento 100% Seguro</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Processado pela Asaas - Plataforma certificada PCI DSS
              </p>
            </div>

            {/* Detalhes do Plano */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Plano selecionado:
              </p>
              <div className="flex items-center justify-center gap-2">
                <Crown className="w-5 h-5 text-yellow-600" />
                <p className="text-lg font-semibold bg-gradient-to-r from-slate-600 via-yellow-600 to-cyan-600 bg-clip-text text-transparent">
                  Plano Premium Online
                </p>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                12x de R$ 149,00
              </p>
            </div>

            {/* Botão Manual */}
            <button
              onClick={handleManualRedirect}
              className="w-full bg-gradient-to-r from-slate-600 via-yellow-600 to-cyan-600 hover:from-slate-700 hover:via-yellow-700 hover:to-cyan-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group shadow-lg"
            >
              <span>Ir para Pagamento Agora</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Link de Cancelamento */}
            <button
              onClick={() => navigate('/planosonline')}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              Voltar para Planos
            </button>
          </div>

          {/* Nota de Rodapé */}
          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
            Ao continuar, você concorda com nossos{' '}
            <a href="/privacy" className="text-slate-600 hover:underline">
              Termos de Serviço
            </a>
          </p>
        </div>
      </div>
    </>
  );
};

export default PagamentoPremiumOnlinePage;

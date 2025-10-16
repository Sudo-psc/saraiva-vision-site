import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Loader2, ExternalLink, ShieldCheck, CreditCard } from 'lucide-react';

/**
 * Página de Redirecionamento para Pagamento Básico Online
 * Redireciona automaticamente para plataforma de pagamento Asaas
 *
 * @author Dr. Philipe Saraiva Cruz
 * @priority P0 - Critical (payment flow)
 */

const PAYMENT_URL = 'https://www.asaas.com/c/ckudf54alhxyv95f';
const REDIRECT_DELAY = 2000; // 2 segundos para UX suave

const PagamentoBasicoOnlinePage = () => {
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
        <title>Redirecionando para Pagamento - Plano Básico Online | Saraiva Vision</title>
        <meta name="description" content="Redirecionando para página de pagamento seguro do Plano Básico Online da Saraiva Vision." />
        <meta name="robots" content="noindex, nofollow" />
        {/* Meta refresh como fallback caso JavaScript falhe */}
        <meta httpEquiv="refresh" content={`${REDIRECT_DELAY / 1000};url=${PAYMENT_URL}`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* Card de Redirecionamento */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center space-y-6">
            {/* Ícone de Loading */}
            <div className="flex justify-center">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-cyan-600 animate-spin" />
                <CreditCard className="w-8 h-8 text-cyan-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
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
            <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-center gap-2 text-cyan-700 dark:text-cyan-300">
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
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                Plano Básico Online
              </p>
            </div>

            {/* Botão Manual */}
            <button
              onClick={handleManualRedirect}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 group"
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
            <a href="/privacy" className="text-cyan-600 hover:underline">
              Termos de Serviço
            </a>
          </p>
        </div>
      </div>
    </>
  );
};

export default PagamentoBasicoOnlinePage;

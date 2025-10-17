import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import { Package, ArrowRight, Loader2, CheckCircle } from 'lucide-react';

const PagamentoBasicoPage = () => {
  const navigate = useNavigate();
  const PAYMENT_URL = 'https://tr.ee/rVpQCT';

  useEffect(() => {
    // Redirect automático após 2 segundos
    const timer = setTimeout(() => {
      window.location.href = PAYMENT_URL;
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const seoData = {
    title: 'Pagamento Plano Básico - SVLentes | Saraiva Vision',
    description: 'Finalize o pagamento do Plano Básico de assinatura de lentes de contato. 12x de R$ 100,00 com entrega regular e acompanhamento médico.',
    keywords: 'pagamento lentes contato, plano básico, assinatura lentes',
    canonicalUrl: 'https://saraivavision.com.br/pagamentobasico',
    ogImage: 'https://saraivavision.com.br/og-image.jpg'
  };

  return (
    <>
      <SEOHead {...seoData} />
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-white to-cyan-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-cyan-100">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full mb-4 shadow-lg">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Plano Básico
              </h1>
              <p className="text-gray-600">
                Redirecionando para o pagamento seguro...
              </p>
            </div>

            {/* Loading Animation */}
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <Loader2 className="w-12 h-12 text-cyan-600 animate-spin" />
              <p className="text-sm text-gray-500">Aguarde um momento</p>
            </div>

            {/* Payment Info */}
            <div className="bg-cyan-50 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-cyan-900 mb-1">
                    Pagamento Seguro
                  </p>
                  <p className="text-xs text-cyan-700">
                    Você será redirecionado para nossa plataforma de pagamento segura Asaas.
                  </p>
                </div>
              </div>
            </div>

            {/* Security Badges */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Pagamento processado com segurança</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Certificado SSL 256-bit</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Dados protegidos</span>
              </div>
            </div>

            {/* Manual Redirect Button */}
            <a
              href={PAYMENT_URL}
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              Ir para Pagamento
              <ArrowRight className="w-5 h-5" />
            </a>

            {/* Cancel Link */}
            <div className="text-center mt-6">
              <button
                onClick={() => navigate('/planos')}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Voltar aos planos
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default PagamentoBasicoPage;

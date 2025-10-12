import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import { Star, ArrowRight, Loader2, CheckCircle } from 'lucide-react';

const PagamentoPadraoPage = () => {
  const navigate = useNavigate();
  const PAYMENT_URL = 'https://www.asaas.com/c/b3g1i4su3gj46evo';

  useEffect(() => {
    // Redirect automático após 1 segundo
    const timer = setTimeout(() => {
      window.location.href = PAYMENT_URL;
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const seoData = {
    title: 'Pagamento Plano Padrão - SVLentes | Saraiva Vision',
    description: 'Finalize o pagamento do Plano Padrão de assinatura de lentes de contato. 12x de R$ 149,99 com entrega regular e acompanhamento médico.',
    keywords: 'pagamento lentes contato, plano padrão, assinatura lentes',
    canonicalUrl: 'https://saraivavision.com.br/pagamentopadrao',
    ogImage: 'https://saraivavision.com.br/og-image.jpg'
  };

  return (
    <>
      <SEOHead {...seoData} />
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-2xl mx-auto px-6 py-12 text-center">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Star className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Redirecionando para o Pagamento...
          </h1>

          {/* Plan Info */}
          <div className="bg-gray-100 rounded-xl p-6 mb-6 border border-gray-200">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Star className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-900">Plano Padrão</h2>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-2">
              R$ 1.799,90
            </p>
            <p className="text-sm text-gray-600 mb-4">
              ou 12x de R$ 149,99
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-gray-600" />
                <span>24 pares de lentes premium</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-gray-600" />
                <span>Consultas de telemedicina ilimitadas</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-gray-600" />
                <span>Prioridade no agendamento</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-8">
            Você está sendo redirecionado para a plataforma de pagamento segura.
          </p>

          {/* Loading Animation */}
          <div className="flex justify-center mb-8">
            <Loader2 className="w-8 h-8 text-gray-600 animate-spin" />
          </div>

          {/* Manual Link */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <p className="text-sm text-gray-600 mb-4">
              Se o redirecionamento não funcionar automaticamente, clique no botão abaixo:
            </p>
            <a
              href={PAYMENT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-3.5 px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Ir para Pagamento
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>

          {/* Security Note */}
          <p className="text-xs text-gray-500 mt-6">
            🔒 Pagamento processado de forma segura pela Asaas
          </p>

          {/* Back Link */}
          <div className="mt-8">
            <button
              onClick={() => navigate('/planos')}
              className="text-gray-600 hover:text-gray-700 font-medium text-sm underline transition-colors"
            >
              ← Voltar para Planos
            </button>
          </div>
        </div>
      </main>
    </>
  );
};

export default PagamentoPadraoPage;

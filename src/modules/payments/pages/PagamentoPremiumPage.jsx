import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import { Crown, ArrowRight, Loader2, CheckCircle } from 'lucide-react';

const PagamentoPremiumPage = () => {
  const navigate = useNavigate();
  const PAYMENT_URL = 'https://www.asaas.com/c/wi5tsnvqbgpnx8ip';

  useEffect(() => {
    // Redirect automático após 1 segundo
    const timer = setTimeout(() => {
      window.location.href = PAYMENT_URL;
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const seoData = {
    title: 'Pagamento Plano Premium - SVLentes | Saraiva Vision',
    description: 'Finalize o pagamento do Plano Premium de assinatura de lentes de contato. 12x de R$ 179,99 com lentes multifocais e atendimento VIP.',
    keywords: 'pagamento lentes contato, plano premium, assinatura lentes multifocais',
    canonicalUrl: 'https://saraivavision.com.br/pagamentopremium',
    ogImage: 'https://saraivavision.com.br/og-image.jpg'
  };

  return (
    <>
      <SEOHead {...seoData} />
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-amber-50">
        <div className="max-w-2xl mx-auto px-6 py-12 text-center">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Crown className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Redirecionando para o Pagamento...
          </h1>

          {/* Plan Info */}
          <div className="bg-amber-100 rounded-xl p-6 mb-6 border border-amber-200">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Crown className="w-5 h-5 text-amber-600" />
              <h2 className="text-xl font-bold text-gray-900">Plano Premium</h2>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-2">
              R$ 2.159,88
            </p>
            <p className="text-sm text-gray-600 mb-4">
              ou 12x de R$ 179,99
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-amber-600" />
                <span>14 pares de lentes premium multifocais</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-amber-600" />
                <span>Consultas online com prioridade</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-amber-600" />
                <span>Exames complementares inclusos</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-8">
            Você está sendo redirecionado para a plataforma de pagamento segura.
          </p>

          {/* Loading Animation */}
          <div className="flex justify-center mb-8">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
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
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold py-3.5 px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
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
              className="text-amber-600 hover:text-amber-700 font-medium text-sm underline transition-colors"
            >
              ← Voltar para Planos
            </button>
          </div>
        </div>
      </main>
    </>
  );
};

export default PagamentoPremiumPage;

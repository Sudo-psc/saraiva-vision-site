import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import { Package, ArrowRight, Loader2 } from 'lucide-react';

const AssinePage = () => {
  const navigate = useNavigate();
  const JOTFORM_URL = 'https://form.jotform.com/252817233384055';

  useEffect(() => {
    // Redirect automático após 1 segundo
    const timer = setTimeout(() => {
      window.location.href = JOTFORM_URL;
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const seoData = {
    title: 'Assine Agora - Planos de Lentes de Contato | Saraiva Vision',
    description: 'Assine nosso plano de lentes de contato com entrega regular, acompanhamento médico e economia garantida. Preencha o formulário e comece hoje!',
    keywords: 'assinar lentes contato, plano lentes, formulário assinatura',
    canonicalUrl: 'https://saraivavision.com.br/assine',
    ogImage: 'https://saraivavision.com.br/og-image.jpg'
  };

  return (
    <>
      <SEOHead {...seoData} />
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-white to-cyan-50">
        <div className="max-w-2xl mx-auto px-6 py-12 text-center">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Package className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Redirecionando para o Formulário...
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-8">
            Você está sendo redirecionado para nosso formulário de assinatura.
          </p>

          {/* Loading Animation */}
          <div className="flex justify-center mb-8">
            <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
          </div>

          {/* Manual Link */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <p className="text-sm text-gray-600 mb-4">
              Se o redirecionamento não funcionar automaticamente, clique no botão abaixo:
            </p>
            <a
              href={JOTFORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-semibold py-3.5 px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Ir para o Formulário
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>

          {/* Back Link */}
          <div className="mt-8">
            <button
              onClick={() => navigate('/planos')}
              className="text-cyan-600 hover:text-cyan-700 font-medium text-sm underline transition-colors"
            >
              ← Voltar para Planos
            </button>
          </div>
        </div>
      </main>
    </>
  );
};

export default AssinePage;

import { useEffect } from 'react';
import SEOHead from '@/components/SEOHead';

const WaitlistPage = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://form.jotform.com/jsform/252956707366065';
    script.type = 'text/javascript';
    script.async = true;
    
    const container = document.getElementById('jotform-container');
    if (container) {
      container.appendChild(script);
    }

    return () => {
      if (container && script.parentNode === container) {
        container.removeChild(script);
      }
    };
  }, []);

  return (
    <>
      <SEOHead 
        title="Lista de Espera - Saraiva Vision"
        description="Inscreva-se na lista de espera para receber novidades e ofertas exclusivas da Clínica Saraiva Vision."
        canonical="https://saraivavision.com.br/waitlist"
        keywords="lista de espera, saraiva vision, oftalmologia, novidades, ofertas exclusivas"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-slate-100">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Lista de Espera
              </h1>
              <p className="text-lg text-gray-600">
                Inscreva-se para receber novidades e ofertas exclusivas
              </p>
            </div>

            <div 
              id="jotform-container" 
              className="bg-white rounded-lg shadow-lg p-6"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default WaitlistPage;

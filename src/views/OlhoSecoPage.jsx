import React from 'react';
import SEOHead from '@/components/SEOHead';
import EnhancedFooter from '@/components/EnhancedFooter';
import {
  HeroSection,
  DiagnosticsSection,
  TreatmentsSection,
  ComplianceSidebar,
  ContinuousCareCard
} from '@/components/olhoSeco';

const OlhoSecoPage = () => {
  const seo = {
    title: 'Clínica de Olho Seco | Diagnóstico e Tratamento com TFOS DEWS III | Saraiva Vision',
    description: 'Protocolos completos para diagnóstico e tratamento de olho seco com meibografia, FBUT, meniscometria, testes de Schirmer e lisamina verde, seguindo TFOS DEWS III.',
    keywords: 'olho seco, TFOS DEWS III, meibografia, FBUT, meniscometria, lisamina verde, Schirmer, plugs lacrimais, microesfoliação palpebral'
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEOHead {...seo} />
      <main className="flex-1 pt-20 sm:pt-24 md:pt-28 lg:pt-32 scroll-block-internal">
        <section className="bg-gradient-to-br from-cyan-50 via-white to-sky-50">
          <div className="max-w-6xl mx-auto px-6 lg:px-12 py-12 lg:py-16 space-y-10">
            <HeroSection />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <DiagnosticsSection />
                <TreatmentsSection />
              </div>

              <div className="space-y-6">
                <ComplianceSidebar />
                <ContinuousCareCard />
              </div>
            </div>
          </div>
        </section>
      </main>
      <EnhancedFooter />
    </div>
  );
};

export default OlhoSecoPage;

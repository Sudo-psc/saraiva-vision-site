'use client';

import { ArrowRight } from 'lucide-react';
import { trackCtaClick } from '@/lib/laas/analytics';

export function CtaFinalSection() {
  const handleCtaClick = () => {
    trackCtaClick('agendar_consulta', 'cta_final');
    const element = document.getElementById('planos');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary to-purple-600 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Pronto para ter mais praticidade e cuidado?
          </h2>
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            Junte-se a milhares de brasileiros que já escolheram o LAAS
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleCtaClick}
              className="bg-white text-primary px-10 py-5 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-2xl flex items-center gap-2 group"
            >
              Agendar Consulta Gratuita
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Prova social */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <div className="grid sm:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">500+</div>
                <div className="text-white/80">Assinantes ativos</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">4.9/5</div>
                <div className="text-white/80">Avaliação média</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">98%</div>
                <div className="text-white/80">Taxa de satisfação</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

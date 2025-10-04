'use client';

import { useEffect, useRef } from 'react';
import { Calendar, Package, Heart } from 'lucide-react';
import { PASSOS } from '@/lib/laas/config';
import { trackSectionScroll } from '@/lib/laas/analytics';

const STEP_ICONS = {
  calendar: Calendar,
  package: Package,
  heart: Heart,
};

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            trackSectionScroll('como_funciona');
          }
        });
      },
      { threshold: 0.5 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="como-funciona" ref={sectionRef} className="py-16 md:py-24 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Como Funciona
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Simples, prático e sem complicação
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Desktop: Timeline Horizontal */}
          <div className="hidden md:grid md:grid-cols-3 gap-8 relative">
            {/* Linha conectora */}
            <div className="absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-purple-500 to-primary" style={{ width: 'calc(100% - 8rem)', marginLeft: '4rem' }} />

            {PASSOS.map((passo) => {
              const Icon = STEP_ICONS[passo.icon as keyof typeof STEP_ICONS];
              return (
                <div key={passo.number} className="relative">
                  {/* Círculo do número */}
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold z-10 relative shadow-lg">
                        {passo.number}
                      </div>
                    </div>
                  </div>

                  {/* Card */}
                  <div className="bg-white rounded-xl p-6 shadow-lg border text-center">
                    <div className="flex justify-center mb-4">
                      <div className="bg-primary/10 p-3 rounded-full">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{passo.title}</h3>
                    <p className="text-gray-600">{passo.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile: Cards empilhados */}
          <div className="md:hidden space-y-6">
            {PASSOS.map((passo) => {
              const Icon = STEP_ICONS[passo.icon as keyof typeof STEP_ICONS];
              return (
                <div key={passo.number} className="bg-white rounded-xl p-6 shadow-lg border">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold shadow-lg">
                        {passo.number}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon className="h-6 w-6 text-primary" />
                        <h3 className="text-lg font-bold text-gray-900">{passo.title}</h3>
                      </div>
                      <p className="text-gray-600">{passo.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

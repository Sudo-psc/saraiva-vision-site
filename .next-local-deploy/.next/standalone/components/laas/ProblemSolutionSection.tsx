'use client';

import { useEffect, useRef } from 'react';
import { X, Check } from 'lucide-react';
import { PROBLEMAS, SOLUCOES } from '@/lib/laas/config';

export function ProblemSolutionSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && window.gtag) {
            window.gtag('event', 'scroll_to_section', {
              section_name: 'problema_solucao',
            });
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
    <section
      ref={sectionRef}
      className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-white"
      aria-labelledby="problem-solution-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
          {/* Coluna PROBLEMA */}
          <div className="space-y-6">
            <div className="inline-block">
              <h2
                id="problem-solution-heading"
                className="text-3xl md:text-4xl font-bold text-gray-900 mb-2"
              >
                Os Desafios com Lentes de Contato
              </h2>
              <div className="h-1 w-24 bg-red-500 rounded-full" aria-hidden="true" />
            </div>

            <ul className="space-y-4" role="list" aria-label="Problemas comuns com lentes de contato">
              {PROBLEMAS.map((problema, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div
                    className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mt-0.5"
                    aria-hidden="true"
                  >
                    <X className="w-4 h-4 text-red-600" strokeWidth={2.5} />
                  </div>
                  <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                    {problema.text}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna SOLUÇÃO */}
          <div className="space-y-6">
            <div className="inline-block">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Como o LAAS Resolve
              </h2>
              <div className="h-1 w-24 bg-green-500 rounded-full" aria-hidden="true" />
            </div>

            <ul className="space-y-4" role="list" aria-label="Soluções oferecidas pelo LAAS">
              {SOLUCOES.map((solucao, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4 border-green-500"
                >
                  <div
                    className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5"
                    aria-hidden="true"
                  >
                    <Check className="w-4 h-4 text-green-600" strokeWidth={2.5} />
                  </div>
                  <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                    {solucao.text}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

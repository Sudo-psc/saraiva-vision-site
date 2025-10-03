'use client';

import { X, Check } from 'lucide-react';
import { PROBLEMAS, SOLUCOES } from '@/lib/laas/config';

export function ProblemSolutionSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Resolva de vez seus problemas com lentes de contato
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Criamos o LAAS para acabar com as dores de quem usa lentes
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 max-w-5xl mx-auto">
          {/* Coluna PROBLEMA */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-red-600 mb-6 flex items-center gap-2">
              <X className="h-6 w-6" />
              PROBLEMA
            </h3>
            <div className="space-y-4">
              {PROBLEMAS.map((problema, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                  <X className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700 line-through decoration-red-600">{problema.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Coluna SOLUÇÃO */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-green-600 mb-6 flex items-center gap-2">
              <Check className="h-6 w-6" />
              SOLUÇÃO
            </h3>
            <div className="space-y-4">
              {SOLUCOES.map((solucao, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg"
                >
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700 font-medium">{solucao.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

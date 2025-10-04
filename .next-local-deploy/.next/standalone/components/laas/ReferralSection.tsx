'use client';

import { Gift, Users } from 'lucide-react';

export function ReferralSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-primary/5 to-purple-50 rounded-2xl p-8 md:p-12 border-2 border-primary/20">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Ilustração */}
              <div className="flex-shrink-0">
                <div className="bg-primary/10 p-8 rounded-full">
                  <Gift className="h-20 w-20 text-primary" />
                </div>
              </div>

              {/* Conteúdo */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center md:justify-start gap-2">
                  <Users className="h-8 w-8 text-primary" />
                  Indique e Ganhe
                </h2>
                <p className="text-lg text-gray-700 mb-6">
                  Ganhe <strong className="text-primary">1 mês de assinatura grátis</strong> a cada
                  amigo que se tornar assinante do LAAS.
                </p>
                <ul className="space-y-2 text-gray-600 mb-6">
                  <li className="flex items-center gap-2 justify-center md:justify-start">
                    <span className="text-primary">✓</span>
                    Sem limite de indicações
                  </li>
                  <li className="flex items-center gap-2 justify-center md:justify-start">
                    <span className="text-primary">✓</span>
                    Crédito automático na sua conta
                  </li>
                  <li className="flex items-center gap-2 justify-center md:justify-start">
                    <span className="text-primary">✓</span>
                    Seu amigo também ganha desconto
                  </li>
                </ul>
                <button className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all hover:scale-105 shadow-lg">
                  Começar a Indicar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

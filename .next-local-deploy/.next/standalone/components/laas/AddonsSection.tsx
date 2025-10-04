'use client';

import { Stethoscope, Shield, Sparkles, Video } from 'lucide-react';
import { ADDONS } from '@/lib/laas/config';

const ADDON_ICONS = {
  stethoscope: Stethoscope,
  shield: Shield,
  sparkles: Sparkles,
  video: Video,
};

export function AddonsSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Personalize sua experiência
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Adicione serviços extras para ter ainda mais praticidade e cuidado
          </p>
        </div>

        {/* Grid de Add-ons */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {ADDONS.map((addon) => {
            const Icon = ADDON_ICONS[addon.icon as keyof typeof ADDON_ICONS];
            return (
              <div
                key={addon.id}
                className="bg-white rounded-xl p-6 shadow-lg border hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-center mb-4">
                  <div className="bg-primary/10 p-4 rounded-full">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                  {addon.name}
                </h3>
                <p className="text-gray-600 text-center text-sm">{addon.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

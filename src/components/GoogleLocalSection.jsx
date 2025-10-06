import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Star, ExternalLink, Navigation } from 'lucide-react';
import { clinicInfo, googleMapsProfileUrl, googleReviewUrl } from '@/lib/clinicInfo';
import GoogleMapRobust from '@/components/GoogleMapRobust';
import { Button } from '@/components/ui/button';

const GoogleLocalSection = () => {
  const { t } = useTranslation();

  return (
    <section
      id="local"
      aria-labelledby="local-heading"
      className="py-12 lg:py-16 text-white bg-gradient-to-br from-[#0a1628] via-[#13203a] to-[#0d1b2a] relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-indigo-900/10 to-cyan-800/20" aria-hidden="true" />

      <div className="container mx-auto px-[7%] relative z-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-14 items-start lg:items-center">
          {/* Content Side - alinhado e com largura ótima */}
          <div className="flex-1 space-y-6 lg:pr-8 max-w-3xl">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Navigation className="w-6 h-6 text-white" />
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-blue-400/50 to-transparent"></div>
              </div>
              <h2 id="local-heading" className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                {t('location.title', 'Encontre-nos')}
              </h2>
              <p className="text-lg md:text-xl text-blue-100/90 leading-relaxed max-w-2xl">
                {t('location.subtitle', 'Localização verificada no Google. Facilite sua rota e avalie nosso atendimento.')}
              </p>
            </div>

            {/* Info Card */}
            <div className="bg-white text-slate-800 rounded-2xl p-6 lg:p-8 border border-slate-200 shadow-xl space-y-5 max-w-xl">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <MapPin className="w-5 h-5 text-cyan-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900">Endereço</h3>
                  <p className="text-slate-600 leading-relaxed">
                    {clinicInfo.streetAddress}, {clinicInfo.neighborhood}<br />
                    {clinicInfo.city} - {clinicInfo.state}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Star className="w-5 h-5 text-amber-500 fill-current" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Avaliações</h3>
                  <p className="text-slate-600">{t('location.reviews_realtime', 'Avaliações em tempo real no Google')}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4" role="group" aria-label={t('location.cta_group', 'Ações principais de localização')}>
              <Button asChild variant="medical" size="lg" className="gap-3">
                <a
                  href={googleMapsProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t('location.google_maps_button_aria', 'Abrir perfil da clínica no Google Maps (nova aba)')}
                >
                  {t('location.google_maps_button', 'Ver no Google Maps')}
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>

              <Button asChild variant="outline" size="lg" className="gap-3 text-cyan-700 border-cyan-500 hover:text-cyan-800">
                <a
                  href={googleReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t('location.review_button_aria', 'Abrir página de avaliações no Google (nova aba)')}
                >
                  {t('location.review_button', 'Avalie-nos no Google')}
                  <Star className="w-4 h-4 text-amber-400" />
                </a>
              </Button>
            </div>
          </div>

          {/* Map Side - Box do Google Maps corrigido e alinhado */}
          <div className="flex-1 max-w-2xl lg:self-center">
            {/* Container externo com altura fixa e padding interno para não cortar o mapa */}
            <div className="h-[304px] lg:h-[336px] rounded-2xl shadow-xl bg-white border border-slate-200 relative p-2">
              <div className="relative w-full h-full rounded-xl overflow-hidden bg-gray-100">
                <GoogleMapRobust height="100%" />
              </div>
              
              {/* Map overlay label - ajustado para o novo padding */}
              <div className="absolute top-6 left-6 bg-white rounded-lg px-4 py-2 shadow-md z-10">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" aria-hidden="true" />
                  <span className="text-sm font-medium text-gray-800">Clínica Saraiva Vision</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GoogleLocalSection;

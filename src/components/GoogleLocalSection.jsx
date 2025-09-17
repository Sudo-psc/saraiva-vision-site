import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Star, ExternalLink, Navigation } from 'lucide-react';
import { clinicInfo, googleMapsProfileUrl, googleReviewUrl } from '@/lib/clinicInfo';
import GoogleMap from '@/components/GoogleMap';

const GoogleLocalSection = () => {
  const { t } = useTranslation();

  return (
    <section id="local" className="py-9 lg:py-11 text-white bg-gradient-to-br from-[#0A1628] via-[#1E2A47] to-[#0D1B2A] relative overflow-hidden">
      {/* Enhanced background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-blue-800/30"></div>
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(59,130,246,0.05)_50%,transparent_75%)] bg-[length:60px_60px] animate-pulse"></div>
      
      {/* Floating elements */}
      <div className="absolute top-10 left-[10%] w-32 h-32 bg-gradient-to-br from-blue-400/10 to-cyan-400/5 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute top-20 right-[15%] w-24 h-24 bg-gradient-to-bl from-indigo-400/10 to-purple-400/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-10 left-[20%] w-40 h-40 bg-gradient-to-tr from-cyan-400/8 to-blue-400/4 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-20 right-[10%] w-28 h-28 bg-gradient-to-tl from-blue-500/10 to-indigo-500/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      
      {/* Geometric accent */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 opacity-60"></div>
      <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-500 opacity-60"></div>
      
      <div className="container mx-auto px-[7%] relative z-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-14 items-start lg:items-center">
          {/* Content Side - alinhado e com largura ótima */}
          <div className="flex-1 space-y-6 lg:pr-8 max-w-3xl">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Navigation className="w-6 h-6 text-white" />
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-blue-400/50 to-transparent"></div>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-2xl leading-tight">
                {t('location.title', 'Encontre-nos')}
              </h2>
              <p className="text-lg md:text-xl text-blue-100/90 leading-relaxed max-w-2xl">
                {t('location.subtitle', 'Localização verificada no Google. Facilite sua rota e avalie nosso atendimento.')}
              </p>
            </div>

            {/* Info Card */}
            <div className="bg-white/10 backdrop-blur-3xl rounded-3xl p-6 lg:p-8 border border-white/20 shadow-2xl space-y-5 max-w-xl">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-white">Endereço</h3>
                  <p className="text-blue-100 leading-relaxed">
                    {clinicInfo.streetAddress}, {clinicInfo.neighborhood}<br />
                    {clinicInfo.city} - {clinicInfo.state}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Star className="w-5 h-5 text-white fill-current" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Avaliações</h3>
                  <p className="text-blue-100">{t('location.reviews_realtime', 'Avaliações em tempo real no Google')}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href={googleMapsProfileUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 lg:px-8 py-3 lg:py-4 rounded-2xl shadow-xl hover:shadow-2xl backdrop-blur-sm border border-blue-400/30 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                aria-label={t('location.google_maps_button_aria', 'Abrir perfil da clínica no Google Maps (nova aba)')}
              >
                <span className="text-base lg:text-lg">{t('location.google_maps_button', 'Ver no Google Maps')}</span>
                <ExternalLink className="w-4 lg:w-5 h-4 lg:h-5 group-hover:rotate-45 transition-transform duration-300" />
              </a>
              
              <a 
                href={googleReviewUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group inline-flex items-center justify-center gap-3 border-2 border-blue-300/40 hover:border-blue-300/60 text-blue-100 hover:text-white font-semibold px-6 lg:px-8 py-3 lg:py-4 rounded-2xl bg-white/5 hover:bg-white/15 backdrop-blur-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl"
                aria-label={t('location.review_button_aria', 'Abrir página de avaliaçeeeees no Google (nova aba)')}
              >
                <span className="text-base lg:text-lg">{t('location.review_button', 'Avalie-nos no Google')}</span>
                <Star className="w-4 lg:w-5 h-4 lg:h-5 text-amber-300 group-hover:scale-110 transition-transform duration-300" />
              </a>
            </div>
          </div>

          {/* Map Side - Box do Google Maps corrigido e alinhado */}
          <div className="flex-1 max-w-2xl lg:self-center">
            {/* Container externo com altura fixa e padding interno para não cortar o mapa */}
            <div className="h-[304px] lg:h-[336px] rounded-3xl shadow-2xl bg-white/10 backdrop-blur-3xl relative border-2 border-white/20 group p-2">
              <div className="absolute inset-2 bg-gradient-to-br from-blue-400/10 to-transparent rounded-2xl"></div>
              <div className="absolute inset-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-cyan-400/5 to-blue-400/5 rounded-2xl"></div>
              
              {/* Google Map container - agora com padding interno para não ser cortado */}
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gray-100">
                <GoogleMap height="100%" />
              </div>
              
              {/* Map overlay label - ajustado para o novo padding */}
              <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg z-10">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
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

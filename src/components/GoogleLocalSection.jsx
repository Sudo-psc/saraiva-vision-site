import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Star, ExternalLink } from 'lucide-react';
import { clinicInfo, googleMapsProfileUrl, googleReviewUrl } from '@/lib/clinicInfo';
import GoogleMap from '@/components/GoogleMap';

const GoogleLocalSection = () => {
  const { t } = useTranslation();

  return (
    <section id="local" className="py-20 text-white bg-gradient-to-br from-[#0D1B2A] via-[#1B263B] to-[#0F3460] relative overflow-hidden">
      {/* Liquid glass effects */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 via-transparent to-blue-800/30 backdrop-blur-3xl"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-cyan-400/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-tl from-indigo-400/10 to-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 items-stretch">
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">{t('location.title', 'Encontre-nos')}</h2>
            <p className="text-blue-100/90 max-w-lg">{t('location.subtitle', 'Localização verificada no Google. Facilite sua rota e avalie nosso atendimento.')}</p>
            <div className="space-y-2 text-sm font-medium bg-white/5 backdrop-blur-2xl rounded-2xl p-6 border border-white/10 shadow-2xl">
              <div className="flex items-start gap-3"><MapPin className="mt-0.5 text-blue-300" size={18} />
                <span className="text-blue-50">{clinicInfo.streetAddress}, {clinicInfo.neighborhood}, {clinicInfo.city} - {clinicInfo.state}</span>
              </div>
              <div className="flex items-center gap-3"><Star size={18} className="text-amber-300" /> <span className="text-blue-50">{t('location.reviews_realtime', 'Avaliações em tempo real')}</span></div>
            </div>
            <div className="flex flex-wrap gap-4">
              <a href={googleMapsProfileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-2xl shadow-xl hover:shadow-2xl backdrop-blur-sm border border-blue-400/30 transition-all transform hover:scale-105">
                {t('location.google_maps_button', 'Ver no Google Maps')} <ExternalLink size={16} />
              </a>
              <a href={googleReviewUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border-2 border-blue-300/40 text-blue-100 hover:text-white font-semibold px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 backdrop-blur-xl transition-all transform hover:scale-105 shadow-lg">
                {t('location.review_button', 'Avalie-nos no Google')} <Star size={16} className="text-amber-300" />
              </a>
            </div>
            <ul className="mt-4 text-xs text-blue-200/70 list-disc list-inside space-y-1">
              {clinicInfo.servicesKeywords.map(k => <li key={k}>{k}</li>)}
            </ul>
          </div>
          <div className="flex-1 h-[340px] rounded-3xl shadow-2xl bg-white/5 backdrop-blur-2xl relative border-2 border-white/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-transparent"></div>
            <GoogleMap />
          </div>
        </div>
      </div>
    </section>
  );
};

export default GoogleLocalSection;

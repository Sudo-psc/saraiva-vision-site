import React from 'react';
import { MapPin, Star, ExternalLink } from 'lucide-react';
import { clinicInfo, googleMapsProfileUrl, googleReviewUrl } from '@/lib/clinicInfo';
import GoogleReviewsWidget from '@/components/GoogleReviewsWidget';
import GoogleMap from '@/components/GoogleMap';

const GoogleLocalSection = () => {
  return (
    <section id="local" className="py-20 bg-[#004D61] text-white">
      <div className="container mx-auto px-4 md:px-6">
  <div className="flex flex-col lg:flex-row gap-12 items-stretch">
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Encontre-nos</h2>
            <p className="text-white/80 max-w-lg">Clínica oftalmológica em Caratinga com localização verificada no Google. Facilite sua rota e avalie nosso atendimento especializado.</p>
            <div className="space-y-2 text-sm font-medium bg-white/5 rounded-xl p-4">
              <div className="flex items-start gap-3"><MapPin className="mt-0.5" size={18} />
                <span>{clinicInfo.streetAddress}, {clinicInfo.neighborhood}, {clinicInfo.city} - {clinicInfo.state}</span>
              </div>
              <div className="flex items-center gap-3"><Star size={18} className="text-yellow-400" /> <span>Avaliações reais de pacientes oftalmológicos</span></div>
            </div>
            <div className="flex flex-wrap gap-4">
              <a href={googleMapsProfileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-[#004D61] font-semibold px-5 py-3 rounded-full shadow hover:shadow-md transition">
                Ver no Google Maps <ExternalLink size={16} />
              </a>
              <a href={googleReviewUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-white/50 text-white font-semibold px-5 py-3 rounded-full hover:bg-white/10 transition">
                Avalie-nos no Google <Star size={16} className="text-yellow-400" />
              </a>
            </div>
            <ul className="mt-4 text-xs text-white/60 list-disc list-inside">
              {clinicInfo.servicesKeywords.map(k => <li key={k}>{k}</li>)}
            </ul>
          </div>
          <div className="flex-1 min-h-[340px] rounded-2xl overflow-hidden shadow-lg bg-slate-200 relative">
            <GoogleMap />
          </div>
        </div>
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <GoogleReviewsWidget />
          <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
            <h3 className="text-xl font-semibold mb-4 text-white">Como sua avaliação ajuda</h3>
            <p className="text-white/80 text-sm leading-relaxed">Seu feedback fortalece nossa reputação como clínica oftalmológica em Caratinga e ajuda novos pacientes a encontrar cuidados especializados para a visão. Leva menos de 1 minuto.</p>
            <a href={googleReviewUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-5 px-5 py-3 bg-yellow-400 text-[#004D61] font-semibold rounded-full hover:bg-yellow-300 transition shadow">
              Escrever Avaliação ⭐
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GoogleLocalSection;

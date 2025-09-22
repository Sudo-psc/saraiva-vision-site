'use client';

import Image from 'next/image';
import { Calendar, ArrowRight } from 'lucide-react';
import { HomeData } from '../../types/home';

interface HeroSectionProps {
  data: HomeData | null;
  error: string | null;
}

const HeroSection: React.FC<HeroSectionProps> = ({ data, error }) => {
  // Fallback data if API fails
  const fallbackData: HomeData = {
    title: 'Cuidando da sua visão com excelência',
    subtitle: 'Agende sua consulta hoje mesmo e tenha acesso aos melhores cuidados oftalmológicos.',
    imageUrl: '/images/hero.webp',
    ctaButtons: [
      { label: 'Agendar Consulta', link: '/contato', primary: true },
      { label: 'Saiba Mais', link: '#services', primary: false }
    ],
    promoText: 'Mês de Setembro com 50% de desconto em consultas iniciais!'
  };

  const heroData = data || fallbackData;

  const handleAgendarClick = () => {
    window.open(process.env.NEXT_PUBLIC_CLINIC_URL || '/contato', '_blank');
  };

  const handleServicesClick = () => {
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="home"
      className="relative pt-32 pb-24 md:pt-40 md:pb-32 min-h-[100dvh] bg-gradient-to-br from-blue-50 to-cyan-50"
    >
      <div className="container mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <div className="flex flex-col space-y-6 text-center lg:text-left">
            {/* Partner Badge */}
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-2 w-fit mx-auto lg:mx-0">
              <span className="mr-2">✦</span>
              <span>Clínica Oftalmológica</span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {heroData.title}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-gray-700 leading-relaxed">
              {heroData.subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
              {heroData.ctaButtons.map((button, index) => (
                <div key={index}>
                  {button.primary ? (
                    <button
                      onClick={handleAgendarClick}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-colors"
                    >
                      <Calendar size={20} />
                      {button.label}
                    </button>
                  ) : (
                    <button
                      onClick={handleServicesClick}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-blue-200 text-blue-700 hover:bg-blue-50 font-semibold rounded-lg transition-colors"
                    >
                      {button.label}
                      <ArrowRight size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                <p className="text-yellow-800 text-sm">
                  ⚠️ Usando dados locais: {error}
                </p>
              </div>
            )}
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-lg bg-white">
              <Image
                src={heroData.imageUrl}
                alt="Saraiva Vision"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
                priority
                unoptimized
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/hero.webp';
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
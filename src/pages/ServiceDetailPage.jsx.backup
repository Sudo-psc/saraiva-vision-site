import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { useTranslation } from 'react-i18next';

const ServiceDetailPage = () => {
  const { t } = useTranslation();
  const seo = {
    title: t('services.items.consultations.title') + ' | Saraiva Vision',
    description: t('services.items.consultations.fullDescription'),
    keywords: 'oftalmologia, serviços, consultas, exames, cirurgias',
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEOHead {...seo} />
      <Navbar />
      <main className="flex-1 pt-28">
        <div className="container mx-auto px-4 md:px-6 py-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 drop-shadow-sm">
            {t('services.items.consultations.title')}
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed drop-shadow-sm">
            {t('services.items.consultations.fullDescription')}
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ServiceDetailPage;
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import Services from '@/components/Services';
import { useTranslation } from 'react-i18next';

const ServicesPage = () => {
  const { t } = useTranslation();
  const seo = {
    title: t('services.title') + ' | Saraiva Vision',
    description: t('services.subtitle'),
    keywords: 'oftalmologia, serviços, consultas, exames, cirurgias',
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEOHead {...seo} />
      <Navbar />
      <main className="flex-1 pt-28">
        <Services full />
      </main>
      <Footer />
    </div>
  );
};

export default ServicesPage;
